export class MainSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <main>
      <foods-section title="✨7 хоногийн онцлох хоолнууд✨" category="weekly"></foods-section>
      <foods-section title="🥢Ази хоолнууд🥢" category="asian"></foods-section>
      <foods-section title="🏆Хамгийн их үзэлттэй хоолнууд🏆" category="popular"></foods-section>
    </main>
    `;
  }
}
customElements.define('main-section', MainSection);