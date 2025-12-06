import domUtils from "../utils/dom-utils";
import dockUtils from "../utils/dock-utils";
import focusMgr from "../utils/focus-mgr";

/**
 * 可停靠元素接口
 */
interface DockableElement extends HTMLElement {
  _dockable?: boolean;
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | "auto";
  _computedMaxHeight?: number | "auto";
  _notifyResize?: () => void;
  _reflowRecursively?: () => void;
  _updatePreferredSizeRecursively?: () => void;
}

/**
 * 快照数据接口
 */
interface SnapshotData {
  sizeList: number[];
  resizerIndex: number;
  prevTotalSize: number;
  prevMinSize: number;
  prevMaxSize: number;
  nextTotalSize: number;
  nextMinSize: number;
  nextMaxSize: number;
}

/**
 * 限制宽度
 */
function clampWidth(element: DockableElement, width: number): number {
  if (width < (element._computedMinWidth || 0)) {
    return element._computedMinWidth || 0;
  }
  if (
    element._computedMaxWidth !== undefined &&
    element._computedMaxWidth !== "auto" &&
    width > element._computedMaxWidth
  ) {
    return element._computedMaxWidth;
  }
  return width;
}

/**
 * 限制高度
 */
function clampHeight(element: DockableElement, height: number): number {
  if (height < (element._computedMinHeight || 0)) {
    return element._computedMinHeight || 0;
  }
  if (
    element._computedMaxHeight !== undefined &&
    element._computedMaxHeight !== "auto" &&
    height > element._computedMaxHeight
  ) {
    return element._computedMaxHeight;
  }
  return height;
}

/**
 * Resizer 组件 - 用于调整 Dock 面板大小
 */
