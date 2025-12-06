/**
 * 只读行为
 */

import domUtils from '../utils/dom-utils';
import type { ReadonlyBehavior } from '../types';

interface ReadonlyElement extends HTMLElement {
  canBeReadonly?: boolean;
  _readonly?: boolean;
  _readonlyNested?: boolean;
  _setIsReadonlyAttribute?(readonly: boolean): void;
}

const readonlyBehavior: ReadonlyBehavior & ThisType<HTMLElement & ReadonlyBehavior> = {
  get canBeReadonly(): boolean {
    return true;
  },

  get readonly(): boolean {
    return this.getAttribute('is-readonly') !== null;
  },

  set readonly(value: boolean) {
    if (value !== this._readonly) {
      this._readonly = value;

      if (value) {
        this.setAttribute('readonly', '');
        this._setIsReadonlyAttribute(true);

        if (!this._readonlyNested) {
          return;
        }

        this._propgateReadonly();
      } else {
        this.removeAttribute('readonly');

        if (!this._isReadonlyInHierarchy(true)) {
          this._setIsReadonlyAttribute(false);

          if (!this._readonlyNested) {
            return;
          }

          this._propgateReadonly();
        }
      }
    }
  },

  _initReadonly(nested: boolean): void {
    this._readonly = this.getAttribute('readonly') !== null;

    if (this._readonly) {
      this._setIsReadonlyAttribute(true);
    }

    this._readonlyNested = nested;
  },

  _propgateReadonly(): void {
    domUtils.walk(this, { excludeSelf: true }, (el: HTMLElement) => {
      const readonlyEl = el as ReadonlyElement;
      return (
        !!readonlyEl.canBeReadonly &&
        (!!readonlyEl._readonly ||
          (readonlyEl._setIsReadonlyAttribute?.(this._readonly!), !readonlyEl._readonlyNested))
      );
    });
  },

  _isReadonlyInHierarchy(excludeSelf?: boolean): boolean {
    if (!excludeSelf && this.readonly) {
      return true;
    }
    let parent = this.parentNode as ReadonlyElement | null;

    while (parent) {
      if ((parent as any).readonly) {
        return true;
      }
      parent = parent.parentNode as ReadonlyElement | null;
    }

    return false;
  },

  _isReadonlySelf(): boolean {
    return this._readonly!;
  },

  _setIsReadonlyAttribute(readonly: boolean): void {
    if (readonly) {
      this.setAttribute('is-readonly', '');
    } else {
      this.removeAttribute('is-readonly');
    }
  },
};

export default readonlyBehavior;
