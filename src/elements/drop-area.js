import e from "./utils.js";
// import i from "../behaviors/droppable"; // 需要创建此文件
import r from "../behaviors/disable.js";

// 临时占位符
const i = {};

export default e.registerElement("ui-drop-area", {
  shadowDOM: false,
  behaviors: [i, r],
  ready() {
    this._initDroppable(this);
    this._initDisable(false);
  },
});
