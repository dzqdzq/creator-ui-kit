/**
 * 可聚焦行为
 */

import domUtils from '../utils/dom-utils';
import type { FocusableBehavior, FocusableElement } from '../types';

const focusableBehavior: FocusableBehavior & ThisType<HTMLElement & FocusableBehavior> = {
  get focusable(): boolean {
    return true;
  },

  get focused(): boolean {
    return this.getAttribute('focused') !== null;
  },

  get unnavigable(): boolean {
    return this.getAttribute('unnavigable') !== null;
  },

  set unnavigable(value: boolean) {
    if (value) {
      this.setAttribute('unnavigable', '');
    } else {
      this.removeAttribute('unnavigable');
    }
  },

  _initFocusable(
    focusEls?: HTMLElement | HTMLElement[],
    navEls?: HTMLElement | HTMLElement[],
  ): void {
    if (focusEls) {
      if (Array.isArray(focusEls)) {
        this._focusELs = focusEls;
      } else {
        this._focusELs = [focusEls];
      }
    } else {
      this._focusELs = [];
    }

    if (navEls) {
      if (Array.isArray(navEls)) {
        this._navELs = navEls;
      } else {
        this._navELs = [navEls];
      }
    } else {
      this._navELs = this._focusELs;
    }

    requestAnimationFrame(() => {
      this.tabIndex = -1;

      for (const el of this._focusELs!) {
        el.tabIndex = -1;

        el.addEventListener('focus', () => {
          this._curFocus = el;
        });
      }
    });
  },

  _getFirstFocusableElement(): HTMLElement | null {
    if (!this._focusELs) {
      this._focusELs = [];
    }
    return this._focusELs.length > 0 ? this._focusELs[0] : null;
  },

  _setFocused(focused: boolean): void {
    if (this.focused !== focused) {
      // 确保 _focusELs 已初始化
      if (!this._focusELs) {
        this._focusELs = [];
      }

      if (focused) {
        this.setAttribute('focused', '');

        if (this._focusELs.length > 0) {
          const el = this._focusELs[0] as FocusableElement;

          if (el === this) {
            el.focus();
          } else if (el.focusable) {
            el._setFocused?.(true);
          } else {
            el.focus();
          }
        }
      } else {
        this.removeAttribute('focused');

        this._focusELs.forEach((el) => {
          const focusEl = el as FocusableElement;
          if (focusEl.focusable && focusEl.focused) {
            focusEl._setFocused?.(false);
          }
        });
      }

      domUtils.fire(this, 'focus-changed', {
        bubbles: true,
        detail: { focused: this.focused },
      });
    }
  },
};

export default focusableBehavior;
