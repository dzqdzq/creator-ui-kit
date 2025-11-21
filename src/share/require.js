import e from "fs";
import r from "path";
import n from "path";
import t from "vm";
import s from "v8";
import i from "module";
import o from "zlib";
const c = ["pixi.js", "highlight.js", "ipaddr.js", "svg.js", "svg.filter.js"];
let a = null;
try {
  a = process._linkedBinding("electron_common_compile");
} catch (e) {
  console.log(`(${process.pid}) Develop mode...`);
}
i.prototype.__require = i.prototype.require;

i.prototype.require = function (t) {
  return c.includes(t)
    ? this.__require(t)
    : ((t = t.replace(/\.js$/i, (s) => {
        if (r.isAbsolute(t) && e.existsSync(t)) {
          return s;
        }
        if (/^\./.test(t)) {
          return "";
        }
        for (let n of this.paths) {
          const i = r.join(n, t);
          if (e.existsSync(i)) {
            return s;
          }
        }
        return "";
      })),
      this.__require(t));
};

global.__vm__ = t;
global.__temp_panel_proto_ = undefined;
s.setFlagsFromString("--no-lazy");

if (Number.parseInt(process.versions.node.split(".")[0], 10) >= 12) {
  s.setFlagsFromString("--no-flush-bytecode");
}

const l = (e) => {
  if (!Buffer.isBuffer(e)) {
    throw new Error("bytecodeBuffer must be a buffer object.");
  }
  return process.version.startsWith("v8.8") ||
    process.version.startsWith("v8.9")
    ? e.slice(12, 16).reduce((e, r, t) => (e += r * 256 ** t), 0)
    : e.slice(8, 12).reduce((e, r, t) => (e += r * 256 ** t), 0);
};

const u = (e) => {
  if (typeof e != "string") {
    throw new Error(`javascriptCode must be string. ${typeof e} was given.`);
  }
  let r = new t.Script(e, { produceCachedData: true });
  return r.createCachedData && r.createCachedData.call
    ? r.createCachedData()
    : r.cachedData;
};

function f(e) {
  if (e.charCodeAt(0) === 65279) {
    e = e.slice(1);
  }

  return e;
}
let p = function (r, t) {
  let s;
  let o = n.basename(t, n.extname(t));
  let l = `${o}.jsc`;
  let u = `${o}.js`;
  let p = `${o}.cjs`;
  let m = `${o}.ccd`;
  let h = n.join(n.dirname(t), u);
  let _ = n.join(n.dirname(t), l);
  let v = n.join(n.dirname(t), p);
  let y = n.join(n.dirname(t), m);
  if (e.existsSync(y)) {
    t = y;

    s = function (e) {
      let r = a.test2(e);
      r = Buffer.from(r);
      return d.call(this, r, e);
    }.call(this, y);
  } else {
    if (e.existsSync(h)) {
      t = h;
      const s = e.readFileSync(t, "utf8");
      return r._compile(f(s), t);
    }
    if (!e.existsSync(_)) {
      t = v;
      const s = e.readFileSync(t, "utf8");
      return r._compile(f(s), t);
    }
    t = _;

    s = ((r) => d(e.readFileSync(r), r)).call(this, _);
  }

  class j {
    constructor(e) {
      return r.require(e);
    }

    static resolve(e, t) {
      return c.includes(e)
        ? i._resolveFilename(e, r, false, t)
        : ((e = e.replace(/\.js$/, "")), i._resolveFilename(e, r, false, t));
    }
  }

  j.main = process.mainModule;
  j.extensions = i._extensions;
  j.cache = i._cache;
  let x = n.dirname(t);
  let b = [r.exports, j, r, t, x, process, global];
  return s.apply(r.exports, b);
};
function d(e, r) {
  ((e) => {
    if (!Buffer.isBuffer(e)) {
      throw new Error("bytecodeBuffer must be a buffer object.");
    }
    let r = u('"c_c"');

    if (
      process.version.startsWith("v8.8") ||
      process.version.startsWith("v8.9")
    ) {
      r.slice(16, 20).copy(e, 16);
      r.slice(20, 24).copy(e, 20);
    } else if (
      process.version.startsWith("v12") ||
      process.version.startsWith("v13")
    ) {
      r.slice(12, 16).copy(e, 12);
    } else {
      r.slice(12, 16).copy(e, 12);
      r.slice(16, 20).copy(e, 16);
    }
  })(e);
  let s = l(e);
  let n = "";

  if (s > 1) {
    n = `"${"​".repeat(s - 2)}"`;
  }

  let i = new t.Script(n, {
    filename: r,
    lineOffset: 0,
    displayErrors: true,
    cachedData: e,
  });
  if (i.cachedDataRejected) {
    throw new Error("Invalid or incompatible cached data (cachedDataRejected)");
  }
  return i.runInThisContext({
    filename: r,
    lineOffset: 0,
    columnOffset: 0,
    displayErrors: true,
  });
}
i._extensions[".js"] = p;
i._extensions[".jsc"] = p;

i._extensions[".jsg"] = (r, t) => {
  const s = e.readFileSync(t);
  const n = o.gunzipSync(s);
  r._compile(n.toString(), t);
};

i._extensions[".ccd"] = p;

i._extensions[".ccc"] = function (r, t) {
  let s = `${n.basename(t, n.extname(t))}.ccc`;
  let o = n.join(n.dirname(t), s);

  class l {
    constructor(e) {
      return r.require(e);
    }

    static resolve(e, t) {
      return c.includes(e)
        ? i._resolveFilename(e, r, false, t)
        : ((e = e.replace(/\.js$/, "")), i._resolveFilename(e, r, false, t));
    }
  }

  l.main = process.mainModule;
  l.extensions = i._extensions;
  l.cache = i._cache;
  let u = n.dirname(o);
  let f = [r.exports, l, r, t, u, process, global];
  return e.existsSync(o)
    ? ((t = o),
      ((e, ...r) =>
        a.test(
          e,
          ["exports", "require", "module", "__filename", "__dirname"],
          { filename: e },
          ...r
        )).call(this, o, ...f))
    : null;
};
