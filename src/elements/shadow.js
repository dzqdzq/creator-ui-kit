import elementUtils from "./utils.js";

export default elementUtils.registerElement("ui-shadow", {
  style: "\n    :host {\n      display: block;\n    }\n  ",
  template: "",
  factoryImpl(t) {
    this.shadowRoot.innerHTML = t;
  },
  ready() {
    while (this.childNodes.length) {
      let t = this.childNodes[0];
      this.shadowRoot.appendChild(t);
    }
  },
});
