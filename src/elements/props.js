import elementUtils from "./utils.js";
import PropElement from "./prop.js";
import domUtils from "../utils/dom-utils.js";
let t = {};
export default t;

let { parseString, parseBoolean, parseColor, parseArray } = elementUtils;

t.string = {
  value: parseString,
  attrs: { multiline: parseBoolean },
  template(t) {
    let i;
    return (i = t.multiline
      ? '\n        <ui-text-area class="flex-1" resize-v></ui-text-area>\n      '
      : '\n        <ui-input class="flex-1"></ui-input>\n      ');
  },
  ready() {
    if (this.attrs.multiline) {
      this.autoHeight = true;
    }

    this.$input = this.children[0];
    this.$input.value = this.value;
    this.$input.values = this.values;
    this.multiValues = this.getAttribute("multi-values");
    this.installStandardEvents(this.$input);
  },
  inputValue() {
    return this.$input.value;
  },
  attrsChanged(t, i) {
    if (i.multiline !== t.multiline) {
      this.regen();
      return undefined;
    }
  },
  valueChanged(t, i) {
    this.$input.value = i;
  },
  valuesChanged(t, i) {
    this.$input.values = i;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  multiValuesChanged(t, i) {
    this._updateMultiValue();
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$input.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i == t)) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.setAttribute("multi-values", "");
    }
  },
};

t.number = {
  value: parseFloat,
  attrs: {
    "input-type": parseString,
    slide: parseBoolean,
    min: parseFloat,
    max: parseFloat,
    step: parseFloat,
    precision: parseInt,
  },
  template(t) {
    let i;
    return (i = t.slide
      ? '\n        <ui-slider class="flex-1"></ui-slider>\n      '
      : '\n        <ui-num-input class="flex-1"></ui-num-input>\n      ');
  },
  ready() {
    this.slidable = true;
    this.$input = this.children[0];
    this.$input.type = this.attrs["input-type"];
    this.$input.min = this.attrs.min;
    this.$input.max = this.attrs.max;
    this.$input.step = this.attrs.step;
    this.$input.precision = this.attrs.precision;
    this.$input.value = this.value;
    this.$input.values = this.values;
    this.multiValues = this.getAttribute("multi-values");
    this.installStandardEvents(this.$input);

    this.installSlideEvents(
      this,
      (t) => {
        this.$input.value = this.$input.value + t * this.$input.step;
      },
      null,
      () => {
        this.$input.value = this.value;
      }
    );
  },
  inputValue() {
    return this.$input.value;
  },
  attrsChanged(t, i) {
    if (t.slide !== i.slide) {
      this.regen();
      return undefined;
    }
    this.$input.type = i["input-type"];
    this.$input.min = i.min;
    this.$input.max = i.max;
    this.$input.step = i.step;
    this.$input.precision = i.precision;
  },
  valueChanged(t, i) {
    this.$input.value = i;
  },
  valuesChanged(t, i) {
    this.$input.values = i;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  multiValuesChanged(t, i) {
    this._updateMultiValue();
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$input.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this._values.every((i, e) => e == 0 || i == t)) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.setAttribute("multi-values", "");
    }
  },
};

t.boolean = {
  value: (t) => t !== "false" && t !== "0" && (t === "true" || t !== null),
  template: '\n    <ui-checkbox class="flex-1"></ui-checkbox>\n  ',
  ready() {
    this.$input = this.children[0];
    this.$input.value = this.value;
    this.$input.values = this.values;
    this.multiValues = this.getAttribute("multi-values");
    this.installStandardEvents(this.$input);
  },
  inputValue() {
    return this.$input.value;
  },
  valueChanged(t, i) {
    this.$input.value = i;
  },
  valuesChanged(t, i) {
    this.$input.values = i;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  multiValuesChanged(t, i) {
    this._updateMultiValue();
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$input.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this._values.every((i, e) => e == 0 || i == t)) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.setAttribute("multi-values", "");
    }
  },
};

t.object = {
  value: (t) => JSON.parse(t),
  template: '\n    <div class="child" slot="child"></div>\n  ',
  ready() {
    this.foldable = true;
    this.$child = this.querySelector(".child");

    requestAnimationFrame(() => {
      let t = this.value;
      for (let i in t) {
        let t_i = t[i];
        let s = new PropElement(i, t_i, null, null, this.indent + 1);
        this.$child.appendChild(s);
      }
    });

    this.multiValues = this.getAttribute("multi-values");
  },
  addProp(t) {
    this.$child.appendChild(t);
  },
  valueChanged(t, i) {
    this.regen();
  },
};

