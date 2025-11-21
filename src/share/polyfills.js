import i from "util";

if (!i.promisify) {
  i.promisify =
    (i) =>
    (...n) =>
      new Promise((r, t) => {
        i(...n, (i, n) => {
          if (i) {
            t(i);
          } else {
            r(n);
          }
        });
      });
}
