import elementUtils from "./utils.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";

const template = /*html*/ `
    <slot></slot>
  `;

export default elementUtils.registerElement("ui-vlist", {
  behaviors: [focusableBehavior, disableBehavior],
  template,
  factoryImpl(e) {
    if (e) {
      this._items = e;
    }
  },
  ready() {
    this._initFocusable(this);
    this._initDisable(true);
  },
});
