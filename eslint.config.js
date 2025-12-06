import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default tseslint.config(
  // 忽略的文件/目录
  {
    ignores: ["dist/**", "node_modules/**", "demo-vue/**", "*.config.js"],
  },

  // 基础 JavaScript 推荐配置
  js.configs.recommended,

  // TypeScript 推荐配置
  ...tseslint.configs.recommended,

  // Vue 推荐配置
  ...pluginVue.configs["flat/recommended"],

  // Vue 文件使用 TypeScript 解析器
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 全局配置
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
    },
  },

  // 自定义规则
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    rules: {
      // TypeScript 相关
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // Vue 相关
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/max-attributes-per-line": "off",
      "vue/attributes-order": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/no-mutating-props": "off",
      "vue/require-default-prop": "off",
      "vue/no-use-v-if-with-v-for": "off",

      // 通用规则
      "no-console": "off",
      "no-debugger": "warn",
      "prefer-const": "warn",
    },
  }
);

