import { describe, it, expect } from 'vitest'
import { handleApiError, formatBytes, formatUptime } from '@/utils/error'

describe('formatBytes', () => {
  it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('should format bytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  it('should format fractional values', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})

describe('formatUptime', () => {
  it('should format less than a minute', () => {
    expect(formatUptime(30)).toBe('< 1 分钟')
  })

  it('should format minutes', () => {
    expect(formatUptime(120)).toBe('2分钟')
  })

  it('should format hours and minutes', () => {
    expect(formatUptime(3661)).toBe('1小时 1分钟')
  })

  it('should format days, hours, and minutes', () => {
    expect(formatUptime(90061)).toBe('1天 1小时 1分钟')
  })
})
