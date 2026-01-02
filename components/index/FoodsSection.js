export class FoodsSection extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const result = await fetch("./data/info.json");
    const data = await result.json();
    const title = this.getAttribute("title") ?? "Онцлох хоолнууд";
    const category = this.getAttribute("category") ?? null;

    const filteredData = category 
      ? data.filter(f => f.category === category).slice(0, 4)
      : data.slice(0, 4);

    this.innerHTML = `
      <section class="foods-section">
        <section class="food-title">
          <h2>${title}</h2>
          <a>Бүгдийг үзэх &#8594;</a>
        </section>
        <section class="food-info">
          ${
            filteredData.map(f => 
              `<card-section 
                 <card-section 
                  name="${f.name}"
                  type="${f.type}"
                  rating="${f.rating}"
                  view="${f.view}"
                  time="${f.time}"
                  portion="${f.portion}"
                  cal="${f.cal}"
                  image="${f.image}">
                </card-section>
               </card-section>`
            ).join('')
          }
        </section>
      </section>
    `;
  }
}
customElements.define('foods-section', FoodsSection);
