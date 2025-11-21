import elementUtils from "./utils.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";

export default elementUtils.registerElement("ui-vlist", {
  behaviors: [focusableBehavior, disableBehavior],
  template: "\n    <slot></slot>\n  ",
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
