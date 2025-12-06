/**
 * UI Loader 组件
 */

import chroma from "chroma-js";
import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";

const template = /*html*/ `
    <div class="animate"></div>
    <div class="label">
      <slot></slot>
    </div>
  `;

export default elementUtils.registerElement("ui-loader", {
  get inline(): boolean {
    return this.getAttribute("inline") !== null;
  },

  set inline(value: boolean) {
    if (value) {
      this.setAttribute("inline", "");
    } else {
      this.removeAttribute("inline");
    }
  },

  get maskColor(): number[] {
    return this._maskColor;
  },

  set maskColor(value: string | number[]) {
    const rgba = chroma(value as any).rgba();

    if (rgba !== this._maskColor) {
      this._maskColor = rgba;
      this.style.backgroundColor = chroma(rgba).css();
    }
  },

  template,
  style: getElementStyleSync("loader"),

  factoryImpl(text: string): void {
    if (text) {
      this.innerText = text;
    }
  },

  ready(): void {
    const color = this.getAttribute("color");
    this._maskColor = color !== null ? chroma(color).rgba() : [0, 0, 0, 0.3];
  },

  connectedCallback(): void {
    this.style.backgroundColor = chroma(this.maskColor).css();
  },
});

