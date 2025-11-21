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
    return compiledStyles[elementName];
  }
  
  return styleCache.get(cacheKey) || '';
}

export async function preloadElementStyles(elementNames, themeName = 'default') {
  elementNames.forEach(name => {
    if (compiledStyles[name]) {
      const cacheKey = `${themeName}/${name}`;
      styleCache.set(cacheKey, compiledStyles[name]);
    }
  });
  
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

