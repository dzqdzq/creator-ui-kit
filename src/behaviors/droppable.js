import domUtils from "../utils/dom-utils";
import dragDropUtils from "../utils/drag-drop";

class DroppableBehavior {
  get droppable() {
    return this.getAttribute("droppable");
  }

  set droppable(droppableValue) {
    this.setAttribute("droppable", droppableValue);
  }

  get multi() {
    return this.getAttribute("multi") !== null;
  }

  set multi(multiValue) {
    if (multiValue) {
      this.setAttribute("multi", "");
    } else {
      this.removeAttribute("multi");
    }
  }

  get canDrop() {
    return this._canDrop;
  }

  _initDroppable(containerElement) {
    let eventTarget = containerElement.shadowRoot || containerElement;
    this._dragenterCnt = 0;
    this._canDrop = false;

    eventTarget.addEventListener("dragenter", (dragEnterEvent) => {
      ++this._dragenterCnt;

      if (this._dragenterCnt === 1) {
        this._canDrop = false;
        let allowedTypes = [];

        if (this.droppable !== null) {
          allowedTypes = this.droppable.split(",");
        }

        let dragType = dragDropUtils.type(dragEnterEvent.dataTransfer);
        let typeMatched = false;
        for (let index = 0; index < allowedTypes.length; ++index) {
          if (dragType === allowedTypes[index]) {
            typeMatched = true;
            break;
          }
        }
        if (!typeMatched) {
          this._canDrop = false;
          return undefined;
        }
        let itemCount = dragDropUtils.getLength();

        if (dragType === "file" && itemCount === 0) {
          itemCount = dragEnterEvent.dataTransfer.items.length;
        }

        if (!this.multi && itemCount > 1) {
          this._canDrop = false;
          return undefined;
        }

        dragEnterEvent.stopPropagation();
        this._canDrop = true;
        this.setAttribute("drag-hovering", "");

        domUtils.fire(this, "drop-area-enter", {
          bubbles: true,
          detail: {
            target: dragEnterEvent.target,
            dataTransfer: dragEnterEvent.dataTransfer,
            clientX: dragEnterEvent.clientX,
            clientY: dragEnterEvent.clientY,
            offsetX: dragEnterEvent.offsetX,
            offsetY: dragEnterEvent.offsetY,
            dragType: dragType,
            dragItems: dragDropUtils.items(dragEnterEvent.dataTransfer),
            dragOptions: dragDropUtils.options(),
          },
        });
      }
    });

    eventTarget.addEventListener("dragleave", (dragLeaveEvent) => {
      --this._dragenterCnt;

      if (this._dragenterCnt === 0) {
        if (!this._canDrop) {
          return;
        }
        dragLeaveEvent.stopPropagation();
        this.removeAttribute("drag-hovering");

        domUtils.fire(this, "drop-area-leave", {
          bubbles: true,
          detail: {
            target: dragLeaveEvent.target,
            dataTransfer: dragLeaveEvent.dataTransfer,
          },
        });
      }
    });

    eventTarget.addEventListener("drop", (dropEvent) => {
      this._dragenterCnt = 0;

      if (this._canDrop) {
        dropEvent.preventDefault();
        dropEvent.stopPropagation();
        this.removeAttribute("drag-hovering");

        domUtils.fire(this, "drop-area-accept", {
          bubbles: true,
          detail: {
            target: dropEvent.target,
            dataTransfer: dropEvent.dataTransfer,
            clientX: dropEvent.clientX,
            clientY: dropEvent.clientY,
            offsetX: dropEvent.offsetX,
            offsetY: dropEvent.offsetY,
            dragType: dragDropUtils.type(dropEvent.dataTransfer),
            dragItems: dragDropUtils.items(dropEvent.dataTransfer),
            dragOptions: dragDropUtils.options(),
          },
        });
      }
    });

    eventTarget.addEventListener("dragover", (dragOverEvent) => {
      if (this._canDrop) {
        dragOverEvent.preventDefault();
        dragOverEvent.stopPropagation();

        domUtils.fire(this, "drop-area-move", {
          bubbles: true,
          detail: {
            target: dragOverEvent.target,
            clientX: dragOverEvent.clientX,
            clientY: dragOverEvent.clientY,
            offsetX: dragOverEvent.offsetX,
            offsetY: dragOverEvent.offsetY,
            dataTransfer: dragOverEvent.dataTransfer,
            dragType: dragDropUtils.type(dragOverEvent.dataTransfer),
            dragItems: dragDropUtils.items(dragOverEvent.dataTransfer),
            dragOptions: dragDropUtils.options(),
          },
        });
      }
    });
  }
}

// 导出类的实例方法和属性，以便混入到元素原型
const behaviorPrototype = DroppableBehavior.prototype;
export default {
  get droppable() {
    return behaviorPrototype.droppable.get.call(this);
  },
  set droppable(value) {
    behaviorPrototype.droppable.set.call(this, value);
  },
  get multi() {
    return behaviorPrototype.multi.get.call(this);
  },
  set multi(value) {
    behaviorPrototype.multi.set.call(this, value);
  },
  get canDrop() {
    return behaviorPrototype.canDrop.get.call(this);
  },
  _initDroppable: behaviorPrototype._initDroppable,
};
