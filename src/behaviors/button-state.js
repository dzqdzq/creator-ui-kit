import domUtils from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";

function isPressed(el) {
  return el.getAttribute("pressed") !== null;
}

export default {
  _initButtonState(target) {
    domUtils.installDownUpEvent(target);

    target.addEventListener("keydown", (e) => {
      if (!this.disabled) {
        if (e.keyCode === 32) {
          domUtils.acceptEvent(e);
          this._setPressed(target, true);
          this._canceledByEsc = false;
        } else if (e.keyCode === 13) {
          domUtils.acceptEvent(e);
          if (this._enterTimeoutID) {
            return;
          }
          this._setPressed(target, true);
          this._canceledByEsc = false;
          this._enterTimeoutID = setTimeout(() => {
            this._enterTimeoutID = null;
            this._setPressed(target, false);
            target.click();
          }, 100);
        } else if (e.keyCode === 27) {
          domUtils.acceptEvent(e);
          if (isPressed(target)) {
            domUtils.fire(target, "cancel", { bubbles: true });
            this._canceledByEsc = true;
          }
          this._setPressed(target, false);
        }
      }
    });

    target.addEventListener("keyup", (e) => {
      if (e.keyCode === 32) {
        domUtils.acceptEvent(e);
        if (isPressed(target)) {
          setTimeout(() => {
            target.click();
          }, 1);
        }
        this._setPressed(target, false);
      }
    });

    target.addEventListener("down", (e) => {
      domUtils.acceptEvent(e);
      focusMgr._setFocusElement(this);
      this._setPressed(target, true);
      this._canceledByEsc = false;
    });

    target.addEventListener("up", (e) => {
      domUtils.acceptEvent(e);
      this._setPressed(target, false);
    });

    target.addEventListener("click", (e) => {
      this._onButtonClick(target, e);
      if (!this.readonly) {
        if (this._canceledByEsc) {
          this._canceledByEsc = false;
          domUtils.acceptEvent(e);
        }
      }
    });

    target.addEventListener("focus-changed", () => {
      if (!this.focused) {
        this._setPressed(target, false);
      }
    });
  },
  _setPressed(el, value) {
    if (value) {
      el.setAttribute("pressed", "");
    } else {
      el.removeAttribute("pressed");
    }
  },
};
