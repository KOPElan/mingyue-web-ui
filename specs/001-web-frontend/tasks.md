---

description: "Task list for Web 前端开发 feature implementation"
---

# Tasks: Web 前端开发

**Input**: Design documents from `/specs/001-web-frontend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化与基础结构

- [X] T001 创建 frontend/ 目录与基础项目结构（如 Vue3+Vite/React+Vite）
- [X] T002 初始化 package.json，配置 TypeScript、ESLint、Prettier
- [X] T003 [P] 配置国际化（i18n）与主题切换基础框架
- [X] T004 [P] 创建 backend-proxy/ 目录，初始化 API 代理服务（Node.js/Go）
- [X] T005 [P] 配置前后端开发环境与 CORS 支持

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础能力，所有用户故事前置

- [X] T006 实现 API 代理服务的 agent 动态注册与 API Key 安全注入（backend-proxy/src/）
- [X] T007 [P] 实现前端与代理的基础通信（frontend/src/api/proxy.ts）
- [X] T008 [P] 配置自动化测试框架（Playwright/Cypress/Vitest）
- [X] T009 [P] 配置全局错误处理与标准化提示（frontend/src/utils/error.ts）

---

## Phase 3: 用户故事 1 - 访问与登录管理后台 (P1)

**Goal**: 支持安全登录、登出、会话管理
**Independent Test Criteria**: 通过访问首页、输入凭证，验证能否正常登录并进入主界面

- [X] T010 [US1] 实现登录页 UI（frontend/src/pages/Login.vue|tsx）
- [X] T011 [US1] 实现登录逻辑与会话状态管理（frontend/src/store/session.ts）
- [X] T012 [P] [US1] 实现登出与会话失效处理（frontend/src/store/session.ts）
- [X] T013 [US1] 登录后跳转主界面，未登录访问自动重定向（frontend/src/router/index.ts）
- [X] T014 [US1] 登录相关自动化测试（tests/login.spec.ts）

---

## Phase 4: 用户故事 2 - 可视化管理 mingyue-go 资源 (P2)

**Goal**: 支持资源列表、详情、增删改查
**Independent Test Criteria**: 登录后可浏览资源、操作并获得反馈

- [X] T015 [US2] 实现 agent 管理与切换 UI（frontend/src/pages/AgentManager.vue|tsx）
- [X] T016 [US2] 实现系统监控页面（frontend/src/pages/SystemOverview.vue|tsx）
- [X] T017 [US2] 实现进程管理页面（frontend/src/pages/ProcessManager.vue|tsx）
- [X] T018 [US2] 实现磁盘与挂载管理页面（frontend/src/pages/DiskManager.vue|tsx）
- [X] T019 [US2] 实现文件管理页面（frontend/src/pages/FileManager.vue|tsx）
- [X] T020 [US2] 实现 Samba/NFS 管理页面（frontend/src/pages/ShareManager.vue|tsx）
- [X] T021 [US2] 实现网络与 ACL 管理页面（frontend/src/pages/NetworkAclManager.vue|tsx）
- [X] T022 [P] [US2] 实现所有资源的增删改查 API 封装（frontend/src/api/agent.ts）
- [X] T023 [P] [US2] 资源管理相关自动化测试（tests/resource.spec.ts）

---

## Phase 5: 用户故事 3 - 主题与多语言切换 (P3)

**Goal**: 支持主题与中英文切换
**Independent Test Criteria**: 用户可切换主题/语言，界面即时响应

- [X] T024 [US3] 实现主题切换组件与全局样式（frontend/src/components/ThemeSwitcher.vue|tsx）
- [X] T025 [US3] 实现中英文切换组件与国际化配置（frontend/src/components/LangSwitcher.vue|tsx）
- [X] T026 [P] [US3] 主题/语言切换相关自动化测试（tests/ui.spec.ts）

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T027 优化前端性能与懒加载（frontend/src/）
- [X] T028 完善文档与用户指引（frontend/README.md, quickstart.md）
- [X] T029 [P] 补充端到端自动化测试与 CI 配置（.github/workflows/ci.yml）
- [X] T030 [P] 代码与依赖安全审计（frontend/, backend-proxy/）

---

## Dependencies

- Phase 1 → Phase 2 → Phase 3/4/5（用户故事可并行，需完成前置）
- 资源管理各子模块可并行开发（如进程/磁盘/文件等）
- 主题/多语言切换可与资源管理并行

## Parallel Execution Examples

- T003、T004、T005 可与 T002 并行
- T007、T008、T009 可与 T006 并行
- T012、T014 可与 T011 并行
- T016~T021、T022 可并行（不同资源页面）
- T024、T025、T026 可并行
- T029、T030 可并行

## Implementation Strategy

- 先实现 MVP（Phase 3 用户故事 1 + Phase 1/2 基础），确保可登录、API 通、主界面可见
- 后续增量交付资源管理、主题/多语言、自动化测试等
- 每个用户故事均可独立测试与交付
