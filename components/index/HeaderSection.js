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
          <input type="text" placeholder="Хайх..." class="search-input">
          <img class="search-logo" src="images/icon-images/search-logo.svg">
          <button>Нэвтрэх</button>
          <button class="more-search">Дэлгэрэнгүй хайлт</button>
        </section>
      </header>
    `;

    const home = document.querySelector("#home");
    const recipes = document.querySelector("#recipes");
    const recipeInfo = document.querySelector("#recipe");
    const searchInput = this.querySelector(".search-input");

    this.querySelector(".nav-home").onclick = (e) => {
      e.preventDefault();
      home.style.display = "block";
      recipes.style.display = "none";
      recipeInfo.style.display = "none";
    };

    this.querySelector(".nav-recipes").onclick = (e) => {
      e.preventDefault();
      home.style.display = "none";
      recipes.style.display = "block";
      recipeInfo.style.display = "none";
      recipes.loadFoods();
    };

    // SPA хайлт
    searchInput.addEventListener("input", async (e) => {
      const query = e.target.value.toLowerCase();

      const res = await fetch("./data/info.json");
      const foods = await res.json();

      // Нэр эсвэл type-д query байгаа хоолуудыг шүүж авна
      const filtered = foods.filter(f => 
        f.name.toLowerCase().includes(query) || f.type.toLowerCase().includes(query)
      );

      // Нүүр хуудас болон Жорууд дээр харуулах
      home.style.display = "none";
      recipes.style.display = "block";
      recipeInfo.style.display = "none";

      recipes.querySelector(".all-recipes").innerHTML = filtered.map(f => `
        <card-section
          id="${f.id}"
          name="${f.name}"
          type="${f.type}"
          rating="${f.rating}"
          view="${f.view}"
          time="${f.time}"
          portion="${f.portion}"
          cal="${f.cal}"
          image="${f.image}">
        </card-section>
      `).join("");
    });
  }
}

customElements.define("header-section", HeaderSection);
