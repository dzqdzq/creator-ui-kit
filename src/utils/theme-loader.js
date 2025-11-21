// 主题样式加载器 - 从 themes 目录加载 CSS 文件
const loadedStyles = {};

// 加载 CSS 文件内容
async function loadCssFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to load CSS file: ${url}`, error);
    throw error;
  }
}

// 获取基础 URL
function getBaseUrl() {
  const scripts = document.getElementsByTagName('script');
  for (let script of scripts) {
    if (script.src && script.src.includes('ui-kit')) {
      const url = new URL(script.src);
      return url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    }
  }
  return window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
}

// 加载元素样式
export async function loadElementStyle(elementName, themeName = 'default') {
  const cacheKey = `${themeName}/${elementName}`;
  if (loadedStyles[cacheKey]) {
    return loadedStyles[cacheKey];
  }

  try {
    const baseUrl = getBaseUrl();
    const cssUrl = `${baseUrl}/src/themes/${themeName}/elements/${elementName}.css`;
    let css = await loadCssFile(cssUrl);
    
    // 处理 checkbox.css 中的 @import url(theme://globals/fontello.css)
    if (elementName === 'checkbox' && css.includes('theme://globals/fontello.css')) {
      const fontelloUrl = `${baseUrl}/src/themes/${themeName}/globals/fontello.css`;
      const fontelloCss = await loadCssFile(fontelloUrl);
      css = css.replace(/@import\s+url\(['"]theme:\/\/globals\/fontello\.css['"]\);?/g, fontelloCss);
    }
    
    loadedStyles[cacheKey] = css;
    return css;
  } catch (error) {
    console.error(`Failed to load style for ${elementName}:`, error);
    return '';
  }
}

// 预加载多个样式
export async function preloadStyles(elementNames, themeName = 'default') {
  const promises = elementNames.map(name => loadElementStyle(name, themeName));
  await Promise.all(promises);
}

export default {
  loadElementStyle,
  preloadStyles
};
