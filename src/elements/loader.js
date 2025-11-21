import e from "chroma-js";
import t from "./utils.js";
import s from "../utils/resource-mgr.js";

export default t.registerElement("ui-loader", {
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
    let s = e(t).rgba();

    if (s !== this._maskColor) {
      this._maskColor = s;
      this.style.backgroundColor = e(s).css();
    }
  },
  template:
    '\n    <div class="animate"></div>\n    <div class="label">\n      <slot></slot>\n    </div>\n  ',
  style: s.getResource("theme://elements/loader.css"),
  factoryImpl(e) {
    if (e) {
      this.innerText = e;
    }
  },
  ready() {
    let t = this.getAttribute("color");
    this._maskColor = t !== null ? e(t).rgba() : [0, 0, 0, 0.3];
  },
  connectedCallback() {
    this.style.backgroundColor = e(this.maskColor).css();
  },
});
