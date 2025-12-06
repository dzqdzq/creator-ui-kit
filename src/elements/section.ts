/**
 * UI Section 组件
 */

import elementUtils from '../utils/utils';
import { acceptEvent } from '../utils/dom-utils';
import focusMgr from '../utils/focus-mgr';
import { getElementStyleSync } from '../utils/css-loader';
import focusableBehavior from '../behaviors/focusable';
import disableBehavior from '../behaviors/disable';

const template = /*html*/ `
    <div class="wrapper">
      <i class="fold icon-fold-up"></i>
      <slot name="header"></slot>
    </div>
    <slot class="content"></slot>
  `;

export default elementUtils.registerElement('ui-section', {
  get hovering(): boolean {
    return this.getAttribute('hovering') !== null;
  },

  set hovering(value: boolean) {
    if (value) {
      this.setAttribute('hovering', '');
    } else {
      this.removeAttribute('hovering');
    }
  },

  behaviors: [focusableBehavior, disableBehavior],
  template,
  style: getElementStyleSync('section'),
  $: { wrapper: '.wrapper', foldIcon: '.fold' },

  factoryImpl(text: string): void {
    const span = document.createElement('span');
    span.innerText = text;
    this.appendChild(span);
  },

  ready(): void {
    if (this.getAttribute('folded') !== null) {
      this.fold();
    } else {
      this.foldup();
    }

    this._initFocusable(this.$wrapper);
    this._initDisable(true);
    this._initEvents();

    if (this.querySelector('[slot="header"]') === null) {
      const header = this.querySelector('.header');

      if (header) {
        header.setAttribute('slot', 'header');
      }
    }
  },

  _initEvents(): void {
    this.$wrapper.addEventListener('mousedown', (event: Event) => {
      event.stopPropagation();
      focusMgr._setFocusElement(this);
    });

    this.$wrapper.addEventListener('click', () => {
      if (this._folded) {
        this.foldup();
      } else {
        this.fold();
      }
    });

    this.$wrapper.addEventListener('mouseover', (event: Event) => {
      event.stopImmediatePropagation();
      this.hovering = true;
    });

    this.$wrapper.addEventListener('mouseout', (event: Event) => {
      event.stopImmediatePropagation();
      this.hovering = false;
    });

    this.$wrapper.addEventListener('keydown', (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.keyCode === 37) {
        acceptEvent(e);
        this.fold();
      } else if (e.keyCode === 39) {
        acceptEvent(e);
        this.foldup();
      }
    });
  },

  fold(): void {
    if (!this._folded) {
      this._folded = true;
      this.$foldIcon.classList.remove('icon-fold-up');
      this.$foldIcon.classList.add('icon-fold');
      this.setAttribute('folded', '');
    }
  },

  foldup(): void {
    if (this._folded) {
      this._folded = false;
      this.$foldIcon.classList.remove('icon-fold');
      this.$foldIcon.classList.add('icon-fold-up');
      this.removeAttribute('folded');
    }
  },
});
