import e from "./utils.js";
import s from "../utils/resource-mgr.js";
import i from "../behaviors/focusable.js";
import t from "../behaviors/disable.js";

export default e.registerElement("ui-box-container", {
  behaviors: [i, t],
  style: s.getResource("theme://elements/box-container.css"),
  template: "\n    <slot></slot>\n  ",
  ready() {
    this._initFocusable(this);
    this._initDisable(true);
  },
});
