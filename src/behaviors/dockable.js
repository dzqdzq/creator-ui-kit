import dockUtils from "../utils/dock-utils";

class DockableBehavior {
  _dockable = true;

  get noCollapse() {
    return this.getAttribute("no-collapse") !== null;
  }

  set noCollapse(noCollapseValue) {
    if (noCollapseValue) {
      this.setAttribute("no-collapse", "");
    } else {
      this.removeAttribute("no-collapse");
    }
  }

  _initDockable() {
    this._preferredWidth = "auto";
    this._preferredHeight = "auto";
    this._computedMinWidth = 0;
    this._computedMinHeight = 0;

    requestAnimationFrame(() => {
      this.style.minWidth = "auto";
      this.style.minHeight = "auto";
      this.style.maxWidth = "auto";
      this.style.maxHeight = "auto";
    });

    this.addEventListener("dragover", (dragOverEvent) => {
      dragOverEvent.preventDefault();
      dockUtils.dragoverDock(this);
    });
  }

  _notifyResize() {
    for (let childElement of this.children) {
      if (childElement._dockable) {
        childElement._notifyResize();
      }
    }
  }

  _collapse() {
    let parentNode = this.parentNode;
    if (this.noCollapse || !parentNode) {
      return false;
    }
    if (this.children.length === 0) {
      if (parentNode._dockable) {
        parentNode.removeDock(this);
      } else {
        parentNode.removeChild(this);
      }

      return true;
    }
    if (this.children.length === 1) {
      let onlyChild = this.children[0];
      onlyChild.style.flex = this.style.flex;
      onlyChild._preferredWidth = this._preferredWidth;
      onlyChild._preferredHeight = this._preferredHeight;
      parentNode.insertBefore(onlyChild, this);
      parentNode.removeChild(this);

      if (onlyChild._dockable) {
        onlyChild._collapse();
      }

      return true;
    }
    if (parentNode._dockable && parentNode.row === this.row) {
      while (this.children.length > 0) {
        parentNode.insertBefore(this.children[0], this);
      }

      parentNode.removeChild(this);
      return true;
    }
    return false;
  }

  _makeRoomForNewComer(position, newElement) {
    if (position === "left" || position === "right") {
      let remainingWidth =
        this._preferredWidth - newElement._preferredWidth - dockUtils.resizerSpace;

      if (remainingWidth > 0) {
        this._preferredWidth = remainingWidth;
      } else {
        remainingWidth = Math.floor(
          0.5 * (this._preferredWidth - dockUtils.resizerSpace)
        );
        this._preferredWidth = remainingWidth;
        newElement._preferredWidth = remainingWidth;
      }
    } else {
      let remainingHeight =
        this._preferredHeight -
        newElement._preferredHeight -
        dockUtils.resizerSpace;

      if (remainingHeight > 0) {
        this._preferredHeight = remainingHeight;
      } else {
        remainingHeight = Math.floor(
          0.5 * (this._preferredHeight - dockUtils.resizerSpace)
        );
        this._preferredHeight = remainingHeight;
        newElement._preferredHeight = remainingHeight;
      }
    }
  }

