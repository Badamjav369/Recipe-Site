export class RecipesInfo extends HTMLElement {
  constructor() {
    super();
    this.recipeId = null;
    this.recipe = null;
    this.details = null;
    this.similarFoods = [];
  }

  connectedCallback() {
    this.innerHTML = `<main class="recipes"></main>`;
  }

  async loadRecipeData(id) {
    try {
      const [infoRes, detailsRes] = await Promise.all([
        fetch("./data/info.json"),
        fetch("./data/recipes-details.json")
      ]);

      if (!infoRes.ok || !detailsRes.ok) {
        throw new Error('Өгөгдөл татахад алдаа гарлаа');
      }

      const infoData = await infoRes.json();
      const detailsData = await detailsRes.json();

      return { infoData, detailsData };
      
    } catch (error) {
      console.error('Recipe өгөгдөл ачааллахад алдаа:', error);
      throw error;
    }
  }

  findRecipe(data, id) {
    return data.find(r => r.id === id);
  }

  findSimilarFoods(allFoods, currentRecipe) {
    return allFoods
      .filter(f => f.type === currentRecipe.type && f.id !== currentRecipe.id)
      .sort((a, b) => this.parseView(b.view) - this.parseView(a.view))
      .slice(0, 4);
  }

  parseView(view) {
    if (typeof view === "string") {
      const cleaned = view.toLowerCase().trim();
      if (cleaned.endsWith("k")) {
        return parseFloat(cleaned) * 1000;
      }
    }
    return Number(view) || 0;
  }

  createIngredientsHTML(ingredients) {
    if (!ingredients || ingredients.length === 0) {
      return "<li>Орц мэдээлэл байхгүй</li>";
    }
    return ingredients.map(i => `<li>${i}</li>`).join("");
  }

  createStepsHTML(steps) {
    if (!steps || steps.length === 0) {
      return "<li>Хийх дараалал мэдээлэл байхгүй</li>";
    }
    return steps.map(s => `<li>${s}</li>`).join("");
  }

  createExtraHTML(extra) {
    if (!extra || extra.length === 0) {
      return "<p>Нэмэлт мэдээлэл байхгүй</p>";
    }
    return extra.map(e => `<p>${e}</p>`).join("");
  }

  createImageHTML(recipe) {
    return `
      <img class="food-images" src="${recipe.image}" alt="${recipe.name}">
    `;
  }

  createIngredientsSection(ingredients) {
    return `
      <article class="ingredients">
        <h2>Орц</h2>
        <ol>${ingredients}</ol>
      </article>
    `;
  }

  createRecipeDetailHTML(recipe, extra, username) {
    return `
      <section class="recipe-detail">
        <h2 class="food-name">${recipe.name}</h2>
        <p class="food-detail-info">${extra}</p>
        <p class="user-name">~${username}</p>
        <section class="buttons">
          <button class="save">❤️Хадгалах</button>
          <button class="rate">⭐Үнэлгээ өгөх</button>
        </section>
      </section>
    `;
  }

  createStepsSection(steps) {
    return `
      <article class="steps">
        <h2>Хийх дараалал</h2>
        <ol>${steps}</ol>
      </article>
    `;
  }

  createSimilarFoodCard(food) {
    return `
      <card-section
        id="${food.id}"
        name="${food.name}"
        type="${food.type}"
        rating="${food.rating}"
        view="${food.view}"
        time="${food.time}"
        portion="${food.portion}"
        cal="${food.cal}"
        image="${food.image}">
      </card-section>
    `;
  }

  createSimilarFoodsHTML(similarFoods) {
    if (similarFoods.length === 0) {
      return "<p>Ойролцоо хоол олдсонгүй</p>";
    }
    return similarFoods.map(f => this.createSimilarFoodCard(f)).join("");
  }

  createRecipeHTML(recipe, details, similarFoods) {
    const ingredientsHTML = this.createIngredientsHTML(details?.ingredients);
    const stepsHTML = this.createStepsHTML(details?.steps);
    const extraHTML = this.createExtraHTML(details?.extra);
    const username = details?.username ?? "Хэрэглэгч";
    const similarHTML = this.createSimilarFoodsHTML(similarFoods);

    return `
      <main class="recipes">
        <section class="recipe-information">
          <aside>
            ${this.createImageHTML(recipe)}
            ${this.createIngredientsSection(ingredientsHTML)}
          </aside>
          <aside>
            ${this.createRecipeDetailHTML(recipe, extraHTML, username)}
            ${this.createStepsSection(stepsHTML)}
          </aside>
        </section>
            <foods-section title="Ойролцоо хоолнууд"></foods-section-title>
          <section class="food-info">
            ${similarHTML}
          </section>
        </section>
      </main>
    `;
  }

  createNotFoundHTML() {
    return `
      <main class="recipes">
        <p style="text-align: center; padding: 2rem;">Жор олдсонгүй.</p>
      </main>
    `;
  }

  createErrorHTML() {
    return `
      <main class="recipes">
        <p style="text-align: center; padding: 2rem; color: #777;">
          Жор ачааллахад алдаа гарлаа. Дахин оролдоно уу.
        </p>
      </main>
    `;
  }

  handleSaveButton() {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      alert("Жор хадгалахын тулд нэвтэрнэ үү");
      return;
    }

    console.log("Жор хадгалах:", this.recipeId);
    alert("Жор амжилттай хадгалагдлаа! (Одоогоор backend байхгүй)");
  }

  handleRateButton() {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      alert("Үнэлгээ өгөхийн тулд нэвтэрнэ үү");
      return;
    }

    const rating = prompt("1-5 хүртэлх үнэлгээ оруулна уу:");
    
    if (rating && rating >= 1 && rating <= 5) {
      console.log("Үнэлгээ өгөх:", { recipeId: this.recipeId, rating });
      alert(`Таны үнэлгээ: ${rating} ⭐ (Одоогоор backend байхгүй)`);
    } else if (rating) {
      alert("1-5 хүртэлх тоо оруулна уу");
    }
  }

  attachButtonListeners() {
    const saveBtn = this.querySelector(".save");
    const rateBtn = this.querySelector(".rate");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.handleSaveButton());
    }

    if (rateBtn) {
      rateBtn.addEventListener("click", () => this.handleRateButton());
    }
  }

  async showRecipe(id) {
    try {
      this.recipeId = id;

      const { infoData, detailsData } = await this.loadRecipeData(id);

      this.recipe = this.findRecipe(infoData, id);
      
      if (!this.recipe) {
        this.innerHTML = this.createNotFoundHTML();
        return;
      }

      this.details = this.findRecipe(detailsData, id);

      this.similarFoods = this.findSimilarFoods(infoData, this.recipe);

      this.innerHTML = this.createRecipeHTML(this.recipe, this.details, this.similarFoods);

      this.attachButtonListeners();

    } catch (error) {
      this.innerHTML = this.createErrorHTML();
    }
  }
}

customElements.define('recipe-info', RecipesInfo);
