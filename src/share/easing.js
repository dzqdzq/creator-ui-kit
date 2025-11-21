let n = {};
function t(n, t) {
  return (u) => (u < 0.5 ? t(2 * u) / 2 : n(2 * u - 1) / 2 + 0.5);
}
export default n;

n.linear = (n) => n;

n.quadIn = (n) => n * n;

n.quadOut = (n) => n * (2 - n);

n.quadInOut = (n) => ((n *= 2) < 1 ? 0.5 * n * n : -0.5 * (--n * (n - 2) - 1));

n.quadOutIn = t(n.quadIn, n.quadOut);

n.cubicIn = (n) => n * n * n;

n.cubicOut = (n) => --n * n * n + 1;

n.cubicInOut = (n) =>
  (n *= 2) < 1 ? 0.5 * n * n * n : 0.5 * ((n -= 2) * n * n + 2);

n.cubicOutIn = t(n.cubicIn, n.cubicOut);

n.quartIn = (n) => n * n * n * n;

n.quartOut = (n) => 1 - --n * n * n * n;

n.quartInOut = (n) =>
  (n *= 2) < 1 ? 0.5 * n * n * n * n : -0.5 * ((n -= 2) * n * n * n - 2);

n.quartOutIn = t(n.quartIn, n.quartOut);

n.quintIn = (n) => n * n * n * n * n;

n.quintOut = (n) => --n * n * n * n * n + 1;

n.quintInOut = (n) =>
  (n *= 2) < 1 ? 0.5 * n * n * n * n * n : 0.5 * ((n -= 2) * n * n * n * n + 2);

n.quintOutIn = t(n.quintIn, n.quintOut);

n.sineIn = (n) => 1 - Math.cos((n * Math.PI) / 2);

n.sineOut = (n) => Math.sin((n * Math.PI) / 2);

n.sineInOut = (n) => 0.5 * (1 - Math.cos(Math.PI * n));

n.sineOutIn = t(n.sineIn, n.sineOut);

n.expoIn = (n) => (n === 0 ? 0 : 1024 ** (n - 1));

n.expoOut = (n) => (n === 1 ? 1 : 1 - 2 ** (-10 * n));

n.expoInOut = (n) =>
  n === 0
    ? 0
    : n === 1
    ? 1
    : (n *= 2) < 1
    ? 0.5 * 1024 ** (n - 1)
    : 0.5 * (2 - 2 ** (-10 * (n - 1)));

n.expoOutIn = t(n.expoIn, n.expoOut);

n.circIn = (n) => 1 - Math.sqrt(1 - n * n);

n.circOut = (n) => Math.sqrt(1 - --n * n);

n.circInOut = (n) =>
  (n *= 2) < 1
    ? -0.5 * (Math.sqrt(1 - n * n) - 1)
    : 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);

n.circOutIn = t(n.circIn, n.circOut);

n.elasticIn = (n) => {
  let t;
  let u = 0.1;
  return n === 0
    ? 0
    : n === 1
    ? 1
    : (!u || u < 1
        ? ((u = 1), (t = 0.1))
        : (t = (0.4 * Math.asin(1 / u)) / (2 * Math.PI)),
      -u * 2 ** (10 * (n -= 1)) * Math.sin(((n - t) * (2 * Math.PI)) / 0.4));
};

n.elasticOut = (n) => {
  let t;
  let u = 0.1;
  return n === 0
    ? 0
    : n === 1
    ? 1
    : (!u || u < 1
        ? ((u = 1), (t = 0.1))
        : (t = (0.4 * Math.asin(1 / u)) / (2 * Math.PI)),
      u * 2 ** (-10 * n) * Math.sin(((n - t) * (2 * Math.PI)) / 0.4) + 1);
};

n.elasticInOut = (n) => {
  let t;
  let u = 0.1;
  return n === 0
    ? 0
    : n === 1
    ? 1
    : (!u || u < 1
        ? ((u = 1), (t = 0.1))
        : (t = (0.4 * Math.asin(1 / u)) / (2 * Math.PI)),
      (n *= 2) < 1
        ? u *
          2 ** (10 * (n -= 1)) *
          Math.sin(((n - t) * (2 * Math.PI)) / 0.4) *
          -0.5
        : u *
            2 ** (-10 * (n -= 1)) *
            Math.sin(((n - t) * (2 * Math.PI)) / 0.4) *
            0.5 +
          1);
};

n.elasticOutIn = t(n.elasticIn, n.elasticOut);

n.backIn = (n) => {
  const t = 1.70158;
  return n * n * ((t + 1) * n - t);
};

n.backOut = (n) => {
  const t = 1.70158;
  return --n * n * ((t + 1) * n + t) + 1;
};

n.backInOut = (n) => {
  const t = 2.5949095;
  return (n *= 2) < 1
    ? n * n * ((t + 1) * n - t) * 0.5
    : 0.5 * ((n -= 2) * n * ((t + 1) * n + t) + 2);
};

n.backOutIn = t(n.backIn, n.backOut);

n.bounceIn = (t) => 1 - n.bounceOut(1 - t);

n.bounceOut = (n) =>
  n < 1 / 2.75
    ? 7.5625 * n * n
    : n < 2 / 2.75
    ? 7.5625 * (n -= 1.5 / 2.75) * n + 0.75
    : n < 2.5 / 2.75
    ? 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375
    : 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;

n.bounceInOut = (t) =>
  t < 0.5 ? 0.5 * n.bounceIn(2 * t) : 0.5 * n.bounceOut(2 * t - 1) + 0.5;

n.bounceOutIn = t(n.bounceIn, n.bounceOut);

n.smooth = (n) => (n <= 0 ? 0 : n >= 1 ? 1 : n * n * (3 - 2 * n));

n.fade = (n) => (n <= 0 ? 0 : n >= 1 ? 1 : n * n * n * (n * (6 * n - 15) + 10));
