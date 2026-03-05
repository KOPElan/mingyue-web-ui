# contracts/api-proxy.md

## 1. 代理 API 设计
- 所有前端请求均通过 `/proxy/:agentId/*` 路径转发到对应 mingyue agent
- 代理服务负责注入 API Key，前端不直接持有密钥
- 支持多 agent 动态切换，agentId 由前端传递

## 2. 认证与安全
- 代理服务需校验前端用户身份（如 JWT/cookie/session）
- 仅后端持有和管理 API Key，前端无权访问明文密钥
- 代理需限制可访问的 API 路径，防止越权

## 3. 错误处理
- 代理需将 mingyue agent 的标准错误码和消息原样转发前端
- 401/403/404/409/500 等需标准化处理

## 4. 示例接口
- `GET /proxy/:agentId/api/v1/system/overview` → 转发到对应 agent
- `POST /proxy/:agentId/api/v1/files` → 转发并注入密钥

## 5. 兼容性
- 代理需支持 CORS，允许前端跨域访问
- 推荐与前端同源部署，或通过 nginx/caddy 反代

---

如需扩展支持 WebSocket、文件大上传等，需在此基础上补充协议说明。