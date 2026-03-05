# data-model.md

## 1. 用户与会话
- UserSession
  - role: 'viewer' | 'operator' | 'admin'
  - displayName: string
  - currentAgent: string
  - token: string（仅后端代理持有，前端不存储）

## 2. Agent
- Agent
  - name: string
  - address: string
  - status: 'online' | 'offline'
  - version: string

## 3. 资源实体（与 API 对齐）
- SystemOverview
  - timestamp: string
  - cpu_percent: number
  - mem_total: number
  - mem_used: number
  - mem_percent: number
  - uptime: number
- Process
  - pid: number
  - name: string
  - status: string
  - cpu_percent: number
  - mem_rss: number
  - user: string
  - cmdline: string
- DiskDevice
  - name: string
  - size_bytes: number
  - type: string
  - mount_point: string
  - model: string
  - removable: boolean
- Mount
  - device: string
  - mount_point: string
  - fs_type: string
  - options: string
- FileEntry
  - name: string
  - type: string
  - size: number
  - mode: string
  - mod_time: string
  - is_dir: boolean
  - is_symlink: boolean
- SmbShare/NfsExport/NetworkInterface/AclEntry 等，字段与 API 文档一致

## 4. 界面设置
- UiSettings
  - theme: 'light' | 'dark' | 'auto'
  - language: 'zh-CN' | 'en-US'
  - agentList: Agent[]

---

所有实体字段与 mingyue-go API 保持同步，后续如有 API 变更需同步更新。