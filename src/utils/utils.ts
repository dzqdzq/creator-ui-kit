/**
 * 元素工具函数
 */

import jsUtils from "./js-utils";
import type { ElementConfig, Behavior } from '../types';

// 用于存储属性生成器
const propertyGenerators: Map<string, (prop: HTMLElement, regenerate?: boolean) => void> = new Map();

interface ElementUtils {
  registerElement<T extends HTMLElement>(tagName: string, config: ElementConfig): { new (...args: any[]): T };
  registerProperty(type: string, generator: (prop: HTMLElement, regenerate?: boolean) => void): void;
  regenProperty(prop: HTMLElement, regenerate?: boolean): void;
}

const elementUtils: ElementUtils = {
  registerElement<T extends HTMLElement>(tagName: string, config: ElementConfig): { new (...args: any[]): T } {
    const {
      template,
      style,
      listeners,
      behaviors,
      $,
      factoryImpl,
    } = config;

    const observedAttributes = config.observedAttributes || [];
    const useShadowDOM = config.shadowDOM !== undefined ? !!config.shadowDOM : true;

    class CustomElement extends HTMLElement {
      static get observedAttributes(): string[] {
        return observedAttributes;
      }

      // 动态属性
      [key: string]: any;

      constructor(...args: any[]) {
        super();
        let root: HTMLElement | ShadowRoot = this;

        if (useShadowDOM) {
          root = this.attachShadow({ mode: "open" });
        }

        if (template) {
          root.innerHTML = template;
        }

        if (style) {
          if (useShadowDOM) {
            const styleEl = document.createElement("style");
            styleEl.type = "text/css";
            styleEl.textContent = style;
            if (root.firstChild) {
              root.insertBefore(styleEl, root.firstChild);
            } else {
              root.appendChild(styleEl);
            }
          } else {
            console.warn("Can not use style in light DOM");
          }
        }

        if ($) {
          for (const name in $) {
            const propName = `$${name}`;
            if ((this as any)[propName]) {
              console.warn(`Failed to assign selector $${name}, already used`);
            } else {
              (this as any)[propName] = root.querySelector($[name]);
            }
          }
        }

        if (listeners) {
          for (const eventName in listeners) {
            const handler = listeners[eventName].bind(this);
            const options = eventName === "mousewheel" ? { passive: true } : {};
            if (root !== this) {
              root.addEventListener(eventName, handler, options);
            }
            this.addEventListener(eventName, handler, options);
          }
        }

        if (factoryImpl && args.length > 0) {
          factoryImpl.apply(this, args);
        }

        if ((this as any).ready) {
          (this as any).ready();
        }
      }
    }

    jsUtils.assignExcept(
      CustomElement.prototype,
      config,
      [
        "shadowDOM",
        "dependencies",
        "factoryImpl",
        "template",
        "style",
        "listeners",
        "behaviors",
        "$",
      ]
    );

    if (behaviors) {
      behaviors.forEach((behavior: Behavior) => {
        jsUtils.assign(CustomElement.prototype, behavior);
      });
    }

    window.customElements.define(tagName, CustomElement);
    return CustomElement as any;
  },

  /**
   * 注册属性生成器
   */
  registerProperty(type: string, generator: (prop: HTMLElement, regenerate?: boolean) => void): void {
    propertyGenerators.set(type, generator);
  },

  /**
   * 重新生成属性
   */
  regenProperty(prop: HTMLElement, regenerate?: boolean): void {
    const type = (prop as any)._type || (prop as any).type;
    if (type && propertyGenerators.has(type)) {
      const generator = propertyGenerators.get(type)!;
      generator(prop, regenerate);
    }
  },
};

export default elementUtils;

