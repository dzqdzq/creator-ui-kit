/**
 * UI Webview 组件
 */

import elementUtils from "../utils/utils";
import focusableBehavior from "../behaviors/focusable";

const template = /*html*/ `
    <webview id="view"
      nodeintegration
      disablewebsecurity
      autosize="on"
    ></webview>
    <ui-loader id="loader">Loading</ui-loader>
    <div id="dropArea" class="fit" hidden></div>
  `;

interface WebviewElement extends HTMLElement {
  src?: string;
  reloadIgnoringCache?(): void;
  openDevTools?(): void;
}

export default elementUtils.registerElement("ui-webview", {
  get src(): string | null {
    return this.getAttribute("src");
  },

  set src(value: string | null) {
    if (value) {
      this.setAttribute("src", value);
      (this.$view as WebviewElement).src = value;
      this.$loader.hidden = false;
    }
  },

  behaviors: [focusableBehavior],
  style: `
    :host {
      display: block;
      position: relative;
      min-width: 100px;
      min-height: 100px;
    }

    .wrapper {
      background: #333;
    }

    .fit {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    [hidden] {
      display: none;
    }
  `,
  template,
  $: { view: "#view", loader: "#loader", dropArea: "#dropArea" },

  ready(): void {
    let src = this.getAttribute("src");

    if (src === null) {
      src = "about:blank";
    }

    this.src = src;
    this._initFocusable(this);
    this._initEvents();
  },

  _initEvents(): void {
    this.$view.addEventListener("console-message", () => {});

    this.$view.addEventListener("did-finish-load", () => {
      this.$loader.hidden = true;
    });
  },

  reload(): void {
    this.$loader.hidden = false;
    (this.$view as WebviewElement).reloadIgnoringCache?.();
  },

  openDevTools(): void {
    (this.$view as WebviewElement).openDevTools?.();
  },
});

