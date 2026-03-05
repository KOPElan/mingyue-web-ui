# quickstart.md

## 1. 环境准备
- 安装 Node.js 18+、pnpm/yarn
- 拉取本仓库，切换到 `001-web-frontend` 分支

## 2. 启动后端 API 代理
- 进入 backend-proxy 目录
- 配置 agent 地址与 API Key（仅在后端持有）
- 启动代理服务（如 `pnpm start` 或 `go run main.go`）

## 3. 启动前端开发环境
- 进入 frontend 目录
- 安装依赖：`pnpm install`
- 启动开发服务器：`pnpm dev`
- 访问 http://localhost:5173

## 4. 主要功能入口
- 登录页：输入用户名/密码（如有）
- agent 管理：添加/切换 agent
- 资源管理：系统监控、进程、磁盘、文件、Samba/NFS、网络、ACL
- 设置：主题切换、中英文切换

## 5. 生产部署建议
- 前端与代理服务建议同源部署，或通过 nginx/caddy 反代
- 启用 HTTPS，配置 CORS
- 定期轮换 API Key，仅后端持有密钥

---

详细 API 参考与安全建议见 [mingyue-go Web 前端接入指南](https://raw.githubusercontent.com/KOPElan/mingyue-go/refs/heads/main/docs/web-integration.md)