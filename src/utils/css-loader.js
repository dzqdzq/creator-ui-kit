// CSS 加载器 - 支持编译时和运行时两种方式
// 在构建工具（如 Vite）中，CSS 内容会在编译时被注入到 __COMPILED_STYLES__
// 在运行时，使用 theme-loader 动态加载

import { loadElementStyle } from "./theme-loader.js";

// 编译时样式映射（在构建时会被 Vite 插件注入）
// 如果 __COMPILED_STYLES__ 存在，说明是构建后的版本
const compiledStyles = typeof __COMPILED_STYLES__ !== 'undefined' ? __COMPILED_STYLES__ : {};

// 样式缓存
const styleCache = new Map();

/**
 * 获取元素的 CSS 样式
 * @param {string} elementName - 元素名称（如 'button', 'input'）
 * @param {string} themeName - 主题名称，默认为 'default'
 * @returns {Promise<string>} CSS 样式字符串
 */
export async function getElementStyle(elementName, themeName = 'default') {
  const cacheKey = `${themeName}/${elementName}`;
  
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }
  
  try {
    const css = await loadElementStyle(elementName, themeName);
    styleCache.set(cacheKey, css);
    return css;
  } catch (error) {
    console.error(`Failed to load style for ${elementName}:`, error);
    return '';
  }
}

/**
 * 同步获取元素的 CSS 样式（如果已缓存）
 * 如果未缓存，返回空字符串（需要先调用 getElementStyle 进行预加载）
 * @param {string} elementName - 元素名称
 * @param {string} themeName - 主题名称，默认为 'default'
 * @returns {string} CSS 样式字符串
 */
export function getElementStyleSync(elementName, themeName = 'default') {
  const cacheKey = `${themeName}/${elementName}`;
  
  // 优先使用编译时的样式
  if (compiledStyles[elementName]) {
    return compiledStyles[elementName];
  }
  
  // 回退到运行时缓存的样式
  return styleCache.get(cacheKey) || '';
}

/**
 * 预加载多个元素的样式
 * @param {string[]} elementNames - 元素名称数组
 * @param {string} themeName - 主题名称，默认为 'default'
 */
export async function preloadElementStyles(elementNames, themeName = 'default') {
  // 首先将编译时的样式添加到缓存中
  elementNames.forEach(name => {
    if (compiledStyles[name]) {
      const cacheKey = `${themeName}/${name}`;
      styleCache.set(cacheKey, compiledStyles[name]);
    }
  });
  
  // 对于没有编译时样式的，使用运行时加载
  const runtimePromises = elementNames
    .filter(name => !compiledStyles[name])
    .map(name => getElementStyle(name, themeName));
  
  await Promise.all(runtimePromises);
}

export default {
  getElementStyle,
  getElementStyleSync,
  preloadElementStyles
};