  addDock(position, newElement, skipMakeRoom) {
    if (newElement._dockable === false) {
      console.warn(
        `Dock element at position ${position} must be dockable`
      );
      return undefined;
    }
    let newDockContainer;
    let resizerElement;
    let nextSibling;
    let needNewContainer = false;
    let parentNode = this.parentNode;
    if (parentNode._dockable) {
      if (position === "left" || position === "right") {
        needNewContainer = !parentNode.row;
      } else {
        needNewContainer = parentNode.row;
      }

      if (needNewContainer) {
        newDockContainer = document.createElement("ui-dock");
        newDockContainer.row = position === "left" || position === "right";
        parentNode.insertBefore(newDockContainer, this);

        if (position === "left" || position === "top") {
          newDockContainer.appendChild(newElement);
          newDockContainer.appendChild(this);
        } else {
          newDockContainer.appendChild(this);
          newDockContainer.appendChild(newElement);
        }

        newDockContainer._initResizers();
        newDockContainer._finalizePreferredSize();
        newDockContainer.style.flex = this.style.flex;
        newDockContainer._preferredWidth = this._preferredWidth;
        newDockContainer._preferredHeight = this._preferredHeight;
        this._makeRoomForNewComer(position, newElement);
      } else {
        resizerElement = document.createElement("ui-dock-resizer");
        resizerElement.vertical = parentNode.row;

        if (position === "left" || position === "top") {
          parentNode.insertBefore(newElement, this);
          parentNode.insertBefore(resizerElement, this);
        } else {
          nextSibling = this.nextElementSibling;
          if (nextSibling === null) {
            parentNode.appendChild(resizerElement);
            parentNode.appendChild(newElement);
          } else {
            parentNode.insertBefore(resizerElement, nextSibling);
            parentNode.insertBefore(newElement, nextSibling);
          }
        }

        if (!skipMakeRoom) {
          this._makeRoomForNewComer(position, newElement);
        }
      }
    } else {
      if (position === "left" || position === "right") {
        needNewContainer = !this.row;
      } else {
        needNewContainer = this.row;
      }

      if (needNewContainer) {
        newDockContainer = document.createElement("ui-dock");
        newDockContainer.row = this.row;

        this.row = position === "left" || position === "right";

        while (this.children.length > 0) {
          let firstChild = this.children[0];
          newDockContainer.appendChild(firstChild);
        }

        if (position === "left" || position === "top") {
          this.appendChild(newElement);
          this.appendChild(newDockContainer);
        } else {
          this.appendChild(newDockContainer);
          this.appendChild(newElement);
        }

        this._initResizers();
        newDockContainer._finalizePreferredSize();
        newDockContainer.style.flex = this.style.flex;
        newDockContainer._preferredWidth = this._preferredWidth;
        newDockContainer._preferredHeight = this._preferredHeight;
        this._makeRoomForNewComer(position, newElement);
      } else {
        resizerElement = document.createElement("ui-dock-resizer");
        resizerElement.vertical = this.row;

        if (position === "left" || position === "top") {
          this.insertBefore(newElement, this.firstElementChild);
          this.insertBefore(resizerElement, this.firstElementChild);
        } else {
          nextSibling = this.nextElementSibling;
          if (nextSibling === null) {
            this.appendChild(resizerElement);
            this.appendChild(newElement);
          } else {
            this.insertBefore(resizerElement, nextSibling);
            this.insertBefore(newElement, nextSibling);
          }
        }

        if (!skipMakeRoom) {
          this._makeRoomForNewComer(position, newElement);
        }
      }
    }
  }

  removeDock(elementToRemove) {
    let found = false;
    for (let index = 0; index < this.children.length; ++index) {
      if (this.children[index] === elementToRemove) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }

    if (this.children[0] === elementToRemove) {
      let nextSibling = elementToRemove.nextElementSibling;
      if (nextSibling && dockUtils.isResizer(nextSibling)) {
        this.removeChild(nextSibling);
      }
    } else {
      let previousSibling = elementToRemove.previousElementSibling;
      if (previousSibling && dockUtils.isResizer(previousSibling)) {
        this.removeChild(previousSibling);
      }
    }

    this.removeChild(elementToRemove);
    return this._collapse();
  }
}

// 导出类的实例方法和属性，以便混入到元素原型
const behaviorPrototype = DockableBehavior.prototype;
export default {
  _dockable: true,
  get noCollapse() {
    return behaviorPrototype.noCollapse.get.call(this);
  },
  set noCollapse(value) {
    behaviorPrototype.noCollapse.set.call(this, value);
  },
  _initDockable: behaviorPrototype._initDockable,
  _notifyResize: behaviorPrototype._notifyResize,
  _collapse: behaviorPrototype._collapse,
  _makeRoomForNewComer: behaviorPrototype._makeRoomForNewComer,
  addDock: behaviorPrototype.addDock,
  removeDock: behaviorPrototype.removeDock,
};
