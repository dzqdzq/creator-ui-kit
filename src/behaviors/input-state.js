import domUtils from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";

export default {
  _initInputState(input) {
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

    const isTextArea = input instanceof HTMLTextAreaElement;
    input._initValue = input.value;
    input._focused = false;
    input._selectAllWhenMouseUp = false;
    input._mouseStartX = -1;

    input.addEventListener("focus", () => {
      input._focused = true;
      input._initValue = input.value;
      if (input._selectAllWhenMouseUp === false) {
        input.select();
      }
    });

    input.addEventListener("blur", () => {
      input._focused = false;
    });

    input.addEventListener("change", (e) => {
      domUtils.acceptEvent(e);
      this._onInputConfirm(input);
    });

    input.addEventListener("input", (e) => {
      domUtils.acceptEvent(e);
      this._onInputChange(input);
    });

    input.addEventListener("keydown", (e) => {
      if (!this.disabled) {
        e.stopPropagation();
        if (e.keyCode === 13) {
          if (!isTextArea || e.ctrlKey || e.metaKey) {
            domUtils.acceptEvent(e);
            this._onInputConfirm(input, true);
          }
        } else if (e.keyCode === 27) {
          domUtils.acceptEvent(e);
          this._onInputCancel(input, true);
        }
      }
    });

    input.addEventListener("keyup", (e) => {
      e.stopPropagation();
    });

    input.addEventListener("keypress", (e) => {
      e.stopPropagation();
    });

    input.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      focusMgr._setFocusElement(this);
      input._mouseStartX = e.clientX;
      if (!input._focused) {
        input._selectAllWhenMouseUp = true;
      }
    });

    input.addEventListener("mouseup", (e) => {
      e.stopPropagation();
      if (input._selectAllWhenMouseUp) {
        input._selectAllWhenMouseUp = false;
        if (Math.abs(e.clientX - input._mouseStartX) < 4) {
          input.select();
        }
      }
    });
  },
  _unselect(input) {
    input.selectionStart = input.selectionEnd = -1;
  },
};
