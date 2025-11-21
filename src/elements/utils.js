import chroma from "chroma-js";
import { clear } from "../utils/dom-utils.js";
import jsUtils from "../utils/js-utils.js";

const elementUtils = {};
const propertyRegistry = {};

function regeneratePropertyElement(element, config, callback) {
  let savedChildren;
  
  if (config.hasUserContent) {
    let userContentContainer = element.querySelector(".user-content");
    userContentContainer = userContentContainer || element;
    
    if (userContentContainer.children.length) {
      savedChildren = Array.prototype.slice.call(userContentContainer.children, 0);
    }
  }
  
  clear(element);
  const customStyleElement = element.shadowRoot.getElementById("custom-style");

  if (customStyleElement) {
    customStyleElement.remove();
  }

  jsUtils.assignExcept(element, config, [
    "template",
    "style",
    "attrs",
    "value",
    "hasUserContent",
  ]);

  if (config.attrs) {
    const parsedAttrs = element._attrs || {};
    for (const attrName in config.attrs) {
      const attrValue = element.getAttribute(attrName);
      if (attrValue !== null) {
        const parser = config.attrs[attrName];
        parsedAttrs[attrName] = parser(attrValue);
      }
    }
    element._attrs = parsedAttrs;
  }

  if (element._value === undefined) {
    const valueAttr = element.getAttribute("value");
    if (valueAttr !== null) {
      element._value = config.value(valueAttr);
    }
  }
  
  if (config.template) {
    const templateType = typeof config.template;
    if (templateType === "string") {
      element.innerHTML = config.template;
    } else if (templateType === "function") {
      element.innerHTML = config.template(element._attrs);
    }
  }
  
  if (config.hasUserContent && savedChildren) {
    const userContentDiv = document.createElement("div");
    userContentDiv.classList = ["user-content"];

    savedChildren.forEach((child) => {
      userContentDiv.appendChild(child.cloneNode(true));
    });

    element.insertBefore(userContentDiv, element.firstChild);
  }
  
  if (config.style) {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = config.style;
    styleElement.id = "custom-style";
    element.shadowRoot.insertBefore(styleElement, element.shadowRoot.firstChild);
  }
  
  element._propagateDisable();
  element._propagateReadonly();

  if (element.ready) {
    element.ready(savedChildren);
  }

  if (callback) {
    callback();
  }
}

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
    static tagName() {
      return tagName.toUpperCase();
    }
    
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
          const styleElement = document.createElement("style");
          styleElement.type = "text/css";
          styleElement.textContent = style;
          root.insertBefore(styleElement, root.firstChild);
        } else {
          console.warn("Can not use style in light DOM");
        }
      }

      if ($) {
        for (const selectorName in $) {
          if (this[`$${selectorName}`]) {
            console.warn(`Failed to assign selector $${selectorName}, already used`);
          } else {
            this[`$${selectorName}`] = root.querySelector($[selectorName]);
          }
        }
      }
      
      if (listeners) {
        for (const eventName in listeners) {
          if (root) {
            root.addEventListener(
              eventName,
              listeners[eventName].bind(this),
              eventName === "mousewheel" ? { passive: true } : {}
            );
          }

          this.addEventListener(
            eventName,
            listeners[eventName].bind(this),
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

  jsUtils.assignExcept(CustomElement.prototype, config, [
    "shadowDOM",
    "dependencies",
    "factoryImpl",
    "template",
    "style",
    "listeners",
    "behaviors",
    "$",
  ]);

  if (behaviors) {
    behaviors.forEach((behavior) => {
      jsUtils.addon(CustomElement.prototype, behavior);
    });
  }

  window.customElements.define(tagName, CustomElement);
  return CustomElement;
};

elementUtils.registerProperty = (type, config) => {
  propertyRegistry[type] = config;
};

elementUtils.unregisterProperty = (type) => {
  delete propertyRegistry[type];
};

elementUtils.getProperty = (type) => propertyRegistry[type];

elementUtils.regenProperty = (element, callback) => {
  const propertyConfig = propertyRegistry[element._type];
  if (!propertyConfig) {
    console.warn(`Failed to regen property ${element._type}: type not registered.`);
    return undefined;
  }
  
  if (typeof propertyConfig == "string") {
    import(propertyConfig)
      .then((module) => {
        const config = module.default || module;
        try {
          regeneratePropertyElement(element, config, callback);
        } catch (error) {
          console.error(error.stack);
          if (callback) {
            callback(error);
          }
        }
      })
      .catch((error) => {
        console.error(error.stack);
        if (callback) {
          callback(error);
        }
      });

    return undefined;
  }
  
  try {
    regeneratePropertyElement(element, propertyConfig, callback);
  } catch (error) {
    console.error(error.stack);
    if (callback) {
      callback(error);
    }
  }
};

elementUtils.parseString = (value) => value;

elementUtils.parseBoolean = (value) => value !== "false" && value !== null;

elementUtils.parseColor = (value) => chroma(value).rgba();

elementUtils.parseArray = (value) => JSON.parse(value);

elementUtils.parseObject = (value) => JSON.parse(value);

export default elementUtils;
