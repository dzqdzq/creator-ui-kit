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
    behaviors.forEach((behavior) => {
      jsUtils.assign(CustomElement.prototype, behavior);
    });
  }

  window.customElements.define(tagName, CustomElement);
  return CustomElement;
};

export default elementUtils;
