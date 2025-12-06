import jsUtils from '../utils/js-utils';
import dockUtils from '../utils/dock-utils';
import domUtils from '../utils/dom-utils';
import dockableBehavior from '../behaviors/dockable';

/**
 * 可停靠元素接口
 */
interface DockableElement extends HTMLElement {
  _dockable?: boolean;
  _preferredWidth?: number | 'auto';
  _preferredHeight?: number | 'auto';
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | 'auto';
  _computedMaxHeight?: number | 'auto';
  _collapseRecursively?: () => void;
  _reflowRecursively?: () => void;
  _updatePreferredSizeRecursively?: () => void;
  _finalizePreferredSizeRecursively?: () => void;
  _finalizeMinMaxRecursively?: () => void;
  _finalizeStyleRecursively?: () => void;
}

/**
 * Dock 组件
 */
class Dock extends HTMLElement {
  static get tagName(): string {
    return 'ui-dock';
  }

  // Dockable behavior properties
  _dockable?: boolean;
  _preferredWidth?: number | 'auto';
  _preferredHeight?: number | 'auto';
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | 'auto';
  _computedMaxHeight?: number | 'auto';
  _initDockable?: () => void;
  _collapse?: () => void;
  _reflow?: () => void;
  _finalizePreferredSize?: () => void;
  _finalizeMinMax?: () => void;
  _finalizeStyle?: () => void;

  get row(): boolean {
    return this.getAttribute('row') !== null;
  }

