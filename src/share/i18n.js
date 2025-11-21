let e = new (require("node-polyglot"))();
let t = /^i18n:/;

export default {
  format(r) {
    if (t.test(r)) {
      if (Editor.openEduMode) {
        let t = r.substr(5);
        return e.has(t) ? e.t(t) : r;
      }
      return e.t(r.substr(5));
    }
    return r;
  },
  formatPath(e) {
    let t = e.split("/");
    return (t = t.map((e) => this.format(e))).join("/");
  },
  t: (t, r) => e.t(t, r),
  extend(t) {
    e.extend(t);
  },
  replace(t) {
    e.replace(t);
  },
  unset(t) {
    e.unset(t);
  },
  clear() {
    e.clear();
  },
  _phrases: () => e.phrases,
  get polyglot() {
    return e;
  },
};
