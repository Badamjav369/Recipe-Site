export class FoodsSection extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const result = await fetch("./info.json");
    const data= await result.json();
    this.innerHTML = `
      <section class="foods-section">
            <section class="food-title">
                <h2>✨7 хоногийн онцлох хоолнууд✨</h2>
                <a>Бүгдийг үзэх &#8594;</a>
            </section>
            <section class="food-info">
            ${
              data.map(f=>`<card-section fname="${f.name}"></card-section>`).join('')
            }
            </section>
        </section>
    `;
  }
}
customElements.define('foods-section', FoodsSection);