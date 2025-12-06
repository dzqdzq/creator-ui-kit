/**
 * DOM 工具函数
 */

import type { FireOptions, WalkOptions } from '../types';

const mouseEvents = ['mousedown', 'mousemove', 'mouseup', 'click'];
const buttonMapping = [0, 1, 4, 2];

const supportsButtons = (() => {
  try {
    return new MouseEvent('test', { buttons: 1 }).buttons === 1;
  } catch (e) {
    return false;
  }
})();

/**
 * 检查是否是左键点击
 */
function isLeftMouseButton(e: MouseEvent): boolean {
  if (!mouseEvents.includes(e.type)) {
    return false;
  }
  if (e.type === 'mousemove') {
    let buttons = e.buttons === undefined ? 1 : e.buttons;
    if (e instanceof window.MouseEvent && !supportsButtons) {
      buttons = buttonMapping[e.which] || 0;
    }
    return Boolean(1 & buttons);
  }
  return e.button === 0 || e.button === undefined;
}

/**
 * 清空元素内容
 */
export function clear(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * 触发自定义事件
 */
export function fire(el: HTMLElement, eventName: string, options?: FireOptions): void {
  options = options || {};
  el.dispatchEvent(new CustomEvent(eventName, options));
}

/**
 * 阻止事件传播和默认行为
 */
export function acceptEvent(e: Event): void {
  e.preventDefault();
  e.stopImmediatePropagation();
}

/**
 * 安装鼠标按下/抬起事件
 */
export function installDownUpEvent(target: HTMLElement): void {
  function cleanup(moveHandler: EventListener, upHandler: EventListener): void {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
  }

  target.addEventListener('mousedown', (e: Event) => {
    const mouseEvent = e as MouseEvent;
    acceptEvent(mouseEvent);
    if (!isLeftMouseButton(mouseEvent)) {
      return;
    }

    const moveHandler = (e: Event): void => {
      const moveEvent = e as MouseEvent;
      if (!isLeftMouseButton(moveEvent)) {
        fire(target, 'up', { detail: { sourceEvent: moveEvent }, bubbles: true });
        cleanup(moveHandler, upHandler);
      }
    };

    const upHandler = (e: Event): void => {
      const upEvent = e as MouseEvent;
      if (isLeftMouseButton(upEvent)) {
        fire(target, 'up', { detail: { sourceEvent: upEvent }, bubbles: true });
        cleanup(moveHandler, upHandler);
      }
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler, true);
    fire(target, 'down', { detail: { sourceEvent: mouseEvent }, bubbles: true });
  });
}

/**
 * 遍历 DOM 树
 */
export function walk(
  el: HTMLElement,
  options: WalkOptions | ((el: HTMLElement) => boolean),
  callback?: (el: HTMLElement) => boolean,
): void {
  const opts = typeof options === 'function' ? {} : options;
  const cb = typeof options === 'function' ? options : callback!;

  if (!opts.excludeSelf) {
    if (cb(el)) {
      return;
    }
  }

  if (!el.children.length) {
    return;
  }

  let parent: HTMLElement = el;
  let current: Element | null = el.children[0];

  while (true) {
    if (!current) {
      if (parent === el) {
        return;
      }
      current = parent;
      parent = parent.parentElement as HTMLElement;
      current = current.nextElementSibling;
    }
    if (current) {
      if (cb(current as HTMLElement)) {
        current = current.nextElementSibling;
        continue;
      }
      if (current.children.length) {
        parent = current as HTMLElement;
        current = current.children[0];
      } else {
        current = current.nextElementSibling;
      }
    }
  }
}

/**
 * 创建样式元素
 * @param href 样式文件路径或 theme:// 协议的 URL
 */
export function createStyleElement(href: string): HTMLStyleElement | HTMLLinkElement {
  // 如果是 theme:// 协议，需要在运行时解析
  if (href.startsWith('theme://')) {
    // 创建一个空的 style 元素，实际样式会通过 CSS 加载器注入
    const style = document.createElement('style');
    style.setAttribute('data-theme-href', href);
    return style;
  }

  // 普通的 CSS 链接
  const link = document.createElement('link') as HTMLLinkElement;
  link.rel = 'stylesheet';
  link.href = href;
  return link;
}

// 保存拖拽时的遮罩元素
let dragGhost: HTMLDivElement | null = null;

/**
 * 添加拖拽遮罩（防止选中文本等）
 */
export function addDragGhost(): HTMLDivElement {
  if (!dragGhost) {
    dragGhost = document.createElement('div');
    dragGhost.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      cursor: move;
    `;
  }
  if (!dragGhost.parentElement) {
    document.body.appendChild(dragGhost);
  }
  return dragGhost;
}

/**
 * 移除拖拽遮罩
 */
export function removeDragGhost(): void {
  if (dragGhost && dragGhost.parentElement) {
    dragGhost.parentElement.removeChild(dragGhost);
  }
}

// 添加默认导出以保持向后兼容
export default {
  clear,
  fire,
  acceptEvent,
  installDownUpEvent,
  walk,
  createStyleElement,
  addDragGhost,
  removeDragGhost,
};
