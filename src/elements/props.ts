/**
 * UI Props 组件 - 属性生成器注册
 */

import elementUtils from "../utils/utils";

// 注册不同类型的属性生成器
// 这些生成器用于 ui-prop 组件的 regen 方法

// 注册 string 类型
elementUtils.registerProperty("string", (prop: HTMLElement) => {
  const propEl = prop as any;
  const slot = prop.querySelector("slot") || prop;
  
  // 清空现有内容
  while (slot.firstChild) {
    slot.removeChild(slot.firstChild);
  }
  
  // 创建输入框
  const input = document.createElement("ui-input") as any;
  input.value = propEl._value || "";
  
  if (propEl._multiValues) {
    input.multiValues = true;
    input.values = propEl._values;
  }
  
  propEl.inputValue = () => input.value;
  propEl.installStandardEvents(input);
  
  slot.appendChild(input);
});

// 注册 number 类型
elementUtils.registerProperty("number", (prop: HTMLElement) => {
  const propEl = prop as any;
  const slot = prop.querySelector("slot") || prop;
  
  // 清空现有内容
  while (slot.firstChild) {
    slot.removeChild(slot.firstChild);
  }
  
  // 创建数字输入框
  const input = document.createElement("ui-num-input") as any;
  const attrs = propEl._attrs || {};
  
  input.value = propEl._value || 0;
  
  if (attrs.type === "int") {
    input.type = "int";
  }
  
  if (attrs.min !== undefined) {
    input.min = attrs.min;
  }
  
  if (attrs.max !== undefined) {
    input.max = attrs.max;
  }
  
  if (attrs.step !== undefined) {
    input.step = attrs.step;
  }
  
  if (attrs.precision !== undefined) {
    input.precision = attrs.precision;
  }
  
  if (propEl._multiValues) {
    input.multiValues = true;
    input.values = propEl._values;
  }
  
  propEl.inputValue = () => input.value;
  propEl.installStandardEvents(input);
  
  slot.appendChild(input);
});

// 注册 boolean 类型
elementUtils.registerProperty("boolean", (prop: HTMLElement) => {
  const propEl = prop as any;
  const slot = prop.querySelector("slot") || prop;
  
  // 清空现有内容
  while (slot.firstChild) {
    slot.removeChild(slot.firstChild);
  }
  
  // 创建复选框
  const checkbox = document.createElement("ui-checkbox") as any;
  checkbox.checked = propEl._value || false;
  
  if (propEl._multiValues) {
    checkbox.multiValues = true;
    checkbox.values = propEl._values;
  }
  
  propEl.inputValue = () => checkbox.checked;
  propEl.installStandardEvents(checkbox);
  
  slot.appendChild(checkbox);
});

// 注册 color 类型
elementUtils.registerProperty("color", (prop: HTMLElement) => {
  const propEl = prop as any;
  const slot = prop.querySelector("slot") || prop;
  
  // 清空现有内容
  while (slot.firstChild) {
    slot.removeChild(slot.firstChild);
  }
  
  // 创建颜色选择器
  const color = document.createElement("ui-color") as any;
  color.value = propEl._value || [255, 255, 255, 1];
  
  if (propEl._multiValues) {
    color.multiValues = true;
    color.values = propEl._values;
  }
  
  propEl.inputValue = () => color.value;
  propEl.installStandardEvents(color);
  
  slot.appendChild(color);
});

// 注册 enum 类型
elementUtils.registerProperty("enum", (prop: HTMLElement) => {
  const propEl = prop as any;
  const slot = prop.querySelector("slot") || prop;
  
  // 清空现有内容
  while (slot.firstChild) {
    slot.removeChild(slot.firstChild);
  }
  
  // 创建下拉选择器
  const select = document.createElement("ui-select") as any;
  const attrs = propEl._attrs || {};
  const options = attrs.enumList || attrs.options || [];
  
  options.forEach((opt: any) => {
    const option = document.createElement("option");
    if (typeof opt === "object") {
      option.value = opt.value;
      option.text = opt.name || opt.label || opt.value;
    } else {
      option.value = String(opt);
      option.text = String(opt);
    }
    select.appendChild(option);
  });
  
  select.value = propEl._value;
  
  if (propEl._multiValues) {
    select.multiValues = true;
    select.values = propEl._values;
  }
  
  propEl.inputValue = () => select.value;
  propEl.installStandardEvents(select);
  
  slot.appendChild(select);
});

export default {};

