export class FoodsSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <section class="foods-section">
        <section class="food-title">
          <h2>✨7 хоногийн онцлох хоолнууд✨</h2>
          <a>Бүгдийг үзэх &#8594;</a>
        </section>
        <section class="food-info">
          <card-section></card-section>
          <card-section></card-section>
          <card-section></card-section>
        </section>
      </section>
    `;
  }
}
customElements.define('foods-section', FoodsSection);