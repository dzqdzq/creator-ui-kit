import domUtils from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";

class InputStateBehavior {
  _initInputState(inputElement) {
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
    let isTextArea = inputElement instanceof HTMLTextAreaElement;
    inputElement._initValue = inputElement.value;
    inputElement._focused = false;
    inputElement._selectAllWhenMouseUp = false;
    inputElement._mouseStartX = -1;

    inputElement.addEventListener("focus", () => {
      inputElement._focused = true;
      inputElement._initValue = inputElement.value;

      if (inputElement._selectAllWhenMouseUp === false) {
        inputElement.select();
      }
    });

    inputElement.addEventListener("blur", () => {
      inputElement._focused = false;
    });

    inputElement.addEventListener("change", (changeEvent) => {
      domUtils.acceptEvent(changeEvent);
      this._onInputConfirm(inputElement);
    });

    inputElement.addEventListener("input", (inputEvent) => {
      domUtils.acceptEvent(inputEvent);
      this._onInputChange(inputElement);
    });

    inputElement.addEventListener("keydown", (keyboardEvent) => {
      if (!this.disabled) {
        keyboardEvent.stopPropagation();

        if (keyboardEvent.keyCode === 13) {
          if (
            !isTextArea ||
            keyboardEvent.ctrlKey ||
            keyboardEvent.metaKey
          ) {
            domUtils.acceptEvent(keyboardEvent);
            this._onInputConfirm(inputElement, true);
          }
        } else if (keyboardEvent.keyCode === 27) {
          domUtils.acceptEvent(keyboardEvent);
          this._onInputCancel(inputElement, true);
        }
      }
    });

    inputElement.addEventListener("keyup", (keyboardEvent) => {
      keyboardEvent.stopPropagation();
    });

    inputElement.addEventListener("keypress", (keyboardEvent) => {
      keyboardEvent.stopPropagation();
    });

    inputElement.addEventListener("mousedown", (mouseEvent) => {
      mouseEvent.stopPropagation();
      focusMgr._setFocusElement(this);
      inputElement._mouseStartX = mouseEvent.clientX;

      if (!inputElement._focused) {
        inputElement._selectAllWhenMouseUp = true;
      }
    });

    inputElement.addEventListener("mouseup", (mouseEvent) => {
      mouseEvent.stopPropagation();

      if (inputElement._selectAllWhenMouseUp) {
        inputElement._selectAllWhenMouseUp = false;
        if (Math.abs(mouseEvent.clientX - inputElement._mouseStartX) < 4) {
          inputElement.select();
        }
      }
    });
  }

  _unselect(inputElement) {
    inputElement.selectionStart = inputElement.selectionEnd = -1;
  }
}

const behaviorPrototype = InputStateBehavior.prototype;
export default {
  _initInputState: behaviorPrototype._initInputState,
  _unselect: behaviorPrototype._unselect,
};
