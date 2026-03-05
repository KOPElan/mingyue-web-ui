# research.md

## 1. 技术选型与架构澄清

### 1.1 前端框架
- 需明确采用 Vue3（推荐）、React、还是其它主流框架？
- 需支持 TypeScript，便于类型安全和维护。

### 1.2 组件库
- 推荐 Element Plus（Vue）、Ant Design（React）等，需支持国际化与主题切换。

### 1.3 API 代理实现
- 采用 Node.js（Express/Koa）或 Go 实现后端 API 代理，负责注入 API Key 并转发请求。
- 需支持多 agent 动态切换，安全隔离。

### 1.4 自动化测试
- 前端端到端测试建议采用 Playwright/Cypress。
- 单元测试建议采用 Vitest/Jest。

### 1.5 部署与安全
- 前端与代理可独立部署，建议通过 nginx/caddy 反代并启用 HTTPS。
- 需配置 CORS，防止跨域问题。

## 2. 关键 API 场景澄清

- 多 agent 切换：前端需维护 agent 地址与显示名映射，切换时刷新所有数据。
- 错误处理：所有 API 错误需标准化提示，401/403 跳转登录，404/409/500 友好弹窗。
- 文件/二进制内容：需处理 Base64 编解码，支持大文件分片/断点续传（如后续扩展）。

## 3. 角色与权限

- 仅 operator 及以上角色可进行写操作，viewer 只读。
- 前端需根据当前角色动态调整可见操作项。

## 4. 兼容性与性能

- 需兼容 Chrome、Edge、Firefox、Safari 最新主流版本。
- 大数据量场景下需分页、懒加载，避免一次性加载全部数据。

## 5. 参考资料
- [mingyue-go Web 前端接入指南](https://raw.githubusercontent.com/KOPElan/mingyue-go/refs/heads/main/docs/web-integration.md)
- [TypeScript 客户端示例](同上文档第7节)

---

所有澄清点已收录，无 NEEDS CLARIFICATION 段落。