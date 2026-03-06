# mingyue-web-ui

[![CI](https://github.com/KOPElan/mingyue-web-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/KOPElan/mingyue-web-ui/actions/workflows/ci.yml)
[![Release](https://github.com/KOPElan/mingyue-web-ui/actions/workflows/release.yml/badge.svg)](https://github.com/KOPElan/mingyue-web-ui/actions/workflows/release.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[mingyue-go](https://github.com/KOPElan/mingyue-go) 的 Web 管理前端，提供安全、可扩展、美观的管理界面。

> **安全设计**：前端不直接持有 API Key，所有 Agent API 调用均通过内置 `backend-proxy` 代理转发，密钥仅存储于代理服务内存。

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🔐 安全认证 | 登录/登出、JWT Token 仅存内存（不落盘）、路由守卫 |
| 🌐 多 Agent 管理 | 动态添加/切换 Agent，支持连通性检测 |
| 📊 系统监控 | CPU、内存、运行时间实时展示 |
| ⚙️ 进程管理 | 进程列表、搜索、终止 |
| 💾 磁盘管理 | 磁盘设备与挂载点管理 |
| 📁 文件管理 | 文件浏览、上传、下载、删除 |
| 🔗 共享管理 | Samba / NFS 共享配置 |
| 🌐 网络/ACL | 网络接口与访问控制管理 |
| 🎨 主题切换 | 浅色 / 深色 / 跟随系统 |
| 🌍 多语言 | 中文 / English 运行时切换 |

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- npm >= 8

### 一键启动（Docker Compose 推荐）

```bash
git clone https://github.com/KOPElan/mingyue-web-ui.git
cd mingyue-web-ui

# 复制并编辑环境变量
cp backend-proxy/.env.example backend-proxy/.env
# 务必修改 JWT_SECRET 和 ADMIN_PASSWORD！

docker compose up -d
# 访问 http://localhost:5173
```

### 本地开发环境

```bash
# 1. 安装依赖
cd backend-proxy && npm install
cd ../frontend && npm install

# 2. 启动代理服务（backend-proxy/目录）
cd backend-proxy
cp .env.example .env   # 修改 .env 中的密钥
npm run dev            # 监听 http://localhost:3000

# 3. 启动前端（frontend/目录，另开终端）
cd frontend
npm run dev            # 监听 http://localhost:5173
```

### 默认登录凭据

> ⚠️ **生产环境务必在 `.env` 中修改！**

| 字段 | 默认值 |
|------|--------|
| 用户名 | `admin` |
| 密码 | `admin123` |

## 📁 项目结构

```
mingyue-web-ui/
├── frontend/                  # Vue3 + Vite + TypeScript 前端
│   ├── src/
│   │   ├── api/               # Axios API 封装（proxy.ts、agent.ts）
│   │   ├── components/        # 公共组件（ThemeSwitcher、LangSwitcher、AgentSelector）
│   │   ├── locales/           # 国际化文件（zh-CN、en-US）
│   │   ├── pages/             # 页面组件（Login、Dashboard、各资源页）
│   │   ├── router/            # Vue Router 路由配置
│   │   ├── stores/            # Pinia 状态管理（session、ui）
│   │   └── utils/             # 工具函数（error.ts）
│   └── tests/
│       ├── e2e/               # Playwright E2E 测试
│       └── unit/              # Vitest 单元测试
├── backend-proxy/             # Node.js + Express API 代理服务
│   ├── src/
│   │   └── index.js           # 主服务（JWT、代理转发、Agent 管理）
│   └── .env.example           # 环境变量模板
├── docs/
│   └── deployment.md          # 生产部署文档
├── docker-compose.yml         # 一键启动配置
└── .github/workflows/
    ├── ci.yml                 # CI（lint、构建、测试）
    └── release.yml            # 构建发布（Docker 镜像 + GitHub Release）
```

## 🔧 常用命令

```bash
# 前端
cd frontend
npm run dev          # 开发服务器
npm run build        # 生产构建（产物在 dist/）
npm run lint         # ESLint 代码检查
npm run test:unit    # Vitest 单元测试
npm run test:e2e     # Playwright E2E 测试

# 后端代理
cd backend-proxy
npm run dev          # 开发模式（文件热重载）
npm start            # 生产模式
```

## ⚙️ 环境变量（backend-proxy/.env）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 代理服务端口 | `3000` |
| `JWT_SECRET` | JWT 签名密钥 | `mingyue-secret-change-me` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |
| `INITIAL_AGENTS` | 初始 Agent 列表（JSON 数组） | 无 |

`INITIAL_AGENTS` 示例：

```json
[
  {
    "id": "agent1",
    "name": "本地主机",
    "address": "http://192.168.1.100:8080",
    "apiKey": "your-api-key",
    "status": "online",
    "version": "1.0.0"
  }
]
```

## 🔐 安全设计

- **API Key 隔离**：密钥仅存储于 backend-proxy 内存，前端无法获取明文密钥
- **Token 策略**：JWT Token 仅存于 Pinia store（内存），页面刷新后清除，不写入 localStorage / sessionStorage
- **代理隔离**：所有 Agent API 请求通过 `/proxy/:agentId/*` 路径转发，前端不直接访问 Agent
- **速率限制**：登录接口 20次/15分钟，其余 API 200次/分钟
- **角色权限**：viewer（只读）/ operator（可写）/ admin（全权）

## 📦 生产部署

详见 [docs/deployment.md](docs/deployment.md)，包含：

- Docker 单容器部署
- Docker Compose 完整部署
- nginx 反向代理配置
- HTTPS / 安全加固建议

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。代码风格遵循 ESLint + Prettier 配置，提交前请运行 `npm run lint`。

## 📄 License

[GPL-3.0](LICENSE)
