export class MainSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <main>
      <foods-section></foods-section>
      <foods-section></foods-section>
      <foods-section></foods-section>
    </main>
    `;
  }
}
customElements.define('main-section', MainSection);