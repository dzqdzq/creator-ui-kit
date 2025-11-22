import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { globSync } from 'glob';

function resolveThemeUrlBuild(themeUrl, themeName) {
  const path = themeUrl.replace(/^theme:\/\//, '');
  return resolve(__dirname, `src/themes/${themeName}/${path}`);
}

function fileToBase64(filePath) {
  try {
    if (!existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return null;
    }
    const fileContent = readFileSync(filePath);
    const ext = filePath.split('.').pop().toLowerCase();
    let mimeType = 'application/octet-stream';
    
    // 根据文件扩展名确定 MIME 类型
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'eot': 'application/vnd.ms-fontobject',
      'otf': 'font/otf'
    };
    
    if (mimeTypes[ext]) {
      mimeType = mimeTypes[ext];
    }
    
    return `data:${mimeType};base64,${fileContent.toString('base64')}`;
  } catch (error) {
    console.warn(`Failed to convert file to base64: ${filePath}`, error);
    return null;
  }
}

function processThemeUrlsBuild(css, themeName, processedUrls = new Set()) {
  // 匹配 url(theme://...) 包括可能的片段标识符（如 #iefix）
  // 需要排除 @import url(...) 中的 URL
  const urlRegex = /url\((['"]?)(theme:\/\/[^'")]+)(?:\1)?\)/g;
  let match;
  let result = css;
  const replacements = [];
  
  // 先收集所有匹配项
  while ((match = urlRegex.exec(css)) !== null) {
    const themeUrl = match[2];
    const fullMatch = match[0];
    const matchIndex = match.index;
    
    // 检查是否在 @import 语句中
    const beforeMatch = css.substring(Math.max(0, matchIndex - 100), matchIndex);
    if (beforeMatch.match(/@import\s+url\s*$/)) {
      continue; // 跳过 @import 中的 URL
    }
    
    // 避免重复处理同一个 URL
    if (processedUrls.has(themeUrl)) {
      continue;
    }
    processedUrls.add(themeUrl);
    
    try {
      // 提取文件路径（去掉片段标识符）
      const filePathOnly = themeUrl.split('#')[0];
      const filePath = resolveThemeUrlBuild(filePathOnly, themeName);
      const base64 = fileToBase64(filePath);
      
      if (base64) {
        // 如果有片段标识符，保留它
        const fragment = themeUrl.includes('#') ? '#' + themeUrl.split('#')[1] : '';
        replacements.push({
          index: matchIndex,
          length: fullMatch.length,
          replacement: `url('${base64}${fragment}')`
        });
      } else {
        console.warn(`Failed to convert to base64: ${filePath}`);
      }
    } catch (error) {
      console.warn(`Failed to process theme URL: ${themeUrl}`, error);
    }
  }
  
  // 从后往前替换，避免索引偏移
  replacements.sort((a, b) => b.index - a.index);
  for (const rep of replacements) {
    result = result.substring(0, rep.index) + rep.replacement + result.substring(rep.index + rep.length);
  }
  
  return result;
}

function processImportsBuild(css, themeName, processedImports = new Set()) {
  const importRegex = /@import\s+url\((['"]?)(theme:\/\/[^'")]+)\1\);?/g;
  const imports = [];
  let match;
  
  // 收集所有 @import
  while ((match = importRegex.exec(css)) !== null) {
    const themeUrl = match[2];
    if (!imports.includes(themeUrl)) {
      imports.push(themeUrl);
    }
  }
  
  // 处理每个 @import
  for (const themeUrl of imports) {
    // 避免循环导入
    if (processedImports.has(themeUrl)) {
      const escapedUrl = themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const importPattern = new RegExp(`@import\\s+url\\((['"]?)${escapedUrl}\\1\\);?\\s*`, 'g');
      css = css.replace(importPattern, '');
      continue;
    }
    
    try {
      const filePath = resolveThemeUrlBuild(themeUrl, themeName);
      if (!existsSync(filePath)) {
        console.warn(`Imported CSS file not found: ${filePath}`);
        const escapedUrl = themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const importPattern = new RegExp(`@import\\s+url\\((['"]?)${escapedUrl}\\1\\);?\\s*`, 'g');
        css = css.replace(importPattern, '');
        continue;
      }
      
      processedImports.add(themeUrl);
      let importedCss = readFileSync(filePath, 'utf-8');
      
      // 如果导入的是 fontello.css，需要确保包含 @font-face 定义
      if (themeUrl === 'theme://globals/fontello.css') {
        const commonCssPath = resolveThemeUrlBuild('theme://globals/common.css', themeName);
        if (existsSync(commonCssPath)) {
          let commonCss = readFileSync(commonCssPath, 'utf-8');
          // 提取 @font-face 定义
          const fontFaceMatch = commonCss.match(/@font-face\s*\{[^}]*font-family:\s*fontello[^}]*\}/s);
          if (fontFaceMatch) {
            // 处理 @font-face 中的 URL
            let fontFaceCss = processThemeUrlsBuild(fontFaceMatch[0], themeName);
            // 将 @font-face 添加到 fontello.css 的开头
            importedCss = fontFaceCss + '\n' + importedCss;
          }
        }
      }
      
      // 递归处理导入的 CSS 中的 @import
      importedCss = processImportsBuild(importedCss, themeName, processedImports);
      
      // 处理导入的 CSS 中的 URL
      importedCss = processThemeUrlsBuild(importedCss, themeName);
      
      // 替换 @import 语句为实际 CSS 内容
      const escapedUrl = themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const importPattern = new RegExp(`@import\\s+url\\((['"]?)${escapedUrl}\\1\\);?`, 'g');
      css = css.replace(importPattern, importedCss);
    } catch (error) {
      console.warn(`Failed to load imported resource: ${themeUrl}`, error);
      const escapedUrl = themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const importPattern = new RegExp(`@import\\s+url\\((['"]?)${escapedUrl}\\1\\);?\\s*`, 'g');
      css = css.replace(importPattern, '');
    }
  }
  
  return css;
}

function collectAllStyles(themeName = 'default') {
  const cssMap = {};
  const processedFiles = new Set();
  
  // 收集 elements 目录下的 CSS 文件
  const elementFiles = globSync(`src/themes/${themeName}/elements/*.css`);
  
  elementFiles.forEach(file => {
    const elementName = file.match(/elements\/(.+)\.css$/)?.[1];
    if (elementName && !processedFiles.has(file)) {
      processedFiles.add(file);
      try {
        let cssContent = readFileSync(file, 'utf-8');
        
        // 处理 @import
        cssContent = processImportsBuild(cssContent, themeName);
        
        // 处理 url(theme://...)
        cssContent = processThemeUrlsBuild(cssContent, themeName);
        
        cssMap[elementName] = cssContent;
      } catch (e) {
        console.warn(`Failed to read CSS file: ${file}`, e);
      }
    }
  });
  
  // 收集 globals 目录下的 CSS 文件（如果需要单独使用）
  const globalFiles = globSync(`src/themes/${themeName}/globals/*.css`);
  globalFiles.forEach(file => {
    const globalName = file.match(/globals\/(.+)\.css$/)?.[1];
    if (globalName && !processedFiles.has(file)) {
      processedFiles.add(file);
      try {
        let cssContent = readFileSync(file, 'utf-8');
        
        // 处理 @import（globals 文件可能也会导入其他文件）
        cssContent = processImportsBuild(cssContent, themeName);
        
        // 处理 url(theme://...)
        cssContent = processThemeUrlsBuild(cssContent, themeName);
        
        // 将 globals 文件也添加到 cssMap，使用 globals/ 前缀
        cssMap[`globals/${globalName}`] = cssContent;
      } catch (e) {
        console.warn(`Failed to read global CSS file: ${file}`, e);
      }
    }
  });
  
  return cssMap;
}

/**
 * 提取字体定义
 */
function extractFontFace(cssMap) {
  // 优先从 globals/common.css 中提取
  if (cssMap['globals/common']) {
    const css = cssMap['globals/common'];
    // 匹配完整的 @font-face 规则（包括多行）
    const fontFaceMatch = css.match(/@font-face\s*\{[^}]*font-family:\s*fontello[^}]*\}/s);
    if (fontFaceMatch) {
      return fontFaceMatch[0];
    }
  }
  
  // 如果没找到，从任何包含 @font-face 的 CSS 中提取
  for (const [key, css] of Object.entries(cssMap)) {
    const fontFaceMatch = css.match(/@font-face\s*\{[^}]*font-family:\s*fontello[^}]*\}/s);
    if (fontFaceMatch) {
      return fontFaceMatch[0];
    }
  }
  return null;
}

