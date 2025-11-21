import e from "./utils.js";
import t from "../utils/dom-utils.js";
import s from "../utils/focus-mgr.js";
import i from "../utils/resource-mgr.js";
import o from "../behaviors/focusable.js";
import r from "../behaviors/disable.js";

export default e.registerElement("ui-section", {
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
  behaviors: [o, r],
  template:
    '\n    <div class="wrapper">\n      <i class="fold icon-fold-up"></i>\n      <slot name="header"></slot>\n    </div>\n    <slot class="content"></slot>\n  ',
  style: i.getResource("theme://elements/section.css"),
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
      s._setFocusElement(this);
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
        t.acceptEvent(e);
        this.fold();
      } else if (e.keyCode === 39) {
        t.acceptEvent(e);
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