class Resizer extends HTMLElement {
  static get tagName(): string {
    return "ui-dock-resizer";
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <div class="bar"></div>
    `;

    shadowRoot.insertBefore(
      domUtils.createStyleElement("theme://elements/resizer.css"),
      shadowRoot.firstChild
    );

    this.addEventListener("mousedown", this._onMouseDown.bind(this));
  }

  connectedCallback(): void {
    // 连接回调
  }

  get vertical(): boolean {
    return this.getAttribute("vertical") !== null;
  }

  set vertical(value: boolean) {
    if (value) {
      this.setAttribute("vertical", "");
    } else {
      this.removeAttribute("vertical");
    }
  }

  get active(): boolean {
    return this.getAttribute("active") !== null;
  }

  set active(value: boolean) {
    if (value) {
      this.setAttribute("active", "");
    } else {
      this.removeAttribute("active");
    }
  }

  private _snapshot(): SnapshotData {
    const parent = this.parentNode as HTMLElement;
    const sizeList: number[] = [];
    let resizerIndex = -1;

    for (let i = 0; i < parent.children.length; ++i) {
      const child = parent.children[i] as DockableElement;

      if (child === this) {
        resizerIndex = i;
      }

      sizeList.push(this.vertical ? child.offsetWidth : child.offsetHeight);
    }

    let prevTotalSize = 0;
    let prevMinSize = 0;
    let prevMaxSize = 0;
    let nextTotalSize = 0;
    let nextMinSize = 0;
    let nextMaxSize = 0;

    for (let i = 0; i < resizerIndex; i += 2) {
      prevTotalSize += sizeList[i];
      const child = parent.children[i] as DockableElement;

      prevMinSize += this.vertical
        ? child._computedMinWidth || 0
        : child._computedMinHeight || 0;

      const maxSize = this.vertical
        ? child._computedMaxWidth
        : child._computedMaxHeight;
      prevMaxSize +=
        maxSize === "auto" || maxSize === undefined ? Infinity : maxSize;
    }

    for (let i = resizerIndex + 1; i < parent.children.length; i += 2) {
      nextTotalSize += sizeList[i];
      const child = parent.children[i] as DockableElement;

      nextMinSize += this.vertical
        ? child._computedMinWidth || 0
        : child._computedMinHeight || 0;

      const maxSize = this.vertical
        ? child._computedMaxWidth
        : child._computedMaxHeight;
      nextMaxSize +=
        maxSize === "auto" || maxSize === undefined ? Infinity : maxSize;
    }

    return {
      sizeList,
      resizerIndex,
      prevTotalSize,
      prevMinSize,
      prevMaxSize,
      nextTotalSize,
      nextMinSize,
      nextMaxSize,
    };
  }

  private _onMouseDown(event: MouseEvent): void {
    event.stopPropagation();

    const parent = this.parentNode as HTMLElement;
    this.active = true;

    let snapshot = this._snapshot();
    let direction = 0;

    const rect = this.getBoundingClientRect();
    let anchorX = Math.round(rect.left + rect.width / 2);
    let anchorY = Math.round(rect.top + rect.height / 2);

    // 设置初始 flex
    for (let i = 0; i < parent.children.length; ++i) {
      const child = parent.children[i] as HTMLElement;

      if (!dockUtils.isResizer(child)) {
        child.style.flex = `0 0 ${snapshot.sizeList[i]}px`;
      }
    }

    const onMouseMove = (moveEvent: MouseEvent): void => {
      moveEvent.stopPropagation();

      const delta = this.vertical
        ? moveEvent.clientX - anchorX
        : moveEvent.clientY - anchorY;

      if (delta !== 0) {
        const currentRect = this.getBoundingClientRect();
        const currentX = Math.round(currentRect.left + currentRect.width / 2);
        const currentY = Math.round(currentRect.top + currentRect.height / 2);

        const relativeDelta = this.vertical
          ? moveEvent.clientX - currentX
          : moveEvent.clientY - currentY;

        const newDirection = Math.sign(relativeDelta);

        // 方向改变时重新快照
        if (direction !== 0 && direction !== newDirection) {
          snapshot = this._snapshot();
          anchorX = currentX;
          anchorY = currentY;
        }

        direction = newDirection;

        this._resize(
          parent.children as HTMLCollectionOf<DockableElement>,
          this.vertical,
          relativeDelta,
          snapshot.sizeList,
          snapshot.resizerIndex,
          snapshot.prevTotalSize,
          snapshot.prevMinSize,
          snapshot.prevMaxSize,
          snapshot.nextTotalSize,
          snapshot.nextMinSize,
          snapshot.nextMaxSize
        );
      }
    };

    const onMouseUp = (upEvent: MouseEvent): void => {
      upEvent.stopPropagation();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      domUtils.removeDragGhost();
      this.active = false;

      const parentEl = this.parentNode as DockableElement;

      if (parentEl._reflowRecursively) {
        parentEl._reflowRecursively();
      }

      if (parentEl._updatePreferredSizeRecursively) {
        parentEl._updatePreferredSizeRecursively();
      }

      for (const child of Array.from(parentEl.children)) {
        const dockableChild = child as DockableElement;
        if (!dockUtils.isResizer(dockableChild)) {
          if (dockableChild._notifyResize) {
            dockableChild._notifyResize();
          }
        }
      }

      dockUtils.saveLayout();
      focusMgr._refocus();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  private _resize(
    children: HTMLCollectionOf<DockableElement>,
    isVertical: boolean,
    delta: number,
    sizeList: number[],
    resizerIndex: number,
    prevTotalSize: number,
    _prevMinSize: number,
    _prevMaxSize: number,
    nextTotalSize: number,
    nextMinSize: number,
    _nextMaxSize: number
  ): void {
    const sign = Math.sign(delta);
    let prevIndex: number;
    let nextIndex: number;

    if (sign > 0) {
      prevIndex = resizerIndex - 1;
      nextIndex = resizerIndex + 1;
    } else {
      prevIndex = resizerIndex + 1;
      nextIndex = resizerIndex - 1;
    }

    let adjustedDelta = delta;
    const prevElement = children[prevIndex];
    const prevSize = sizeList[prevIndex];

    let newPrevSize = prevSize + adjustedDelta * sign;
    let clampedPrevSize = isVertical
      ? clampWidth(prevElement, newPrevSize)
      : clampHeight(prevElement, newPrevSize);

    adjustedDelta = (clampedPrevSize - prevSize) * sign;

    // 处理下一个元素及后续元素
    let currentNextIndex = nextIndex;
    let nextElement = children[currentNextIndex];
    let nextSize = sizeList[currentNextIndex];

    while (true) {
      const newNextSize = nextSize - adjustedDelta * sign;
      const clampedNextSize = isVertical
        ? clampWidth(nextElement, newNextSize)
        : clampHeight(nextElement, newNextSize);

      const nextDiff = (clampedNextSize - nextSize) * sign;
      nextElement.style.flex = `0 0 ${clampedNextSize}px`;

      if (clampedNextSize - newNextSize !== 0) {
        adjustedDelta += nextDiff;

        if (sign > 0) {
          currentNextIndex += 2;
          if (currentNextIndex >= children.length) {
            break;
          }
        } else {
          currentNextIndex -= 2;
          if (currentNextIndex < 0) {
            break;
          }
        }

        nextElement = children[currentNextIndex];
        nextSize = sizeList[currentNextIndex];
      } else {
        break;
      }
    }

    // 边界检查
    if (sign > 0) {
      if (nextTotalSize - delta * sign <= nextMinSize) {
        adjustedDelta = (nextTotalSize - nextMinSize) * sign;
        clampedPrevSize = prevSize + adjustedDelta * sign;
      }
    } else {
      if (prevTotalSize - delta * sign <= nextMinSize) {
        adjustedDelta = (prevTotalSize - nextMinSize) * sign;
        clampedPrevSize = prevSize + adjustedDelta * sign;
      }
    }

    prevElement.style.flex = `0 0 ${clampedPrevSize}px`;

    // 通知所有子元素大小已改变
    for (const child of Array.from(children)) {
      if (!dockUtils.isResizer(child)) {
        if (child._notifyResize) {
          child._notifyResize();
        }
      }
    }
  }
}

export default Resizer;

