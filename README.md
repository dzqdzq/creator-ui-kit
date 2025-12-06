# Creator UI Kit

<p align="center">
  <strong>从 Cocos Creator Editor 提取的 UI 组件库</strong>
</p>

<p align="center">
  基于 Web Components 标准 | Vue 3 组件支持 | TypeScript 类型定义
</p>

<p align="center">
  <a href="#安装">安装</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#组件列表">组件列表</a> •
  <a href="#api-文档">API 文档</a> •
  <a href="#主题定制">主题定制</a>
</p>

---

## ✨ 功能特性

- 🎨 **Web Components** - 基于原生标准，可在任何框架中使用
- 🖼️ **Vue 3 支持** - 提供 Cocos Creator 编辑器组件的 Vue 3 封装
- 📦 **按需导入** - 支持 Tree-shaking，只打包你使用的组件
- 🔒 **样式隔离** - Shadow DOM 保证样式不会污染全局
- 📘 **TypeScript** - 完整的类型定义支持
- 🎯 **专业设计** - 来自 Cocos Creator 编辑器的成熟 UI 设计

---

## 📦 安装

```bash
# npm
npm install @aspect/creator-ui-kit

# yarn
yarn add @aspect/creator-ui-kit

# pnpm
pnpm add @aspect/creator-ui-kit
```

---

## 🚀 快速开始

### 方式一：全量导入 Web Components

```javascript
// 导入即自动注册所有 UI 组件
import '@aspect/creator-ui-kit';

// 直接在 HTML 中使用
document.body.innerHTML = `
  <ui-button>点击我</ui-button>
  <ui-input placeholder="请输入内容"></ui-input>
`;
```

### 方式二：在 Vue 3 中使用 Cocos 组件

```vue
<script setup>
import { CcButton, CcLabel, CcSprite } from '@aspect/creator-ui-kit/vue';

const target = {
  string: { value: 'Hello World' },
  // ... 其他属性
};
</script>

<template>
  <CcLabel :target="target" />
  <CcButton :target="buttonTarget" />
</template>
```

### 方式三：在 HTML 中直接使用（CDN）

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@aspect/creator-ui-kit/dist/ui-kit.js"></script>
</head>
<body>
  <ui-button>按钮</ui-button>
  <ui-checkbox>复选框</ui-checkbox>
  <ui-input value="输入框"></ui-input>
  <ui-progress value="50"></ui-progress>
</body>
</html>
```

---

## 📚 组件列表

### Web Components（基础 UI 组件）

| 组件 | 标签名 | 描述 |
|------|--------|------|
| Button | `<ui-button>` | 按钮组件 |
| Checkbox | `<ui-checkbox>` | 复选框组件 |
| Input | `<ui-input>` | 输入框组件 |
| Select | `<ui-select>` | 下拉选择组件 |
| NumInput | `<ui-num-input>` | 数字输入框 |
| Slider | `<ui-slider>` | 滑动条组件 |
| Progress | `<ui-progress>` | 进度条组件 |
| Color | `<ui-color>` | 颜色选择器 |
| ColorPicker | `<ui-color-picker>` | 完整颜色选择面板 |
| Section | `<ui-section>` | 可折叠区域 |
| Prop | `<ui-prop>` | 属性行组件 |
| TextArea | `<ui-text-area>` | 多行文本输入 |

### Vue 3 组件（Cocos Creator 编辑器组件）

| 组件 | 描述 |
|------|------|
| `CcLabel` | 文本标签属性面板 |
| `CcSprite` | 精灵图属性面板 |
| `CcButton` | 按钮组件属性面板 |
| `CcScrollView` | 滚动视图属性面板 |
| `CcWidget` | Widget 布局属性面板 |
| `CcLayout` | Layout 布局属性面板 |
| `CcCamera` | 相机属性面板 |
| ... | 更多组件 |

---

## 📖 API 文档

### ui-button

```html
<ui-button disabled>禁用按钮</ui-button>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `disabled` | `boolean` | `false` | 是否禁用 |
| `focused` | `boolean` | `false` | 是否聚焦 |

