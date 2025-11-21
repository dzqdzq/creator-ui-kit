import r from "chroma-js";
import o from "../utils/dom-utils.js";
import n from "../utils/js-utils.js";
let e = {};
export default e;
let t = {};
function l(e, t, r) {
  let s;
  if (t.hasUserContent) {
    let t = e.querySelector(".user-content");

    if ((t = t || e).children.length) {
      s = Array.prototype.slice.call(t.children, 0);
    }
  }
  o.clear(e);
  let i = e.shadowRoot.getElementById("custom-style");

  if (i) {
    i.remove();
  }

  n.assignExcept(e, t, [
    "template",
    "style",
    "attrs",
    "value",
    "hasUserContent",
  ]);

  if (t.attrs) {
    let r = e._attrs || {};
    for (let s in t.attrs) {
      let n = e.getAttribute(s);
      if (n !== null) {
        let e = t.attrs[s];
        r[s] = e(n);
      }
    }
    e._attrs = r;
  }

  if (e._value === undefined) {
    let r = e.getAttribute("value");

    if (r !== null) {
      e._value = t.value(r);
    }
  }
  if (t.template) {
    let r = typeof t.template;

    if (r === "string") {
      e.innerHTML = t.template;
    } else if (r === "function") {
      e.innerHTML = t.template(e._attrs);
    }
  }
  if (t.hasUserContent && s) {
    let t = document.createElement("div");
    t.classList = ["user-content"];

    s.forEach((e) => {
      t.appendChild(e.cloneNode(true));
    });

    e.insertBefore(t, e.firstChild);
  }
  if (t.style) {
    let r = document.createElement("style");
    r.type = "text/css";
    r.textContent = t.style;
    r.id = "custom-style";
    e.shadowRoot.insertBefore(r, e.shadowRoot.firstChild);
  }
  e._propagateDisable();
  e._propagateReadonly();

  if (e.ready) {
    e.ready(s);
  }

  if (r) {
    r();
  }
}

e.registerElement = (e, t) => {
  let { template, style, listeners, behaviors, $, factoryImpl } = t;

  let u = t.observedAttributes || [];
  let d = true;

  if (t.shadowDOM !== undefined) {
    d = !!t.shadowDOM;
  }

  class p extends HTMLElement {
    static tagName() {
      return e.toUpperCase();
    }
    static get observedAttributes() {
      return u;
    }
    constructor(...args) {
      super();
      let e = this;

      if (d) {
        e = this.attachShadow({ mode: "open" });
      }

      if (template) {
        e.innerHTML = template;
      }

      if (style) {
        if (d) {
          let t = document.createElement("style");
          t.type = "text/css";
          t.textContent = style;
          e.insertBefore(t, e.firstChild);
        } else {
          console.warn("Can not use style in light DOM");
        }
      }

      if ($) {
        for (let t in $) {
          if (this[`$${t}`]) {
            console.warn(`Failed to assign selector $${t}, already used`);
          } else {
            this[`$${t}`] = e.querySelector($[t]);
          }
        }
      }
      if (listeners) {
        for (let t in listeners) {
          if (e) {
            e.addEventListener(
              t,
              listeners[t].bind(this),
              t === "mousewheel" ? { passive: true } : {}
            );
          }

          this.addEventListener(
            t,
            listeners[t].bind(this),
            t === "mousewheel" ? { passive: true } : {}
          );
        }
      }

      if (factoryImpl && args.length > 0) {
        factoryImpl.apply(this, args);
      }

      if (this.ready) {
        this.ready();
      }
    }
  }

  n.assignExcept(p.prototype, t, [
    "shadowDOM",
    "dependencies",
    "factoryImpl",
    "template",
    "style",
    "listeners",
    "behaviors",
    "$",
  ]);

  if (behaviors) {
    behaviors.forEach((e) => {
      n.addon(p.prototype, e);
    });
  }

  window.customElements.define(e, p);
  return p;
};

e.registerProperty = (e, r) => {
  t[e] = r;
};

e.unregisterProperty = (e) => {
  delete t[e];
};

e.getProperty = (e) => t[e];

e.regenProperty = (e, r) => {
  let n = t[e._type];
  if (!n) {
    console.warn(`Failed to regen property ${e._type}: type not registered.`);
    return undefined;
  }
  if (typeof n == "string") {
    import(n)
      .then((module) => {
        const t = module.default || module;
        try {
          l(e, t, r);
        } catch (e) {
          console.error(e.stack);

          if (r) {
            r(e);
          }
        }
      })
      .catch((e) => {
        console.error(e.stack);

        if (r) {
          r(e);
        }
      });

    return undefined;
  }
  try {
    l(e, n, r);
  } catch (e) {
    console.error(e.stack);

    if (r) {
      r(e);
    }
  }
};

e.parseString = (e) => e;

e.parseBoolean = (e) => e !== "false" && e !== null;

e.parseColor = (e) => r(e).rgba();

e.parseArray = (e) => JSON.parse(e);

e.parseObject = (e) => JSON.parse(e);
