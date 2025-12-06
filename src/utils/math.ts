/**
 * 数学工具函数
 */

/**
 * 将值限制在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * 将值限制在 0-1 范围内
 */
export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export default {
  clamp,
  clamp01,
};
