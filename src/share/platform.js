let e = {};
export default e;

e.isNode = !(
  typeof process == "undefined" ||
  !process.versions ||
  !process.versions ||
  !process.versions.node
);

e.isElectron = !!(e.isNode && "electron" in process.versions);
e.isNative = e.isElectron;
e.isPureWeb = !e.isNode && !e.isNative;

if (e.isElectron) {
  e.isRendererProcess =
    typeof process != "undefined" && process.type === "renderer";
} else {
  e.isRendererProcess = typeof __dirname == "undefined" || __dirname === null;
}

e.isMainProcess = typeof process != "undefined" && process.type === "browser";

if (e.isNode) {
  e.isDarwin = process.platform === "darwin";
  e.isWin32 = process.platform === "win32";
} else {
  let s = window.navigator.platform;
  e.isDarwin = s.substring(0, 3) === "Mac";
  e.isWin32 = s.substring(0, 3) === "Win";
}

Object.defineProperty(e, "isRetina", {
  enumerable: true,
  get: () =>
    e.isRendererProcess &&
    window.devicePixelRatio &&
    window.devicePixelRatio > 1,
});