t.array = {
  value: parseArray,
  template:
    '\n    <ui-num-input class="flex-1"></ui-num-input>\n    <div slot="child"></div>\n  ',
  ready() {
    this.foldable = true;
    this.$input = this.children[0];
    this.$child = this.querySelector(".child");
    this.multiValues = this.getAttribute("multi-values");
    this.$input.value = this.value.length;
    this._updateChildren();

    this.$input.addEventListener("confirm", () => {
      this.value.length = this.$input.value;
      this._emitConfirm();
    });
  },
  _updateChildren() {
    domUtils.clear(this.$child);
    for (let t = 0; t < this.value.length; ++t) {
      let i = this.value[t];
      let u = new PropElement(`[${t}]`, i.value, this.type, this.attrs, this.indent + 1);
      u.movable = true;
      u.removable = true;
      this.$child.appendChild(u);
    }
  },
  valueChanged(t, i) {
    this.$input.value = i.length;
    this._updateChildren();
  },
};

t.enum = {
  hasUserContent: true,
  value: parseInt,
  attrs: { options: parseArray },
  template: '\n    <ui-select class="flex-1"></ui-select>\n  ',
  ready(t) {
    this.$input = this.querySelector("ui-select");
    this.installStandardEvents(this.$input);

    if (this.attrs && this.attrs.options) {
      this.attrs.options.forEach((t) => {
        this.addItem(t.value, t.name);
      });
    } else if (t) {
      t.forEach((t) => {
        this.$input.addElement(t);
      });
    }

    this.$input.value = this.value;
    this.$input.values = this.values;
    this.multiValues = this.getAttribute("multi-values");
  },
  inputValue() {
    return this.$input.value;
  },
  addItem(t, i) {
    this.$input.addItem(t, i);
  },
  valueChanged(t, i) {
    this.$input.value = i;
  },
  valuesChanged(t, i) {
    this.$input.values = i;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  multiValuesChanged(t, i) {
    this._updateMultiValue();
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$input.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i == t)) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.setAttribute("multi-values", "");
    }
  },
};

t.color = {
  value: parseColor,
  template: '\n    <ui-color class="flex-1"></ui-color>\n  ',
  ready() {
    this.$input = this.children[0];
    this.$input.value = this.value;
    this.$input.values = this.values;
    this.multiValues = this.getAttribute("multi-values");
    this.installStandardEvents(this.$input);
  },
  inputValue() {
    return this.$input.value;
  },
  valueChanged(t, i) {
    this.$input.value = i;
  },
  multiValuesChanged() {
    this._updateMultiValue();
  },
  valuesChanged(t, i) {
    this.$input.values = i;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  _updateMultiValue() {
    if (!this.values || this.values.length <= 1) {
      return this.$input.removeAttribute("multi-values");
    }
    const t = this._values[0];

    if (
      this._values.every(
        (i, e) => e == 0 || (i.r == t.r && i.g == t.g && i.b == t.b)
      )
    ) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.setAttribute("multi-values", "");
    }
  },
};

t.vec2 = {
  value: parseArray,
  template:
    '\n    <ui-prop name="X" id="x-comp" slidable class="fixed-label red flex-1">\n      <ui-num-input class="flex-1"></ui-num-input>\n    </ui-prop>\n    <ui-prop name="Y" id="y-comp" slidable class="fixed-label green flex-1">\n      <ui-num-input class="flex-1"></ui-num-input>\n    </ui-prop>\n  ',
  ready() {
    this.$propX = this.querySelector("#x-comp");
    this.$inputX = this.$propX.children[0];

    if (this.value) {
      this.$inputX.value = this.value[0];
    }

    if (this.values) {
      this.$inputX.values = this.values.map((t) => t[0]);
    }

    this.installStandardEvents(this.$inputX);

    this.installSlideEvents(
      this.$propX,
      (t) => {
        this.$inputX.value = this.$inputX.value + t * this.$inputX.step;
      },
      null,
      () => {
        this.$inputX.value = this.value[0];
      }
    );

    this.$propY = this.querySelector("#y-comp");
    this.$inputY = this.$propY.children[0];

    if (this.value) {
      this.$inputY.value = this.value[1];
    }

    if (this.values) {
      this.$inputY.values = this.values.map((t) => t[1]);
    }

    this.installStandardEvents(this.$inputY);

    this.installSlideEvents(
      this.$propY,
      (t) => {
        this.$inputY.value = this.$inputY.value + t * this.$inputY.step;
      },
      null,
      () => {
        this.$inputY.value = this.value[1];
      }
    );

    this.multiValues = this.getAttribute("multi-values");
  },
  inputValue() {
    return [this.$inputX.value, this.$inputY.value];
  },
  multiValuesChanged(t, i) {
    this._updateMultiX();
    this._updateMultiY();
  },
  valueChanged(t, i) {
    this.$inputX.value = i[0];
    this.$inputY.value = i[1];
  },
  valuesChanged(t, i) {
    this.$inputX.values = i.map((t) => t[0]);

    this.$inputY.values = i.map((t) => t[1]);

    if (this.multiValues) {
      this._updateMultiX();
      this._updateMultiY();
    }
  },
  _updateMultiX() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$inputX.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i[0] == t[0])) {
      this.$inputX.removeAttribute("multi-values");
    } else {
      this.$inputX.setAttribute("multi-values", "");
    }
  },
  _updateMultiY() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$inputY.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i[1] == t[1])) {
      this.$inputY.removeAttribute("multi-values");
    } else {
      this.$inputY.setAttribute("multi-values", "");
    }
  },
};

