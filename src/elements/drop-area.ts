/**
 * UI Drop Area 组件
 */

import elementUtils from "../utils/utils";
import disableBehavior from "../behaviors/disable";

export default elementUtils.registerElement("ui-drop-area", {
  shadowDOM: false,
  behaviors: [disableBehavior],

  ready(): void {
    this._initDisable(false);
  },
});

