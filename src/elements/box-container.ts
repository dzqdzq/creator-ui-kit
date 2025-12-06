/**
 * UI Box Container 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";

const template = /*html*/ `
    <slot></slot>
  `;

export default elementUtils.registerElement("ui-box-container", {
  behaviors: [focusableBehavior, disableBehavior],
  template,
  style: getElementStyleSync("box-container"),

  ready(): void {
    this._initFocusable(this);
    this._initDisable(true);
  },
});