t.vec3 = {
  value: parseArray,
  template:
    '\n    <ui-prop name="X" id="x-comp" slidable class="fixed-label red flex-1">\n      <ui-num-input class="flex-1"></ui-num-input>\n    </ui-prop>\n    <ui-prop name="Y" id="y-comp" slidable class="fixed-label green flex-1">\n      <ui-num-input class="flex-1"></ui-num-input>\n    </ui-prop>\n    <ui-prop name="Z" id="z-comp" slidable class="fixed-label blue flex-1">\n      <ui-num-input class="flex-1"></ui-num-input>\n    </ui-prop>\n  ',
  ready() {
    this.$propX = this.querySelector("#x-comp");
    this.$inputX = this.$propX.children[0];

    if (this.value) {
      this.$inputX.value = this.value[0];
    }

    if (this.values) {
      this.$inputX.values = this.values.map((t) => t[0]);
    }

    this.installStandardEvents(this.$inputX);

    this.installSlideEvents(
      this.$propX,
      (t) => {
        this.$inputX.value = this.$inputX.value + t * this.$inputX.step;
      },
      null,
      () => {
        this.$inputX.value = this.value[0];
      }
    );

    this.$propY = this.querySelector("#y-comp");
    this.$inputY = this.$propY.children[0];

    if (this.value) {
      this.$inputY.value = this.value[1];
    }

    if (this.values) {
      this.$inputY.values = this.values.map((t) => t[1]);
    }

    this.installStandardEvents(this.$inputY);

    this.installSlideEvents(
      this.$propY,
      (t) => {
        this.$inputY.value = this.$inputY.value + t * this.$inputY.step;
      },
      null,
      () => {
        this.$inputY.value = this.value[1];
      }
    );

    this.$propZ = this.querySelector("#z-comp");
    this.$inputZ = this.$propZ.children[0];

    if (this.value) {
      this.$inputZ.value = this.value[2];
    }

    if (this.values) {
      this.$inputZ.values = this.values.map((t) => t[2]);
    }

    this.installStandardEvents(this.$inputZ);

    this.installSlideEvents(
      this.$propZ,
      (t) => {
        this.$inputZ.value = this.$inputZ.value + t * this.$inputZ.step;
      },
      null,
      () => {
        this.$inputZ.value = this.value[2];
      }
    );

    this.multiValues = this.getAttribute("multi-values");
  },
  inputValue() {
    return [this.$inputX.value, this.$inputY.value, this.$inputZ.value];
  },
  multiValuesChanged() {
    this._updateMultiX();
    this._updateMultiY();
    this._updateMultiZ();
  },
  valueChanged(t, i) {
    this.$inputX.value = i[0];
    this.$inputY.value = i[1];
    this.$inputZ.value = i[2];
  },
  valuesChanged(t, i) {
    this.$inputX.values = i.map((t) => t[0]);

    this.$inputY.values = i.map((t) => t[1]);

    this.$inputZ.values = i.map((t) => t[2]);

    if (this.multiValues) {
      this._updateMultiX();
      this._updateMultiY();
      this._updateMultiZ();
    }
  },
  _updateMultiX() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$inputX.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i[0] == t[0])) {
      this.$inputX.removeAttribute("multi-values");
    } else {
      this.$inputX.setAttribute("multi-values", "");
    }
  },
  _updateMultiY() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$inputY.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i[1] == t[1])) {
      this.$inputY.removeAttribute("multi-values");
    } else {
      this.$inputY.setAttribute("multi-values", "");
    }
  },
  _updateMultiZ() {
    if (
      !this.multiValues ||
      !this.values ||
      !this.values ||
      this.values.length <= 1
    ) {
      return this.$inputZ.removeAttribute("multi-values");
    }
    const t = this.values[0];

    if (this.values.every((i, e) => e == 0 || i[2] == t[2])) {
      this.$inputZ.removeAttribute("multi-values");
    } else {
      this.$inputZ.setAttribute("multi-values", "");
    }
  },
};
