import t from "../utils/dock-utils";
import a from "../utils/focus-mgr";
import r from "../utils/drag-drop";
import i from "./dock";
import o from "../../ipc";

export default class extends i {
  static get tagName() {
    return "ui-main-dock";
  }
  constructor() {
    super();
    this._initEvents();
    t.root = this;
  }
  connectedCallback() {
    this.noCollapse = true;

    this._loadLayout((t) => {
      if (t) {
        console.error(`Failed to load layout: ${t.stack}`);
      }

      a._setFocusPanelFrame(null);
    });
  }
  _finalizeStyle() {
    super._finalizeStyle();
    this.style.minWidth = "";
    this.style.minHeight = "";
  }
  _initEvents() {
    this.addEventListener("dragenter", (e) => {
      if (r.type(e.dataTransfer) === "tab") {
        e.stopPropagation();
        t.dragenterMainDock();
      }
    });

    this.addEventListener("dragleave", (e) => {
      if (r.type(e.dataTransfer) === "tab") {
        e.stopPropagation();
        t.dragleaveMainDock();
      }
    });

    this.addEventListener("dragover", (e) => {
      if (r.type(e.dataTransfer) === "tab") {
        e.preventDefault();
        e.stopPropagation();
        r.updateDropEffect(e.dataTransfer, "move");
        t.dragoverMainDock(e.x, e.y);
      }
    });

    this.addEventListener("drop", (e) => {
      if (r.type(e.dataTransfer) !== "tab") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      let a = r.items(e.dataTransfer)[0];
      t.dropMainDock(a);
    });
  }
  _loadLayout(e) {
    o.sendToMain("editor:window-query-layout", (a, r) => {
      if (a) {
        if (e) {
          e(a);
        }

        return undefined;
      }
      t.reset(this, r, (t) => {
        if (e) {
          e(t);
        }
      });
    });
  }
}
