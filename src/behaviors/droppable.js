import t from "../utils/dom-utils";
import e from "../utils/drag-drop";
let r = {
  get droppable() {
    return this.getAttribute("droppable");
  },
  set droppable(t) {
    this.setAttribute("droppable", t);
  },
  get multi() {
    return this.getAttribute("multi") !== null;
  },
  set multi(t) {
    if (t) {
      this.setAttribute("multi", "");
    } else {
      this.removeAttribute("multi");
    }
  },
  get canDrop() {
    return this._canDrop;
  },
  _initDroppable(r) {
    let a = r.shadowRoot || r;
    this._dragenterCnt = 0;
    this._canDrop = false;

    a.addEventListener("dragenter", (r) => {
      ++this._dragenterCnt;

      if (this._dragenterCnt === 1) {
        this._canDrop = false;
        let a = [];

        if (this.droppable !== null) {
          a = this.droppable.split(",");
        }

        let i = e.type(r.dataTransfer);
        let s = false;
        for (let t = 0; t < a.length; ++t) {
          if (i === a[t]) {
            s = true;
            break;
          }
        }
        if (!s) {
          this._canDrop = false;
          return undefined;
        }
        let n = e.getLength();

        if (i === "file" && n === 0) {
          n = r.dataTransfer.items.length;
        }

        if (!this.multi && n > 1) {
          this._canDrop = false;
          return undefined;
        }

        r.stopPropagation();
        this._canDrop = true;
        this.setAttribute("drag-hovering", "");

        t.fire(this, "drop-area-enter", {
          bubbles: true,
          detail: {
            target: r.target,
            dataTransfer: r.dataTransfer,
            clientX: r.clientX,
            clientY: r.clientY,
            offsetX: r.offsetX,
            offsetY: r.offsetY,
            dragType: i,
            dragItems: e.items(r.dataTransfer),
            dragOptions: e.options(),
          },
        });
      }
    });

    a.addEventListener("dragleave", (e) => {
      --this._dragenterCnt;

      if (this._dragenterCnt === 0) {
        if (!this._canDrop) {
          return;
        }
        e.stopPropagation();
        this.removeAttribute("drag-hovering");

        t.fire(this, "drop-area-leave", {
          bubbles: true,
          detail: { target: e.target, dataTransfer: e.dataTransfer },
        });
      }
    });

    a.addEventListener("drop", (r) => {
      this._dragenterCnt = 0;

      if (this._canDrop) {
        r.preventDefault();
        r.stopPropagation();
        this.removeAttribute("drag-hovering");

        t.fire(this, "drop-area-accept", {
          bubbles: true,
          detail: {
            target: r.target,
            dataTransfer: r.dataTransfer,
            clientX: r.clientX,
            clientY: r.clientY,
            offsetX: r.offsetX,
            offsetY: r.offsetY,
            dragType: e.type(r.dataTransfer),
            dragItems: e.items(r.dataTransfer),
            dragOptions: e.options(),
          },
        });
      }
    });

    a.addEventListener("dragover", (r) => {
      if (this._canDrop) {
        r.preventDefault();
        r.stopPropagation();

        t.fire(this, "drop-area-move", {
          bubbles: true,
          detail: {
            target: r.target,
            clientX: r.clientX,
            clientY: r.clientY,
            offsetX: r.offsetX,
            offsetY: r.offsetY,
            dataTransfer: r.dataTransfer,
            dragType: e.type(r.dataTransfer),
            dragItems: e.items(r.dataTransfer),
            dragOptions: e.options(),
          },
        });
      }
    });
  },
};
export default r;
