# Feature Specification: Web 前端开发

**Feature Branch**: `[001-web-frontend]`  
**Created**: 2026-03-05  
**Status**: Draft  
**Input**: User description: "为 https://github.com/KOPElan/mingyue-go 开发一个 web 前端"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 访问与登录管理后台 (Priority: P1)

作为用户，我希望通过浏览器访问一个美观、直观的 Web 管理界面，并通过登录认证后安全地管理 mingyue-go 后端资源。

**Why this priority**: 登录与访问是所有后续操作的前提，直接影响系统安全与用户体验。

**Independent Test**: 通过访问首页、输入账号密码，验证能否正常登录并进入主界面。

**Acceptance Scenarios**:

1. **Given** 用户未登录，**When** 访问管理界面，**Then** 跳转到登录页
2. **Given** 用户输入正确凭证，**When** 点击登录，**Then** 成功进入主界面
3. **Given** 用户输入错误凭证，**When** 点击登录，**Then** 显示错误提示

---

### User Story 2 - 可视化管理 mingyue-go 资源 (Priority: P2)

作为已登录用户，我希望在前端界面中直观地查看、检索、编辑和管理 mingyue-go 后端的各类资源（如节点、任务、配置等），提升管理效率。

**Why this priority**: 资源可视化是管理系统的核心价值，直接提升易用性和效率。

**Independent Test**: 登录后可浏览资源列表、查看详情、进行增删改查操作。

**Acceptance Scenarios**:

1. **Given** 用户已登录，**When** 进入资源管理页，**Then** 能看到资源列表
2. **Given** 用户点击某资源，**When** 查看详情，**Then** 展示详细信息
3. **Given** 用户进行增删改查操作，**When** 操作成功，**Then** 页面及时反馈并刷新数据

---

### User Story 3 - 主题与多语言切换 (Priority: P3)

作为用户，我希望界面支持主题（如明暗模式）和中英文切换，以适应不同使用习惯和场景。

**Why this priority**: 增强用户个性化体验，提升国际化和可访问性。

**Independent Test**: 用户可在界面切换主题和语言，界面内容与样式即时响应。

**Acceptance Scenarios**:

1. **Given** 用户在主界面，**When** 切换主题，**Then** 所有页面样式随之变化
2. **Given** 用户在主界面，**When** 切换语言，**Then** 所有文本即时切换为目标语言

---

### Edge Cases
- 前端不直接持有 API Key，所有 API 调用通过后端代理转发，最大限度降低密钥泄漏风险

- 用户多次输入错误密码，系统应有安全提示或限制（如临时锁定、验证码等）
- 后端 API 异常、无响应或返回标准错误码时，前端应有友好错误提示，并能区分 401/403/404/500 等常见错误
- 资源数据量极大时，界面应支持分页、搜索与懒加载，保证性能
- API Key 失效、权限不足、密钥丢失等场景，前端应有明确指引（如跳转登录、提示联系管理员）
- 局域网自动发现失败时，允许用户手动输入 agent 地址并检测连通性

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须支持 Bearer Token 登录、登出及会话管理，所有 API 调用除 /health、/version 外均需认证
- **FR-002**: 系统必须通过 API 获取并展示 mingyue-go 后端的各类资源，涵盖系统监控、进程、磁盘、文件、Samba/NFS、网络、ACL 等
- **FR-003**: 用户必须能对资源进行增删改查操作，所有操作均通过 API 实现，需严格遵循角色权限（viewer/operator/admin）
- **FR-004**: 系统必须支持主题切换（如明暗模式）
- **FR-005**: 系统必须支持中英文界面切换
- **FR-006**: 所有 API Key 不得硬编码在前端源码，不得存储于 localStorage/sessionStorage，**所有 API 调用通过后端代理转发，前端不直接持有密钥**
- **FR-007**: 支持局域网自动发现 agent（后端代理/手动输入），并能动态切换/管理多个 agent
- **FR-008**: 前端需对 API 错误码（401/403/404/409/500 等）进行标准化处理，友好提示用户
- **FR-009**: 页面加载时间应小于 2 秒，主要交互响应时间小于 200ms
- **FR-010**: 前端需兼容主流浏览器，适配不同分辨率

### Key Entities

- **用户**：会话状态、角色（viewer/operator/admin），API Key 由后端代理安全管理，前端不直接持有
- **资源**：系统监控、进程、磁盘、挂载、文件、Samba/NFS 共享、网络接口、ACL 等，属性与后端 API 保持一致
- **界面设置**：主题、语言偏好、已配置 agent 列表

## Success Criteria *(mandatory)*

## Clarifications

### Session 2026-03-06
- Q: API Key 管理推荐方案？ → A: 后端代理API，前端不直接持有Key（推荐）

### Measurable Outcomes

- **SC-001**: 95% 用户可在 2 分钟内完成首次登录、agent 发现与主要资源管理操作
- **SC-002**: 主要页面加载时间 < 2 秒，交互响应 < 200ms
- **SC-003**: 90% 以上用户可无障碍切换主题与语言
- **SC-004**: 资源管理相关操作出错率低于 1%，所有错误均有友好提示，API 错误码处理符合官方建议
- **SC-005**: 支持 Chrome、Edge、Firefox、Safari 等主流浏览器
- **SC-006**: 不出现 API Key 泄漏、硬编码、前端明文存储等安全问题
