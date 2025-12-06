/**
 * 可停靠行为
 */

import type { DockableBehavior } from '../types';

// 简化的 dockUtils（原来是外部模块，这里提供基本实现）
const dockUtils = {
  resizerSpace: 3,
  dragoverDock(_el: HTMLElement): void {},
  isResizer(el: Element): boolean {
    return el.tagName === 'UI-DOCK-RESIZER';
  },
};

interface DockableElement extends HTMLElement {
  _dockable?: boolean;
  _preferredWidth?: number | 'auto';
  _preferredHeight?: number | 'auto';
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  row?: boolean;
  noCollapse?: boolean;
  removeDock?(el: HTMLElement): boolean;
  _initResizers?(): void;
  _finalizePreferredSize?(): void;
  _notifyResize?(): void;
  _collapse?(): boolean;
}

const dockableBehavior: DockableBehavior & ThisType<HTMLElement & DockableBehavior & DockableElement> = {
  _dockable: true,

  get noCollapse(): boolean {
    return this.getAttribute("no-collapse") !== null;
  },

  set noCollapse(value: boolean) {
    if (value) {
      this.setAttribute("no-collapse", "");
    } else {
      this.removeAttribute("no-collapse");
    }
  },

  _initDockable(): void {
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

    this.addEventListener("dragover", (e: Event) => {
      e.preventDefault();
      dockUtils.dragoverDock(this);
    });
  },

  _notifyResize(): void {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as DockableElement;
      if (child._dockable) {
        child._notifyResize?.();
      }
    }
  },

  _collapse(): boolean {
    const parent = this.parentNode as DockableElement | null;
    if (this.noCollapse || !parent) {
      return false;
    }

    if (this.children.length === 0) {
      if (parent._dockable) {
        parent.removeDock?.(this);
      } else {
        parent.removeChild(this);
      }
      return true;
    }

    if (this.children.length === 1) {
      const child = this.children[0] as HTMLElement & DockableElement;
      child.style.flex = this.style.flex;
      child._preferredWidth = this._preferredWidth;
      child._preferredHeight = this._preferredHeight;
      parent.insertBefore(child, this);
      parent.removeChild(this);

      if (child._dockable) {
        child._collapse?.();
      }

      return true;
    }

    if (parent._dockable && (parent as any).row === (this as any).row) {
      while (this.children.length > 0) {
        parent.insertBefore(this.children[0], this);
      }
      parent.removeChild(this);
      return true;
    }

    return false;
  },

  _makeRoomForNewComer(position: string, element: HTMLElement): void {
    const el = element as DockableElement;
    if (position === "left" || position === "right") {
      let space = (this._preferredWidth as number) - (el._preferredWidth as number) - dockUtils.resizerSpace;

      if (space > 0) {
        this._preferredWidth = space;
      } else {
        space = Math.floor(0.5 * ((this._preferredWidth as number) - dockUtils.resizerSpace));
        this._preferredWidth = space;
        el._preferredWidth = space;
      }
    } else {
      let space = (this._preferredHeight as number) - (el._preferredHeight as number) - dockUtils.resizerSpace;

      if (space > 0) {
        this._preferredHeight = space;
      } else {
        space = Math.floor(0.5 * ((this._preferredHeight as number) - dockUtils.resizerSpace));
        this._preferredHeight = space;
        el._preferredHeight = space;
      }
    }
  },

  addDock(position: string, element: HTMLElement, noResize?: boolean): void {
    const el = element as DockableElement;
    if (el._dockable === false) {
      console.warn(`Dock element at position ${position} must be dockable`);
      return;
    }

    let newDock: HTMLElement & DockableElement;
    let resizer: HTMLElement & { vertical?: boolean };
    let nextSibling: Element | null;
    let needWrap = false;
    const parent = this.parentNode as DockableElement;

    if (parent._dockable) {
      if (position === "left" || position === "right") {
        needWrap = !parent.row;
      } else {
        needWrap = !!parent.row;
      }

      if (needWrap) {
        newDock = document.createElement("ui-dock") as HTMLElement & DockableElement;
        newDock.row = position === "left" || position === "right";
        parent.insertBefore(newDock, this);

        if (position === "left" || position === "top") {
          newDock.appendChild(element);
          newDock.appendChild(this);
        } else {
          newDock.appendChild(this);
          newDock.appendChild(element);
        }

        newDock._initResizers?.();
        newDock._finalizePreferredSize?.();
        newDock.style.flex = this.style.flex;
        newDock._preferredWidth = this._preferredWidth;
        newDock._preferredHeight = this._preferredHeight;
        this._makeRoomForNewComer(position, element);
      } else {
        resizer = document.createElement("ui-dock-resizer") as HTMLElement & { vertical?: boolean };
        resizer.vertical = parent.row;

        if (position === "left" || position === "top") {
          parent.insertBefore(element, this);
          parent.insertBefore(resizer, this);
        } else {
          nextSibling = this.nextElementSibling;
          if (nextSibling === null) {
            parent.appendChild(resizer);
            parent.appendChild(element);
          } else {
            parent.insertBefore(resizer, nextSibling);
            parent.insertBefore(element, nextSibling);
          }
        }

        if (!noResize) {
          this._makeRoomForNewComer(position, element);
        }
      }
    } else {
      if (position === "left" || position === "right") {
        needWrap = !(this as any).row;
      } else {
        needWrap = !!(this as any).row;
      }

      if (needWrap) {
        newDock = document.createElement("ui-dock") as HTMLElement & DockableElement;
        newDock.row = (this as any).row;

        (this as any).row = position === "left" || position === "right";
        while (this.children.length > 0) {
          newDock.appendChild(this.children[0]);
        }

        if (position === "left" || position === "top") {
          this.appendChild(element);
          this.appendChild(newDock);
        } else {
          this.appendChild(newDock);
          this.appendChild(element);
        }

        (this as any)._initResizers?.();
        newDock._finalizePreferredSize?.();
        newDock.style.flex = this.style.flex;
        newDock._preferredWidth = this._preferredWidth;
        newDock._preferredHeight = this._preferredHeight;
        this._makeRoomForNewComer(position, element);
      } else {
        resizer = document.createElement("ui-dock-resizer") as HTMLElement & { vertical?: boolean };
        resizer.vertical = (this as any).row;

        if (position === "left" || position === "top") {
          this.insertBefore(element, this.firstElementChild);
          this.insertBefore(resizer, this.firstElementChild);
        } else {
          nextSibling = this.nextElementSibling;
          if (nextSibling === null) {
            this.appendChild(resizer);
            this.appendChild(element);
          } else {
            this.insertBefore(resizer, nextSibling);
            this.insertBefore(element, nextSibling);
          }
        }

        if (!noResize) {
          this._makeRoomForNewComer(position, element);
        }
      }
    }
  },

  removeDock(element: HTMLElement): boolean {
    let found = false;
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] === element) {
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }

    if (this.children[0] === element) {
      if (element.nextElementSibling && dockUtils.isResizer(element.nextElementSibling)) {
        this.removeChild(element.nextElementSibling);
      }
    } else {
      if (element.previousElementSibling && dockUtils.isResizer(element.previousElementSibling)) {
        this.removeChild(element.previousElementSibling);
      }
    }

    this.removeChild(element);
    return this._collapse();
  },
};

export default dockableBehavior;

