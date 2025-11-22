// 编译时注入的样式，由 vite 插件在构建时注入
const compiledStyles = typeof __COMPILED_STYLES__ !== 'undefined' ? __COMPILED_STYLES__ : {};
const styleCache = new Map();

export async function getElementStyle(elementName, themeName = 'default') {
  // 异步版本，直接返回同步结果
  return getElementStyleSync(elementName, themeName);
}

export function getElementStyleSync(elementName, themeName = 'default') {
  const cacheKey = `${themeName}/${elementName}`;
  
  // 首先检查缓存
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }
  
  // 从编译时注入的样式中获取
  if (compiledStyles[elementName]) {
    const css = compiledStyles[elementName];
    styleCache.set(cacheKey, css);
    return css;
  }
  
  // 如果找不到，返回空字符串
  console.warn(`[css-loader] 警告: ${elementName} 样式未找到！`, {
    elementName,
    themeName,
    cacheKey,
    hasCompiledStyle: !!compiledStyles[elementName],
    availableStyles: Object.keys(compiledStyles),
  });
  return '';
}

export async function preloadElementStyles(elementNames, themeName = 'default') {
  // 将所有编译时样式预加载到缓存中
  elementNames.forEach(name => {
    if (compiledStyles[name]) {
      const cacheKey = `${themeName}/${name}`;
      styleCache.set(cacheKey, compiledStyles[name]);
    } else {
      console.warn(`[css-loader] 样式 ${name} 在编译时样式中未找到`);
    }
  });
}

export default {
  getElementStyle,
  getElementStyleSync,
  preloadElementStyles
};

