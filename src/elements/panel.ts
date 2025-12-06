import jsUtils from '../utils/js-utils';
import { clear } from '../utils/dom-utils';

/**
 * 面板配置接口
 */
interface PanelConfig {
  template?: string | ((info: PanelInfo) => string);
  style?: string;
  listeners?: Record<string, EventListener>;
  behaviors?: object[];
  $?: Record<string, string>;
  dependencies?: string[];
  shadowDOM?: boolean;
  [key: string]: unknown;
}

/**
 * 面板信息接口
 */
interface PanelInfo {
  title?: string;
  'shadow-dom'?: boolean;
  width?: number | string;
  height?: number | string;
  'min-width'?: number | string;
  'max-width'?: number | string;
  'min-height'?: number | string;
  'max-height'?: number | string;
  popable?: boolean;
  [key: string]: unknown;
}

/**
 * Mousetrap 接口
 */
interface Mousetrap {
  bind(key: string, callback: () => void): void;
  unbind(): void;
}

interface MousetrapConstructor {
  new (element: Element): Mousetrap;
}

declare global {
  interface Window {
    Mousetrap?: MousetrapConstructor;
  }
}

/**
 * UI Panel 组件
 * 参考 frame.js 实现的面板组件，用于创建可配置的面板界面
 *
 * 使用方式:
 * ```js
 * const panel = document.createElement('ui-panel');
 * panel.info = {
 *   title: 'My Panel',
 *   'shadow-dom': true,
 *   width: 300,
 *   height: 400
 * };
 * panel.load((error) => {
 *   if (!error) {
 *     console.log('Panel loaded');
 *   }
 * });
 * ```
 */
export default class Panel extends HTMLElement {
  static get tagName(): string {
    return 'ui-panel';
  }

  private _info: PanelInfo | null = null;
  private _focusedElement: Element | null = null;
  private _lastFocusedElement: Element | null = null;
  private _mousetrapList: Mousetrap[] | null = null;

  // 动态属性
  ready?: () => void;
  [key: string]: unknown;

  /**
   * 获取根元素（shadowRoot 或 this）
   */
  get root(): ShadowRoot | this {
    return this.shadowRoot ? this.shadowRoot : this;
  }

  /**
   * 获取面板信息
   */
  get info(): PanelInfo | null {
    return this._info;
  }

  /**
   * 设置面板信息
   */
  set info(value: PanelInfo | null) {
    this._info = value;
  }

  /**
   * 获取面板名称
   */
  get name(): string {
    return this._info?.title || this.id || 'Panel';
  }

  /**
   * 获取面板宽度
   */
  get width(): number | 'auto' {
    if (!this._info) {
      return 'auto';
    }
    const width = parseInt(String(this._info.width));
    return isNaN(width) ? 'auto' : width;
  }

  /**
   * 获取最小宽度
   */
  get minWidth(): number {
    if (!this._info) {
      return 100;
    }
    const width = parseInt(String(this._info['min-width']));
    return isNaN(width) ? 100 : width;
  }

  /**
   * 获取最大宽度
   */
  get maxWidth(): number | 'auto' {
    if (!this._info) {
      return 'auto';
    }
    const width = parseInt(String(this._info['max-width']));
    return isNaN(width) ? 'auto' : width;
  }

  /**
   * 获取面板高度
   */
  get height(): number | 'auto' {
    if (!this._info) {
      return 'auto';
    }
    const height = parseInt(String(this._info.height));
    return isNaN(height) ? 'auto' : height;
  }

  /**
   * 获取最小高度
   */
  get minHeight(): number {
    if (!this._info) {
      return 100;
    }
    const height = parseInt(String(this._info['min-height']));
    return isNaN(height) ? 100 : height;
  }

  /**
   * 获取最大高度
   */
  get maxHeight(): number | 'auto' {
    if (!this._info) {
      return 'auto';
    }
    const height = parseInt(String(this._info['max-height']));
    return isNaN(height) ? 'auto' : height;
  }

  /**
   * 是否可弹出
   */
  get popable(): boolean {
    return !this._info || this._info.popable !== false;
  }

  constructor() {
    super();
    this._info = null;
    this._focusedElement = null;
    this._lastFocusedElement = null;
  }

  /**
   * 当元素被插入到 DOM 时调用
   */
  connectedCallback(): void {
    this.classList.add('fit');
    this.tabIndex = -1;
  }

  /**
   * 当元素从 DOM 中移除时调用
   */
  disconnectedCallback(): void {
    // 清理资源
    if (this._mousetrapList) {
      this._mousetrapList.forEach((mousetrap) => {
        if (mousetrap && typeof mousetrap.unbind === 'function') {
          mousetrap.unbind();
        }
      });
      this._mousetrapList = null;
    }
  }

  /**
   * 通过 ID 查询元素
   */
  queryID(id: string): Element | null {
    const root = this.root;
    if (root instanceof ShadowRoot) {
      return root.getElementById(id);
    }
    return this.querySelector(`#${id}`);
  }

  /**
   * 查询单个元素
   */
  query<T extends Element = Element>(selector: string): T | null {
    return this.root.querySelector(selector) as T | null;
  }

  /**
   * 查询所有匹配的元素
   */
  queryAll<T extends Element = Element>(selector: string): NodeListOf<T> {
    return this.root.querySelectorAll(selector) as NodeListOf<T>;
  }

  /**
   * 重置面板
   */
  reset(): void {
    // 子类可以重写此方法
  }