function cssInjectPlugin() {
  return {
    name: 'css-inject',
    transform(code, id) {
      if (id.endsWith('css-loader.js')) {
        const themeName = 'default';
        const cssMap = collectAllStyles(themeName);
        
        // 提取字体定义
        const fontFace = extractFontFace(cssMap);
        
        // 直接替换 compiledStyles 的初始化，使用注入的样式对象
        const cssMapStr = JSON.stringify(cssMap, null, 2);
        const pattern = /const compiledStyles\s*=\s*[^;]+;/s;
        const replacement = `const compiledStyles = ${cssMapStr};`;
        let injectedCode = code.replace(pattern, replacement);
        
        // 如果替换失败，尝试更宽松的匹配
        if (injectedCode === code) {
          const pattern2 = /const compiledStyles\s*=\s*typeof[^;]+;/s;
          injectedCode = code.replace(pattern2, `const compiledStyles = ${cssMapStr};`);
        }
        
        // 如果还是失败，在文件开头注入
        if (injectedCode === code) {
          console.warn('[vite-plugin] 无法替换 compiledStyles，使用注入方式');
          injectedCode = `const __COMPILED_STYLES__ = ${cssMapStr};\n${code}`;
        }
        
        // 注入字体定义到全局变量
        if (fontFace) {
          const fontFaceStr = JSON.stringify(fontFace);
          injectedCode = `const __GLOBAL_FONT_FACE__ = ${fontFaceStr};\n${injectedCode}`;
        }
        
        return {
          code: injectedCode,
          map: null
        };
      }
      
      // 同时处理 index.js，注入全局字体加载逻辑
      if (id.endsWith('src/index.js') || id.endsWith('/index.js')) {
        const themeName = 'default';
        const cssMap = collectAllStyles(themeName);
        const fontFace = extractFontFace(cssMap);
        
        if (fontFace) {
          const fontFaceStr = JSON.stringify(fontFace);
          const fontFaceCode = `
// 全局字体加载：在文档级别注入字体定义，确保 Shadow DOM 中的元素也能使用
if (typeof document !== 'undefined') {
  const fontStyleId = 'ui-kit-global-fonts';
  if (!document.getElementById(fontStyleId)) {
    const fontStyle = document.createElement('style');
    fontStyle.id = fontStyleId;
    fontStyle.type = 'text/css';
    fontStyle.textContent = ${fontFaceStr};
    if (document.head) {
      document.head.appendChild(fontStyle);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(fontStyle);
      });
    } else {
      const head = document.getElementsByTagName('head')[0];
      if (head) head.appendChild(fontStyle);
    }
  }
}
`;
          // 在文件开头注入字体加载代码
          return {
            code: fontFaceCode + code,
            map: null
          };
        }
      }
    }
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'UIKit',
      fileName: 'ui-kit',
      formats: ['es']
    },
    rollupOptions: {
      // 移除 chroma-js 的 external，让它被打包进去
      output: {
        inlineDynamicImports: true
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    target: 'es2022'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [cssInjectPlugin()]
});

