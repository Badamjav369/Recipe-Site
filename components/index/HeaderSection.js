export class HeaderSection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <a href="#"><img class="logo" src="images/icon-images/logo.png"></a>

        <nav>
          <a class="nav-home" href="#">Нүүр хуудас</a>
          <a class="nav-recipes" href="#">Жорууд</a>
        </nav>

        <section class="nevtreh-search">
          <input type="text" placeholder="Хайх...">
          <img class="search-logo" src="images/icon-images/search-logo.svg">
          <button>Нэвтрэх</button>
          <button class="more-search">Дэлгэрэнгүй хайлт</button>
        </section>
      </header>
    `;

    const home = document.querySelector("#home");
    const recipes = document.querySelector("#recipes");

    this.querySelector(".nav-home").onclick = (e) => {
      e.preventDefault();
      home.style.display = "block";
      recipes.style.display = "none";
    };

    this.querySelector(".nav-recipes").onclick = (e) => {
      e.preventDefault();
      home.style.display = "none";
      recipes.style.display = "block";
      recipes.loadFoods();
    };
  }
}

customElements.define("header-section", HeaderSection);
