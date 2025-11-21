import domUtils from "../utils/dom-utils";

class ResizableBehavior {
  _resizable = true;

  get row() {
    return this.getAttribute("row") !== null;
  }

  set row(rowValue) {
    if (rowValue) {
      this.setAttribute("row", "");
    } else {
      this.removeAttribute("row");
    }
  }

  _initResizable() {
    const sizeConfigs = [
      { name: "width", prop: "_initWidth", defaultValue: "auto" },
      { name: "height", prop: "_initHeight", defaultValue: "auto" },
      { name: "min-width", prop: "_initMinWidth", defaultValue: 0 },
      { name: "min-height", prop: "_initMinHeight", defaultValue: 0 },
      { name: "max-width", prop: "_initMaxWidth", defaultValue: "auto" },
      { name: "max-height", prop: "_initMaxHeight", defaultValue: "auto" },
    ];

    sizeConfigs.forEach((config) => {
      let attributeValue = this.getAttribute(config.name);
      if (attributeValue === "auto") {
        this[config.prop] = config.defaultValue;
      } else {
        attributeValue = parseInt(attributeValue);
        if (isNaN(attributeValue)) {
          this[config.prop] = config.defaultValue;
        } else {
          this[config.prop] = attributeValue;
        }
      }
    });

    if (
      this._initMaxWidth !== "auto" &&
      this._initMaxWidth < this._initMinWidth
    ) {
      console.warn(
        `"max-width" is less than "min-width". "max-width"=${this._initMaxWidth}, "min-width"=${this._initMinWidth}`
      );

      this._initMaxWidth = this._initMinWidth;
    }

    if (
      this._initMaxHeight !== "auto" &&
      this._initMaxHeight < this._initMinHeight
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
  }

  _notifyResize() {
    domUtils.fire(this, "resize");

    for (let childElement of this.children) {
      if (childElement._resizable) {
        childElement._notifyResize();
      }
    }
  }

  calcWidth(width) {
    if (width < this._computedMinWidth) {
      return this._computedMinWidth;
    }
    if (
      this._computedMaxWidth !== "auto" &&
      width > this._computedMaxWidth
    ) {
      return this._computedMaxWidth;
    }
    return width;
  }

  calcHeight(height) {
    if (height < this._computedMinHeight) {
      return this._computedMinHeight;
    }
    if (
      this._computedMaxHeight !== "auto" &&
      height > this._computedMaxHeight
    ) {
      return this._computedMaxHeight;
    }
    return height;
  }

  _finalizePreferredSizeRecursively() {
    for (let childElement of this.children) {
      if (childElement._resizable) {
        childElement._finalizePreferredSizeRecursively();
      }
    }

    this._finalizePreferredSize();
  }

  _finalizeMinMaxRecursively() {
    for (let childElement of this.children) {
      if (childElement._resizable) {
        childElement._finalizeMinMaxRecursively();
      }
    }

    this._finalizeMinMax();
  }

  _finalizeStyleRecursively() {
    this._finalizeStyle();

    for (let childElement of this.children) {
      if (childElement._resizable) {
        childElement._finalizeStyleRecursively();
      }
    }
  }

  _reflowRecursively() {
    this._reflow();

    for (let childElement of this.children) {
      if (childElement._resizable) {
        childElement._reflowRecursively();
      }
    }
  }

  _finalizeMinMax() {
    if (!this._needEvaluateSize) {
      return;
    }
    let resizableChildren = [];

    for (let childElement of this.children) {
      if (childElement._resizable) {
        resizableChildren.push(childElement);
      }
    }

    if (this.row) {
      this._computedMinWidth =
        resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;
      this._computedMinHeight = 0;
      this._computedMaxWidth = "auto";
      this._computedMaxHeight = "auto";
      let hasAutoMaxWidth = false;
      let hasAutoMaxHeight = false;

      for (let childElement of resizableChildren) {
        this._computedMinWidth += childElement._computedMinWidth;

        if (this._computedMinHeight < childElement._computedMinHeight) {
          this._computedMinHeight = childElement._computedMinHeight;
        }

        if (hasAutoMaxWidth || childElement._computedMaxWidth === "auto") {
          hasAutoMaxWidth = true;
          this._computedMaxWidth = "auto";
        } else {
          this._computedMaxWidth += childElement._computedMaxWidth;
        }

        if (hasAutoMaxHeight || childElement._computedMaxHeight === "auto") {
          hasAutoMaxHeight = true;
          this._computedMaxHeight = "auto";
        } else if (
          this._computedMaxHeight < childElement._computedMaxHeight
        ) {
          this._computedMaxHeight = childElement._computedMaxHeight;
        }
      }
    } else {
      this._computedMinWidth = 0;
      this._computedMinHeight =
        resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;
      this._computedMaxWidth = "auto";
      this._computedMaxHeight = "auto";
      let hasAutoMaxWidth = false;
      let hasAutoMaxHeight = false;

      for (let childElement of resizableChildren) {
        if (this._computedMinWidth < childElement._computedMinWidth) {
          this._computedMinWidth = childElement._computedMinWidth;
        }

        this._computedMinHeight += childElement._computedMinHeight;

        if (hasAutoMaxWidth || childElement._computedMaxWidth === "auto") {
          hasAutoMaxWidth = true;
          this._computedMaxWidth = "auto";
        } else if (
          this._computedMaxWidth < childElement._computedMaxWidth
        ) {
          this._computedMaxWidth = childElement._computedMaxWidth;
        }

        if (hasAutoMaxHeight || childElement._computedMaxHeight === "auto") {
          hasAutoMaxHeight = true;
          this._computedMaxHeight = "auto";
        } else {
          this._computedMaxHeight += childElement._computedMaxHeight;
        }
      }
    }

    if (this._initMinWidth > this._computedMinWidth) {
      this._computedMinWidth = this._initMinWidth;
    }

    if (this._initMinHeight > this._computedMinHeight) {
      this._computedMinHeight = this._initMinHeight;
    }
  }

  _finalizePreferredSize() {
    if (!this._needEvaluateSize) {
      return;
    }
    let resizableChildren = [];

    for (let childElement of this.children) {
      if (childElement._resizable) {
        resizableChildren.push(childElement);
      }
    }

    if (this._preferredWidth === "auto") {
      let hasAutoWidth = false;
      if (this.row) {
        this._preferredWidth =
          resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;

        for (let childElement of resizableChildren) {
          if (hasAutoWidth || childElement._preferredWidth === "auto") {
            hasAutoWidth = true;
            this._preferredWidth = "auto";
          } else {
            this._preferredWidth += childElement._preferredWidth;
          }
        }
      } else {
        this._preferredWidth = 0;

        for (let childElement of resizableChildren) {
          if (hasAutoWidth || childElement._preferredWidth === "auto") {
            hasAutoWidth = true;
            this._preferredWidth = "auto";
          } else if (childElement._preferredWidth > this._preferredWidth) {
            this._preferredWidth = childElement._preferredWidth;
          }
        }
      }
    }
    if (this._preferredHeight === "auto") {
      let hasAutoHeight = false;
      if (this.row) {
        this._preferredHeight = 0;

        for (let childElement of resizableChildren) {
          if (hasAutoHeight || childElement._preferredHeight === "auto") {
            hasAutoHeight = true;
            this._preferredHeight = "auto";
          } else if (childElement._preferredHeight > this._preferredHeight) {
            this._preferredHeight = childElement._preferredHeight;
          }
        }
      } else {
        this._preferredHeight =
          resizableChildren.length > 0 ? 3 * (resizableChildren.length - 1) : 0;

        for (let childElement of resizableChildren) {
          if (hasAutoHeight || childElement._preferredHeight === "auto") {
            hasAutoHeight = true;
            this._preferredHeight = "auto";
          } else {
            this._preferredHeight += childElement._preferredHeight;
          }
        }
      }
    }
  }

  _finalizeStyle() {
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
        this.children[0].style.flex = "1 1 auto";
      } else {
        for (let index = 0; index < this.children.length; ++index) {
          let childElement = this.children[index];
          if (childElement._resizable) {
            let preferredSize = this.row
              ? childElement._preferredWidth
              : childElement._preferredHeight;
            childElement.style.flex =
              preferredSize === "auto" ? "1 1 auto" : `0 0 ${preferredSize}px`;
          }
        }
      }
    }
  }

  _reflow() {
    let childrenCount = this.children.length;
    let childSizes = new Array(childrenCount);
    let totalResizableSize = 0;
    for (let index = 0; index < childrenCount; ++index) {
      let childElement = this.children[index];
      let childSize = this.row
        ? childElement.offsetWidth
        : childElement.offsetHeight;
      childSizes[index] = childSize;

      if (childElement._resizable) {
        totalResizableSize += childSize;
      }
    }
    for (let index = 0; index < this.children.length; ++index) {
      let childElement = this.children[index];
      if (childElement._resizable) {
        let flexRatio = childSizes[index] / totalResizableSize;
        childElement.style.flex = `${flexRatio} ${flexRatio} 0px`;
      }
    }
  }
}

// 导出类的实例方法和属性，以便混入到元素原型
const behaviorPrototype = ResizableBehavior.prototype;
export default {
  _resizable: true,
  get row() {
    return behaviorPrototype.row.get.call(this);
  },
  set row(value) {
    behaviorPrototype.row.set.call(this, value);
  },
  _initResizable: behaviorPrototype._initResizable,
  _notifyResize: behaviorPrototype._notifyResize,
  calcWidth: behaviorPrototype.calcWidth,
  calcHeight: behaviorPrototype.calcHeight,
  _finalizePreferredSizeRecursively:
    behaviorPrototype._finalizePreferredSizeRecursively,
  _finalizeMinMaxRecursively: behaviorPrototype._finalizeMinMaxRecursively,
  _finalizeStyleRecursively: behaviorPrototype._finalizeStyleRecursively,
  _reflowRecursively: behaviorPrototype._reflowRecursively,
  _finalizeMinMax: behaviorPrototype._finalizeMinMax,
  _finalizePreferredSize: behaviorPrototype._finalizePreferredSize,
  _finalizeStyle: behaviorPrototype._finalizeStyle,
  _reflow: behaviorPrototype._reflow,
};
