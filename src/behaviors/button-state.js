import { installDownUpEvent, acceptEvent, fire } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr";

function isPressed(element) {
  return element.getAttribute("pressed") !== null;
}

class ButtonStateBehavior {
  _initButtonState(buttonElement) {
    installDownUpEvent(buttonElement);

    buttonElement.addEventListener("keydown", (keyboardEvent) => {
      if (!this.disabled) {
        if (keyboardEvent.keyCode === 32) {
          acceptEvent(keyboardEvent);
          this._setPressed(buttonElement, true);
          this._canceledByEsc = false;
        } else if (keyboardEvent.keyCode === 13) {
          acceptEvent(keyboardEvent);

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
            acceptEvent(keyboardEvent);

            if (isPressed(buttonElement)) {
              fire(buttonElement, "cancel", { bubbles: true });
              this._canceledByEsc = true;
            }

            this._setPressed(buttonElement, false);
          }
        }
      }
    });

    buttonElement.addEventListener("keyup", (keyboardEvent) => {
      if (keyboardEvent.keyCode === 32) {
        acceptEvent(keyboardEvent);

        if (isPressed(buttonElement)) {
          setTimeout(() => {
            buttonElement.click();
          }, 1);
        }

        this._setPressed(buttonElement, false);
      }
    });

    buttonElement.addEventListener("down", (downEvent) => {
      acceptEvent(downEvent);
      focusMgr._setFocusElement(this);
      this._setPressed(buttonElement, true);
      this._canceledByEsc = false;
    });

    buttonElement.addEventListener("up", (upEvent) => {
      acceptEvent(upEvent);
      this._setPressed(buttonElement, false);
    });

    buttonElement.addEventListener("click", (clickEvent) => {
      this._onButtonClick(buttonElement, clickEvent);

      if (!this.readonly) {
        if (this._canceledByEsc) {
          this._canceledByEsc = false;
          acceptEvent(clickEvent);
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

const behaviorPrototype = ButtonStateBehavior.prototype;
export default {
  _initButtonState: behaviorPrototype._initButtonState,
  _setPressed: behaviorPrototype._setPressed,
};
