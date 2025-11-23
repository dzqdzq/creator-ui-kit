import domUtils from "../utils/dom-utils";
let t = {
  get focusable() {
    return true;
  },
  get focused() {
    return this.getAttribute("focused") !== null;
  },
  get unnavigable() {
    return this.getAttribute("unnavigable") !== null;
  },
  set unnavigable(s) {
    if (s) {
      this.setAttribute("unnavigable", "");
    } else {
      this.removeAttribute("unnavigable");
    }
  },
  _initFocusable(s, t) {
    if (s) {
      if (Array.isArray(s)) {
        this._focusELs = s;
      } else {
        this._focusELs = [s];
      }
    } else {
      this._focusELs = [];
    }

    if (t) {
      if (Array.isArray(t)) {
        this._navELs = t;
      } else {
        this._navELs = [t];
      }
    } else {
      this._navELs = this._focusELs;
    }

    requestAnimationFrame(() => {
      this.tabIndex = -1;

      for (let t of this._focusELs) {
        t.tabIndex = -1;

        t.addEventListener("focus", () => {
          this._curFocus = t;
        });
      }
    });
  },
  _getFirstFocusableElement() {
    if (!this._focusELs) {
      this._focusELs = [];
    }
    return this._focusELs.length > 0 ? this._focusELs[0] : null;
  },
  _setFocused(t) {
    if (this.focused !== t) {
      // 确保 _focusELs 已初始化
      if (!this._focusELs) {
        this._focusELs = [];
      }

      if (t) {
        this.setAttribute("focused", "");

        if (this._focusELs.length > 0) {
          let s = this._focusELs[0];

          if (s === this) {
            s.focus();
          } else if (s.focusable) {
            s._setFocused(true);
          } else {
            s.focus();
          }
        }
      } else {
        this.removeAttribute("focused");

        this._focusELs.forEach((s) => {
          if (s.focusable && s.focused) {
            s._setFocused(false);
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
export default t;
