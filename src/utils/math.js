// 数学工具函数
export default {
  clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  },
  clamp01(value) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
  },
};
