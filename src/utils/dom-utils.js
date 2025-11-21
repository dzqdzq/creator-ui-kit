// DOM 工具函数
let dragCancelHandler = null;
let dragGhost = null;

function isLeftMouseButton(e) {
  const mouseEvents = ["mousedown", "mousemove", "mouseup", "click"];
  if (!mouseEvents.includes(e.type)) {
    return false;
  }
  if (e.type === "mousemove") {
    const buttons = e.buttons === undefined ? 1 : e.buttons;
    return Boolean(1 & buttons);
  }
  return e.button === 0 || e.button === undefined;
}

const domUtils = {
  clear(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  },
  fire(el, eventName, options) {
    options = options || {};
    el.dispatchEvent(new CustomEvent(eventName, options));
  },
  acceptEvent(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  },
  installDownUpEvent(target) {
    function cleanup(moveHandler, upHandler) {
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
    }

    target.addEventListener("mousedown", (e) => {
      this.acceptEvent(e);
      if (!isLeftMouseButton(e)) {
        return;
      }

      const moveHandler = (e) => {
        if (!isLeftMouseButton(e)) {
          this.fire(target, "up", { sourceEvent: e, bubbles: true });
          cleanup(moveHandler, upHandler);
        }
      };

      const upHandler = (e) => {
        if (isLeftMouseButton(e)) {
          this.fire(target, "up", { sourceEvent: e, bubbles: true });
          cleanup(moveHandler, upHandler);
        }
      };

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler, true);
      this.fire(target, "down", { sourceEvent: e, bubbles: true });
    });
  },
  startDrag(cursor, startEvent, onMove, onEnd, onWheel) {
    this.addDragGhost(cursor);
    startEvent.stopPropagation();

    let { button, clientX, clientY } = startEvent;
    let deltaX = 0;
    let deltaY = 0;
    let totalDeltaX = 0;
    let totalDeltaY = 0;

    const moveHandler = (e) => {
      e.stopPropagation();
      deltaX = e.clientX - clientX;
      deltaY = e.clientY - clientY;
      totalDeltaX = e.clientX - clientX;
      totalDeltaY = e.clientY - clientY;
      clientX = e.clientX;
      clientY = e.clientY;
      if (onMove) {
        onMove(e, deltaX, deltaY, totalDeltaX, totalDeltaY);
      }
    };

    const upHandler = (e) => {
      e.stopPropagation();
      if (e.button === button) {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
        document.removeEventListener("mousewheel", wheelHandler);
        this.removeDragGhost();
        deltaX = e.clientX - clientX;
        deltaY = e.clientY - clientY;
        totalDeltaX = e.clientX - clientX;
        totalDeltaY = e.clientY - clientY;
        dragCancelHandler = null;
        if (onEnd) {
          onEnd(e, deltaX, deltaY, totalDeltaX, totalDeltaY);
        }
      }
    };

    const wheelHandler = (e) => {
      if (onWheel) {
        onWheel(e);
      }
    };

    dragCancelHandler = () => {
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
      document.removeEventListener("mousewheel", wheelHandler);
      this.removeDragGhost();
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
    if (onWheel) {
      document.addEventListener("mousewheel", wheelHandler);
    }
  },
  cancelDrag() {
    if (dragCancelHandler) {
      dragCancelHandler();
    }
  },
  addDragGhost(cursor) {
    if (dragGhost === null) {
      dragGhost = document.createElement("div");
      dragGhost.classList.add("drag-ghost");
      dragGhost.style.position = "absolute";
      dragGhost.style.zIndex = "999";
      dragGhost.style.top = "0";
      dragGhost.style.right = "0";
      dragGhost.style.bottom = "0";
      dragGhost.style.left = "0";
      dragGhost.oncontextmenu = () => false;
    }
    dragGhost.style.cursor = cursor;
    document.body.appendChild(dragGhost);
    return dragGhost;
  },
  removeDragGhost() {
    if (dragGhost !== null) {
      dragGhost.style.cursor = "auto";
      if (dragGhost.parentElement !== null) {
        dragGhost.parentElement.removeChild(dragGhost);
      }
    }
  },
  walk(el, options, callback) {
    const opts = typeof options === "function" ? {} : options;
    const cb = typeof options === "function" ? options : callback;

    if (!opts.excludeSelf) {
      if (cb(el)) {
        return;
      }
    }

    if (!el.children.length) {
      return;
    }

    let parent = el;
    let current = el.children[0];

    while (true) {
      if (!current) {
        if ((current = parent) === el) {
          return;
        }
        parent = parent.parentElement;
        current = current.nextElementSibling;
      }
      if (current) {
        if (cb(current)) {
          current = current.nextElementSibling;
          continue;
        }
        if (current.children.length) {
          parent = current;
          current = current.children[0];
        } else {
          current = current.nextElementSibling;
        }
      }
    }
  },
};

export default domUtils;
