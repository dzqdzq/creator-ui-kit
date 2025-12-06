/**
 * UI Button 组件
 */

import elementUtils from '../utils/utils';
import { getElementStyleSync } from '../utils/css-loader';
import { fire } from '../utils/dom-utils';
import focusableBehavior from '../behaviors/focusable';
import disableBehavior from '../behaviors/disable';
import buttonStateBehavior from '../behaviors/button-state';

const template = /*html*/ `
    <div class="inner">
      <slot></slot>
    </div>
  `;

export default elementUtils.registerElement('ui-button', {
  behaviors: [focusableBehavior, disableBehavior, buttonStateBehavior],
  template,
  style: getElementStyleSync('button'),

  factoryImpl(text: string): void {
    if (text) {
      this.innerText = text;
    }
  },

  ready(): void {
    this._initFocusable(this);
    this._initDisable(false);
    this._initButtonState(this);
  },

  _onButtonClick(): void {
    setTimeout(() => {
      fire(this, 'confirm', { bubbles: true });
    }, 1);
  },
});
