import elementUtils from "./utils.js";
// import i from "../behaviors/droppable"; // 需要创建此文件
import disableBehavior from "../behaviors/disable.js";

// 临时占位符
const droppableBehavior = {};

export default elementUtils.registerElement("ui-drop-area", {
  shadowDOM: false,
  behaviors: [droppableBehavior, disableBehavior],
  ready() {
    this._initDroppable(this);
    this._initDisable(false);
  },
});
