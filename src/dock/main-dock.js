import dockUtils from "../utils/dock-utils";
import focusMgr from "../utils/focus-mgr";
import dragDrop from "../utils/drag-drop";
import Dock from "./dock";
import ipc from "../../ipc";

export default class extends Dock {
  static get tagName() {
    return "ui-main-dock";
  }
  constructor() {
    super();
    this._initEvents();
    dockUtils.root = this;
  }
  connectedCallback() {
    this.noCollapse = true;

    this._loadLayout((t) => {
      if (t) {
        console.error(`Failed to load layout: ${t.stack}`);
      }

      focusMgr._setFocusPanelFrame(null);
    });
  }
  _finalizeStyle() {
    super._finalizeStyle();
    this.style.minWidth = "";
    this.style.minHeight = "";
  }
  _initEvents() {
    this.addEventListener("dragenter", (e) => {
      if (dragDrop.type(e.dataTransfer) === "tab") {
        e.stopPropagation();
        dockUtils.dragenterMainDock();
      }
    });

    this.addEventListener("dragleave", (e) => {
      if (dragDrop.type(e.dataTransfer) === "tab") {
        e.stopPropagation();
        dockUtils.dragleaveMainDock();
      }
    });

    this.addEventListener("dragover", (e) => {
      if (dragDrop.type(e.dataTransfer) === "tab") {
        e.preventDefault();
        e.stopPropagation();
        dragDrop.updateDropEffect(e.dataTransfer, "move");
        dockUtils.dragoverMainDock(e.x, e.y);
      }
    });

    this.addEventListener("drop", (e) => {
      if (dragDrop.type(e.dataTransfer) !== "tab") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      let a = dragDrop.items(e.dataTransfer)[0];
      dockUtils.dropMainDock(a);
    });
  }
  _loadLayout(e) {
    ipc.sendToMain("editor:window-query-layout", (a, r) => {
      if (a) {
        if (e) {
          e(a);
        }

        return undefined;
      }
      dockUtils.reset(this, r, (t) => {
        if (e) {
          e(t);
        }
      });
    });
  }
}
