import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

const __dirname = import.meta.dirname;

/**
 * 收集 Font Awesome 4.7.0 样式并内联字体
 * 只保留 woff2 和 woff 格式（现代浏览器），去掉 eot/ttf/svg 以减小体积
 */
function collectFontAwesomeStyles(): string {
  const faBasePath = resolve(__dirname, 'node_modules/font-awesome');
  const fontsPath = resolve(faBasePath, 'fonts');
  const cssPath = resolve(faBasePath, 'css');

  const cssFile = resolve(cssPath, 'font-awesome.css');
  if (!existsSync(cssFile)) {
    console.warn('[vite-plugin] Font Awesome CSS not found');
    return '';
  }

  let css = readFileSync(cssFile, 'utf-8');

  // 只保留 woff2 和 woff 格式，重写 @font-face
  const woff2Path = resolve(fontsPath, 'fontawesome-webfont.woff2');
  const woffPath = resolve(fontsPath, 'fontawesome-webfont.woff');

  let woff2Base64 = '';
  let woffBase64 = '';

  if (existsSync(woff2Path)) {
    woff2Base64 = readFileSync(woff2Path).toString('base64');
  }
  if (existsSync(woffPath)) {
    woffBase64 = readFileSync(woffPath).toString('base64');
  }

  // 替换原有的 @font-face 为只包含 woff2/woff 的版本
  const newFontFace = `@font-face {
  font-family: 'FontAwesome';
  src: url('data:font/woff2;base64,${woff2Base64}') format('woff2'),
       url('data:font/woff;base64,${woffBase64}') format('woff');
  font-weight: normal;
  font-style: normal;
}`;

  // 移除原有的 @font-face 并替换为新的
  css = css.replace(
    /@font-face\s*\{[^}]*font-family:\s*['"]?FontAwesome['"]?[^}]*\}/s,
    newFontFace,
  );

  return css;
}

function resolveThemeUrlBuild(themeUrl: string, themeName: string): string {
  const path = themeUrl.replace(/^theme:\/\//, '');
  return resolve(__dirname, `src/themes/${themeName}/${path}`);
}

function fileToBase64(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return null;
    }
    const fileContent = readFileSync(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    let mimeType = 'application/octet-stream';

    // 根据文件扩展名确定 MIME 类型
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      eot: 'application/vnd.ms-fontobject',
      otf: 'font/otf',
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

interface UrlReplacement {
  index: number;
  length: number;
  replacement: string;
}

function processThemeUrlsBuild(
  css: string,
  themeName: string,
  processedUrls: Set<string> = new Set(),
): string {
  // 匹配 url(theme://...) 包括可能的片段标识符（如 #iefix）
  // 需要排除 @import url(...) 中的 URL
  const urlRegex = /url\((['"]?)(theme:\/\/[^'")]+)(?:\1)?\)/g;
  let match: RegExpExecArray | null;
  let result = css;
  const replacements: UrlReplacement[] = [];

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
          replacement: `url('${base64}${fragment}')`,
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
    result =
      result.substring(0, rep.index) + rep.replacement + result.substring(rep.index + rep.length);
  }

  return result;
}

/**
 * 生成完整的 @font-face 规则，包含所有字体格式
 */
function generateFontFaceRule(themeName: string): string | null {
  const fontFormats = [
    { ext: 'woff2', format: 'woff2' },
    { ext: 'woff', format: 'woff' },
    { ext: 'ttf', format: 'truetype' },
    { ext: 'eot', format: 'embedded-opentype' },
  ];

  const srcParts: string[] = [];

  // 处理每种字体格式
  for (const { ext, format } of fontFormats) {
    try {
      const fontPath = resolve(__dirname, `src/themes/${themeName}/font/fontello.${ext}`);
      if (existsSync(fontPath)) {
        const base64 = fileToBase64(fontPath);
        if (base64) {
          if (ext === 'eot') {
            // EOT 格式需要特殊处理，使用 ?#iefix
            srcParts.push(`url('${base64}?#iefix') format('${format}')`);
          } else {
            srcParts.push(`url('${base64}') format('${format}')`);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to process font format ${ext}:`, error);
    }
  }

  if (srcParts.length === 0) {
    console.warn('No font formats were successfully processed');
    return null;
  }

  // 生成 @font-face 规则
  return `@font-face {
  font-family: fontello;
  src: ${srcParts.join(',\n       ')};
  font-weight: 400;
  font-style: normal;
}`;
}

function processImportsBuild(
  css: string,
  themeName: string,
  processedImports: Set<string> = new Set(),
): string {
  const importRegex = /@import\s+url\((['"]?)(theme:\/\/[^'")]+)\1\);?/g;
  const imports: string[] = [];
  let match: RegExpExecArray | null;

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

      // 如果导入的是 fontello.css，需要生成完整的 @font-face 定义
      if (themeUrl === 'theme://globals/fontello.css') {
        // 生成包含所有字体格式的 @font-face 定义
        const fontFaceCss = generateFontFaceRule(themeName);
        if (fontFaceCss) {
          // 将 @font-face 添加到 fontello.css 的开头
          importedCss = fontFaceCss + '\n' + importedCss;
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

// 在 JS 模板中使用了 fontello 图标的组件列表
const COMPONENTS_USING_FONTELLO = [
  'checkbox', // icon-ok
  'num-input', // icon-up-dir, icon-down-dir
  'color-picker', // icon-right-dir, icon-circle-empty, icon-left-dir, icon-plus
  'prop', // icon-braille, icon-fold-up, icon-lock, icon-trash-empty, icon-fold
  'section', // icon-fold-up, icon-fold
  'select', // icon-down-dir
];

function collectAllStyles(themeName = 'default'): Record<string, string> {
  const cssMap: Record<string, string> = {};
  const processedFiles = new Set<string>();

  // 预先读取 fontello 样式
  let fontelloFullCss: string | null = null;
  const fontFaceCss = generateFontFaceRule(themeName);
  const fontelloPath = resolve(__dirname, `src/themes/${themeName}/globals/fontello.css`);
  if (existsSync(fontelloPath)) {
    const fontelloCss = readFileSync(fontelloPath, 'utf-8');
    if (fontFaceCss) {
      fontelloFullCss = fontFaceCss + '\n\n' + fontelloCss;
    } else {
      fontelloFullCss = fontelloCss;
    }
  }

  // 收集 elements 目录下的 CSS 文件
  const elementFiles = globSync(`src/themes/${themeName}/elements/*.css`);

  elementFiles.forEach((file) => {
    const elementName = file.match(/elements\/(.+)\.css$/)?.[1];
    if (elementName && !processedFiles.has(file)) {
      processedFiles.add(file);
      try {
        let cssContent = readFileSync(file, 'utf-8');

        // 如果组件在列表中或 CSS 中包含 icon- 类选择器，则注入 fontello 样式
        const needsFontello =
          COMPONENTS_USING_FONTELLO.includes(elementName) ||
          (cssContent.includes('icon-') && !cssContent.includes('@font-face'));

        if (needsFontello && fontelloFullCss && !cssContent.includes('@font-face')) {
          // 将完整的 fontello 样式添加到组件样式开头
          cssContent = fontelloFullCss + '\n\n' + cssContent;
        }

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
  globalFiles.forEach((file) => {
    const globalName = file.match(/globals\/(.+)\.css$/)?.[1];
    if (globalName && !processedFiles.has(file)) {
      processedFiles.add(file);
      try {
        let cssContent = readFileSync(file, 'utf-8');

        // 如果是 common.css，移除旧的不完整的 @font-face 定义
        // 因为我们会动态生成包含所有格式的完整定义
        if (globalName === 'common') {
          cssContent = cssContent.replace(
            /@font-face\s*\{[^}]*font-family:\s*fontello[^}]*\}/gs,
            '',
          );
        }

        // 如果是 fontello.css，在开头添加完整的 @font-face 定义
        if (globalName === 'fontello') {
          const fontFaceCss = generateFontFaceRule(themeName);
          if (fontFaceCss) {
            cssContent = fontFaceCss + '\n\n' + cssContent;
          }
        }

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
 * 提取字体定义（使用动态生成的完整格式定义）
 */
function extractFontFace(_cssMap: Record<string, string>, themeName: string): string | null {
  // 不再从 CSS 文件中提取，而是动态生成包含所有格式的 @font-face
  return generateFontFaceRule(themeName);
}

function cssInjectPlugin(): Plugin {
  return {
    name: 'css-inject',
    transform(code: string, id: string) {
      if (id.endsWith('css-loader.ts') || id.endsWith('css-loader.js')) {
        const themeName = 'default';
        const cssMap = collectAllStyles(themeName);

        // 提取字体定义
        const fontFace = extractFontFace(cssMap, themeName);

        // 直接替换 compiledStyles 的初始化，使用注入的样式对象
        const cssMapStr = JSON.stringify(cssMap, null, 2);
        const pattern = /const compiledStyles\s*[^;]+;/s;
        // 使用字符串拼接而非模板字符串，避免破坏 CSS 中的转义字符（如 \e80a）
        const replacement = 'const compiledStyles = ' + cssMapStr + ';';
        let injectedCode = code.replace(pattern, replacement);

        // 如果替换失败，尝试更宽松的匹配
        if (injectedCode === code) {
          const pattern2 = /const compiledStyles\s*=\s*typeof[^;]+;/s;
          injectedCode = code.replace(pattern2, 'const compiledStyles = ' + cssMapStr + ';');
        }

        // 如果还是失败，在文件开头注入
        if (injectedCode === code) {
          console.warn('[vite-plugin] 无法替换 compiledStyles，使用注入方式');
          injectedCode = 'const __COMPILED_STYLES__ = ' + cssMapStr + ';\n' + code;
        }

        // 注入字体定义到全局变量
        if (fontFace) {
          const fontFaceStr = JSON.stringify(fontFace);
          injectedCode = 'const __GLOBAL_FONT_FACE__ = ' + fontFaceStr + ';\n' + injectedCode;
        }

        return {
          code: injectedCode,
          map: null,
        };
      }

      // 同时处理 index.ts，注入全局样式加载逻辑
      if (id.endsWith('src/index.ts') || id.endsWith('src/index.js')) {
        const themeName = 'default';
        const cssMap = collectAllStyles(themeName);

        // 收集所有 globals 样式
        const globalStyles: string[] = [];
        const globalNames = ['common', 'fontello', 'layout'];
        globalNames.forEach((name) => {
          const key = `globals/${name}`;
          if (cssMap[key]) {
            globalStyles.push(cssMap[key]);
          }
        });

        // 添加 Font Awesome 样式
        const fontAwesomeCss = collectFontAwesomeStyles();
        if (fontAwesomeCss) {
          globalStyles.push(fontAwesomeCss);
          console.log('[vite-plugin] Font Awesome styles collected');
        }

        if (globalStyles.length > 0) {
          const globalStylesStr = JSON.stringify(globalStyles.join('\n'));
          console.log('globalStylesStr：', globalStyles[2]);
          console.log('globalStyles length：', globalStyles.length);
          // 使用字符串拼接而非模板字符串，避免破坏 CSS 中的转义字符
          const globalStylesCode =
            '\n' +
            '// 全局样式加载：在文档级别注入 globals 目录下的所有样式\n' +
            "if (typeof document !== 'undefined') {\n" +
            "  const globalStyleId = 'ui-kit-global-styles';\n" +
            '  if (!document.getElementById(globalStyleId)) {\n' +
            "    const globalStyle = document.createElement('style');\n" +
            '    globalStyle.id = globalStyleId;\n' +
            '    globalStyle.textContent = ' +
            globalStylesStr +
            ';\n' +
            '    if (document.head) {\n' +
            '      document.head.appendChild(globalStyle);\n' +
            "    } else if (document.readyState === 'loading') {\n" +
            "      document.addEventListener('DOMContentLoaded', () => {\n" +
            '        document.head.appendChild(globalStyle);\n' +
            '      });\n' +
            '    } else {\n' +
            "      const head = document.getElementsByTagName('head')[0];\n" +
            '      if (head) head.appendChild(globalStyle);\n' +
            '    }\n' +
            '  }\n' +
            '}\n';
          // 在文件开头注入全局样式加载代码
          return {
            code: globalStylesCode + code,
            map: null,
          };
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      // 多入口支持
      entry: {
        'ui-kit': resolve(__dirname, 'src/index.ts'),
        'vue/index': resolve(__dirname, 'src/cc/index.ts'),
      },
      name: 'UIKit',
    },
    rollupOptions: {
      // Vue 作为外部依赖
      external: ['vue'],
      output: [
        {
          format: 'es',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'ui-kit') return 'ui-kit.js';
            return '[name].js';
          },
          chunkFileNames: 'chunks/[name]-[hash].js',
          globals: { vue: 'Vue' },
        },
        {
          format: 'cjs',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'ui-kit') return 'ui-kit.cjs';
            return '[name].cjs';
          },
          chunkFileNames: 'chunks/[name]-[hash].cjs',
          globals: { vue: 'Vue' },
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    target: 'es2022',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    cssInjectPlugin(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist/types',
      // 跳过诊断以避免 Vue 文件类型错误
      skipDiagnostics: true,
      // 为 Vue 文件生成类型
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
});
