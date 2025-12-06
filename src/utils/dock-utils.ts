/**
 * Dock 工具函数
 */

// resizer 元素的间距
export const resizerSpace = 4;

/**
 * 检查元素是否是 resizer
 */
export function isResizer(element: Element): boolean {
  return element.tagName?.toLowerCase() === 'ui-dock-resizer';
}

/**
 * 保存布局（占位符，实际实现可能需要持久化）
 */
export function saveLayout(): void {
  // 这里可以实现布局保存逻辑
  // 例如保存到 localStorage 或发送到服务器
}

/**
 * 加载布局（占位符）
 */
export function loadLayout(): void {
  // 加载布局
}

const dockUtils = {
  resizerSpace,
  isResizer,
  saveLayout,
  loadLayout,
};

export default dockUtils;
