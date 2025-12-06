/**
 * JavaScript 工具函数
 */

/**
 * 获取对象属性描述符（包括原型链）
 */
function getPropertyDescriptor(obj: object | null, name: string): PropertyDescriptor | null {
  if (!obj) {
    return null;
  }
  return (
    Object.getOwnPropertyDescriptor(obj, name) ||
    getPropertyDescriptor(Object.getPrototypeOf(obj), name)
  );
}

/**
 * 复制属性
 */
function copyprop(name: string, source: object, target: object): void {
  const descriptor = getPropertyDescriptor(source, name);
  if (descriptor) {
    Object.defineProperty(target, name, descriptor);
  }
}

/**
 * 左侧填充字符串
 */
function padLeft(value: string | number, length: number, padChar: string): string {
  const str = value.toString();
  const padLength = length - str.length;
  return padLength > 0 ? new Array(padLength + 1).join(padChar) + str : str;
}

export interface WrappedError {
  __error__: true;
  stack?: string;
  message: string;
  code?: string;
  errno?: number;
  syscall?: string;
}

export default {
  copyprop,

  /**
   * 将源对象的所有属性复制到目标对象
   */
  assign<T extends object>(target: T | null, ...sources: (object | null | undefined)[]): T {
    const result = (target || {}) as T;
    for (const source of sources) {
      if (source) {
        if (typeof source !== 'object') {
          console.error('JS.assign called on non-object:', source);
          continue;
        }
        for (const name in source) {
          copyprop(name, source, result);
        }
      }
    }
    return result;
  },

  /**
   * 将源对象的属性复制到目标对象（排除指定属性）
   */
  assignExcept<T extends object>(target: T | null, source: object, except: string[]): T | null {
    const result = (target || {}) as T;
    if (typeof source !== 'object') {
      console.error('JS.assignExcept called on non-object:', source);
      return null;
    }
    for (const name in source) {
      if (!except.includes(name)) {
        copyprop(name, source, result);
      }
    }
    return result;
  },

  /**
   * 将源对象的属性添加到目标对象
   */
  addon<T extends object>(target: T | null, ...sources: object[]): T {
    const result = (target || {}) as T;
    for (const source of sources) {
      for (const name in source) {
        if (name in result) {
          copyprop(name, source, result);
        } else {
          const descriptor = getPropertyDescriptor(source, name);
          if (descriptor) {
            Object.defineProperty(result, name, descriptor);
          } else {
            (result as any)[name] = (source as any)[name];
          }
        }
      }
    }
    return result;
  },

  padLeft,

  /**
   * 格式化数字为固定小数位
   */
  toFixed(value: number, decimals: number, trimZeros?: number): string {
    const multiplier = 10 ** decimals;
    let result = (Math.round(value * multiplier) / multiplier).toFixed(decimals);
    if (trimZeros) {
      const zeroPattern = new RegExp(`0{1,${trimZeros}}$`);
      result = result.replace(zeroPattern, '');

      if (trimZeros >= decimals && result[result.length - 1] === '.') {
        result = result.slice(0, -1);
      }
    }
    return result;
  },

  /**
   * 格式化帧数
   */
  formatFrame(frame: number, frameRate: number): string {
    const digitCount = Math.floor(Math.log10(frameRate)) + 1;
    let sign = '';
    let absFrame = frame;

    if (frame < 0) {
      sign = '-';
      absFrame = -frame;
    }

    return `${sign + Math.floor(absFrame / frameRate)}:${padLeft(absFrame % frameRate, digitCount, '0')}`;
  },

  /**
   * 平滑缩放
   */
  smoothScale(value: number, delta: number): number {
    return 2 ** (0.002 * delta) * value;
  },

  /**
   * 包装错误对象
   */
  wrapError(e: Error & { code?: string; errno?: number; syscall?: string }): WrappedError {
    return {
      __error__: true,
      stack: e.stack,
      message: e.message,
      code: e.code,
      errno: e.errno,
      syscall: e.syscall,
    };
  },

  /**
   * 数组比较过滤
   */
  arrayCmpFilter<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
    const result: T[] = [];
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

  /**
   * 适应尺寸
   */
  fitSize(width: number, height: number, maxWidth: number, maxHeight: number): [number, number] {
    let finalWidth: number;
    let finalHeight: number;

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

  /**
   * 格式化字节数
   */
  prettyBytes(bytes: number): string {
    if (typeof bytes !== 'number' || Number.isNaN(bytes)) {
      throw new TypeError(`Expected a number, got ${typeof bytes}`);
    }
    const isNegative = bytes < 0;
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let absBytes = bytes;

    if (isNegative) {
      absBytes = -bytes;
    }

    if (absBytes < 1) {
      return `${(isNegative ? '-' : '') + absBytes} B`;
    }

    const unitIndex = Math.min(Math.floor(Math.log(absBytes) / Math.log(1000)), units.length - 1);
    const value = Number((absBytes / 1000 ** unitIndex).toFixed(2));
    return `${isNegative ? '-' : ''}${value} ${units[unitIndex]}`;
  },

  /**
   * 运行命令（仅在 Node.js 环境中有效）
   */
  run(command: string, ...args: string[]): void {
    if (typeof require !== 'undefined') {
      const { spawn } = require('child_process');
      spawn(command, args, { detached: true }).unref();
    }
  },
};
