import http from './http'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    username: string
    role: 'viewer' | 'operator' | 'admin'
    displayName: string
  }
}

export const authApi = {
  login(data: LoginRequest): Promise<{ data: LoginResponse }> {
    return http.post('/api/auth/login', data)
  },

  logout(): Promise<void> {
    return http.post('/api/auth/logout')
  }
}
