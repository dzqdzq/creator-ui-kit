import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { globSync } from 'glob';

function resolveThemeUrlBuild(themeUrl, themeName) {
  const path = themeUrl.replace(/^theme:\/\//, '');
  return resolve(__dirname, `src/themes/${themeName}/${path}`);
}

function processImportsBuild(css, themeName) {
  const importRegex = /@import\s+url\(['"]?(theme:\/\/[^'"]+)['"]?\);?/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(css)) !== null) {
    const themeUrl = match[1];
    if (!imports.includes(themeUrl)) {
      imports.push(themeUrl);
    }
  }
  
  for (const themeUrl of imports) {
    try {
      const filePath = resolveThemeUrlBuild(themeUrl, themeName);
      const importedCss = readFileSync(filePath, 'utf-8');
      const processedCss = processThemeUrlsBuild(importedCss, themeName);
      const importPattern = new RegExp(`@import\\s+url\\(['"]?${themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\);?`, 'g');
      css = css.replace(importPattern, processedCss);
    } catch (error) {
      console.warn(`Failed to load imported resource: ${themeUrl}`, error);
      const importPattern = new RegExp(`@import\\s+url\\(['"]?${themeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\);?\\s*`, 'g');
      css = css.replace(importPattern, '');
    }
  }
  
  return css;
}

function processThemeUrlsBuild(css, themeName) {
  const urlRegex = /url\(['"]?(theme:\/\/[^'"]+)['"]?\)/g;
  let match;
  const urls = [];
  
  while ((match = urlRegex.exec(css)) !== null) {
    const beforeMatch = css.substring(Math.max(0, match.index - 50), match.index);
    if (!beforeMatch.match(/@import\s+url\s*$/)) {
      const themeUrl = match[1];
      if (!urls.includes(themeUrl)) {
        urls.push(themeUrl);
      }
    }
  }
  
  return css;
}

function cssInjectPlugin() {
  return {
    name: 'css-inject',
    transform(code, id) {
      if (id.endsWith('css-loader.js')) {
        const cssFiles = globSync('src/themes/default/elements/*.css');
        const cssMap = {};
        const themeName = 'default';
        
        cssFiles.forEach(file => {
          const elementName = file.match(/elements\/(.+)\.css$/)?.[1];
          if (elementName) {
            try {
              let cssContent = readFileSync(file, 'utf-8');
              cssContent = processImportsBuild(cssContent, themeName);
              cssMap[elementName] = cssContent;
            } catch (e) {
              console.warn(`Failed to read CSS file: ${file}`, e);
            }
          }
        });
        
        const injectedCode = `const __COMPILED_STYLES__ = ${JSON.stringify(cssMap, null, 2)};
${code}`;
        
        return {
          code: injectedCode,
          map: null
        };
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
      external: ['chroma-js'],
      output: {
        globals: {
          'chroma-js': 'chroma'
        },
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

