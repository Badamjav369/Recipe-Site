export class CardSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const ner = this.getAttribute("fname") ?? "-";
    this.innerHTML = `
    <article class="cards">
        <img class="food-image" src="images/food-images/huushuur.jpg" alt="food-images">
        <section class="type-rate">
            <h4>Ази хоол</h4>
            <article class="rate">
                <img src="images/food.svg" alt="food-image">
                <p>
                    4.5 
                    <span>(50k)</span>
                </p>
            </article>
        </section>
        <h3 class="food-name">${ner}</h3>
        <section class="time-member-kalore">
            <section>
                <img src="images/time.svg" alt="time-icon">
                <span>30 мин</span>
            </section>
            <section>
                <img src="images/people.svg" alt="people-icon">
                <span>2-3</span>
            </section>
            <section>
                <img src="images/calore.svg" alt="calore-icon">
                <span>250 ккал</span>
            </section>
        </section>
    </article>
    `;
  }
}
customElements.define('card-section', CardSection);