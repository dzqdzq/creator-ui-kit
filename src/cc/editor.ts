/**
 * Editor 模拟对象
 * 用于模拟 Cocos Creator 编辑器的全局 Editor API
 */

// Profile 类，模拟编辑器配置文件
class EditorProfile {
  private data: Record<string, any> = {}
  private listeners: Map<string, Function[]> = new Map()

  constructor(path: string) {
    console.log('[Editor.Profile.load]', path)
    // 模拟一些默认数据
    this.data = {
      'group-list': ['default', 'UI', 'Background', 'Player', 'Enemy']
    }
  }

  get(key: string): any {
    console.log('[Editor.Profile.get]', key)
    return this.data[key]
  }

  set(key: string, value: any): void {
    console.log('[Editor.Profile.set]', key, value)
    this.data[key] = value
  }

  on(event: string, callback: Function): void {
    console.log('[Editor.Profile.on]', event)
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  removeListener(event: string, callback: Function): void {
    console.log('[Editor.Profile.removeListener]', event)
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
}

// IPC 通信模块
const Ipc = {
  sendToPanel(panel: string, channel: string, ...args: any[]): void {
    console.log('[Editor.Ipc.sendToPanel]', { panel, channel, args })
  },

  sendToMain(channel: string, ...args: any[]): void {
    console.log('[Editor.Ipc.sendToMain]', { channel, args })
  }
}

// 面板模块
const Panel = {
  open(panelName: string, options?: Record<string, any>): void {
    console.log('[Editor.Panel.open]', { panelName, options })
  },

  close(panelName: string): void {
    console.log('[Editor.Panel.close]', { panelName })
  }
}

// UI 模块
const UI = {
  fire(element: HTMLElement, eventName: string, options?: CustomEventInit): void {
    console.log('[Editor.UI.fire]', { element, eventName, options })
    // 实际触发自定义事件
    const event = new CustomEvent(eventName, options)
    element.dispatchEvent(event)
  }
}

// AssetDB 模块
const assetdb = {
  remote: {
    uuidToFspath(uuid: string): string {
      console.log('[Editor.assetdb.remote.uuidToFspath]', uuid)
      return `/mock/path/${uuid}`
    },

    fspathToUuid(fspath: string): string | null {
      console.log('[Editor.assetdb.remote.fspathToUuid]', fspath)
      return `mock-uuid-${fspath.replace(/\//g, '-')}`
    }
  }
}

// Profile 模块
const Profile = {
  load(path: string): EditorProfile {
    return new EditorProfile(path)
  }
}

// 翻译函数
function T(key: string, ...args: any[]): string {
  console.log('[Editor.T]', key, args)
  // 返回 key 的最后一部分作为显示文本
  const parts = key.split('.')
  return parts[parts.length - 1] || key
}

// 日志函数
function log(...args: any[]): void {
  console.log('[Editor.log]', ...args)
}

function warn(...args: any[]): void {
  console.warn('[Editor.warn]', ...args)
}

function error(...args: any[]): void {
  console.error('[Editor.error]', ...args)
}

function info(...args: any[]): void {
  console.info('[Editor.info]', ...args)
}

// 导出 Editor 对象
export const Editor = {
  T,
  Ipc,
  Panel,
  UI,
  Profile,
  assetdb,
  log,
  warn,
  error,
  info
}

// 默认导出
export default Editor

// 挂载到全局 window 对象（用于兼容旧代码）
if (typeof window !== 'undefined') {
  (window as any).Editor = Editor
}

