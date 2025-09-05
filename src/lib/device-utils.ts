export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
}

export class DeviceDetector {
  private static deviceInfo: DeviceInfo | null = null

  /**
   * 获取设备信息
   */
  static getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      // 服务端默认值
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 1
      }
    }

    if (this.deviceInfo) {
      return this.deviceInfo
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const devicePixelRatio = window.devicePixelRatio || 1

    // 检测移动设备
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                    screenWidth <= 768

    // 检测平板设备
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) ||
                    (screenWidth > 768 && screenWidth <= 1024)

    // 检测桌面设备
    const isDesktop = !isMobile && !isTablet

    // 检测触摸设备
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    this.deviceInfo = {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      screenWidth,
      screenHeight,
      devicePixelRatio
    }

    return this.deviceInfo
  }

  /**
   * 重置设备信息（窗口大小改变时调用）
   */
  static resetDeviceInfo(): void {
    this.deviceInfo = null
  }

  /**
   * 获取最佳画布尺寸
   */
  static getOptimalCanvasSize(): { width: number; height: number } {
    const device = this.getDeviceInfo()

    if (device.isMobile) {
      return {
        width: Math.min(device.screenWidth - 40, 600),
        height: Math.min(device.screenHeight - 200, 400)
      }
    }

    if (device.isTablet) {
      return {
        width: Math.min(device.screenWidth - 100, 800),
        height: Math.min(device.screenHeight - 200, 600)
      }
    }

    // 桌面设备
    return {
      width: 800,
      height: 600
    }
  }

  /**
   * 获取工具栏配置
   */
  static getToolbarConfig() {
    const device = this.getDeviceInfo()

    if (device.isMobile) {
      return {
        position: 'bottom' as const,
        size: 'small' as const,
        showLabels: false,
        collapsible: true
      }
    }

    if (device.isTablet) {
      return {
        position: 'left' as const,
        size: 'medium' as const,
        showLabels: true,
        collapsible: true
      }
    }

    // 桌面设备
    return {
      position: 'left' as const,
      size: 'large' as const,
      showLabels: true,
      collapsible: false
    }
  }
}
