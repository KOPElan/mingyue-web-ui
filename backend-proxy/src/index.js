import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// 信任第一层代理（例如 nginx），使 express-rate-limit 能够通过
// 反向代理添加的 X-Forwarded-For 头部正确识别客户端 IP。
app.set('trust proxy', 1);
const JWT_SECRET = process.env.JWT_SECRET || 'mingyue-secret-change-me';

// In-memory agent store.
// NOTE: Agent data is stored in memory only. Any agents added or modified via the API
// will be lost on service restart. Use the INITIAL_AGENTS environment variable to
// persist agent configurations across restarts. In production, maintain INITIAL_AGENTS
// in your deployment config (e.g., docker-compose env_file or Kubernetes Secret).
const agents = new Map();

// Proxy middleware cache: keyed by agentId. Invalidated when an agent is updated or deleted.
const proxyCache = new Map();

// Initialize agents from environment variable if provided
if (process.env.INITIAL_AGENTS) {
  try {
    const initialAgents = JSON.parse(process.env.INITIAL_AGENTS);
    if (!Array.isArray(initialAgents)) {
      throw new Error('INITIAL_AGENTS must be a JSON array');
    }
    for (const agent of initialAgents) {
      // Validate required fields before loading
      if (
        typeof agent.id === 'string' && agent.id.trim() &&
        typeof agent.name === 'string' && agent.name.trim() &&
        typeof agent.address === 'string' && agent.address.trim() &&
        /^https?:\/\/.+/.test(agent.address.trim())
      ) {
        agents.set(agent.id, {
          id: agent.id.trim(),
          name: agent.name.trim(),
          address: agent.address.trim(),
          apiKey: typeof agent.apiKey === 'string' ? agent.apiKey : '',
          status: agent.status === 'online' ? 'online' : 'offline',
          version: typeof agent.version === 'string' ? agent.version : 'unknown'
        });
      } else {
        console.warn('Skipping invalid agent entry (missing/invalid id, name, or address).');
      }
    }
    console.log(`Loaded ${agents.size} agents from INITIAL_AGENTS`);
  } catch (e) {
    console.error('Failed to parse INITIAL_AGENTS:', e.message);
  }
}

// In-memory user store
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

const users = new Map([
  [ADMIN_USERNAME, { username: ADMIN_USERNAME, passwordHash: ADMIN_PASSWORD_HASH, role: 'admin', displayName: 'Administrator' }]
]);

// Middleware
app.use(cors({
  // Default to localhost in development. Set CORS_ORIGIN to your production domain (e.g. https://example.com).
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Allow overriding via env var so CI/test environments can raise the limit
  // without disabling it entirely. Default is 20 for production.
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20', 10),
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});

// JWT Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}

// Optional auth - attaches user if token present
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore
    }
  }
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = users.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role, displayName: user.displayName },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      username: user.username,
      role: user.role,
      displayName: user.displayName
    }
  });
});

app.post('/api/auth/logout', authLimiter, authenticate, (req, res) => {
  // JWT is stateless; the token cannot be server-side invalidated.
  // The authenticate middleware is kept here to ensure only valid-token holders
  // can trigger this endpoint, avoiding unnecessary processing for anonymous requests.
  // The client must discard the token upon receiving this response.
  res.json({ message: 'Logged out successfully' });
});

// Agent management routes
app.get('/api/agents', apiLimiter, authenticate, (req, res) => {
  const agentList = Array.from(agents.values()).map(a => ({
    id: a.id,
    name: a.name,
    address: a.address,
    status: a.status,
    version: a.version
    // Never expose apiKey to frontend
  }));
  res.json(agentList);
});

app.post('/api/agents', apiLimiter, authenticate, (req, res) => {
  const { id, name, address, apiKey, status = 'offline', version = 'unknown' } = req.body;
  if (!id || !name || !address) {
    return res.status(400).json({ error: 'id, name, and address are required' });
  }
  if (agents.has(id)) {
    return res.status(409).json({ error: `Agent with id '${id}' already exists` });
  }
  const agent = { id, name, address, apiKey: apiKey || '', status, version };
  agents.set(id, agent);
  res.status(201).json({ id, name, address, status, version });
});

