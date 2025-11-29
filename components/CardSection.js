export class CardSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <article class="cards">
        <img class="food-image" src="images/food-images/burger.jpg" alt="image">
        <h4>Хоолны төрөл</h4>
        <h3>Хоолны нэр</h3>
        <span class="rate">⭐⭐⭐⭐⭐4.5</span>
    </article>
    `;
  }
}
customElements.define('card-section', CardSection);