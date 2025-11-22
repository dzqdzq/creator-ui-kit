import e from "../utils/dom-utils";
import t from "../utils/focus-mgr";
let n = {
  _initInputState(n) {
    if (!this._onInputConfirm) {
      throw new Error(
        "Failed to init input-state: please implement _onInputConfirm"
      );
    }
    if (!this._onInputCancel) {
      throw new Error(
        "Failed to init input-state: please implement _onInputCancel"
      );
    }
    if (!this._onInputChange) {
      throw new Error(
        "Failed to init input-state: please implement _onInputChange"
      );
    }
    let s = n instanceof HTMLTextAreaElement;
    n._initValue = n.value;
    n._focused = false;
    n._selectAllWhenMouseUp = false;
    n._mouseStartX = -1;

    n.addEventListener("focus", () => {
      n._focused = true;
      n._initValue = n.value;

      if (n._selectAllWhenMouseUp === false) {
        n.select();
      }
    });

    n.addEventListener("blur", () => {
      n._focused = false;
    });

    n.addEventListener("change", (t) => {
      e.acceptEvent(t);
      this._onInputConfirm(n);
    });

    n.addEventListener("input", (t) => {
      e.acceptEvent(t);
      this._onInputChange(n);
    });

    n.addEventListener("keydown", (t) => {
      if (!this.disabled) {
        t.stopPropagation();

        t.keyCode === 13
          ? (!s || t.ctrlKey || t.ctrlKey || t.metaKey) &&
            (e.acceptEvent(t), this._onInputConfirm(n, true))
          : t.keyCode === 27 &&
            (e.acceptEvent(t), this._onInputCancel(n, true));
      }
    });

    n.addEventListener("keyup", (e) => {
      e.stopPropagation();
    });

    n.addEventListener("keypress", (e) => {
      e.stopPropagation();
    });

    n.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      t._setFocusElement(this);
      n._mouseStartX = e.clientX;

      if (!n._focused) {
        n._selectAllWhenMouseUp = true;
      }
    });

    n.addEventListener("mouseup", (e) => {
      e.stopPropagation();

      if (n._selectAllWhenMouseUp) {
        n._selectAllWhenMouseUp = false;
        Math.abs(e.clientX - n._mouseStartX) < 4 && n.select();
      }
    });
  },
  _unselect(e) {
    e.selectionStart = e.selectionEnd = -1;
  },
};
export default n;
