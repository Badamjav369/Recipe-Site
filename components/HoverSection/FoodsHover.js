export class FoodsHover extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = {}
  }
}
customElements.define('foods-hover', FoodsHover);