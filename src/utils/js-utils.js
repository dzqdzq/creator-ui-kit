// 简化的 JS 工具函数
function copyprop(name, source, target) {
  const descriptor = getPropertyDescriptor(source, name);
  if (descriptor) {
    Object.defineProperty(target, name, descriptor);
  }
}

function getPropertyDescriptor(obj, name) {
  if (!obj) {
    return null;
  }
  return (
    Object.getOwnPropertyDescriptor(obj, name) ||
    getPropertyDescriptor(Object.getPrototypeOf(obj), name)
  );
}

function padLeft(e, t, r) {
  t -= (e = e.toString()).length;
  return t > 0 ? new Array(t + 1).join(r) + e : e;
}

export default {
  copyprop,
  assign(target, ...sources) {
    target = target || {};
    for (const source of sources) {
      if (source) {
        if (typeof source !== "object") {
          console.error("JS.assign called on non-object:", source);
          continue;
        }
        for (const name in source) {
          copyprop(name, source, target);
        }
      }
    }
    return target;
  },
  assignExcept(target, source, except) {
    target = target || {};
    if (typeof source !== "object") {
      console.error("JS.assignExcept called on non-object:", source);
      return null;
    }
    for (const name in source) {
      if (!except.includes(name)) {
        copyprop(name, source, target);
      }
    }
    return target;
  },
  addon(target, ...sources) {
    target = target || {};
    for (const source of sources) {
      for (const name in source) {
        // 如果属性已存在，则复制；如果不存在，则直接添加
        if (name in target) {
          copyprop(name, source, target);
        } else {
          // 直接复制属性值
          const descriptor = getPropertyDescriptor(source, name);
          if (descriptor) {
            Object.defineProperty(target, name, descriptor);
          } else {
            target[name] = source[name];
          }
        }
      }
    }
    return target;
  },
  padLeft,
  toFixed(e, t, r) {
    let o = 10 ** t;
    let l = (Math.round(e * o) / o).toFixed(t);
    if (r) {
      let e = new RegExp(`0{1,${r}}$`);
      l = l.replace(e, "");

      if (r >= t && l[l.length - 1] === ".") {
        l = l.slice(0, -1);
      }
    }
    return l;
  },
  formatFrame(t, r) {
    let o = Math.floor(Math.log10(r)) + 1;
    let l = "";

    if (t < 0) {
      l = "-";
      t = -t;
    }

    return `${l + Math.floor(t / r)}:${padLeft(t % r, o, "0")}`;
  },
  smoothScale(e, t) {
    let r = e;
    return (r = 2 ** (0.002 * t) * r);
  },
  wrapError(e) {
    return {
      __error__: true,
      stack: e.stack,
      message: e.message,
      code: e.code,
      errno: e.errno,
      syscall: e.syscall,
    };
  },
  arrayCmpFilter(e, t) {
    let r = [];
    for (let o = 0; o < e.length; ++o) {
      let e_o = e[o];
      let a = true;
      for (let e = 0; e < r.length; ++e) {
        let r_e = r[e];
        if (e_o === r_e) {
          a = false;
          break;
        }
        let n = t(r_e, e_o);
        if (n > 0) {
          a = false;
          break;
        }

        if (n < 0) {
          r.splice(e, 1);
          --e;
        }
      }

      if (a) {
        r.push(e_o);
      }
    }
    return r;
  },
  fitSize(e, t, r, o) {
    let l;
    let a;

    if (e > r && t > o) {
      l = r;
      (a = (t * r) / e) > o && ((a = o), (l = (e * o) / t));
    } else if (e > r) {
      l = r;
      a = (t * r) / e;
    } else if (t > o) {
      l = (e * o) / t;
      a = o;
    } else {
      l = e;
      a = t;
    }

    return [l, a];
  },
  prettyBytes(e) {
    if (typeof e != "number" || Number.isNaN(e)) {
      throw new TypeError(`Expected a number, got ${typeof e}`);
    }
    let t = e < 0;
    let r = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    if (t) {
      e = -e;
    }

    if (e < 1) {
      return `${(t ? "-" : "") + e} B`;
    }

    let o = Math.min(
      Math.floor(Math.log(e) / Math.log(1000 /* 1e3 */)),
      r.length - 1
    );
    e = Number((e / 1000 /* 1e3 */ ** o).toFixed(2));
    return `${t ? "-" : ""}${e} ${r[o]}`;
  },
  run(e, ...t) {
    (0, require("child_process").spawn)(e, t, { detached: true }).unref();
  },
};
