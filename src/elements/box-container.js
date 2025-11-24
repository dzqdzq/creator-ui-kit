import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";

const template = /*html*/ `
    <slot></slot>
  `;

export default elementUtils.registerElement("ui-box-container", {
  behaviors: [focusableBehavior, disableBehavior],
  template,
  style: getElementStyleSync("box-container"),
  ready() {
    this._initFocusable(this);
    this._initDisable(true);
  },
});
