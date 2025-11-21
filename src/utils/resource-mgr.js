// 简化的资源管理器 - 用于存储样式
const resources = {};

export default {
  getResource(key) {
    return resources[key] || "";
  },
  setResource(key, value) {
    resources[key] = value;
  },
  // 用于注册样式
  registerStyle(elementName, css) {
    resources[`theme://elements/${elementName}.css`] = css;
  },
  // 动态导入脚本
  async importScript(url) {
    try {
      const module = await import(url);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to import script: ${url}`, error);
      throw error;
    }
  },
};
