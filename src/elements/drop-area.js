import elementUtils from "./utils.js";
import disableBehavior from "../behaviors/disable.js";

export default elementUtils.registerElement("ui-drop-area", {
  shadowDOM: false,
  behaviors: [disableBehavior],
  ready() {
    this._initDisable(false);
  },
});
