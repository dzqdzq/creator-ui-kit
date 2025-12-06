/**
 * UI Progress 组件
 */

import elementUtils from "../utils/utils";
import mathUtils from "../utils/math";
import { getElementStyleSync } from "../utils/css-loader";

const template = /*html*/ `
    <div class="bar">
      <div class="label"></div>
    </div>
  `;

export default elementUtils.registerElement("ui-progress", {
  get value(): number {
    return this._value;
  },

  set value(value: number | null | undefined) {
    if (value === null || value === undefined) {
      value = 0;
    }

    value = parseInt(String(mathUtils.clamp(value, 0, 100)));

    if (this._value !== value) {
      this._value = value;
      this._updateProgressBar();
    }
  },

  template,
  style: getElementStyleSync("progress"),
  $: { bar: ".bar", label: ".label" },

  factoryImpl(value: number): void {
    if (value) {
      this.value = value;
    }
  },

  ready(): void {
    this.$bar.addEventListener("transitionend", () => {
      this._inTransition = false;
      this.$label.innerText = `${this._value}%`;
    });

    this._inTransition = false;
    const value = parseFloat(this.getAttribute("value") || "0");
    this._value = isNaN(value) ? 0 : value;
    this.$bar.style.width = `${this._value}%`;
    this.$label.innerText = `${this._value}%`;
  },

  _updateProgressBar(): void {
    this._inTransition = true;
    this.$bar.style.width = `${this._value}%`;
    this._updateLabel();
  },

  _updateLabel(): void {
    window.requestAnimationFrame(() => {
      if (!this._inTransition) {
        return;
      }
      const totalWidth = this.clientWidth - 4;
      const barWidth = this.$bar.clientWidth;
      let percent = parseInt(String((barWidth / totalWidth) * 100));

      if (barWidth <= 30) {
        percent = 0;
      }

      this.$label.innerText = `${percent}%`;
      this._updateLabel();
    });
  },
});

