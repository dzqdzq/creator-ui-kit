// 简化的 JS 工具函数
function copyprop(name, source, target) {
  const descriptor = getPropertyDescriptor(source, name);
  if (descriptor) {
    Object.defineProperty(target, name, descriptor);
  }
}

function getPropertyDescriptor(obj, name) {
  if (!obj) {
    return null;
  }
  return (
    Object.getOwnPropertyDescriptor(obj, name) ||
    getPropertyDescriptor(Object.getPrototypeOf(obj), name)
  );
}

export default {
  copyprop,
  assign(target, ...sources) {
    target = target || {};
    for (const source of sources) {
      if (source) {
        if (typeof source !== "object") {
          console.error("JS.assign called on non-object:", source);
          continue;
        }
        for (const name in source) {
          copyprop(name, source, target);
        }
      }
    }
    return target;
  },
  assignExcept(target, source, except) {
    target = target || {};
    if (typeof source !== "object") {
      console.error("JS.assignExcept called on non-object:", source);
      return null;
    }
    for (const name in source) {
      if (!except.includes(name)) {
        copyprop(name, source, target);
      }
    }
    return target;
  },
  addon(target, ...sources) {
    target = target || {};
    for (const source of sources) {
      for (const name in source) {
        // 如果属性已存在，则复制；如果不存在，则直接添加
        if (name in target) {
          copyprop(name, source, target);
        } else {
          // 直接复制属性值
          const descriptor = getPropertyDescriptor(source, name);
          if (descriptor) {
            Object.defineProperty(target, name, descriptor);
          } else {
            target[name] = source[name];
          }
        }
      }
    }
    return target;
  },
};
