import e from "./utils.js";
import i from "../behaviors/focusable.js";
import s from "../behaviors/disable.js";

export default e.registerElement("ui-vlist", {
  behaviors: [i, s],
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
