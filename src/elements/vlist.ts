/**
 * UI VList 组件
 */

import elementUtils from "../utils/utils";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";

const template = /*html*/ `
    <slot></slot>
  `;

export default elementUtils.registerElement("ui-vlist", {
  behaviors: [focusableBehavior, disableBehavior],
  template,

  factoryImpl(items: any[]): void {
    if (items) {
      this._items = items;
    }
  },

  ready(): void {
    this._initFocusable(this);
    this._initDisable(true);
  },
});

