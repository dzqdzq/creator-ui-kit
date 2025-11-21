import e from "electron";
import t from "lodash";
import i from "./platform";
let s;
let r;

if (i.isMainProcess) {
  s = require("../main/ipc");
} else {
  s = require("../renderer/ipc");
}

let n = null;
let l = {};
const o = "selection:selected";
const c = "selection:unselected";
const a = "selection:activated";
const h = "selection:deactivated";
const f = "selection:hoverin";
const d = "selection:hoverout";
const u = "selection:context";
const v = "selection:changed";
const p = "selection:patch";
let y = {
  register(e) {
    if (!i.isMainProcess) {
      console.warn("Editor.Selection.register can only be called in core level.");
      return undefined;
    }

    if (!l[e]) {
      l[e] = new m(e);
      s.sendToWins("_selection:register", e);
    }
  },
  reset() {
    for (let e in l) {
      l[e].clear();
    }
    l = {};
  },
  local: () => new m("local"),
  confirm() {
    for (let e in l) {
      l[e].confirm();
    }
  },
  cancel() {
    for (let e in l) {
      l[e].cancel();
    }
  },
  confirmed(e) {
    let l_e = l[e];
    return l_e
      ? l_e.confirmed
      : (console.error(
          "Cannot find the type %s for selection. Please register it first.",
          e
        ),
        false);
  },
  select(e, t, i, s) {
    let l_e = l[e];

    if (l_e) {
      if (t && typeof t != "string" && !Array.isArray(t)) {
        console.error(
          "The 2nd argument for `Editor.Selection.select` must be a string or array"
        );

        return undefined;
      }

      l_e.select(t, i, s);
      return undefined;
    }

    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      e
    );

    return undefined;
  },
  unselect(e, t, i) {
    let l_e = l[e];

    if (l_e) {
      if (t && typeof t != "string" && !Array.isArray(t)) {
        console.error(
          "The 2nd argument for `Editor.Selection.select` must be a string or array"
        );

        return undefined;
      }

      l_e.unselect(t, i);
      return undefined;
    }

    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      e
    );

    return undefined;
  },
  hover(e, t) {
    let l_e = l[e];
    if (!l_e) {
      console.error(
        "Cannot find the type %s for selection. Please register it first.",
        e
      );

      return undefined;
    }
    l_e.hover(t);
  },
  setContext(e, t) {
    let l_e = l[e];

    if (l_e) {
      if (t && typeof t != "string") {
        console.error(
          "The 2nd argument for `Editor.Selection.setContext` must be a string"
        );

        return undefined;
      }

      l_e.setContext(t);
      return undefined;
    }

    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      e
    );

    return undefined;
  },
  patch(e, t, i) {
    let l_e = l[e];
    if (!l_e) {
      console.error(
        "Cannot find the type %s for selection. Please register it first",
        e
      );

      return undefined;
    }
    l_e.patch(t, i);
  },
  clear(e) {
    let l_e = l[e];
    if (!l_e) {
      console.error(
        "Cannot find the type %s for selection. Please register it first",
        e
      );

      return undefined;
    }
    l_e.clear();
  },
  hovering(e) {
    let l_e = l[e];
    return l_e
      ? l_e.lastHover
      : (console.error(
          "Cannot find the type %s for selection. Please register it first",
          e
        ),
        null);
  },
  contexts(e) {
    let l_e = l[e];
    return l_e
      ? l_e.contexts
      : (console.error(
          "Cannot find the type %s for selection. Please register it first.",
          e
        ),
        null);
  },
  curActivate(e) {
    let l_e = l[e];
    return l_e
      ? l_e.lastActive
      : (console.error(
          "Cannot find the type %s for selection. Please register it first.",
          e
        ),
        null);
  },
  curGlobalActivate: () => (n ? { type: n.type, id: n.lastActive } : null),
  curSelection(e) {
    let l_e = l[e];
    return l_e
      ? l_e.selection.slice()
      : (console.error(
          "Cannot find the type %s for selection. Please register it first.",
          e
        ),
        null);
  },
  filter(e, t, i) {
    let s;
    let r;
    let n;
    let l;
    if (t === "name") {
      s = e.filter(i);
    } else {
      s = [];

      for (n = 0; n < e.length; ++n) {
        r = e[n];
        let t = true;
        for (l = 0; l < s.length; ++l) {
          let s_l = s[l];
          if (r === s_l) {
            t = false;
            break;
          }
          let n = i(s_l, r);
          if (n > 0) {
            t = false;
            break;
          }

          if (n < 0) {
            s.splice(l, 1);
            --l;
          }
        }

        if (t) {
          s.push(r);
        }
      }
    }
    return s;
  },
};
function g(e, t, ...i) {
  if (t !== "local") {
    s.sendToAll.apply(null, [
      `_${e}`,
      t,
      ...i,
      s.option({ excludeSelf: true }),
    ]);
    s.sendToAll.apply(null, [e, t, ...i]);
  }
}
export default y;
class _ {
  constructor(e) {
    this.type = e;
    this.selection = [];
    this.lastActive = null;
    this.lastHover = null;
    this._context = null;
  }
  _activate(e) {
    if (this.lastActive !== e) {
      g(h, this.type, this.lastActive);

      this.lastActive = e;
      g(a, this.type, e);
      n = this;
      return undefined;
    }

    if (n !== this) {
      n = this;
      g(a, this.type, this.lastActive);
    }
  }
  _unselectOthers(e) {
    e = e || [];

    if (!Array.isArray(e)) {
      [e];
    }

    let i = t.difference(this.selection, e);
    return (
      !!i.length &&
      (g(c, this.type, i),
      (this.selection = t.intersection(this.selection, e)),
      true)
    );
  }
  select(e, i, s) {
    let r = false;
    e = e || [];

    if (!Array.isArray(e)) {
      [e];
    }

    if ((i = i === undefined || i)) {
      r = this._unselectOthers(e);
    }

    if (e.length) {
      let i = t.difference(e, this.selection);

      if (i.length) {
        this.selection = this.selection.concat(i);
        g(o, this.type, i);
        r = true;
      }
    }

    if (e.length) {
      this._activate(e[e.length - 1]);
    } else {
      this._activate(null);
    }

    if (r && s) {
      g(v, this.type);
    }
  }
  unselect(e, i) {
    let s = false;
    let r = false;
    e = e || [];

    if (!Array.isArray(e)) {
      [e];
    }

    if (e.length) {
      let i = t.intersection(this.selection, e);
      this.selection = t.difference(this.selection, e);

      if (i.length) {
        i.includes(this.lastActive) && (r = true);
        g(c, this.type, i);
        s = true;
      }
    }

    if (r) {
      if (this.selection.length) {
        this._activate(this.selection[this.selection.length - 1]);
      } else {
        this._activate(null);
      }
    }

    if (s && i) {
      g(v, this.type);
    }
  }
  hover(e) {
    if (this.lastHover !== e) {
      g(d, this.type, this.lastHover);
      this.lastHover = e;
      g(f, this.type, e);
    }
  }
  setContext(e) {
    this._context = e;
    g(u, this.type, e);
  }
  patch(e, t) {
    let i = this.selection.indexOf(e);

    if (-1 !== i) {
      this.selection[i] = t;
    }

    if (this.lastActive === e) {
      this.lastActive = t;
    }

    if (this.lastHover === e) {
      this.lastHover = t;
    }

    if (this._context === e) {
      this._context = t;
    }

    g(p, this.type, e, t);
  }
  clear() {
    let e = false;

    if (this.selection.length) {
      g(c, this.type, this.selection);
      this.selection = [];
      e = true;
    }

    if (this.lastActive) {
      this._activate(null);
      e = true;
    }

    if (e) {
      g(v, this.type);
    }
  }
}
Object.defineProperty(_.prototype, "contexts", {
  enumerable: true,
  get() {
    let e = this._context;

    if (e) {
      if (!this.selection.includes(e)) {
        return [e];
      }

      return this.selection.slice();
    }

    return [];
  },
});
class m extends _ {
  constructor(e) {
    super(e);
    this.confirmed = true;
    this._confirmedSnapShot = [];
  }
  _checkConfirm(e) {
    if (!this.confirmed && e) {
      this.confirm();
    } else if (this.confirmed && !e) {
      this._confirmedSnapShot = this.selection.slice();
      this.confirmed = false;
    }
  }
  _activate(e) {
    if (this.confirmed) {
      super._activate(e);
    }
  }
  select(e, t, i) {
    i = i === undefined || i;
    this._checkConfirm(i);
    super.select(e, t, i);
  }
  unselect(e, t) {
    t = t === undefined || t;
    this._checkConfirm(t);
    super.unselect(e, t);
  }
  confirm() {
    if (!this.confirmed) {
      this.confirmed = true;

      if (t.xor(this._confirmedSnapShot, this.selection).length) {
        g(v, this.type);
      }

      this._confirmedSnapShot = [];

      if (this.selection.length > 0) {
        this._activate(this.selection[this.selection.length - 1]);
      } else {
        this._activate(null);
      }
    }
  }
  cancel() {
    if (!this.confirmed) {
      super.select(this._confirmedSnapShot, true);
      this.confirmed = true;
      this._confirmedSnapShot = [];
    }
  }
  clear() {
    super.clear();
    this.confirm();
  }
}
let A = null;
A = i.isMainProcess ? e.ipcMain : e.ipcRenderer;

