/**
 * CSS 加载器
 * 编译时注入的样式，由 vite 插件在构建时注入
 */

import type { CSSMap } from '../types';

// vite 插件会直接替换这行代码，将 compiledStyles 初始化为实际的样式对象
// 如果替换失败，则使用 __COMPILED_STYLES__ 作为后备
declare const __COMPILED_STYLES__: CSSMap | undefined;

const compiledStyles: CSSMap = typeof __COMPILED_STYLES__ !== 'undefined' ? __COMPILED_STYLES__ : {};

const styleCache = new Map<string, string>();

/**
 * 异步获取元素样式（实际上是同步返回）
 */
export async function getElementStyle(elementName: string, themeName = 'default'): Promise<string> {
  return getElementStyleSync(elementName, themeName);
}

/**
 * 同步获取元素样式
 */
export function getElementStyleSync(elementName: string, themeName = 'default'): string {
  const cacheKey = `${themeName}/${elementName}`;
  
  // 首先检查缓存
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }
  
  // 从编译时注入的样式中获取
  if (compiledStyles[elementName]) {
    const css = compiledStyles[elementName];
    styleCache.set(cacheKey, css);
    return css;
  }
  
  // 如果找不到，返回空字符串
  console.warn(`[css-loader] 警告: ${elementName} 样式未找到！`);
  return '';
}

/**
 * 预加载元素样式到缓存
 */
export async function preloadElementStyles(elementNames: string[], themeName = 'default'): Promise<void> {
  elementNames.forEach(name => {
    if (compiledStyles[name]) {
      const cacheKey = `${themeName}/${name}`;
      styleCache.set(cacheKey, compiledStyles[name]);
    }
  });
}

export default {
  getElementStyle,
  getElementStyleSync,
  preloadElementStyles
};

