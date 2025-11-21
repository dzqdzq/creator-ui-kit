import e from "./utils.js";
import t from "../utils/resource-mgr.js";
import s from "../utils/dom-utils.js";
import l from "../utils/focus-mgr.js";
import i from "../behaviors/focusable.js";
import u from "../behaviors/disable.js";
import a from "../behaviors/readonly.js";

export default e.registerElement("ui-select", {
  get value() {
    return this._value;
  },
  set value(e) {
    const t = this._value;
    this._value = e;

    if (this.valueChanged) {
      this.valueChanged(t, e);
    }

    if (!this.multiValues) {
      this.$select.value = e;
    }
  },
  get values() {
    return this._values;
  },
  set values(e) {
    const t = this._values;
    this._values = e;

    if (this.valuesChanged) {
      this.valuesChanged(t, e);
    }

    if (this.multiValues) {
      this.$select.value = "";
    }
  },
  get selectedIndex() {
    return this.$select.selectedIndex;
  },
  set selectedIndex(e) {
    this.$select.selectedIndex = e;
  },
  get selectedText() {
    return this.$select.item(this.$select.selectedIndex).text;
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(e) {
    if ((e = !(e == null || e === false)) !== this._multiValues) {
      e
        ? ((this.$select.value = ""), this.setAttribute("multi-values", ""))
        : ((this.$select.value = this._value),
          this.removeAttribute("multi-values"));

      this._multiValues = e;
    }
  },
  get observedAttributes() {
    return ["selectedIndex", "selectedText", "multi-values"];
  },
  attributeChangedCallback(e, t, s) {
    if (
      t !== s &&
      (e == "selectedIndex" ||
        e == "selectedText" ||
        e == "selectedText" ||
        e == "multi-values")
    ) {
      this[e.replace(/\-(\w)/g, (e, t) => t.toUpperCase())] = s;
    }
  },
  behaviors: [i, u, a],
  template: "\n    <select></select>\n  ",
  style: t.getResource("theme://elements/select.css"),
  $: { select: "select" },
  factoryImpl(e) {
    if (!isNaN(e)) {
      this.value = e;
    }
  },
  ready() {
    this._observer = new MutationObserver((e) => {
      unused(e);
      this._updateItems();
    });

    this._observer.observe(this, { childList: true });
    for (let e = 0; e < this.children.length; ++e) {
      let t = this.children[e];
      if (t instanceof HTMLOptionElement || t instanceof HTMLOptGroupElement) {
        let e = t.cloneNode(true);
        this.$select.add(e, null);
      }
    }
    let e = this.getAttribute("value");

    if (e !== null) {
      this._value = e;
      this.$select.value = e;
    } else {
      this._value = this.$select.value;
    }

    this.multiValues = this.getAttribute("multi-values");
    this._initFocusable(this.$select);
    this._initDisable(false);
    this._initReadonly(false);
    this.addEventListener("mousedown", this._mouseDownHandler);

    this.$select.addEventListener("keydown", (e) =>
      this.disabled
        ? (e.preventDefault(), undefined)
        : this.readonly
        ? (e.preventDefault(), undefined)
        : ((e.keyCode !== 38 && e.keyCode !== 40) || e.preventDefault(),
          e.keyCode === 32 ||
            e.ctrlKey ||
            e.ctrlKey ||
            e.metaKey ||
            e.ctrlKey ||
            e.metaKey ||
            e.preventDefault(),
          undefined)
    );

    this.$select.addEventListener("change", (e) => {
      s.acceptEvent(e);
      this._value = this.$select.value;
      this.multiValues = false;

      s.fire(this, "change", {
        bubbles: true,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });

      s.fire(this, "confirm", {
        bubbles: true,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });
    });
  },
  _mouseDownHandler(e) {
    e.stopPropagation();
    this._mouseStartX = e.clientX;

    if (!this._inputFocused) {
      this._selectAllWhenMouseUp = true;
    }

    l._setFocusElement(this);

    if (this.readonly) {
      s.acceptEvent(e);
      return undefined;
    }
  },
  _updateItems() {
    s.clear(this.$select);
    for (let e = 0; e < this.children.length; ++e) {
      let t = this.children[e];
      if (t instanceof HTMLOptionElement || t instanceof HTMLOptGroupElement) {
        let e = t.cloneNode(true);
        this.$select.add(e, null);
      }
    }
    this.$select.value = this._value;
  },
  addItem(e, t, s) {
    let l = document.createElement("option");
    l.value = e;
    l.text = t;
    this.addElement(l, s);
    this._value = this.$select.value;
  },
  addElement(e, t) {
    if (!(e instanceof HTMLOptionElement || e instanceof HTMLOptGroupElement)) {
      return;
    }
    let s;
    this._observer.disconnect();

    if (t !== undefined) {
      this.insertBefore(e, this.children[t]);
    } else {
      this.appendChild(e);
    }

    s = t !== undefined ? this.$select.item(t) : null;
    this.$select.add(e.cloneNode(true), s);
    this._observer.observe(this, { childList: true });
  },
  removeItem(e) {
    this.$select.remove(e);
  },
  clear() {
    s.clear(this.$select);
    this._value = null;
    this.$select.value = null;
  },
});
