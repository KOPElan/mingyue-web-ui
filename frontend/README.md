# 明月 Web 管理界面 (mingyue-web-ui)

明月管理平台前端 - 为 mingyue-go 后端提供安全、可扩展的 Web 管理界面。

## 功能特性

- 🔐 安全登录与会话管理（JWT token 仅存内存，不落盘）
- 🌐 多 Agent 动态切换（通过 backend-proxy 代理访问）
- 📊 系统监控（CPU、内存、运行时间）
- ⚙️ 进程管理（列表、搜索、终止）
- 💾 磁盘与挂载管理
- 📁 文件管理（浏览、上传、下载、删除）
- 🔗 Samba/NFS 共享管理
- 🌐 网络接口与 ACL 管理
- 🎨 主题切换（浅色/深色/跟随系统）
- 🌍 国际化（中文/英文）

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 8

### 安装依赖

```bash
# 安装 backend-proxy 依赖
cd backend-proxy
npm install

# 安装 frontend 依赖
cd frontend
npm install
```

### 启动开发环境

```bash
# 1. 启动 backend-proxy（在 backend-proxy/ 目录）
cd backend-proxy
cp .env.example .env
npm run dev
# 代理运行在 http://localhost:3000

# 2. 启动前端（在 frontend/ 目录）
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

### 默认登录

- 用户名: `admin`
- 密码: `admin123`

## 项目结构

```
.
├── backend-proxy/          # Node.js API 代理服务
│   ├── src/
│   │   └── index.js        # Express 服务器
│   └── package.json
├── frontend/               # Vue3 + Vite 前端
│   ├── src/
│   │   ├── api/            # API 封装
│   │   ├── components/     # 公共组件
│   │   ├── locales/        # 国际化
│   │   ├── pages/          # 页面组件
│   │   ├── router/         # Vue Router 配置
│   │   ├── stores/         # Pinia 状态管理
│   │   └── utils/          # 工具函数
│   └── tests/              # 自动化测试
│       ├── e2e/            # Playwright E2E 测试
│       └── unit/           # Vitest 单元测试
└── .github/workflows/      # GitHub Actions CI
```

## 构建

```bash
cd frontend
npm run build
# 构建产物在 frontend/dist/
```

## 测试

```bash
cd frontend
# 单元测试
npm run test:unit

# E2E 测试（需先启动 backend-proxy 和 frontend dev 服务）
npm run test:e2e
```

## 安全设计

- **API Key 安全**: API Key 仅存储在 backend-proxy 内存中，前端无法获取
- **Token 安全**: JWT token 仅存储在内存（Pinia store），页面刷新后清除
- **代理隔离**: 所有 agent API 请求通过 backend-proxy 转发，前端不直接访问 agent

## 环境变量 (backend-proxy/.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 代理服务端口 | `3000` |
| `JWT_SECRET` | JWT 签名密钥 | `mingyue-secret-change-me` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |
| `INITIAL_AGENTS` | 初始 agent 列表（JSON） | 无 |

> ⚠️ **生产环境务必修改 JWT_SECRET 和管理员密码！**

## License

GPLv3