  /**
   * 加载面板配置
   * @param config - 面板配置对象
   * @param callback - 加载完成回调 (error) => {}
   */
  load(config: PanelConfig, callback?: (error: Error | null) => void): void {
    if (!config) {
      const error = new Error('Panel config is required');
      if (callback) {
        callback(error);
      }
      return;
    }

    // 如果配置中有依赖，先加载依赖
    if (config.dependencies && config.dependencies.length) {
      this._loadDependencies(config.dependencies)
        .then(() => {
          this._apply(config);
          if (callback) {
            callback(null);
          }
        })
        .catch((error: Error) => {
          if (callback) {
            callback(error);
          }
        });
      return;
    }

    // 直接应用配置
    try {
      this._apply(config);
      if (callback) {
        callback(null);
      }
    } catch (error) {
      if (callback) {
        callback(error as Error);
      }
    }
  }

  /**
   * 加载依赖
   * @private
   */
  private async _loadDependencies(_dependencies: string[]): Promise<void> {
    // 这里可以实现依赖加载逻辑
    // 目前返回 Promise.resolve() 作为占位符
    return Promise.resolve();
  }

  /**
   * 应用面板配置
   * @private
   */
  private _apply(config: PanelConfig): void {
    const useShadowDOM = this._info?.['shadow-dom'] || config.shadowDOM;

    const { template, style, listeners, behaviors, $ } = config;

    // 将配置中的其他属性复制到实例上（除了特殊属性）
    jsUtils.assignExcept(this, config, [
      'dependencies',
      'template',
      'style',
      'listeners',
      'behaviors',
      '$',
      'shadowDOM',
    ]);

    // 应用 behaviors
    if (behaviors) {
      behaviors.forEach((behavior) => {
        jsUtils.addon(this, behavior);
      });
    }

    // 创建 Shadow DOM（如果需要）
    if (useShadowDOM && !this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const root = this.root;

    // 清空现有内容
    clear(root as HTMLElement);

    // 应用模板
    if (template) {
      const templateType = typeof template;
      if (templateType === 'string') {
        (root as Element).innerHTML = template as string;
      } else if (templateType === 'function') {
        (root as Element).innerHTML = (template as (info: PanelInfo) => string)(this._info || {});
      }
    }

    // 应用样式
    if (style) {
      const styleElement = document.createElement('style');
      styleElement.textContent = style;
      (root as Element).insertBefore(styleElement, (root as Element).firstChild);
    }

    // 应用 $ 选择器
    if ($) {
      for (const selectorName in $) {
        if (this[`$${selectorName}`]) {
          console.warn(`Failed to assign selector $${selectorName}, already used.`);
          continue;
        }
        const element = root.querySelector($[selectorName]);
        if (element) {
          this[`$${selectorName}`] = element;
        } else {
          console.warn(`Failed to query selector ${$[selectorName]} to $${selectorName}.`);
        }
      }
    }

    // 应用事件监听器
    if (listeners) {
      for (const eventName in listeners) {
        const handler = listeners[eventName].bind(this);
        const options: AddEventListenerOptions =
          eventName === 'mousewheel' ? { passive: true } : {};

        // 在 root 上添加监听器
        if (root) {
          (root as Element).addEventListener(eventName, handler, options);
        }

        // 在元素本身上也添加监听器
        this.addEventListener(eventName, handler, options);
      }
    }

    // 调用 ready 方法（如果存在）
    if (this.ready && typeof this.ready === 'function') {
      this.ready();
    }
  }

  /**
   * 注册快捷键（需要 mousetrap 库）
   * @param shortcuts - 快捷键配置对象
   */
  registerShortcuts(shortcuts: Record<string, string | Record<string, string>>): void {
    // 这个方法需要 mousetrap 库支持
    // 如果项目中没有 mousetrap，可以跳过或使用其他快捷键库
    if (typeof window === 'undefined' || !window.Mousetrap) {
      console.warn('Mousetrap is not available, shortcuts will not be registered');
      return;
    }

    const mousetrapList: Mousetrap[] = [];
    const root = this.root;

    for (const key in shortcuts) {
      if (key[0] !== '#') {
        // 全局快捷键
        const methodName = shortcuts[key] as string;
        const method = this[methodName];
        if (!method || typeof method !== 'function') {
          console.warn(
            `Failed to register shortcut, cannot find method ${methodName} in panel ${this.id}.`,
          );
          continue;
        }
        const mousetrap = new window.Mousetrap!(this);
        mousetrap.bind(key, (method as () => void).bind(this));
        mousetrapList.push(mousetrap);
      } else {
        // 元素特定的快捷键
        const element = root.querySelector(key);
        if (!element) {
          console.warn(`Failed to register shortcut for element ${key}, cannot find it.`);
          continue;
        }
        const elementShortcuts = shortcuts[key] as Record<string, string>;
        const mousetrap = new window.Mousetrap!(element);
        for (const shortcutKey in elementShortcuts) {
          const methodName = elementShortcuts[shortcutKey];
          const method = this[methodName];
          if (method && typeof method === 'function') {
            mousetrap.bind(shortcutKey, (method as () => void).bind(this));
          } else {
            console.warn(
              `Failed to register shortcut, cannot find method ${methodName} in panel ${this.id}.`,
            );
          }
        }
        mousetrapList.push(mousetrap);
      }
    }

    this._mousetrapList = mousetrapList;
  }
}

// 注册自定义元素
if (typeof window !== 'undefined' && window.customElements) {
  window.customElements.define('ui-panel', Panel);
}

export { Panel };
export type { PanelConfig, PanelInfo };
