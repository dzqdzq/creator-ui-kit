const loadedStyles = {};
const loadedResources = {};

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

function resolveThemeUrl(themeUrl, themeName, baseUrl) {
  const path = themeUrl.replace(/^theme:\/\//, '');
  return `${baseUrl}/src/themes/${themeName}/${path}`;
}

async function processImports(css, themeName, baseUrl) {
  // 修复正则表达式：正确处理带引号和不带引号的 URL
  const importRegex = /@import\s+url\((['"]?)(theme:\/\/[^'")]+)\1\);?/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(css)) !== null) {
    const themeUrl = match[2];
    if (!imports.includes(themeUrl)) {
      imports.push(themeUrl);
    }
  }
  
  for (const themeUrl of imports) {
    try {
      const actualUrl = resolveThemeUrl(themeUrl, themeName, baseUrl);
      const resourceKey = `${themeName}/${themeUrl}`;
      
      if (!loadedResources[resourceKey]) {
        const importedCss = await loadCssFile(actualUrl);
        const processedCss = await processThemeUrls(importedCss, themeName, baseUrl);
        loadedResources[resourceKey] = processedCss;
      }
      
      // 匹配带引号或不带引号的 URL
      const escapedUrl = themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const importPattern = new RegExp(`@import\\s+url\\((['"]?)${escapedUrl}\\1\\);?`, 'g');
      css = css.replace(importPattern, loadedResources[resourceKey]);
    } catch (error) {
      console.warn(`Failed to load imported resource: ${themeUrl}`, error);
      const escapedUrl = themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const importPattern = new RegExp(`@import\\s+url\\((['"]?)${escapedUrl}\\1\\);?\\s*`, 'g');
      css = css.replace(importPattern, '');
    }
  }
  
  return css;
}

async function processThemeUrls(css, themeName, baseUrl) {
  const urlRegex = /url\(['"]?(theme:\/\/[^'"]+)['"]?\)/g;
  const urls = [];
  let match;
  
  while ((match = urlRegex.exec(css)) !== null) {
    const beforeMatch = css.substring(Math.max(0, match.index - 50), match.index);
    if (!beforeMatch.match(/@import\s+url\s*$/)) {
      const themeUrl = match[1];
      if (!urls.includes(themeUrl)) {
        urls.push(themeUrl);
      }
    }
  }
  
  for (const themeUrl of urls) {
    const actualUrl = resolveThemeUrl(themeUrl, themeName, baseUrl);
    const urlPattern = new RegExp(`url\\(['"]?${themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\)`, 'g');
    css = css.replace(urlPattern, `url('${actualUrl}')`);
  }
  
  return css;
}

export async function loadElementStyle(elementName, themeName = 'default') {
  const cacheKey = `${themeName}/${elementName}`;
  if (loadedStyles[cacheKey]) {
    return loadedStyles[cacheKey];
  }

  try {
    const baseUrl = getBaseUrl();
    const cssUrl = `${baseUrl}/src/themes/${themeName}/elements/${elementName}.css`;
    let css = await loadCssFile(cssUrl);
    
    css = await processImports(css, themeName, baseUrl);
    css = await processThemeUrls(css, themeName, baseUrl);
    
    loadedStyles[cacheKey] = css;
    return css;
  } catch (error) {
    console.error(`Failed to load style for ${elementName}:`, error);
    return '';
  }
}

export async function preloadStyles(elementNames, themeName = 'default') {
  const promises = elementNames.map(name => loadElementStyle(name, themeName));
  await Promise.all(promises);
}

export default {
  loadElementStyle,
  preloadStyles
};
