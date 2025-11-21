import elementUtils from "./utils.js";
import resourceMgr from "../utils/resource-mgr.js";
import domUtils from "../utils/dom-utils.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import buttonStateBehavior from "../behaviors/button-state.js";

export default elementUtils.registerElement("ui-button", {
  behaviors: [focusableBehavior, disableBehavior, buttonStateBehavior],
  template: '\n    <div class="inner">\n      <slot></slot>\n    </div>\n  ',
  style: resourceMgr.getResource("theme://elements/button.css"),
  factoryImpl(e) {
    if (e) {
      this.innerText = e;
    }
  },
  ready() {
    this._initFocusable(this);
    this._initDisable(false);
    this._initButtonState(this);
  },
  _onButtonClick() {
    setTimeout(() => {
      domUtils.fire(this, "confirm", { bubbles: true });
    }, 1);
  },
});
