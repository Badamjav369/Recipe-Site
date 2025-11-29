export class HeaderSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <header>
        <a href="home.html"><img class="logo" src="images/logo.png" alt="logo"></a>
        <nav>
            <a class="home-nav" href="index.html">Нүүр хуудас</a>
            <a href="recipes.html">Жорууд</a>
        </nav>
        <section class="nevtreh-search">
            <input type="text" placeholder="Хайх...">
            <img class="search-logo" src="images/search-logo.svg" alt="searching logo">
            <button>Нэвтрэх</button>
            <button class="more-search">Дэлгэрэнгүй хайлт</button>
        </section>
    </header>
    `;
  }
}

customElements.define('header-section', HeaderSection);
