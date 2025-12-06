/**
 * 按钮状态行为
 */

import domUtils from '../utils/dom-utils';
import focusMgr from '../utils/focus-mgr';
import type { ButtonStateBehavior, FocusableElement } from '../types';

function isPressed(el: HTMLElement): boolean {
  return el.getAttribute('pressed') !== null;
}

interface ButtonStateElement extends HTMLElement {
  disabled?: boolean;
  readonly?: boolean;
  focused?: boolean;
  _canceledByEsc?: boolean;
  _enterTimeoutID?: ReturnType<typeof setTimeout> | null;
}

const buttonStateBehavior: ButtonStateBehavior & ThisType<ButtonStateElement> = {
  _initButtonState(el: HTMLElement): void {
    domUtils.installDownUpEvent(el);

    el.addEventListener('keydown', (e: Event) => {
      const event = e as KeyboardEvent;
      if (!this.disabled) {
        if (event.keyCode === 32) {
          domUtils.acceptEvent(event);
          this._setPressed(el, true);
          this._canceledByEsc = false;
        } else if (event.keyCode === 13) {
          domUtils.acceptEvent(event);

          if (this._enterTimeoutID) {
            return;
          }

          this._setPressed(el, true);
          this._canceledByEsc = false;

          this._enterTimeoutID = setTimeout(() => {
            this._enterTimeoutID = null;
            this._setPressed(el, false);
            el.click();
          }, 100);
        } else {
          if (event.keyCode === 27) {
            domUtils.acceptEvent(event);

            if (isPressed(el)) {
              domUtils.fire(el, 'cancel', { bubbles: true });
              this._canceledByEsc = true;
            }

            this._setPressed(el, false);
          }
        }
      }
    });

    el.addEventListener('keyup', (e: Event) => {
      const event = e as KeyboardEvent;
      if (event.keyCode === 32) {
        domUtils.acceptEvent(event);

        if (isPressed(el)) {
          setTimeout(() => {
            el.click();
          }, 1);
        }

        this._setPressed(el, false);
      }
    });

    el.addEventListener('down', (e: Event) => {
      domUtils.acceptEvent(e);
      focusMgr._setFocusElement(this as FocusableElement);
      this._setPressed(el, true);
      this._canceledByEsc = false;
    });

    el.addEventListener('up', (e: Event) => {
      domUtils.acceptEvent(e);
      this._setPressed(el, false);
    });

    el.addEventListener('click', (e: Event) => {
      const event = e as MouseEvent;
      this._onButtonClick?.(el, event);

      if (!this.readonly) {
        if (this._canceledByEsc) {
          this._canceledByEsc = false;
          domUtils.acceptEvent(event);
          return;
        }
      }
    });

    el.addEventListener('focus-changed', () => {
      if (!this.focused) {
        this._setPressed(el, false);
      }
    });
  },

  _setPressed(el: HTMLElement, pressed: boolean): void {
    if (pressed) {
      el.setAttribute('pressed', '');
    } else {
      el.removeAttribute('pressed');
    }
  },
};

export default buttonStateBehavior;
