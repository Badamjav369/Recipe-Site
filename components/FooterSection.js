export class FooterSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <footer>
        <p>Хүссэн жороо аваарай.</p>
        <br>@2025 Copyright
      </footer>
    `;
  }
}
customElements.define('footer-section', FooterSection);