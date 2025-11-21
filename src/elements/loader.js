import chroma from "chroma-js";
import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";

export default elementUtils.registerElement("ui-loader", {
  get inline() {
    return this.getAttribute("inline") !== null;
  },
  set inline(e) {
    if (e) {
      this.setAttribute("inline", "");
    } else {
      this.removeAttribute("inline");
    }
  },
  get maskColor() {
    return this._maskColor;
  },
  set maskColor(t) {
    let s = chroma(t).rgba();

    if (s !== this._maskColor) {
      this._maskColor = s;
      this.style.backgroundColor = chroma(s).css();
    }
  },
  template:
    '\n    <div class="animate"></div>\n    <div class="label">\n      <slot></slot>\n    </div>\n  ',
  style: getElementStyleSync("loader"),
  factoryImpl(e) {
    if (e) {
      this.innerText = e;
    }
  },
  ready() {
    let t = this.getAttribute("color");
    this._maskColor = t !== null ? chroma(t).rgba() : [0, 0, 0, 0.3];
  },
  connectedCallback() {
    this.style.backgroundColor = chroma(this.maskColor).css();
  },
});
