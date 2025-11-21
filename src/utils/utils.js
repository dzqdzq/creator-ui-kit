// 元素注册工具
import jsUtils from "./js-utils.js";

const elementUtils = {};

elementUtils.registerElement = (tagName, config) => {
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
    static get observedAttributes() {
      return observedAttributes;
    }

    constructor(...args) {
      super();
      let root = this;

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
          // 确保样式插入到最前面
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
          if (this[`$${name}`]) {
            console.warn(`Failed to assign selector $${name}, already used`);
          } else {
            this[`$${name}`] = root.querySelector($[name]);
          }
        }
      }

      if (listeners) {
        for (const eventName in listeners) {
          const handler = listeners[eventName].bind(this);
          if (root) {
            root.addEventListener(
              eventName,
              handler,
              eventName === "mousewheel" ? { passive: true } : {}
            );
          }
          this.addEventListener(
            eventName,
            handler,
            eventName === "mousewheel" ? { passive: true } : {}
          );
        }
      }

      if (factoryImpl && args.length > 0) {
        factoryImpl.apply(this, args);
      }

      if (this.ready) {
        this.ready();
      }
    }
  }

  // 将配置中的其他属性复制到原型
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

  // 应用 behaviors
  if (behaviors) {
    behaviors.forEach((behavior) => {
      jsUtils.assign(CustomElement.prototype, behavior);
    });
  }

  // 注册自定义元素
  window.customElements.define(tagName, CustomElement);
  return CustomElement;
};

export default elementUtils;
