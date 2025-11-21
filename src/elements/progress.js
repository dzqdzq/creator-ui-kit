import elementUtils from "./utils.js";
import mathUtils from "../utils/math.js";
import { getElementStyleSync } from "../utils/css-loader.js";

export default elementUtils.registerElement("ui-progress", {
  get value() {
    return this._value;
  },
  set value(e) {
    if (e === null || e === undefined) {
      e = 0;
    }

    e = parseInt(mathUtils.clamp(e, 0, 100));

    if (this._value !== e) {
      this._value = e;
      this._updateProgressBar();
    }
  },
  template:
    '\n    <div class="bar">\n      <div class="label"></div>\n    </div>\n  ',
  style: getElementStyleSync("progress"),
  $: { bar: ".bar", label: ".label" },
  factoryImpl(e) {
    if (e) {
      this.value = e;
    }
  },
  ready() {
    this.$bar.addEventListener("transitionend", () => {
      this._inTransition = false;
      this.$label.innerText = `${this._value}%`;
    });

    this._inTransition = false;
    let e = parseFloat(this.getAttribute("value"));
    this._value = isNaN(e) ? 0 : e;
    this.$bar.style.width = `${this._value}%`;
    this.$label.innerText = `${this._value}%`;
  },
  _updateProgressBar() {
    this._inTransition = true;
    this.$bar.style.width = `${this._value}%`;
    this._updateLabel();
  },
  _updateLabel() {
    window.requestAnimationFrame(() => {
      if (!this._inTransition) {
        return;
      }
      let e = this.clientWidth - 4;
      let t = this.$bar.clientWidth;
      let i = parseInt((t / e) * 100);

      if (t <= 30) {
        i = 0;
      }

      this.$label.innerText = `${i}%`;
      this._updateLabel();
    });
  },
});
