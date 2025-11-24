import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";

const template = /*html*/ `
    <div class="box">
      <slot></slot>
      <div class="arrow"></div>
    </div>
  `;

export default elementUtils.registerElement("ui-hint", {
  get position() {
    return this._position;
  },
  set position(t) {
    if (this._position !== t) {
      this._position = t;

      this.classList.contains("top") || this.classList.contains("bottom")
        ? this._position[0] === "-"
          ? (this.$arrow.style.right = this._position.substr(1))
          : (this.$arrow.style.left = this._position)
        : (this.classList.contains("left") ||
            this.classList.contains("right")) &&
          (this._position[0] === "-"
            ? (this.$arrow.style.bottom = this._position.substr(1))
            : (this.$arrow.style.top = this._position));
    }
  },
  template,
  $: { arrow: ".arrow" },
  style: getElementStyleSync("hint"),
  factoryImpl(t) {
    if (t) {
      this.innerText = t;
    }
  },
  ready() {
    let t = this.getAttribute("position");

    if (t === null) {
      t = "50%";
    }

    this.position = t;
  },
});
