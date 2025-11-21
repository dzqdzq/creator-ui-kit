import elementUtils from "./utils.js";
import resourceMgr from "../utils/resource-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";

export default elementUtils.registerElement("ui-box-container", {
  behaviors: [focusableBehavior, disableBehavior],
  style: resourceMgr.getResource("theme://elements/box-container.css"),
  template: "\n    <slot></slot>\n  ",
  ready() {
    this._initFocusable(this);
    this._initDisable(true);
  },
});
