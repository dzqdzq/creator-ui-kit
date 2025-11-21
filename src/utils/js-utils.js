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

function padLeft(value, length, padChar) {
  const str = value.toString();
  length -= str.length;
  return length > 0 ? new Array(length + 1).join(padChar) + str : str;
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
  padLeft,
  toFixed(value, decimals, trimZeros) {
    const multiplier = 10 ** decimals;
    let result = (Math.round(value * multiplier) / multiplier).toFixed(decimals);
    if (trimZeros) {
      const zeroPattern = new RegExp(`0{1,${trimZeros}}$`);
      result = result.replace(zeroPattern, "");

      if (trimZeros >= decimals && result[result.length - 1] === ".") {
        result = result.slice(0, -1);
      }
    }
    return result;
  },
  formatFrame(frame, frameRate) {
    const digitCount = Math.floor(Math.log10(frameRate)) + 1;
    let sign = "";

    if (frame < 0) {
      sign = "-";
      frame = -frame;
    }

    return `${sign + Math.floor(frame / frameRate)}:${padLeft(frame % frameRate, digitCount, "0")}`;
  },
  smoothScale(value, delta) {
    return 2 ** (0.002 * delta) * value;
  },
  wrapError(e) {
    return {
      __error__: true,
      stack: e.stack,
      message: e.message,
      code: e.code,
      errno: e.errno,
      syscall: e.syscall,
    };
  },
  arrayCmpFilter(array, compareFn) {
    const result = [];
    for (let i = 0; i < array.length; ++i) {
      const item = array[i];
      let shouldAdd = true;
      for (let j = 0; j < result.length; ++j) {
        const resultItem = result[j];
        if (item === resultItem) {
          shouldAdd = false;
          break;
        }
        const cmp = compareFn(resultItem, item);
        if (cmp > 0) {
          shouldAdd = false;
          break;
        }

        if (cmp < 0) {
          result.splice(j, 1);
          --j;
        }
      }

      if (shouldAdd) {
        result.push(item);
      }
    }
    return result;
  },
  fitSize(width, height, maxWidth, maxHeight) {
    let finalWidth;
    let finalHeight;

    if (width > maxWidth && height > maxHeight) {
      finalWidth = maxWidth;
      finalHeight = (height * maxWidth) / width;
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (width * maxHeight) / height;
      }
    } else if (width > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = (height * maxWidth) / width;
    } else if (height > maxHeight) {
      finalWidth = (width * maxHeight) / height;
      finalHeight = maxHeight;
    } else {
      finalWidth = width;
      finalHeight = height;
    }

    return [finalWidth, finalHeight];
  },
  prettyBytes(bytes) {
    if (typeof bytes != "number" || Number.isNaN(bytes)) {
      throw new TypeError(`Expected a number, got ${typeof bytes}`);
    }
    const isNegative = bytes < 0;
    const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    if (isNegative) {
      bytes = -bytes;
    }

    if (bytes < 1) {
      return `${(isNegative ? "-" : "") + bytes} B`;
    }

    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1000)),
      units.length - 1
    );
    const value = Number((bytes / 1000 ** unitIndex).toFixed(2));
    return `${isNegative ? "-" : ""}${value} ${units[unitIndex]}`;
  },
  run(command, ...args) {
    (0, require("child_process").spawn)(command, args, { detached: true }).unref();
  },
};
