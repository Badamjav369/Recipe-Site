export class CardSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const name = this.getAttribute("name") ?? "-";
    const type = this.getAttribute("type") ?? "-";
    const rating = Number(this.getAttribute("rating") ?? 0).toFixed(1);
    const time = this.getAttribute("time") ?? "-";
    const portion = this.getAttribute("portion") ?? "-";
    const cal = this.getAttribute("cal") ?? "-";
    const view = this.getAttribute("view") ?? 0;
    const image = this.getAttribute("image") ?? "images/food-images/default.jpg";

    this.innerHTML = `
    <article class="cards">
        <img class="food-image" src="${image}" alt="food-images">
        <section class="type-rate">
            <h4>${type}</h4>
            <article class="rate">
                <img src="images/food.svg" alt="food-image">
                <p>
                    ${rating}
                    <span>(${view})</span>
                </p>
            </article>
        </section>
        <h3 class="food-name">${name}</h3>
        <section class="time-member-kalore">
            <section>
                <img src="images/time.svg" alt="time-icon">
                <span>${time} мин</span>
            </section>
            <section>
                <img src="images/people.svg" alt="people-icon">
                <span>${portion}</span>
            </section>
            <section>
                <img src="images/calore.svg" alt="calore-icon">
                <span>${cal} ккал</span>
            </section>
        </section>
    </article>
    `;
  }
}
customElements.define('card-section', CardSection);
