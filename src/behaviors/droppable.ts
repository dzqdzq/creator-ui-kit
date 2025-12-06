/**
 * 可放置行为
 */

import domUtils from '../utils/dom-utils';
import type { DroppableBehavior } from '../types';

// 简化的 dragDrop（原来是外部模块，这里提供基本实现）
const dragDrop = {
  type(_dataTransfer: DataTransfer | null): string {
    return 'file';
  },
  items(_dataTransfer: DataTransfer | null): any[] {
    return [];
  },
  options(): Record<string, any> {
    return {};
  },
  getLength(): number {
    return 0;
  },
};

const droppableBehavior: DroppableBehavior & ThisType<HTMLElement & DroppableBehavior> = {
  get droppable(): string | null {
    return this.getAttribute('droppable');
  },

  set droppable(value: string | null) {
    if (value) {
      this.setAttribute('droppable', value);
    } else {
      this.removeAttribute('droppable');
    }
  },

  get multi(): boolean {
    return this.getAttribute('multi') !== null;
  },

  set multi(value: boolean) {
    if (value) {
      this.setAttribute('multi', '');
    } else {
      this.removeAttribute('multi');
    }
  },

  get canDrop(): boolean {
    return this._canDrop!;
  },

  _initDroppable(element: HTMLElement): void {
    const root = element.shadowRoot || element;
    this._dragenterCnt = 0;
    this._canDrop = false;

    root.addEventListener('dragenter', (e: Event) => {
      const event = e as DragEvent;
      this._dragenterCnt!++;

      if (this._dragenterCnt === 1) {
        this._canDrop = false;
        let allowedTypes: string[] = [];

        if (this.droppable !== null) {
          allowedTypes = this.droppable.split(',');
        }

        const dragType = dragDrop.type(event.dataTransfer);
        let typeAllowed = false;

        for (let i = 0; i < allowedTypes.length; i++) {
          if (dragType === allowedTypes[i]) {
            typeAllowed = true;
            break;
          }
        }

        if (!typeAllowed) {
          this._canDrop = false;
          return;
        }

        let itemCount = dragDrop.getLength();
        if (dragType === 'file' && itemCount === 0) {
          itemCount = event.dataTransfer?.items.length || 0;
        }

        if (!this.multi && itemCount > 1) {
          this._canDrop = false;
          return;
        }

        event.stopPropagation();
        this._canDrop = true;
        this.setAttribute('drag-hovering', '');

        domUtils.fire(this, 'drop-area-enter', {
          bubbles: true,
          detail: {
            target: event.target,
            dataTransfer: event.dataTransfer,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            dragType: dragType,
            dragItems: dragDrop.items(event.dataTransfer),
            dragOptions: dragDrop.options(),
          },
        });
      }
    });

    root.addEventListener('dragleave', (e: Event) => {
      const event = e as DragEvent;
      this._dragenterCnt!--;

      if (this._dragenterCnt === 0) {
        if (!this._canDrop) {
          return;
        }
        event.stopPropagation();
        this.removeAttribute('drag-hovering');

        domUtils.fire(this, 'drop-area-leave', {
          bubbles: true,
          detail: {
            target: event.target,
            dataTransfer: event.dataTransfer,
          },
        });
      }
    });

    root.addEventListener('drop', (e: Event) => {
      const event = e as DragEvent;
      this._dragenterCnt = 0;

      if (this._canDrop) {
        event.preventDefault();
        event.stopPropagation();
        this.removeAttribute('drag-hovering');

        domUtils.fire(this, 'drop-area-accept', {
          bubbles: true,
          detail: {
            target: event.target,
            dataTransfer: event.dataTransfer,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            dragType: dragDrop.type(event.dataTransfer),
            dragItems: dragDrop.items(event.dataTransfer),
            dragOptions: dragDrop.options(),
          },
        });
      }
    });

    root.addEventListener('dragover', (e: Event) => {
      const event = e as DragEvent;
      if (this._canDrop) {
        event.preventDefault();
        event.stopPropagation();

        domUtils.fire(this, 'drop-area-move', {
          bubbles: true,
          detail: {
            target: event.target,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            dataTransfer: event.dataTransfer,
            dragType: dragDrop.type(event.dataTransfer),
            dragItems: dragDrop.items(event.dataTransfer),
            dragOptions: dragDrop.options(),
          },
        });
      }
    });
  },
};

export default droppableBehavior;
