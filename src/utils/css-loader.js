import { loadElementStyle } from "./theme-loader.js";

const compiledStyles = typeof __COMPILED_STYLES__ !== 'undefined' ? __COMPILED_STYLES__ : {};
const styleCache = new Map();

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

export function getElementStyleSync(elementName, themeName = 'default') {
  const cacheKey = `${themeName}/${elementName}`;
  
  if (compiledStyles[elementName]) {
    console.log(`[css-loader] 从编译样式获取 ${elementName}:`, compiledStyles[elementName].length, "字符");
    return compiledStyles[elementName];
  }
  
  const cached = styleCache.get(cacheKey);
  if (cached) {
    console.log(`[css-loader] 从缓存获取 ${elementName}:`, cached.length, "字符");
    return cached;
  }
  
  console.warn(`[css-loader] 警告: ${elementName} 样式未找到！`, {
    elementName,
    themeName,
    cacheKey,
    hasCompiledStyle: !!compiledStyles[elementName],
    cacheSize: styleCache.size,
    cacheKeys: Array.from(styleCache.keys()),
  });
  return '';
}

export async function preloadElementStyles(elementNames, themeName = 'default') {
  console.log("[css-loader] 开始预加载样式:", elementNames);
  
  elementNames.forEach(name => {
    if (compiledStyles[name]) {
      const cacheKey = `${themeName}/${name}`;
      styleCache.set(cacheKey, compiledStyles[name]);
      console.log(`[css-loader] 从编译样式设置缓存 ${name}:`, compiledStyles[name].length, "字符");
    }
  });
  
  const runtimePromises = elementNames
    .filter(name => !compiledStyles[name])
    .map(async (name) => {
      console.log(`[css-loader] 异步加载样式 ${name}...`);
      const style = await getElementStyle(name, themeName);
      console.log(`[css-loader] 样式 ${name} 加载完成:`, style.length, "字符");
      return style;
    });
  
  await Promise.all(runtimePromises);
  
  console.log("[css-loader] 样式预加载完成，缓存状态:", {
    cacheSize: styleCache.size,
    cacheKeys: Array.from(styleCache.keys()),
    compiledStyles: Object.keys(compiledStyles),
  });
}

export default {
  getElementStyle,
  getElementStyleSync,
  preloadElementStyles
};

