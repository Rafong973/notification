const win = window as any

class NotificationClass {
  private globalOption: NotificationOptions | null
  private notificationList: Array<Notification>
  constructor(options: NotificationOptions) {
    // 全局配置
    this.globalOption = null
    // 通知列表
    this.notificationList = []

    // 检查当前运行环境
    if (environmentSupport()) {
      console.warn('必须是HTTPS或者localhost')
    } else {
      // 保存全局配置
      this.setGlobalOptions = options

      // 申请通知权限
      this.requestPermission()
    }
  }

  // 打开通知
  open(title: string, options?: NotificationOptions) {
    if (!this.permission || this.permission !== 'granted') return null

    // 添加tag标识
    const tag = String(new Date().getTime())
    if (!options) {
      options = {
        tag
      }
    } else {
      if (!options.tag) options.tag = tag
    }

    return this.init(title, options)
  }
  // 生成单个通知
  init(title: string, options: customNotificationOptions) {
    let item: Notification = new this.NotificationAPI(title, Object.assign(this.globalOption as NotificationOptions, options))
    this.addNotificationItem = item

    item.onclose = () => {
      options.close && options.close()
      this.removeNotificationItem = item
    }

    item.onclick = () => {
      options.onclick && options.onclick()
    }

    item.onerror = () => {
      this.removeNotificationItem = item
    }

    item.onshow = () => {
      options.onshow && options.onshow()
    }
    // 返回通知本身，用于链式调用
    return item
  }

  requestPermission() {
    if (!this.permission || (this.permission && this.permission !== 'denied')) {
      return this.NotificationAPI.requestPermission()
    } else {
      console.warn('通知权限被拒绝')
    }
  }

  set setGlobalOptions(value: NotificationOptions) {
    this.globalOption = value
  }
  // 获取权限
  get permission() {
    return (this.NotificationAPI && this.NotificationAPI.permission) || null
  }
  // 获取Notification API
  get NotificationAPI() {
    const Notification = win.Notification || win.webkitNotifications
    return Notification || {}
  }
  // 将每个通知添加到数据组
  set addNotificationItem(item: Notification) {
    this.notificationList.push(item)
  }
  // 从通知列表中删除某个通知
  set removeNotificationItem(item: Notification) {
    const { tag } = item
    let index = this.notificationList.findIndex((i) => i.tag === tag)
    if (index > -1) {
      this.notificationList.splice(index)
    }
  }
}

// 判断环境，Notification仅支持本地或者HTTPS域名
function environmentSupport() {
  const protocol = window.location.protocol
  const host = window.location.host
  return !protocol.includes('https:') && !(host.includes('localhost') || host.includes('127.0.0.1'))
}

export interface notificationOptionsHook {
  callback?: Function
  close?: Function
  onclick?: Function
  onshow?: Function
}

type customNotificationOptions = NotificationOptions & notificationOptionsHook

const notification = new NotificationClass({
  dir: 'auto',
  lang: 'zh-CN',
  icon: ''
})

export default notification
