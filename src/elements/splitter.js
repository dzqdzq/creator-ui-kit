import elementUtils from "./utils.js";
// import i from "../behaviors/resizable"; // 需要创建此文件
import resourceMgr from "../utils/resource-mgr.js";

// 临时占位符
const resizableBehavior = {};

export default elementUtils.registerElement("ui-splitter", {
  behaviors: [resizableBehavior],
  template: '\n    <div class="content">\n      <slot></slot>\n    </div>\n  ',
  style: resourceMgr.getResource("theme://elements/splitter.css"),
  ready() {
    this._initResizable();
    this._needEvaluateSize = this.children.length !== 0;
    for (let e = 0; e < this.children.length; ++e) {
      if (this.children[e].tagName !== "UI-SPLITTER") {
        this._needEvaluateSize = false;
        break;
      }
    }
    this._initResizers();

    window.requestAnimationFrame(() => {
      if (this.parentElement.tagName !== "UI-SPLITTER") {
        this._finalizeMinMaxRecursively();
        this._finalizePreferredSizeRecursively();
        this._finalizeStyleRecursively();
        this._reflowRecursively();
      }
    });
  },
  _initResizers() {
    if (this._needEvaluateSize && this.children.length > 1) {
      for (let e = 0; e < this.children.length; ++e) {
        if (e !== this.children.length - 1) {
          let i = this.children[e + 1];
          let t = document.createElement("ui-dock-resizer");
          t.vertical = this.row;
          this.insertBefore(t, i);
          e += 1;
        }
      }
    }
  },
});
