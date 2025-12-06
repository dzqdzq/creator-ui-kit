/**
 * UI Hint 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";

const template = /*html*/ `
    <div class="box">
      <slot></slot>
      <div class="arrow"></div>
    </div>
  `;

export default elementUtils.registerElement("ui-hint", {
  get position(): string {
    return this._position;
  },

  set position(value: string) {
    if (this._position !== value) {
      this._position = value;

      if (this.classList.contains("top") || this.classList.contains("bottom")) {
        if (this._position[0] === "-") {
          this.$arrow.style.right = this._position.substr(1);
        } else {
          this.$arrow.style.left = this._position;
        }
      } else if (this.classList.contains("left") || this.classList.contains("right")) {
        if (this._position[0] === "-") {
          this.$arrow.style.bottom = this._position.substr(1);
        } else {
          this.$arrow.style.top = this._position;
        }
      }
    }
  },

  template,
  $: { arrow: ".arrow" },
  style: getElementStyleSync("hint"),

  factoryImpl(text: string): void {
    if (text) {
      this.innerText = text;
    }
  },

  ready(): void {
    let position = this.getAttribute("position");

    if (position === null) {
      position = "50%";
    }

    this.position = position;
  },
});

