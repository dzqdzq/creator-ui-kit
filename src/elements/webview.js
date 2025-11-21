import elementUtils from "./utils.js";
import focusableBehavior from "../behaviors/focusable.js";

export default elementUtils.registerElement("ui-webview", {
  get src() {
    return this.getAttribute("src");
  },
  set src(e) {
    this.setAttribute("src", e);
    this.$view.src = e;
    this.$loader.hidden = false;
  },
  behaviors: [focusableBehavior],
  style:
    "\n    :host {\n      display: block;\n      position: relative;\n      min-width: 100px;\n      min-height: 100px;\n    }\n\n    .wrapper {\n      background: #333;\n    }\n\n    .fit {\n      position: absolute;\n      top: 0;\n      right: 0;\n      bottom: 0;\n      left: 0;\n    }\n\n    [hidden] {\n      display: none;\n    }\n  ",
  template:
    '\n    <webview id="view"\n      nodeintegration\n      disablewebsecurity\n      autosize="on"\n    ></webview>\n    <ui-loader id="loader">Loading</ui-loader>\n    <div id="dropArea" class="fit" hidden></div>\n  ',
  $: { view: "#view", loader: "#loader", dropArea: "#dropArea" },
  ready() {
    let e = this.getAttribute("src");

    if (e === null) {
      e = "editor-framework://static/blank.html";
    }

    this.src = e;
    this._initFocusable(this);
    this._initEvents();
  },
  _initEvents() {
    this.$view.addEventListener("console-message", () => {});
    // IPC functionality removed

    this.$view.addEventListener("did-finish-load", () => {
      this.$loader.hidden = true;
    });
  },
  reload() {
    this.$loader.hidden = false;
    this.$view.reloadIgnoringCache();
  },
  openDevTools() {
    this.$view.openDevTools();
  },
});
