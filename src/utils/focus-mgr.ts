/**
 * 焦点管理器
 */

import { acceptEvent } from './dom-utils';
import type { FocusableElement } from '../types';

let focusedElement: FocusableElement | null = null;
let lastFocusedElement: FocusableElement | null = null;

interface FocusManager {
  _setFocusElement(el: FocusableElement | null): void;
  _refocus(): void;
  readonly focusedElement: FocusableElement | null;
  readonly lastFocusedElement: FocusableElement | null;
}

const focusMgr: FocusManager = {
  _setFocusElement(el: FocusableElement | null): void {
    // 添加调试日志
    if (el && (typeof el.getAttribute !== 'function' || !(el instanceof HTMLElement))) {
      console.error('[focus-mgr._setFocusElement] Invalid element:', {
        el,
        type: typeof el,
        isHTMLElement: el instanceof HTMLElement,
        hasGetAttribute: typeof el?.getAttribute,
        hasSetFocused: typeof el?._setFocused,
        constructor: el?.constructor?.name,
        prototype: Object.getPrototypeOf(el)?.constructor?.name,
        currentFocusedElement: focusedElement,
      });
    }

    if (focusedElement !== el) {
      if (focusedElement) {
        try {
          if (typeof focusedElement._setFocused === 'function') {
            focusedElement._setFocused(false);
          } else {
            console.warn(
              '[focus-mgr._setFocusElement] focusedElement._setFocused is not a function:',
              focusedElement,
            );
          }
        } catch (error) {
          console.error(
            '[focus-mgr._setFocusElement] Error calling _setFocused(false) on focusedElement:',
            error,
            'focusedElement:',
            focusedElement,
          );
        }
      }
      lastFocusedElement = focusedElement;
      focusedElement = el;
      if (el) {
        try {
          if (typeof el._setFocused === 'function') {
            el._setFocused(true);
          } else {
            console.warn('[focus-mgr._setFocusElement] el._setFocused is not a function:', el);
          }
        } catch (error) {
          console.error(
            '[focus-mgr._setFocusElement] Error calling _setFocused(true) on el:',
            error,
            'el:',
            el,
          );
          throw error;
        }
      }
    }
  },

  get focusedElement(): FocusableElement | null {
    return focusedElement;
  },

  get lastFocusedElement(): FocusableElement | null {
    return lastFocusedElement;
  },

  _refocus(): void {
    // 重新聚焦上一个焦点元素
    if (lastFocusedElement && typeof lastFocusedElement._setFocused === 'function') {
      this._setFocusElement(lastFocusedElement);
    }
  },
};

// 全局键盘事件处理
if (typeof window !== 'undefined') {
  window.addEventListener('mousedown', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName && !target.tagName.startsWith('UI-')) {
      if (e.which === 1) {
        focusMgr._setFocusElement(null);
      }
    }
  });

  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.keyCode === 9) {
        if (e.ctrlKey || e.metaKey) {
          return;
        }
        acceptEvent(e);
        // Tab 键导航可以在这里实现
      }
    },
    true,
  );
}

export default focusMgr;
