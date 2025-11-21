import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";

export default elementUtils.registerElement("ui-box-container", {
  behaviors: [focusableBehavior, disableBehavior],
  style: getElementStyleSync("box-container"),
  template: "\n    <slot></slot>\n  ",
  ready() {
    this._initFocusable(this);
    this._initDisable(true);
  },
});
