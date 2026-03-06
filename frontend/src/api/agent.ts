import http from './http'

// All agent API calls go through /proxy/:agentId/*

export interface SystemOverview {
  timestamp: string
  cpu_percent: number
  mem_total: number
  mem_used: number
  mem_percent: number
  uptime: number
}

export interface Process {
  pid: number
  name: string
  status: string
  cpu_percent: number
  mem_rss: number
  user: string
  cmdline: string
}

export interface DiskDevice {
  name: string
  size_bytes: number
  type: string
  mount_point: string
  model: string
  removable: boolean
}

export interface Mount {
  device: string
  mount_point: string
  fs_type: string
  options: string
}

export interface FileEntry {
  name: string
  type: string
  size: number
  mode: string
  mod_time: string
  is_dir: boolean
  is_symlink: boolean
}

export interface SmbShare {
  name: string
  path: string
  comment: string
  valid_users: string
  read_only: boolean
}

export interface NfsExport {
  path: string
  clients_spec: string
  options: string
}

export interface NetworkInterface {
  ifname: string
  addresses: string[]
  mac: string
  mtu: number
  state: string
}

export interface AclEntry {
  path: string
  entries: string[]
}

const agentApi = (agentId: string) => ({
  // System overview
  getSystemOverview(): Promise<{ data: SystemOverview }> {
    return http.get(`/proxy/${agentId}/api/v1/system/overview`)
  },

  // Processes
  getProcesses(): Promise<{ data: Process[] }> {
    return http.get(`/proxy/${agentId}/api/v1/processes`)
  },

  killProcess(pid: number): Promise<void> {
    return http.delete(`/proxy/${agentId}/api/v1/processes/${pid}`)
  },

  // Disks
  getDisks(): Promise<{ data: DiskDevice[] }> {
    return http.get(`/proxy/${agentId}/api/v1/disks`)
  },

  getMounts(): Promise<{ data: Mount[] }> {
    return http.get(`/proxy/${agentId}/api/v1/mounts`)
  },

  // Files
  getFiles(path: string): Promise<{ data: FileEntry[] }> {
    return http.get(`/proxy/${agentId}/api/v1/files`, { params: { path } })
  },

  uploadFile(path: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    return http.post(`/proxy/${agentId}/api/v1/files/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteFile(path: string): Promise<void> {
    return http.delete(`/proxy/${agentId}/api/v1/files`, { params: { path } })
  },

  createDirectory(path: string): Promise<void> {
    return http.post(`/proxy/${agentId}/api/v1/files/mkdir`, { path })
  },

  getFileDownloadUrl(path: string): string {
    return `/proxy/${agentId}/api/v1/files/download?path=${encodeURIComponent(path)}`
  },

  // SMB Shares
  getSmbShares(): Promise<{ data: SmbShare[] }> {
    return http.get(`/proxy/${agentId}/api/v1/smb/shares`)
  },

  // NFS Exports
  getNfsExports(): Promise<{ data: NfsExport[] }> {
    return http.get(`/proxy/${agentId}/api/v1/nfs/exports`)
  },

  // Network interfaces
  getNetworkInterfaces(): Promise<{ data: NetworkInterface[] }> {
    return http.get(`/proxy/${agentId}/api/v1/network/interfaces`)
  },

  // ACL
  getAcl(path: string): Promise<{ data: AclEntry }> {
    return http.get(`/proxy/${agentId}/api/v1/acl`, { params: { path } })
  }
})

export default agentApi
