import elementUtils from "./utils.js";
import resourceMgr from "../utils/resource-mgr.js";
import domUtils from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import hintElement from "./hint.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import jsUtils from "../utils/js-utils.js";
let d = null;
function u(e) {
  let t = document.createElement("th");
  t.classList.add("wrapper");
  let l = document.importNode(e, true);
  t.appendChild(l);
  return t;
}

export default elementUtils.registerElement("ui-prop-table", {
  style: resourceMgr.getResource("theme://elements/prop-table.css"),
  template: "\n    <table></table>\n  ",
  $: { table: "table" },
  ready() {
    let e = this.querySelector("template");
    if (e && e.content) {
      e.content.querySelectorAll("ui-row").forEach((e) => {
        let t = e.getAttribute("name");
        let a = e.getAttribute("tooltip");

        let c = ((e, t) => {
          let n = document.createElement("tr");

          if (e) {
            n.setAttribute("disabled", "");
          }

          if (t) {
            n.setAttribute("readonly", "");
          }

          jsUtils.addon(n, disableBehavior);
          jsUtils.addon(n, readonlyBehavior);
          n._initDisable(true);
          n._initReadonly(true);

          n.addEventListener("focus-changed", (e) => {
            if (e.detail.focused) {
              n.setAttribute("selected", "");
            } else {
              n.removeAttribute("selected");
            }
          });

          n.addEventListener("mouseover", (e) => {
            e.stopImmediatePropagation();
            n.setAttribute("hovering", "");
          });

          n.addEventListener("mouseout", (e) => {
            e.stopImmediatePropagation();
            n.removeAttribute("hovering");
          });

          n.addEventListener("mousedown", (e) => {
            domUtils.acceptEvent(e);
            focusMgr._setFocusElement(null);
            let t = focusMgr._getFirstFocusableFrom(n, true);

            if (t) {
              focusMgr._setFocusElement(t);
            }
          });

          return n;
        })(
          e.getAttribute("disabled") !== null,
          e.getAttribute("readonly") !== null
        );

        let p = ((e, t) => {
          let l = document.createElement("th");
          l.classList.add("label");
          l.innerText = e;

          l.addEventListener("mouseenter", () => {
            if (t) {
              ((e, t) => {
                if (!d) {
                  (d = new n(t)).style.display = "none";
                  d.style.position = "absolute";
                  d.style.maxWidth = "200px";
                  d.style.zIndex = "999";
                  d.classList = "bottom shadow";
                  d.position = "20px";
                  document.body.appendChild(d);
                }

                d.innerText = t;

                e._showTooltipID = setTimeout(() => {
                  e._showTooltipID = null;
                  d.style.display = "block";
                  let t = e.getBoundingClientRect();
                  let l = d.getBoundingClientRect();
                  d.style.left = t.left - 10;
                  d.style.top = t.top - l.height - 10;
                }, 200);
              })(l, t);
            }
          });

          l.addEventListener("mouseleave", () => {
            if (t) {
              ((e) => {
                clearTimeout(e._showTooltipID);
                e._showTooltipID = null;

                if (d) {
                  d.style.display = "none";
                }
              })(l);
            }
          });

          return l;
        })(t, a);

        c.appendChild(p);
        for (let t = 0; t < e.children.length; ++t) {
          let l = u(e.children[t]);
          c.appendChild(l);
        }
        this.$table.appendChild(c);

        if (c._disabled) {
          domUtils.walk(c, { excludeSelf: true }, (e) => {
            if (e._setIsDisabledAttribute) {
              e._setIsDisabledAttribute(true);
            }

            return false;
          });
        }

        if (c._readonly) {
          domUtils.walk(c, { excludeSelf: true }, (e) => {
            if (e._setIsReadonlyAttribute) {
              e._setIsReadonlyAttribute(true);
            }

            return false;
          });
        }
      });
    }
  },
});