if (i.isMainProcess) {
  A.on("selection:get-registers", (e) => {
    let t = [];
    for (let e in l) {
      let l_e = l[e];
      t.push({
        type: e,
        selection: l_e.selection,
        lastActive: l_e.lastActive,
        lastHover: l_e.lastHover,
        context: l_e._context,
        isLastGlobalActive: l_e === n,
      });
    }
    e.returnValue = t;
  });
}

if (i.isRendererProcess) {
  (() => {
    let e = s.sendToMainSync("selection:get-registers");

    for (let i of e) {
      if (l[i.type]) {
        return;
      }
      let s = new m(i.type);
      s.selection = i.selection.slice();
      s.lastActive = i.lastActive;
      s.lastHover = i.lastHover;
      s._context = i.context;
      l[i.type] = s;

      if (i.isLastGlobalActive) {
        n = s;
      }
    }

    A.on("_selection:register", (e, t) => {
      let i = new m(t);
      l[t] = i;
    });
  })();
}

A.on("_selection:selected", (e, t, i) => {
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }

  if ((i = i.filter((e) => !l_t.selection.includes(e))).length === 1) {
    l_t.selection.push(i[0]);
  } else if (i.length > 1) {
    l_t.selection = l_t.selection.concat(i);
  }
});

A.on("_selection:unselected", (e, t, i) => {
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }
  l_t.selection = l_t.selection.filter((e) => !i.includes(e));
});

A.on("_selection:activated", (e, t, i) => {
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }
  n = l_t;
  l_t.lastActive = i;
});

A.on("_selection:deactivated", (e, t, i) => {
  unused(i);
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }

  if (n === l_t) {
    n = null;
  }

  l_t.lastActive = null;
});

A.on("_selection:hoverin", (e, t, i) => {
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }
  l_t.lastHover = i;
});

A.on("_selection:hoverout", (e, t, i) => {
  unused(i);
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }
  l_t.lastHover = null;
});

A.on("_selection:context", (e, t, i) => {
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }
  l_t._context = i;
});

A.on("_selection:patch", (e, t, i, s) => {
  let l_t = l[t];
  if (!l_t) {
    console.error(
      "Cannot find the type %s for selection. Please register it first.",
      t
    );

    return undefined;
  }
  let o = l_t.selection.indexOf(i);

  if (-1 !== o) {
    l_t.selection[o] = s;
  }

  if (l_t.lastActive === i) {
    l_t.lastActive = s;
  }

  if (l_t.lastHover === i) {
    l_t.lastHover = s;
  }

  if (l_t._context === i) {
    l_t._context = s;
  }
});