  set row(value: boolean) {
    if (value) {
      this.setAttribute('row', '');
    } else {
      this.removeAttribute('row');
    }
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <div class="content">
        <slot select="ui-dock,ui-dock-panel,ui-dock-resizer"></slot>
      </div>
    `;

    shadowRoot.insertBefore(
      domUtils.createStyleElement('theme://elements/dock.css'),
      shadowRoot.firstChild,
    );

    this._initDockable?.();
    this._initResizers();
  }

  private _initResizers(): void {
    if (this.children.length > 1) {
      for (let i = 0; i < this.children.length; ++i) {
        if (i !== this.children.length - 1) {
          const nextChild = this.children[i + 1];
          const resizer = document.createElement('ui-dock-resizer') as HTMLElement & {
            vertical: boolean;
          };
          resizer.vertical = this.row;
          this.insertBefore(resizer, nextChild);
          i += 1;
        }
      }
    }
  }

  _collapseRecursively(): void {
    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChild._collapseRecursively?.();
      }
    }

    this._collapse?.();
  }

  _reflowRecursively(): void {
    this._reflow?.();

    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChild._reflowRecursively?.();
      }
    }
  }

  _updatePreferredSizeRecursively(): void {
    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChild._updatePreferredSizeRecursively?.();
      }
    }

    this._preferredWidth = this.clientWidth;
    this._preferredHeight = this.clientHeight;
  }

  _finalizePreferredSizeRecursively(): void {
    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChild._finalizePreferredSizeRecursively?.();
      }
    }

    this._finalizePreferredSizeInternal();
  }

  _finalizeMinMaxRecursively(): void {
    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChild._finalizeMinMaxRecursively?.();
      }
    }

    this._finalizeMinMaxInternal();
  }

  _finalizeStyleRecursively(): void {
    this._finalizeStyleInternal();

    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChild._finalizeStyleRecursively?.();
      }
    }
  }

  private _finalizePreferredSizeInternal(): void {
    const resizerSpace = dockUtils.resizerSpace;
    const dockableChildren: DockableElement[] = [];

    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChildren.push(dockableChild);
      }
    }

    if (this._preferredWidth === 'auto') {
      let hasAuto = false;
      if (this.row) {
        this._preferredWidth =
          dockableChildren.length > 0 ? resizerSpace * (dockableChildren.length - 1) : 0;

        for (const child of dockableChildren) {
          if (hasAuto || child._preferredWidth === 'auto') {
            hasAuto = true;
            this._preferredWidth = 'auto';
          } else {
            (this._preferredWidth as number) += child._preferredWidth as number;
          }
        }
      } else {
        this._preferredWidth = 0;

        for (const child of dockableChildren) {
          if (hasAuto || child._preferredWidth === 'auto') {
            hasAuto = true;
            this._preferredWidth = 'auto';
          } else if ((child._preferredWidth as number) > (this._preferredWidth as number)) {
            this._preferredWidth = child._preferredWidth;
          }
        }
      }
    }

    if (this._preferredHeight === 'auto') {
      let hasAuto = false;
      if (this.row) {
        this._preferredHeight = 0;

        for (const child of dockableChildren) {
          if (hasAuto || child._preferredHeight === 'auto') {
            hasAuto = true;
            this._preferredHeight = 'auto';
          } else if ((child._preferredHeight as number) > (this._preferredHeight as number)) {
            this._preferredHeight = child._preferredHeight;
          }
        }
      } else {
        this._preferredHeight =
          dockableChildren.length > 0 ? resizerSpace * (dockableChildren.length - 1) : 0;

        for (const child of dockableChildren) {
          if (hasAuto || child._preferredHeight === 'auto') {
            hasAuto = true;
            this._preferredHeight = 'auto';
          } else {
            (this._preferredHeight as number) += child._preferredHeight as number;
          }
        }
      }
    }
  }

  private _finalizeMinMaxInternal(): void {
    const resizerSpace = dockUtils.resizerSpace;
    const dockableChildren: DockableElement[] = [];

    for (const child of Array.from(this.children)) {
      const dockableChild = child as DockableElement;
      if (dockableChild._dockable) {
        dockableChildren.push(dockableChild);
      }
    }

    if (this.row) {
      this._computedMinWidth =
        dockableChildren.length > 0 ? resizerSpace * (dockableChildren.length - 1) : 0;
      this._computedMinHeight = 0;

      for (const child of dockableChildren) {
        this._computedMinWidth! += child._computedMinWidth || 0;

        if (this._computedMinHeight! < (child._computedMinHeight || 0)) {
          this._computedMinHeight = child._computedMinHeight;
        }
      }
    } else {
      this._computedMinWidth = 0;
      this._computedMinHeight =
        dockableChildren.length > 0 ? resizerSpace * (dockableChildren.length - 1) : 0;

      for (const child of dockableChildren) {
        if (this._computedMinWidth! < (child._computedMinWidth || 0)) {
          this._computedMinWidth = child._computedMinWidth;
        }

        this._computedMinHeight! += child._computedMinHeight || 0;
      }
    }
  }

  private _finalizeStyleInternal(): void {
    this.style.minWidth = `${this._computedMinWidth}px`;
    this.style.minHeight = `${this._computedMinHeight}px`;

    if (this.children.length === 1) {
      (this.children[0] as HTMLElement).style.flex = '1 1 auto';
    } else {
      for (let i = 0; i < this.children.length; ++i) {
        const child = this.children[i] as DockableElement;
        if (child._dockable) {
          const size = this.row ? child._preferredWidth : child._preferredHeight;
          child.style.flex = size === 'auto' ? '1 1 auto' : `0 0 ${size}px`;
        }
      }
    }
  }

  // Note: _reflow is implemented to handle recalculating flex sizes
  private _reflowInternal(): void {
    const childCount = this.children.length;
    const sizes: number[] = new Array(childCount);
    let totalDockableSize = 0;

    for (let i = 0; i < childCount; ++i) {
      const child = this.children[i] as DockableElement;
      const size = this.row ? child.offsetWidth : child.offsetHeight;
      sizes[i] = size;

      if (child._dockable) {
        totalDockableSize += size;
      }
    }

    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i] as DockableElement;
      if (child._dockable) {
        const ratio = sizes[i] / totalDockableSize;
        child.style.flex = `${ratio} ${ratio} 0px`;
      }
    }
  }
}

jsUtils.addon(Dock.prototype, dockableBehavior);

export default Dock;
