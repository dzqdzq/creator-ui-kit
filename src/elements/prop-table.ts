/**
 * UI Prop Table 组件
 */

import elementUtils from '../utils/utils';
import { getElementStyleSync } from '../utils/css-loader';

const template = /*html*/ `
    <slot></slot>
  `;

export default elementUtils.registerElement('ui-prop-table', {
  template,
  style: getElementStyleSync('prop-table'),

  ready(): void {
    // 属性表格初始化
  },
});
