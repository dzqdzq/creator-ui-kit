import e from "./utils.js";
import t from "../utils/resource-mgr.js";
import i from "../utils/dom-utils.js";
import s from "../behaviors/focusable.js";
import r from "../behaviors/disable.js";
import u from "../behaviors/button-state.js";

export default e.registerElement("ui-button", {
  behaviors: [s, r, u],
  template: '\n    <div class="inner">\n      <slot></slot>\n    </div>\n  ',
  style: t.getResource("theme://elements/button.css"),
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
      i.fire(this, "confirm", { bubbles: true });
    }, 1);
  },
});
