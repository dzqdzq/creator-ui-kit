/**
 * UI Splitter 组件
 */

import elementUtils from "../utils/utils";
import resizableBehavior from "../behaviors/resizable";
import { getElementStyleSync } from "../utils/css-loader";

const template = /*html*/ `
    <div class="content">
      <slot></slot>
    </div>
  `;

export default elementUtils.registerElement("ui-splitter", {
  behaviors: [resizableBehavior],
  template,
  style: getElementStyleSync("splitter"),

  ready(): void {
    this._initResizable();
    this._needEvaluateSize = this.children.length !== 0;

    for (let i = 0; i < this.children.length; ++i) {
      if (this.children[i].tagName !== "UI-SPLITTER") {
        this._needEvaluateSize = false;
        break;
      }
    }

    this._initResizers();

    window.requestAnimationFrame(() => {
      if (this.parentElement?.tagName !== "UI-SPLITTER") {
        this._finalizeMinMaxRecursively();
        this._finalizePreferredSizeRecursively();
        this._finalizeStyleRecursively();
        this._reflowRecursively();
      }
    });
  },

  _initResizers(): void {
    if (this._needEvaluateSize && this.children.length > 1) {
      for (let i = 0; i < this.children.length; ++i) {
        if (i !== this.children.length - 1) {
          const nextSibling = this.children[i + 1];
          const resizer = document.createElement("ui-dock-resizer") as HTMLElement & { vertical?: boolean };
          resizer.vertical = this.row;
          this.insertBefore(resizer, nextSibling);
          i += 1;
        }
      }
    }
  },
});

