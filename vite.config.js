import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { globSync } from 'glob';

// Vite 插件：在构建时注入 CSS 内容到 css-loader.js
function cssInjectPlugin() {
  return {
    name: 'css-inject',
    transform(code, id) {
      // 只处理 css-loader.js 文件
      if (id.endsWith('css-loader.js')) {
        // 获取所有 CSS 文件
        const cssFiles = globSync('src/themes/default/elements/*.css');
        const cssMap = {};
        
        cssFiles.forEach(file => {
          const elementName = file.match(/elements\/(.+)\.css$/)?.[1];
          if (elementName) {
            try {
              const cssContent = readFileSync(file, 'utf-8');
              cssMap[elementName] = cssContent;
            } catch (e) {
              console.warn(`Failed to read CSS file: ${file}`, e);
            }
          }
        });
        
        // 在文件开头注入编译时的样式
        const injectedCode = `// 编译时注入的样式（由 Vite 插件生成）
const __COMPILED_STYLES__ = ${JSON.stringify(cssMap, null, 2)};
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
      // 将 chroma-js 设为外部依赖，不打包进库中
      external: ['chroma-js'],
      output: {
        // 为外部依赖提供全局变量名（虽然我们使用 ES 模块，但保留此配置）
        globals: {
          'chroma-js': 'chroma'
        },
        // 内联所有依赖，确保所有代码在一个文件中
        inlineDynamicImports: true
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    // 确保 CSS 文件被正确处理
    cssCodeSplit: false,
    // 支持 top-level await
    target: 'es2022'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [cssInjectPlugin()]
});

