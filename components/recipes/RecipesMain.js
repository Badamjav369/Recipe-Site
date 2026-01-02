export class RecipesMain extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const resCat = await fetch("./data/categories-info.json");
    const categories = await resCat.json();

    this.innerHTML = `
      <main class="main-recipes">
        <section class="category">
          <h2>Ангилалууд</h2>
          ${categories.map(c => `<a href="#">${c}</a>`).join("")}
        </section>

        <section class="selected-cat">
          <h2>Бүх хоол</h2>
          <section class="all-recipes"></section>
        </section>
      </main>
    `;

    this.loadFoods();

    this.querySelectorAll(".category a").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const selected = e.target.textContent;
        this.querySelector(".selected-cat h2").textContent = selected;
        this.loadFoods(selected);
      });
    });
  }

  async loadFoods(selectedCategory = "Бүх хоол") {
    const res = await fetch("./data/info.json");
    const foods = await res.json();

    let filteredFoods = foods;

    if (selectedCategory !== "Бүх хоол") {
      filteredFoods = foods.filter(f => f.type === selectedCategory);
    }

    this.querySelector(".all-recipes").innerHTML =
      filteredFoods.map(f => `
        <card-section
          name="${f.name}"
          type="${f.type}"
          rating="${f.rating}"
          views="${f.view}"
          time="${f.time}"
          portion="${f.portion}"
          cal="${f.cal}"
          image="${f.image}">
        </card-section>
      `).join("");
  }
}

customElements.define("recipes-main", RecipesMain);