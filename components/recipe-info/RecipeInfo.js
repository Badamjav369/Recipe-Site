const API_BASE_URL = 'http://localhost:3000';

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
      const recipeRes = await fetch(`${API_BASE_URL}/api/recipes/${id}`);
      if (recipeRes.ok) {
        const recipe = await recipeRes.json();
        return this.formatBackendData(recipe);
      }
    } catch (error) {
      console.error('Backend алдаа:', error);
    }

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

  formatBackendData(recipe) {
    return {
      infoData: [{
        id: recipe.id,
        name: recipe.title,
        type: recipe.category_name,
        rating: parseFloat(recipe.rating || 0).toFixed(2),
        view: recipe.views || 0,
        time: recipe.cook_time,
        portion: `${recipe.servings_min}-${recipe.servings_max} хүн`,
        cal: recipe.calories,
        image: recipe.image_url
      }],
      detailsData: [{
        id: recipe.id,
        ingredients: recipe.ingredients ? recipe.ingredients.split('\n') : [],
        steps: recipe.instructions ? recipe.instructions.split('\n') : [],
        extra: recipe.extra_info ? recipe.extra_info.split('\n') : [],
        username: recipe.username || 'Хэрэглэгч'
      }]
    };
  }

  findRecipe(data, id) {
    return data.find(r => r.id == id);
  }

  async findSimilarFoods(allFoods, currentRecipe) {
    let similarFoods = allFoods
      .filter(f => f.type === currentRecipe.type && f.id !== currentRecipe.id)
      .sort((a, b) => this.parseView(b.view) - this.parseView(a.view))
      .slice(0, 4);
    
    if (similarFoods.length === 0) {
      try {
        similarFoods = await this.fetchSuggestedFoods(currentRecipe.id);
      } catch (error) {
        console.error('Error fetching suggested foods:', error);
        similarFoods = allFoods
          .filter(f => f.id !== currentRecipe.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
      }
    }
    
    return similarFoods;
  }

  async fetchSuggestedFoods(currentRecipeId) {
    try {
      const limit = this.getCardLimitForScreenSize();
      
      const response = await fetch(`${API_BASE_URL}/api/recipes?status=approved&limit=${limit + 2}`);
      if (!response.ok) throw new Error('API request failed');
      
      const recipes = await response.json();
      return recipes
        .filter(r => r.id !== currentRecipeId)
        .map(recipe => ({
          id: recipe.id,
          name: recipe.title,
          type: recipe.category_name || 'Хоол',
          rating: parseFloat(recipe.rating || 0).toFixed(2),
          view: recipe.views || 0,
          time: recipe.cook_time,
          portion: `${recipe.servings_min}-${recipe.servings_max} хүн`,
          cal: recipe.calories,
          image: recipe.image_url
        }))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch suggested foods:', error);
      throw error;
    }
  }

  getCardLimitForScreenSize() {
    const width = window.innerWidth;
    
    if (width <= 480) {
      return 2;
    } else if (width <= 768) {
      return 4;
    } else if (width <= 1024) {
      return 4;
    } else if (width <= 1200) {
      return 6;
    } else if (width <= 1400) {
      return 6;
    } else {
      return 8;
    }
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

  createSimilarFoodsHTML(similarFoods, hasSimilarFoods = true) {
    if (similarFoods.length === 0) {
      return "<p>Санал болгох хоол олдсонгүй</p>";
    }
    
    const title = hasSimilarFoods ? "Ойролцоо хоолнууд" : "Санал болгох хоолнууд";
    return similarFoods.map(f => this.createSimilarFoodCard(f)).join("");
  }

  createRecipeHTML(recipe, details, similarFoods, hasSimilarFoods = true) {
    const ingredientsHTML = this.createIngredientsHTML(details?.ingredients);
    const stepsHTML = this.createStepsHTML(details?.steps);
    const extraHTML = this.createExtraHTML(details?.extra);
    const username = details?.username ?? "Хэрэглэгч";
    const similarHTML = this.createSimilarFoodsHTML(similarFoods, hasSimilarFoods);
    const sectionTitle = hasSimilarFoods && similarFoods.length > 0 ? "Ойролцоо хоолнууд" : "Санал болгох хоолнууд";
    
    const seeMoreLink = !hasSimilarFoods && similarFoods.length > 0 
      ? '<a href="#" class="view-all-link">Бүгдийг үзэх &#8594;</a>'
      : '';

    return `
      <main class="recipes">
        <section class="recipe-information">
          <aside>
            ${this.createImageHTML(recipe)}
            ${this.createRecipeDetailHTML(recipe, extraHTML, username)}
          </aside>
          <aside>
            ${this.createIngredientsSection(ingredientsHTML)}
            ${this.createStepsSection(stepsHTML)}
          </aside>
        </section>
        <section class="foods-section">
          <section class="food-title">
            <h2>${sectionTitle}</h2>
            ${seeMoreLink}
          </section>
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

  async handleSaveButton() {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Жор хадгалахын тулд нэвтэрнэ үү");
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/recipes/${this.recipeId}/save`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (response.ok) {
        alert("Жор амжилттай хадгалагдлаа!");
      } else {
        if (response.status === 404) {
          alert("Энэ жор өгөгдлийн санд байхгүй байна. Зөвхөн өөрийн нэмсэн эсвэл бусад хэрэглэгчийн нэмсэн жоруудыг хадгалж болно.");
        } else {
          alert(result.error || "Жор хадгалахад алдаа гарлаа");
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert("Серверт холбогдоход алдаа гарлаа");
    }
  }

  async handleRateButton() {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Үнэлгээ өгөхийн тулд нэвтэрнэ үү");
      return;
    }

    const rating = prompt("1-5 хүртэлх үнэлгээ оруулна уу:");
    
    if (!rating || rating < 1 || rating > 5) {
      if (rating) alert("1-5 хүртэлх тоо оруулна уу");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${this.recipeId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: Number(rating) })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Таны үнэлгээ: ${rating} ⭐`);
        await this.showRecipe(this.recipeId);
      } else {
        if (response.status === 404) {
          alert("Энэ жор өгөгдлийн санд байхгүй байна. Зөвхөн өөрийн нэмсэн эсвэл бусад хэрэглэгчийн нэмсэн жоруудыг үнэлж болно.");
        } else {
          alert(result.error || "Үнэлгээ өгөхөд алдаа гарлаа");
        }
      }
    } catch (error) {
      console.error('Rate error:', error);
      alert("Серверт холбогдоход алдаа гарлаа");
    }
  }

  attachButtonListeners() {
    const saveBtn = this.querySelector(".save");
    const rateBtn = this.querySelector(".rate");
    const viewAllLink = this.querySelector(".view-all-link");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.handleSaveButton());
    }

    if (rateBtn) {
      rateBtn.addEventListener("click", () => this.handleRateButton());
    }

    if (viewAllLink) {
      viewAllLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleSeeMoreSuggested();
      });
    }
  }

  handleSeeMoreSuggested() {
    const recipes = document.querySelector("#recipes");
    const recipe = document.querySelector("#recipe");
    
    if (recipe) recipe.style.display = "none";
    if (recipes) {
      recipes.style.display = "block";
      if (typeof recipes.loadFoods === 'function') {
        recipes.loadFoods();
      }
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

      let similarFoods = infoData
        .filter(f => f.type === this.recipe.type && f.id !== this.recipe.id)
        .sort((a, b) => this.parseView(b.view) - this.parseView(a.view))
        .slice(0, this.getCardLimitForScreenSize());
      
      let hasSimilarFoods = similarFoods.length > 0;
      
      if (similarFoods.length === 0) {
        try {
          similarFoods = await this.fetchSuggestedFoods(this.recipe.id);
          hasSimilarFoods = false;
        } catch (error) {
          console.error('Error fetching suggested foods:', error);
          const limit = this.getCardLimitForScreenSize();
          similarFoods = infoData
            .filter(f => f.id !== this.recipe.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);
          hasSimilarFoods = false;
        }
      }
      
      this.similarFoods = similarFoods;

      this.innerHTML = this.createRecipeHTML(this.recipe, this.details, this.similarFoods, hasSimilarFoods);

      this.attachButtonListeners();

    } catch (error) {
      this.innerHTML = this.createErrorHTML();
    }
  }
}

customElements.define('recipe-info', RecipesInfo);
