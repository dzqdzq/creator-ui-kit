import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { acceptEvent, fire, clear } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";

export default elementUtils.registerElement("ui-select", {
  get value() {
    return this._value;
  },
  set value(value) {
    const oldValue = this._value;
    this._value = value;

    if (this.valueChanged) {
      this.valueChanged(oldValue, value);
    }

    if (!this.multiValues) {
      this.$select.value = value;
    }
  },
  get values() {
    return this._values;
  },
  set values(values) {
    const oldValues = this._values;
    this._values = values;

    if (this.valuesChanged) {
      this.valuesChanged(oldValues, values);
    }

    if (this.multiValues) {
      this.$select.value = "";
    }
  },
  get selectedIndex() {
    return this.$select.selectedIndex;
  },
  set selectedIndex(index) {
    this.$select.selectedIndex = index;
  },
  get selectedText() {
    return this.$select.item(this.$select.selectedIndex).text;
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(value) {
    const boolValue = !(value == null || value === false);
    if (boolValue !== this._multiValues) {
      if (boolValue) {
        this.$select.value = "";
        this.setAttribute("multi-values", "");
      } else {
        this.$select.value = this._value;
        this.removeAttribute("multi-values");
      }

      this._multiValues = boolValue;
    }
  },
  get observedAttributes() {
    return ["selectedIndex", "selectedText", "multi-values"];
  },
  attributeChangedCallback(name, oldValue, newValue) {
    if (
      oldValue !== newValue &&
      (name == "selectedIndex" ||
        name == "selectedText" ||
        name == "multi-values")
    ) {
      const propertyName = name.replace(/\-(\w)/g, (match, letter) => letter.toUpperCase());
      this[propertyName] = newValue;
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior],
  template: "\n    <select></select>\n  ",
  style: getElementStyleSync("select"),
  $: { select: "select" },
  factoryImpl(value) {
    if (!isNaN(value)) {
      this.value = value;
    }
  },
  ready() {
    this._observer = new MutationObserver(() => {
      this._updateItems();
    });

    this._observer.observe(this, { childList: true });
    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child instanceof HTMLOptionElement || child instanceof HTMLOptGroupElement) {
        const cloned = child.cloneNode(true);
        this.$select.add(cloned, null);
      }
    }
    const valueAttr = this.getAttribute("value");

    if (valueAttr !== null) {
      this._value = valueAttr;
      this.$select.value = valueAttr;
    } else {
      this._value = this.$select.value;
    }

    this.multiValues = this.getAttribute("multi-values");
    this._initFocusable(this.$select);
    this._initDisable(false);
    this._initReadonly(false);
    this.addEventListener("mousedown", this._mouseDownHandler);

    this.$select.addEventListener("keydown", (event) =>
      this.disabled
        ? (event.preventDefault(), undefined)
        : this.readonly
        ? (event.preventDefault(), undefined)
        : ((event.keyCode !== 38 && event.keyCode !== 40) || event.preventDefault(),
          event.keyCode === 32 ||
            event.ctrlKey ||
            event.metaKey ||
            event.preventDefault(),
          undefined)
    );

    this.$select.addEventListener("change", (event) => {
      acceptEvent(event);
      this._value = this.$select.value;
      this.multiValues = false;

      fire(this, "change", {
        bubbles: true,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });

      fire(this, "confirm", {
        bubbles: true,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });
    });
  },
  _mouseDownHandler(event) {
    event.stopPropagation();
    this._mouseStartX = event.clientX;

    if (!this._inputFocused) {
      this._selectAllWhenMouseUp = true;
    }

    focusMgr._setFocusElement(this);

    if (this.readonly) {
      acceptEvent(event);
      return undefined;
    }
  },
  _updateItems() {
    clear(this.$select);
    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child instanceof HTMLOptionElement || child instanceof HTMLOptGroupElement) {
        const cloned = child.cloneNode(true);
        this.$select.add(cloned, null);
      }
    }
    this.$select.value = this._value;
  },
  addItem(value, text, index) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    this.addElement(option, index);
    this._value = this.$select.value;
  },
  addElement(element, index) {
    if (!(element instanceof HTMLOptionElement || element instanceof HTMLOptGroupElement)) {
      return;
    }
    let beforeElement;
    this._observer.disconnect();

    if (index !== undefined) {
      this.insertBefore(element, this.children[index]);
    } else {
      this.appendChild(element);
    }

    beforeElement = index !== undefined ? this.$select.item(index) : null;
    this.$select.add(element.cloneNode(true), beforeElement);
    this._observer.observe(this, { childList: true });
  },
  removeItem(index) {
    this.$select.remove(index);
  },
  clear() {
    clear(this.$select);
    this._value = null;
    this.$select.value = null;
  },
});
