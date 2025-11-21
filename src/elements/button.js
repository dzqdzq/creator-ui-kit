import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { fire } from "../utils/dom-utils.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import buttonStateBehavior from "../behaviors/button-state.js";

export default elementUtils.registerElement("ui-button", {
  behaviors: [focusableBehavior, disableBehavior, buttonStateBehavior],
  template: '\n    <div class="inner">\n      <slot></slot>\n    </div>\n  ',
  style: getElementStyleSync("button"),
  factoryImpl(text) {
    if (text) {
      this.innerText = text;
    }
  },
  ready() {
    this._initFocusable(this);
    this._initDisable(false);
    this._initButtonState(this);
  },
  _onButtonClick() {
    setTimeout(() => {
      fire(this, "confirm", { bubbles: true });
    }, 1);
  },
});
