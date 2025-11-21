import e from "highlight.js";
import t from "remarkable";
import r from "./utils.js";
import i from "../utils/resource-mgr.js";
// import l from "../../console"; // 外部依赖，暂时注释

// 创建 console 占位符
const l = {
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  log: (...args) => console.log(...args),
};

export default r.registerElement("ui-markdown", {
  get value() {
    return this._value;
  },
  set value(e) {
    if (e === null || e === undefined) {
      e = "";
    }

    if (this._value !== e) {
      this._value = e;
      this._render();
    }
  },
  get values() {
    return this._values;
  },
  set values(e) {
    return (this._values = e);
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(e) {
    if ((e = !(e == null || e === false)) !== this._multiValues) {
      this._multiValues = e;

      if (e) {
        this.setAttribute("multi-values", "");
      } else {
        this.removeAttribute("multi-values");
      }

      return e;
    }
  },
  get observedAttributes() {
    return ["multi-values"];
  },
  attributeChangedCallback(e, t, r) {
    if (t !== r && e == "multi-values") {
      this[e.replace(/\-(\w)/g, (e, t) => t.toUpperCase())] = r;
    }
  },
  template: '\n    <div class="container"></div>\n  ',
  style: i.getResource("theme://elements/markdown.css"),
  $: { container: ".container" },
  factoryImpl(e) {
    if (e) {
      this.value = e;
    }
  },
  ready() {
    this.value = this._unindent(this.textContent);
    this.multiValues = this.getAttribute("multi-values");
  },
  _render() {
    let r = new t({
      html: true,
      highlight(t, r) {
        if (r && e.getLanguage(r)) {
          try {
            return e.highlight(r, t).value;
          } catch (e) {
            l.error(`Syntax highlight failed: ${e.message}`);
          }
        }
        try {
          return e.highlightAuto(t).value;
        } catch (e) {
          l.error(`Syntax highlight failed: ${e.message}`);
        }
        return "";
      },
    }).render(this.value);
    this.$container.innerHTML = r;

    this.$container.querySelectorAll("a").forEach((e) => {
      e.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { shell } = require("electron");
        try {
          await shell.openExternal(e.target.href);
        } catch (e) {
          console.error(e);
        }
      });
    });
  },
  _unindent(e) {
    if (!e) {
      return e;
    }
    let t = e.replace(/\t/g, "  ").split("\n");

    let r = t.reduce((e, t) => {
      if (/^\s*$/.test(t)) {
        return e;
      }
      let r = t.match(/^(\s*)/)[0].length;
      return e === null ? r : r < e ? r : e;
    }, null);

    return t.map((e) => e.substr(r)).join("\n");
  },
});
