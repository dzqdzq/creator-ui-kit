import e from "./platform";
let t;
function r(e, t, r) {
  let n = (function e(t, r) {
    if (!t) {
      return null;
    }
    return (
      Object.getOwnPropertyDescriptor(t, r) || e(Object.getPrototypeOf(t), r)
    );
  })(t, e);
  Object.defineProperty(r, e, n);
}

t = e.isMainProcess
  ? require("../main/console")
  : require("../renderer/console");

export default {
  copyprop: r,
  assign(e, ...n) {
    e = e || {};

    for (let l of n) {
      if (l) {
        if (typeof l != "object") {
          t.error("JS.assign called on non-object:", l);
          continue;
        }
        for (let t in l) {
          r(t, l, e);
        }
      }
    }

    return e;
  },
  assignExcept(e, n, o) {
    e = e || {};

    if (typeof n != "object") {
      t.error("JS.assignExcept called on non-object:", n);
      return null;
    }

    for (let t in n) {
      if (!o.includes(t)) {
        r(t, n, e);
      }
    }
    return e;
  },
  addon(e, ...t) {
    e = e || {};

    for (let o of t) {
      for (let t in o) {
        if (t in e) {
          r(t, o, e);
        }
      }
    }

    return e;
  },
  extract(e, t) {
    let n = {};

    for (let l of t) {
      if (e[l] !== undefined) {
        r(l, e, n);
      }
    }

    return n;
  },
  extend(e, r) {
    if (!r) {
      t.error("The base class to extend from must be non-nil");
      return undefined;
    }
    if (!e) {
      t.error("The class to extend must be non-nil");
      return undefined;
    }
    for (const n in r) {
      if (r.hasOwnProperty(n)) {
        e[n] = r[n];
      }
    }
    function o() {
      this.constructor = e;
    }
    o.prototype = r.prototype;
    e.prototype = new o();
    return e;
  },
  clear(e) {
    let t = Object.keys(e);
    for (let r = 0; r < t.length; r++) {
      delete e[t[r]];
    }
  },
  getPropertyByPath(e, t) {
    if (!e) {
      return null;
    }
    if (!t.includes(".")) {
      return e[t];
    }
    let r = t.split(".");
    let n = e;
    for (let e = 0; e < r.length; e++) {
      if (!(n = n[r[e]])) {
        return null;
      }
    }
    return n;
  },
};
