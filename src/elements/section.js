import elementUtils from "./utils.js";
import { acceptEvent } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";

export default elementUtils.registerElement("ui-section", {
  get hovering() {
    return this.getAttribute("hovering") !== null;
  },
  set hovering(e) {
    if (e) {
      this.setAttribute("hovering", "");
    } else {
      this.removeAttribute("hovering");
    }
  },
  behaviors: [focusableBehavior, disableBehavior],
  template:
    '\n    <div class="wrapper">\n      <i class="fold icon-fold-up"></i>\n      <slot name="header"></slot>\n    </div>\n    <slot class="content"></slot>\n  ',
  style: getElementStyleSync("section"),
  $: { wrapper: ".wrapper", foldIcon: ".fold" },
  factoryImpl(e) {
    let t = document.createElement("span");
    t.innerText = e;
    this.appendChild(t);
  },
  ready() {
    if (this.getAttribute("folded") !== null) {
      this.fold();
    } else {
      this.foldup();
    }

    this._initFocusable(this.$wrapper);
    this._initDisable(true);
    this._initEvents();

    if (this.querySelector('[slot="header"]') === null) {
      const e = this.querySelector(".header");

      if (e) {
        e.setAttribute("slot", "header");
      }
    }
  },
  _initEvents() {
    this.$wrapper.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      focusMgr._setFocusElement(this);
    });

    this.$wrapper.addEventListener("click", () => {
      if (this._folded) {
        this.foldup();
      } else {
        this.fold();
      }
    });

    this.$wrapper.addEventListener("mouseover", (e) => {
      e.stopImmediatePropagation();
      this.hovering = true;
    });

    this.$wrapper.addEventListener("mouseout", (e) => {
      e.stopImmediatePropagation();
      this.hovering = false;
    });

    this.$wrapper.addEventListener("keydown", (e) => {
      if (e.keyCode === 37) {
        acceptEvent(e);
        this.fold();
      } else if (e.keyCode === 39) {
        acceptEvent(e);
        this.foldup();
      }
    });
  },
  fold() {
    if (!this._folded) {
      this._folded = true;
      this.$foldIcon.classList.remove("icon-fold-up");
      this.$foldIcon.classList.add("icon-fold");
      this.setAttribute("folded", "");
    }
  },
  foldup() {
    if (this._folded) {
      this._folded = false;
      this.$foldIcon.classList.remove("icon-fold");
      this.$foldIcon.classList.add("icon-fold-up");
      this.removeAttribute("folded");
    }
  },
});