| 事件 | 描述 |
|------|------|
| `confirm` | 点击时触发 |

### ui-input

```html
<ui-input value="初始值" placeholder="请输入..." max-length="100"></ui-input>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `value` | `string` | `''` | 输入值 |
| `placeholder` | `string` | `''` | 占位符 |
| `password` | `boolean` | `false` | 是否为密码模式 |
| `max-length` | `number` | `-1` | 最大长度 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |

| 事件 | 描述 |
|------|------|
| `change` | 值改变时触发 |
| `confirm` | 按下 Enter 时触发 |
| `cancel` | 按下 Esc 时触发 |

### ui-num-input

```html
<ui-num-input value="50" min="0" max="100" step="1"></ui-num-input>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `value` | `number` | `0` | 数值 |
| `min` | `number` | `-Infinity` | 最小值 |
| `max` | `number` | `Infinity` | 最大值 |
| `step` | `number` | `1` | 步长 |
| `precision` | `number` | `auto` | 精度（小数位数） |

### ui-select

```html
<ui-select value="option1">
  <option value="option1">选项 1</option>
  <option value="option2">选项 2</option>
</ui-select>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `value` | `string` | `''` | 选中的值 |
| `selectedIndex` | `number` | `0` | 选中的索引 |

### ui-checkbox

```html
<ui-checkbox checked>已选中</ui-checkbox>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `checked` | `boolean` | `false` | 是否选中 |
| `value` | `boolean` | `false` | 同 checked |

### ui-slider

```html
<ui-slider value="50" min="0" max="100"></ui-slider>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `value` | `number` | `0` | 当前值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长 |

### ui-progress

```html
<ui-progress value="75"></ui-progress>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `value` | `number` | `0` | 进度值（0-100） |

### ui-section

```html
<ui-section name="基本属性" foldable>
  <ui-prop name="Name">
    <ui-input slot="content" value="Node"></ui-input>
  </ui-prop>
</ui-section>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `name` | `string` | `''` | 区域标题 |
| `folded` | `boolean` | `false` | 是否折叠 |
| `foldable` | `boolean` | `true` | 是否可折叠 |

---

## 🎨 主题定制

组件使用 CSS 变量进行主题定制，你可以覆盖以下变量：

```css
:root {
  /* 主题色 */
  --color-primary: #4a90e2;
  --color-primary-hover: #5a9ff2;
  
  /* 背景色 */
  --color-bg-primary: #2a2a2a;
  --color-bg-secondary: #333333;
  
  /* 文本色 */
  --color-text-primary: #cccccc;
  --color-text-secondary: #888888;
  
  /* 边框 */
  --border-radius: 3px;
  --border-color: #444444;
  
  /* 间距 */
  --spacing-xs: 2px;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 16px;
}
```

---

## 📝 在 JavaScript/TypeScript 中使用

```typescript
import '@aspect/creator-ui-kit';

// 创建组件
const button = document.createElement('ui-button');
button.textContent = '动态按钮';
button.addEventListener('confirm', () => {
  console.log('按钮被点击');
});
document.body.appendChild(button);

// 操作数字输入
const numInput = document.querySelector<UINumInput>('ui-num-input');
numInput.value = 50;
numInput.min = 0;
numInput.max = 100;
```

---

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务
pnpm run demo      # Web Components 演示
pnpm run demo:vue  # Vue 组件演示

# 构建
pnpm run build

# 类型检查
pnpm run build:types
```

### 目录结构

```
src/
├── elements/       # Web Components 组件
├── cc/             # Vue 3 Cocos 组件
├── behaviors/      # 行为混入
├── utils/          # 工具函数
└── themes/         # 主题样式
    └── default/
        ├── elements/   # 组件样式
        ├── globals/    # 全局样式
        └── font/       # 图标字体
```

---

## 📄 许可证

[MIT](./LICENSE) © Cocos Creator Team

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
