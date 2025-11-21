import e from "../utils/dom-utils";
import t from "../utils/focus-mgr";
function s(e) {
  return e.getAttribute("pressed") !== null;
}
let i = {
  _initButtonState(i) {
    e.installDownUpEvent(i);

    i.addEventListener("keydown", (t) => {
      if (!this.disabled) {
        if (t.keyCode === 32) {
          e.acceptEvent(t);
          this._setPressed(i, true);
          this._canceledByEsc = false;
        } else if (t.keyCode === 13) {
          e.acceptEvent(t);

          if (this._enterTimeoutID) {
            return;
          }

          this._setPressed(i, true);
          this._canceledByEsc = false;

          this._enterTimeoutID = setTimeout(() => {
            this._enterTimeoutID = null;
            this._setPressed(i, false);
            i.click();
          }, 100);
        } else {
          if (t.keyCode === 27) {
            e.acceptEvent(t);

            s(i) &&
              (e.fire(i, "cancel", { bubbles: true }),
              (this._canceledByEsc = true));

            this._setPressed(i, false);
          }
        }
      }
    });

    i.addEventListener("keyup", (t) => {
      if (t.keyCode === 32) {
        e.acceptEvent(t);

        s(i) &&
          setTimeout(() => {
            i.click();
          }, 1);

        this._setPressed(i, false);
      }
    });

    i.addEventListener("down", (s) => {
      e.acceptEvent(s);
      t._setFocusElement(this);
      this._setPressed(i, true);
      this._canceledByEsc = false;
    });

    i.addEventListener("up", (t) => {
      e.acceptEvent(t);
      this._setPressed(i, false);
    });

    i.addEventListener("click", (t) => {
      this._onButtonClick(i, t);

      if (!this.readonly) {
        return this._canceledByEsc
          ? ((this._canceledByEsc = false), e.acceptEvent(t), undefined)
          : undefined;
      }
    });

    i.addEventListener("focus-changed", () => {
      if (!this.focused) {
        this._setPressed(i, false);
      }
    });
  },
  _setPressed(e, t) {
    if (t) {
      e.setAttribute("pressed", "");
    } else {
      e.removeAttribute("pressed");
    }
  },
};
export default i;
