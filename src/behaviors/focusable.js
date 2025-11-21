import domUtils from "../utils/dom-utils.js";

export default {
  get focusable() {
    return true;
  },
  get focused() {
    return this.getAttribute("focused") !== null;
  },
  get unnavigable() {
    return this.getAttribute("unnavigable") !== null;
  },
  set unnavigable(value) {
    if (value) {
      this.setAttribute("unnavigable", "");
    } else {
      this.removeAttribute("unnavigable");
    }
  },
  _initFocusable(focusEls, navEls) {
    if (focusEls) {
      if (Array.isArray(focusEls)) {
        this._focusELs = focusEls;
      } else {
        this._focusELs = [focusEls];
      }
    } else {
      this._focusELs = [];
    }

    if (navEls) {
      if (Array.isArray(navEls)) {
        this._navELs = navEls;
      } else {
        this._navELs = [navEls];
      }
    } else {
      this._navELs = this._focusELs;
    }

    requestAnimationFrame(() => {
      this.tabIndex = -1;
      for (const el of this._focusELs) {
        el.tabIndex = -1;
        el.addEventListener("focus", () => {
          this._curFocus = el;
        });
      }
    });
  },
  _getFirstFocusableElement() {
    return this._focusELs.length > 0 ? this._focusELs[0] : null;
  },
  _setFocused(value) {
    if (this.focused !== value) {
      if (value) {
        this.setAttribute("focused", "");
        if (this._focusELs.length > 0) {
          const el = this._focusELs[0];
          if (el === this) {
            el.focus();
          } else if (el.focusable) {
            el._setFocused(true);
          } else {
            el.focus();
          }
        }
      } else {
        this.removeAttribute("focused");
        this._focusELs.forEach((el) => {
          if (el.focusable && el.focused) {
            el._setFocused(false);
          }
        });
      }
      domUtils.fire(this, "focus-changed", {
        bubbles: true,
        detail: { focused: this.focused },
      });
    }
  },
};
