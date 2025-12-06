/**
 * 可调整大小行为
 */

import domUtils from "../utils/dom-utils";
import type { ResizableBehavior } from '../types';

interface ResizableElement extends HTMLElement {
  _resizable?: boolean;
  _preferredWidth?: number | 'auto';
  _preferredHeight?: number | 'auto';
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | 'auto';
  _computedMaxHeight?: number | 'auto';
  _initWidth?: number | 'auto';
  _initHeight?: number | 'auto';
  _initMinWidth?: number;
  _initMinHeight?: number;
  _initMaxWidth?: number | 'auto';
  _initMaxHeight?: number | 'auto';
  _needEvaluateSize?: boolean;
  row?: boolean;
}

const resizableBehavior: ResizableBehavior & ThisType<HTMLElement & ResizableBehavior & ResizableElement> = {
  _resizable: true,

  get row(): boolean {
    return this.getAttribute("row") !== null;
  },

  set row(value: boolean) {
    if (value) {
      this.setAttribute("row", "");
    } else {
      this.removeAttribute("row");
    }
  },

  _initResizable(): void {
    const attrs = [
      { name: "width", prop: "_initWidth", defaultValue: "auto" as const },
      { name: "height", prop: "_initHeight", defaultValue: "auto" as const },
      { name: "min-width", prop: "_initMinWidth", defaultValue: 0 },
      { name: "min-height", prop: "_initMinHeight", defaultValue: 0 },
      { name: "max-width", prop: "_initMaxWidth", defaultValue: "auto" as const },
      { name: "max-height", prop: "_initMaxHeight", defaultValue: "auto" as const },
    ];

    attrs.forEach((attr) => {
      let value: string | null = this.getAttribute(attr.name);
      if (value === "auto") {
        (this as any)[attr.prop] = attr.defaultValue;
        return;
      }
      const numValue = parseInt(value || "");
      if (isNaN(numValue)) {
        (this as any)[attr.prop] = attr.defaultValue;
        return;
      }
      (this as any)[attr.prop] = numValue;
    });

    if (
      this._initMaxWidth !== "auto" &&
      (this._initMaxWidth as number) < this._initMinWidth!
    ) {
      console.warn(
        `"max-width" is less than "min-width". "max-width"=${this._initMaxWidth}, "min-width"=${this._initMinWidth}`
      );
      this._initMaxWidth = this._initMinWidth;
    }

    if (
      this._initMaxHeight !== "auto" &&
      (this._initMaxHeight as number) < this._initMinHeight!
    ) {
      console.warn(
        `"max-height" is less than "min-height". "max-height"=${this._initMaxHeight}, "min-height"=${this._initMinHeight}`
      );
      this._initMaxHeight = this._initMinHeight;
    }

    this._needEvaluateSize = false;
    this._preferredWidth = this._initWidth;
    this._preferredHeight = this._initHeight;
    this._computedMinWidth = this._initMinWidth;
    this._computedMaxWidth = this._initMaxWidth;
    this._computedMinHeight = this._initMinHeight;
    this._computedMaxHeight = this._initMaxHeight;
    this.style.minWidth = `${this._initMinWidth}px`;
    this.style.minHeight = `${this._initMinHeight}px`;
    this.style.maxWidth =
      this._initMaxWidth !== "auto" ? `${this._initMaxWidth}px` : "auto";
    this.style.maxHeight =
      this._initMaxHeight !== "auto" ? `${this._initMaxHeight}px` : "auto";
  },

  _notifyResize(): void {
    domUtils.fire(this, "resize");

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        (child as any)._notifyResize?.();
      }
    }
  },

  calcWidth(width: number): number {
    return width < this._computedMinWidth!
      ? this._computedMinWidth!
      : this._computedMaxWidth !== "auto" && width > (this._computedMaxWidth as number)
      ? (this._computedMaxWidth as number)
      : width;
  },

  calcHeight(height: number): number {
    return height < this._computedMinHeight!
      ? this._computedMinHeight!
      : this._computedMaxHeight !== "auto" && height > (this._computedMaxHeight as number)
      ? (this._computedMaxHeight as number)
      : height;
  },

  _finalizePreferredSizeRecursively(): void {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        (child as any)._finalizePreferredSizeRecursively?.();
      }
    }
    this._finalizePreferredSize();
  },

  _finalizeMinMaxRecursively(): void {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        (child as any)._finalizeMinMaxRecursively?.();
      }
    }
    this._finalizeMinMax();
  },

  _finalizeStyleRecursively(): void {
    this._finalizeStyle();
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        (child as any)._finalizeStyleRecursively?.();
      }
    }
  },

  _reflowRecursively(): void {
    this._reflow();
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        (child as any)._reflowRecursively?.();
      }
    }
  },

  _finalizeMinMax(): void {
    if (!this._needEvaluateSize) {
      return;
    }

    const resizableChildren: ResizableElement[] = [];
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        resizableChildren.push(child);
      }
    }

    if (this.row) {
      this._computedMinWidth = resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;
      this._computedMinHeight = 0;
      this._computedMaxWidth = "auto";
      this._computedMaxHeight = "auto";
      let hasAutoWidth = false;
      let hasAutoHeight = false;

      for (const child of resizableChildren) {
        this._computedMinWidth! += child._computedMinWidth!;

        if (this._computedMinHeight! < child._computedMinHeight!) {
          this._computedMinHeight = child._computedMinHeight;
        }

        if (hasAutoWidth || child._computedMaxWidth === "auto") {
          hasAutoWidth = true;
          this._computedMaxWidth = "auto";
        } else {
          this._computedMaxWidth = ((this._computedMaxWidth as number) || 0) + (child._computedMaxWidth as number);
        }

        if (hasAutoHeight || child._computedMaxHeight === "auto") {
          hasAutoHeight = true;
          this._computedMaxHeight = "auto";
        } else if ((this._computedMaxHeight as number) < (child._computedMaxHeight as number)) {
          this._computedMaxHeight = child._computedMaxHeight;
        }
      }
    } else {
      this._computedMinWidth = 0;
      this._computedMinHeight = resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;
      this._computedMaxWidth = "auto";
      this._computedMaxHeight = "auto";
      let hasAutoWidth = false;
      let hasAutoHeight = false;

      for (const child of resizableChildren) {
        if (this._computedMinWidth! < child._computedMinWidth!) {
          this._computedMinWidth = child._computedMinWidth;
        }

        this._computedMinHeight! += child._computedMinHeight!;

        if (hasAutoWidth || child._computedMaxWidth === "auto") {
          hasAutoWidth = true;
          this._computedMaxWidth = "auto";
        } else if ((this._computedMaxWidth as number) < (child._computedMaxWidth as number)) {
          this._computedMaxWidth = child._computedMaxWidth;
        }

        if (hasAutoHeight || child._computedMaxHeight === "auto") {
          hasAutoHeight = true;
          this._computedMaxHeight = "auto";
        } else {
          this._computedMaxHeight = ((this._computedMaxHeight as number) || 0) + (child._computedMaxHeight as number);
        }
      }
    }

    if (this._initMinWidth! > this._computedMinWidth!) {
      this._computedMinWidth = this._initMinWidth;
    }

    if (this._initMinHeight! > this._computedMinHeight!) {
      this._computedMinHeight = this._initMinHeight;
    }
  },

  _finalizePreferredSize(): void {
    if (!this._needEvaluateSize) {
      return;
    }

    const resizableChildren: ResizableElement[] = [];
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as ResizableElement;
      if (child._resizable) {
        resizableChildren.push(child);
      }
    }

    if (this._preferredWidth === "auto") {
      let hasAuto = false;
      if (this.row) {
        this._preferredWidth = resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;

        for (const child of resizableChildren) {
          if (hasAuto || child._preferredWidth === "auto") {
            hasAuto = true;
            this._preferredWidth = "auto";
          } else {
            (this._preferredWidth as number) += (child._preferredWidth as number);
          }
        }
      } else {
        this._preferredWidth = 0;

        for (const child of resizableChildren) {
          if (hasAuto || child._preferredWidth === "auto") {
            hasAuto = true;
            this._preferredWidth = "auto";
          } else if ((child._preferredWidth as number) > (this._preferredWidth as number)) {
            this._preferredWidth = child._preferredWidth;
          }
        }
      }
    }

    if (this._preferredHeight === "auto") {
      let hasAuto = false;
      if (this.row) {
        this._preferredHeight = 0;

        for (const child of resizableChildren) {
          if (hasAuto || child._preferredHeight === "auto") {
            hasAuto = true;
            this._preferredHeight = "auto";
          } else if ((child._preferredHeight as number) > (this._preferredHeight as number)) {
            this._preferredHeight = child._preferredHeight;
          }
        }
      } else {
        this._preferredHeight = resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;

        for (const child of resizableChildren) {
          if (hasAuto || child._preferredHeight === "auto") {
            hasAuto = true;
            this._preferredHeight = "auto";
          } else {
            (this._preferredHeight as number) += (child._preferredHeight as number);
          }
        }
      }
    }
  },

  _finalizeStyle(): void {
    this.style.minWidth = `${this._computedMinWidth}px`;
    this.style.minHeight = `${this._computedMinHeight}px`;

    if (this._computedMaxWidth !== "auto") {
      this.style.maxWidth = `${this._computedMaxWidth}px`;
    } else {
      this.style.maxWidth = "auto";
    }

    if (this._computedMaxHeight !== "auto") {
      this.style.maxHeight = `${this._computedMaxHeight}px`;
    } else {
      this.style.maxHeight = "auto";
    }

    if (this._needEvaluateSize) {
      if (this.children.length === 1) {
        (this.children[0] as HTMLElement).style.flex = "1 1 auto";
      } else {
        for (let i = 0; i < this.children.length; i++) {
          const child = this.children[i] as HTMLElement & ResizableElement;
          if (child._resizable) {
            const size = this.row ? child._preferredWidth : child._preferredHeight;
            child.style.flex = size === "auto" ? "1 1 auto" : `0 0 ${size}px`;
          }
        }
      }
    }
  },

  _reflow(): void {
    const childCount = this.children.length;
    const sizes = new Array<number>(childCount);
    let totalSize = 0;

    for (let i = 0; i < childCount; i++) {
      const child = this.children[i] as HTMLElement & ResizableElement;
      const size = this.row ? child.offsetWidth : child.offsetHeight;
      sizes[i] = size;

      if (child._resizable) {
        totalSize += size;
      }
    }

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as HTMLElement & ResizableElement;
      if (child._resizable) {
        const ratio = sizes[i] / totalSize;
        child.style.flex = `${ratio} ${ratio} 0px`;
      }
    }
  },
};

export default resizableBehavior;

