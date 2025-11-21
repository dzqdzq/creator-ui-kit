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

export function clear(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function fire(el, eventName, options) {
  options = options || {};
  el.dispatchEvent(new CustomEvent(eventName, options));
}

export function acceptEvent(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
}

export function installDownUpEvent(target) {
  function cleanup(moveHandler, upHandler) {
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", upHandler);
  }

  target.addEventListener("mousedown", (e) => {
    acceptEvent(e);
    if (!isLeftMouseButton(e)) {
      return;
    }

    const moveHandler = (e) => {
      if (!isLeftMouseButton(e)) {
        fire(target, "up", { sourceEvent: e, bubbles: true });
        cleanup(moveHandler, upHandler);
      }
    };

    const upHandler = (e) => {
      if (isLeftMouseButton(e)) {
        fire(target, "up", { sourceEvent: e, bubbles: true });
        cleanup(moveHandler, upHandler);
      }
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler, true);
    fire(target, "down", { sourceEvent: e, bubbles: true });
  });
}

export function walk(el, options, callback) {
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
}