app.put('/api/agents/:agentId', apiLimiter, authenticate, (req, res) => {
  const { agentId } = req.params;
  if (!agents.has(agentId)) {
    return res.status(404).json({ error: `Agent '${agentId}' not found` });
  }
  const existing = agents.get(agentId);
  const { name, address, apiKey, status, version } = req.body;
  const updated = {
    ...existing,
    ...(name !== undefined && { name }),
    ...(address !== undefined && { address }),
    ...(apiKey !== undefined && { apiKey }),
    ...(status !== undefined && { status }),
    ...(version !== undefined && { version })
  };
  agents.set(agentId, updated);
  // Invalidate proxy cache so the next request creates a fresh proxy with updated config
  proxyCache.delete(agentId);
  const { apiKey: _key, ...safeAgent } = updated;
  res.json(safeAgent);
});

app.delete('/api/agents/:agentId', apiLimiter, authenticate, (req, res) => {
  const { agentId } = req.params;
  if (!agents.has(agentId)) {
    return res.status(404).json({ error: `Agent '${agentId}' not found` });
  }
  agents.delete(agentId);
  proxyCache.delete(agentId);
  res.json({ message: `Agent '${agentId}' deleted` });
});

// Test agent connectivity
app.get('/api/agents/:agentId/ping', apiLimiter, authenticate, async (req, res) => {
  const { agentId } = req.params;
  const agent = agents.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: `Agent '${agentId}' not found` });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${agent.address}/health`, {
      signal: controller.signal,
      headers: agent.apiKey ? { 'X-API-Key': agent.apiKey } : {}
    });
    clearTimeout(timeout);
    if (response.ok) {
      // Update status to online
      agents.set(agentId, { ...agent, status: 'online' });
      res.json({ status: 'online', agentId });
    } else {
      agents.set(agentId, { ...agent, status: 'offline' });
      res.json({ status: 'offline', agentId, httpStatus: response.status });
    }
  } catch (err) {
    agents.set(agentId, { ...agent, status: 'offline' });
    res.json({ status: 'offline', agentId, error: err.message });
  }
});

// Proxy routes: /proxy/:agentId/* → agent address
app.use('/proxy/:agentId', apiLimiter, authenticate, (req, res, next) => {
  const { agentId } = req.params;
  const agent = agents.get(agentId);

  if (!agent) {
    return res.status(404).json({ error: `Agent not found` });
  }

  // Use cached proxy middleware; create a new one only if the target address has changed
  let cached = proxyCache.get(agentId);
  if (!cached || cached.address !== agent.address) {
    const proxy = createProxyMiddleware({
      target: agent.address,
      changeOrigin: true,
      pathRewrite: (path) => {
        // Remove /proxy/:agentId prefix
        return path.replace(new RegExp(`^/proxy/${agentId}`), '');
      },
      on: {
        proxyReq: (proxyReq) => {
          // Always look up the current agent from the store so that apiKey updates
          // (applied via the PUT endpoint, which also invalidates this cache entry)
          // take effect immediately without needing to recreate the proxy middleware.
          const currentAgent = agents.get(agentId);
          if (currentAgent?.apiKey) {
            proxyReq.setHeader('X-API-Key', currentAgent.apiKey);
          }
          // Remove Authorization header to not expose JWT to agent
          proxyReq.removeHeader('Authorization');
        },
        error: (err, req, res) => {
          console.error('Proxy error: agent unreachable');
          res.status(502).json({ error: 'Bad Gateway: agent unreachable' });
        }
      }
    });
    cached = { proxy, address: agent.address };
    proxyCache.set(agentId, cached);
  }

  cached.proxy(req, res, next);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mingyue Backend Proxy running on http://localhost:${PORT}`);
  console.log(`Loaded ${agents.size} agents`);
});

export default app;
