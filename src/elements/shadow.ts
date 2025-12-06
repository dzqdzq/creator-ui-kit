/**
 * UI Shadow 组件
 */

import elementUtils from '../utils/utils';

const template = /*html*/ '';

export default elementUtils.registerElement('ui-shadow', {
  style: `
    :host {
      display: block;
    }
  `,
  template,

  factoryImpl(content: string): void {
    this.shadowRoot!.innerHTML = content;
  },

  ready(): void {
    while (this.childNodes.length) {
      const child = this.childNodes[0];
      this.shadowRoot!.appendChild(child);
    }
  },
});
