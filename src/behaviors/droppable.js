
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
    // Drag and drop functionality has been removed
  }
}

// 导出类的实例方法和属性，以便混入到元素原型
const behaviorPrototype = DroppableBehavior.prototype;

// 获取 getter 描述符的辅助函数
function getGetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.get) {
    return descriptor.get;
  }
  return null;
}

function getSetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.set) {
    return descriptor.set;
  }
  return null;
}

export default {
  get droppable() {
    const getter = getGetter(behaviorPrototype, "droppable");
    if (!getter) {
      console.error("[droppable] droppable getter not found");
      return null;
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[droppable] Error calling droppable getter:", error, "this:", this);
      throw error;
    }
  },
  set droppable(value) {
    const setter = getSetter(behaviorPrototype, "droppable");
    if (!setter) {
      console.error("[droppable] droppable setter not found");
      return;
    }
    try {
      setter.call(this, value);
    } catch (error) {
      console.error("[droppable] Error calling droppable setter:", error, "this:", this);
      throw error;
    }
  },
  get multi() {
    const getter = getGetter(behaviorPrototype, "multi");
    if (!getter) {
      console.error("[droppable] multi getter not found");
      return false;
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[droppable] Error calling multi getter:", error, "this:", this);
      throw error;
    }
  },
  set multi(value) {
    const setter = getSetter(behaviorPrototype, "multi");
    if (!setter) {
      console.error("[droppable] multi setter not found");
      return;
    }
    try {
      setter.call(this, value);
    } catch (error) {
      console.error("[droppable] Error calling multi setter:", error, "this:", this);
      throw error;
    }
  },
  get canDrop() {
    const getter = getGetter(behaviorPrototype, "canDrop");
    if (!getter) {
      console.error("[droppable] canDrop getter not found");
      return false;
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[droppable] Error calling canDrop getter:", error, "this:", this);
      throw error;
    }
  },
  _initDroppable: behaviorPrototype._initDroppable,
};
