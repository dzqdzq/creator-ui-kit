import domUtils from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";

function isPressed(element) {
  return element.getAttribute("pressed") !== null;
}

class ButtonStateBehavior {
  _initButtonState(buttonElement) {
    domUtils.installDownUpEvent(buttonElement);

    buttonElement.addEventListener("keydown", (keyboardEvent) => {
      if (!this.disabled) {
        if (keyboardEvent.keyCode === 32) {
          // Space key
          domUtils.acceptEvent(keyboardEvent);
          this._setPressed(buttonElement, true);
          this._canceledByEsc = false;
        } else if (keyboardEvent.keyCode === 13) {
          // Enter key
          domUtils.acceptEvent(keyboardEvent);

          if (this._enterTimeoutID) {
            return;
          }

          this._setPressed(buttonElement, true);
          this._canceledByEsc = false;

          this._enterTimeoutID = setTimeout(() => {
            this._enterTimeoutID = null;
            this._setPressed(buttonElement, false);
            buttonElement.click();
          }, 100);
        } else {
          if (keyboardEvent.keyCode === 27) {
            // Escape key
            domUtils.acceptEvent(keyboardEvent);

            if (isPressed(buttonElement)) {
              domUtils.fire(buttonElement, "cancel", { bubbles: true });
              this._canceledByEsc = true;
            }

            this._setPressed(buttonElement, false);
          }
        }
      }
    });

    buttonElement.addEventListener("keyup", (keyboardEvent) => {
      if (keyboardEvent.keyCode === 32) {
        // Space key
        domUtils.acceptEvent(keyboardEvent);

        if (isPressed(buttonElement)) {
          setTimeout(() => {
            buttonElement.click();
          }, 1);
        }

        this._setPressed(buttonElement, false);
      }
    });

    buttonElement.addEventListener("down", (downEvent) => {
      domUtils.acceptEvent(downEvent);
      focusMgr._setFocusElement(this);
      this._setPressed(buttonElement, true);
      this._canceledByEsc = false;
    });

    buttonElement.addEventListener("up", (upEvent) => {
      domUtils.acceptEvent(upEvent);
      this._setPressed(buttonElement, false);
    });

    buttonElement.addEventListener("click", (clickEvent) => {
      this._onButtonClick(buttonElement, clickEvent);

      if (!this.readonly) {
        if (this._canceledByEsc) {
          this._canceledByEsc = false;
          domUtils.acceptEvent(clickEvent);
          return undefined;
        }
        return undefined;
      }
    });

    buttonElement.addEventListener("focus-changed", () => {
      if (!this.focused) {
        this._setPressed(buttonElement, false);
      }
    });
  }

  _setPressed(element, pressed) {
    if (pressed) {
      element.setAttribute("pressed", "");
    } else {
      element.removeAttribute("pressed");
    }
  }
}

// 导出类的实例方法作为对象，以便混入到元素原型
const behaviorPrototype = ButtonStateBehavior.prototype;
export default {
  _initButtonState: behaviorPrototype._initButtonState,
  _setPressed: behaviorPrototype._setPressed,
};
