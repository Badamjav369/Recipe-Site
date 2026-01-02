export class RecipesMain extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
      <main class="main-recipes">
        <section class="category">
          <h2>Ангилалууд</h2>
        </section>

        <section class="selected-cat">
          <h2>Бүх хоол</h2>
          <section class="all-recipes"></section>
        </section>
      </main>
    `;

    const catRes = await fetch("./data/categories-info.json");
    const categories = await catRes.json();

    const catBox = this.querySelector(".category");

    categories.forEach(cat => {
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = cat;
      a.onclick = (e) => {
        e.preventDefault();
        this.querySelector(".selected-cat h2").textContent = cat;
        this.loadFoods(cat);
      };
      catBox.appendChild(a);
    });

    this.loadFoods();
  }

  async loadFoods(category = "Бүх хоол") {
    const res = await fetch("./data/info.json");
    let foods = await res.json();

    if (category !== "Бүх хоол") {
      foods = foods.filter(f => f.type === category);
    }

    this.querySelector(".all-recipes").innerHTML = foods.map(f => `
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
