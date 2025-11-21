# UI-Kit

从 Cocos Creator Editor 中提取的 UI 组件库，基于 Web Components 标准。

## 功能特性

- 基于 Web Components 标准，可在任何现代浏览器中使用
- 支持 Shadow DOM，样式隔离
- 支持焦点管理、禁用、只读等行为
- 包含多个常用 UI 组件

## 已包含的组件

- `ui-button` - 按钮组件
- `ui-checkbox` - 复选框组件
- `ui-input` - 输入框组件
- `ui-select` - 下拉选择组件
- `ui-progress` - 进度条组件

## 使用方法

### 在 HTML 中直接使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./dist/ui-kit.js"></script>
</head>
<body>
  <ui-button>点击我</ui-button>
  <ui-checkbox>选项 1</ui-checkbox>
  <ui-input placeholder="请输入..."></ui-input>
  <ui-select>
    <option value="1">选项 1</option>
    <option value="2">选项 2</option>
  </ui-select>
  <ui-progress value="50"></ui-progress>
</body>
</html>
```

### 在 JavaScript 中使用

```javascript
import './ui-kit/src/index.js';

// 创建元素
const button = document.createElement('ui-button');
button.textContent = '动态创建的按钮';
document.body.appendChild(button);

// 监听事件
button.addEventListener('confirm', (e) => {
  console.log('按钮被点击');
});
```

## CSS 加载方式

本项目支持两种 CSS 加载方式：

### 1. 运行时加载（默认）

CSS 文件在运行时通过 `fetch` API 动态加载。这种方式适合开发环境或直接使用源码的场景。

### 2. 编译时注入（推荐用于生产环境）

使用构建工具（如 Vite、Webpack）在编译时将 CSS 内容直接注入到 JavaScript 中，可以：
- 减少运行时请求
- 提高性能
- 支持代码分割和 tree-shaking

#### 使用 Vite 进行编译时注入

创建 `vite.config.js`：

```javascript
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'css-inject',
      transform(code, id) {
        // 将 CSS 文件导入转换为字符串
        if (id.endsWith('.css')) {
          const cssContent = readFileSync(id, 'utf-8');
          return `export default ${JSON.stringify(cssContent)};`;
        }
      },
      resolveId(id) {
        // 处理 theme:// 协议的导入
        if (id.startsWith('theme://')) {
          const path = id.replace('theme://elements/', 'src/themes/default/elements/');
          return resolve(path + '.css');
        }
      }
    }
  ]
});
```

然后修改 `src/utils/css-loader.js`，在构建时直接导入 CSS：

```javascript
// 编译时导入（如果使用构建工具）
let compiledStyles = {};
try {
  // 构建工具会将这些替换为实际的 CSS 内容
  compiledStyles.button = import('../../themes/default/elements/button.css?raw');
  compiledStyles.checkbox = import('../../themes/default/elements/checkbox.css?raw');
  // ... 其他样式
} catch (e) {
  // 运行时回退
}

export function getElementStyleSync(elementName, themeName = 'default') {
  // 优先使用编译时的样式
  if (compiledStyles[elementName]) {
    return compiledStyles[elementName];
  }
  // 回退到运行时加载
  return styleCache.get(`${themeName}/${elementName}`) || '';
}
```

#### 使用 Webpack 进行编译时注入

在 `webpack.config.js` 中使用 `raw-loader` 或 `css-loader`：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['raw-loader'] // 将 CSS 作为字符串导入
      }
    ]
  }
};
```

## 构建

使用现代打包工具（如 Vite、Webpack、Rollup）进行构建：

```bash
# 使用 Vite
npm install -D vite
vite build

# 使用 Rollup
npm install -D rollup
rollup -c
```

## API

### ui-button

属性：
- `disabled` - 禁用按钮
- `focused` - 是否获得焦点

事件：
- `confirm` - 点击时触发

### ui-checkbox

属性：
- `checked` - 是否选中
- `value` - 值（等同于 checked）
- `disabled` - 禁用
- `readonly` - 只读

事件：
- `change` - 值改变时触发
- `confirm` - 确认时触发

### ui-input

属性：
- `value` - 输入值
- `placeholder` - 占位符
- `password` - 是否为密码输入
- `max-length` - 最大长度
- `disabled` - 禁用
- `readonly` - 只读

事件：
- `change` - 值改变时触发
- `confirm` - 确认时触发（Enter 键）
- `cancel` - 取消时触发（Esc 键）

### ui-select

属性：
- `value` - 选中的值
- `selectedIndex` - 选中的索引
- `disabled` - 禁用
- `readonly` - 只读

事件：
- `change` - 值改变时触发
- `confirm` - 确认时触发

### ui-progress

属性：
- `value` - 进度值（0-100）

## 开发

所有源代码位于 `src/` 目录：

- `src/utils/` - 工具函数
- `src/behaviors/` - 行为混入
- `src/elements/` - UI 组件
- `src/styles/` - 样式文件

## 许可证

MIT
