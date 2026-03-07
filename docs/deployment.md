# 部署指南

本文档介绍 mingyue-web-ui 的多种生产环境部署方式。

---

## 目录

1. [环境要求](#环境要求)
2. [方式一：Docker Compose（推荐）](#方式一docker-compose推荐)
3. [方式二：Docker 单独部署](#方式二docker-单独部署)
4. [方式三：手动构建部署](#方式三手动构建部署)
5. [nginx 反向代理配置](#nginx-反向代理配置)
6. [HTTPS 配置](#https-配置)
7. [环境变量说明](#环境变量说明)
8. [安全加固建议](#安全加固建议)
9. [常见问题](#常见问题)

---

## 环境要求

| 组件 | 最低版本 |
|------|---------|
| Docker | 24.x |
| Docker Compose | v2.x |
| Node.js（非 Docker 部署） | 18.x |

---

## 方式一：Docker Compose（推荐）

这是最简单的生产部署方式，一条命令启动所有服务。

### 1. 克隆仓库

```bash
git clone https://github.com/KOPElan/mingyue-web-ui.git
cd mingyue-web-ui
```

### 2. 配置环境变量

```bash
cp backend-proxy/.env.example backend-proxy/.env
```

编辑 `backend-proxy/.env`，**务必修改以下字段**：

```env
JWT_SECRET=<随机生成的强密钥，至少32位>
ADMIN_PASSWORD=<强密码>
```

可用以下命令生成随机密钥：

```bash
openssl rand -hex 32
```

### 3. 启动服务

```bash
docker compose up -d
```

服务启动后，访问 `http://<服务器IP>:5173`。

### 4. 查看日志

```bash
docker compose logs -f
```

### 5. 停止服务

```bash
docker compose down
```

---

## 方式二：Docker 单独部署

### 构建并运行 backend-proxy

```bash
cd backend-proxy
docker build -t mingyue-proxy .

docker run -d \
  --name mingyue-proxy \
  -p 3000:3000 \
  -e JWT_SECRET=<your-secret> \
  -e ADMIN_PASSWORD=<your-password> \
  -e INITIAL_AGENTS='[{"id":"agent1","name":"主机1","address":"http://192.168.1.100:8080","apiKey":"<key>","status":"online","version":"1.0.0"}]' \
  --restart unless-stopped \
  mingyue-proxy
```

### 构建并运行 frontend

```bash
cd frontend
docker build -t mingyue-frontend .

docker run -d \
  --name mingyue-frontend \
  -p 5173:80 \
  --restart unless-stopped \
  mingyue-frontend
```

> **注意**：前端容器需能访问 backend-proxy，默认通过 nginx 将 `/api` 和 `/proxy` 路径转发到 `backend-proxy:3000`。

---

## 方式三：手动构建部署

### 1. 构建前端

```bash
cd frontend
npm install
npm run build
# 产物位于 frontend/dist/
```

### 2. 部署前端静态文件

将 `frontend/dist/` 目录内容复制到 nginx / caddy / Apache 的 Web 根目录。

### 3. 启动 backend-proxy

```bash
cd backend-proxy
npm install
# 配置 .env
npm start
```

建议使用 `pm2` 管理进程：

```bash
npm install -g pm2
pm2 start src/index.js --name mingyue-proxy
pm2 save
pm2 startup
```

---

## nginx 反向代理配置

将前端静态资源与代理服务统一在同一域名下，推荐配置如下：

```nginx
server {
    listen 80;
    server_name example.com;  # 替换为你的域名

    # 安全响应头
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;

    # 前端静态资源
    root /var/www/mingyue-web-ui/dist;
    index index.html;

    # Vue Router history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长效缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 代理 API 请求到 backend-proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /proxy/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## HTTPS 配置

### 使用 Certbot（Let's Encrypt）

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d example.com
```

### nginx HTTPS 完整配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 安全响应头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" always;

    root /var/www/mingyue-web-ui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /proxy/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 强制跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

---

## 环境变量说明

以下环境变量在 `backend-proxy/.env` 中配置：

| 变量 | 说明 | 默认值 | 生产环境建议 |
|------|------|--------|------------|
| `PORT` | 代理服务监听端口 | `3000` | 可保持默认，通过 nginx 反代 |
| `JWT_SECRET` | JWT 签名密钥 | `mingyue-secret-change-me` | **必须修改**，使用 32+ 位随机字符串 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` | 建议修改为非默认值 |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` | **必须修改**，使用强密码 |
| `INITIAL_AGENTS` | 初始 Agent 配置（JSON） | 无 | 预配置已知 Agent 地址 |

### INITIAL_AGENTS 格式

```json
[
  {
    "id": "agent1",
    "name": "服务器-1",
    "address": "http://192.168.1.100:8080",
    "apiKey": "your-mingyue-go-api-key",
    "status": "online",
    "version": "1.0.0"
  }
]
```

---

## 安全加固建议

1. **修改默认凭据**：生产环境必须修改 `JWT_SECRET`、`ADMIN_PASSWORD`，建议同时修改 `ADMIN_USERNAME`。

2. **使用 HTTPS**：通过 Let's Encrypt 免费获取 TLS 证书，避免明文传输。

3. **防火墙配置**：
   - 仅开放 80/443 端口对外
   - backend-proxy（3000 端口）应仅允许 nginx/内网访问，不对外暴露

4. **定期轮换 API Key**：在 mingyue-go 后端定期更换 API Key，并同步更新 backend-proxy 中的 Agent 配置。

5. **Docker 安全**：
   - 以非 root 用户运行容器（Dockerfile 已配置）
   - 定期更新基础镜像

6. **备份**：
   - 定期备份 `backend-proxy/.env`（包含 Agent 配置）

---

## 常见问题

### Q: 登录后页面空白 / API 请求失败

- 检查 backend-proxy 是否正常运行：`curl http://localhost:3000/health`
- 检查 nginx 代理配置中 `/api/` 路径是否正确转发

### Q: Agent 显示离线

- 检查 mingyue-go 服务是否正常运行
- 检查 Agent 地址是否可从 backend-proxy 所在服务器访问
- 检查 API Key 是否正确

### Q: 主题/语言设置刷新后丢失

- 主题和语言偏好存储于 localStorage，正常情况下刷新不会丢失
- 如果使用隐私模式浏览，刷新后会重置为默认值

### Q: Docker Compose 启动后无法访问

- 检查端口是否被占用：`ss -tlnp | grep -E '3000|5173'`
- 查看容器日志：`docker compose logs`
