/**
 * 禁用行为
 */

import domUtils from '../utils/dom-utils';
import type { DisableBehavior } from '../types';

interface DisableElement extends HTMLElement {
  canBeDisable?: boolean;
  _disabled?: boolean;
  _disabledNested?: boolean;
  _setIsDisabledAttribute?(disabled: boolean): void;
}

const disableBehavior: DisableBehavior & ThisType<HTMLElement & DisableBehavior> = {
  get canBeDisable(): boolean {
    return true;
  },

  get disabled(): boolean {
    return this.getAttribute('is-disabled') !== null;
  },

  set disabled(value: boolean) {
    if (value !== this._disabled) {
      this._disabled = value;

      if (value) {
        this.setAttribute('disabled', '');
        this._setIsDisabledAttribute(true);

        if (!this._disabledNested) {
          return;
        }

        this._propgateDisable();
      } else {
        this.removeAttribute('disabled');

        if (!this._isDisabledInHierarchy(true)) {
          this._setIsDisabledAttribute(false);

          if (!this._disabledNested) {
            return;
          }

          this._propgateDisable();
        }
      }
    }
  },

  _initDisable(nested: boolean): void {
    this._disabled = this.getAttribute('disabled') !== null;

    if (this._disabled) {
      this._setIsDisabledAttribute(true);
    }

    this._disabledNested = nested;
  },

  _propgateDisable(): void {
    domUtils.walk(this, { excludeSelf: true }, (el: HTMLElement) => {
      const disableEl = el as DisableElement;
      return (
        !!disableEl.canBeDisable &&
        (!!disableEl._disabled ||
          (disableEl._setIsDisabledAttribute?.(this._disabled!), !disableEl._disabledNested))
      );
    });
  },

  _isDisabledInHierarchy(excludeSelf?: boolean): boolean {
    if (!excludeSelf && this.disabled) {
      return true;
    }
    let parent = this.parentNode as DisableElement | null;

    while (parent) {
      if ((parent as any).disabled) {
        return true;
      }
      parent = parent.parentNode as DisableElement | null;
    }

    return false;
  },

  _isDisabledSelf(): boolean {
    return this._disabled!;
  },

  _setIsDisabledAttribute(disabled: boolean): void {
    if (disabled) {
      this.setAttribute('is-disabled', '');
    } else {
      this.removeAttribute('is-disabled');
    }
  },
};

export default disableBehavior;
