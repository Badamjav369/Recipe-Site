const API_BASE_URL = 'http://localhost:3000';

export class RecipesMain extends HTMLElement {
  constructor() {
    super();
    this.categories = [];
    this.currentCategory = "Бүх хоол";
  }

  async connectedCallback() {
    this.render();
    await this.loadCategories();
    await this.loadFoods();
  }

  createHTML() {
    return `
      <main class="main-recipes">
        ${this.createCategorySection()}
        ${this.createRecipesSection()}
      </main>
    `;
  }

  createCategorySection() {
    return `
      <section class="category">
        <h2>Ангилалууд</h2>
      </section>
    `;
  }

  createRecipesSection() {
    return `
      <section class="selected-cat">
        <h2>${this.currentCategory}</h2>
        <section class="all-recipes"></section>
      </section>
    `;
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error('API алдаа');
      const data = await response.json();
      // If empty, fallback to JSON
      if (data && data.length > 0) {
        return ['Бүх хоол', ...data.map(c => c.name)];
      }
      throw new Error('Хоосон категори');
    } catch {
      // Fallback to JSON
      const response = await fetch("./data/categories-info.json");
      if (!response.ok) throw new Error('Категори ачааллахад алдаа гарлаа');
      return await response.json();
    }
  }

  async fetchFoods() {
    try {
      const params = new URLSearchParams({ status: 'approved' });
      const response = await fetch(`${API_BASE_URL}/api/recipes?${params}`);
      if (!response.ok) throw new Error('API алдаа');
      const data = await response.json();
      // If empty, fallback to JSON
      if (data && data.length > 0) {
        return this.formatRecipes(data);
      }
      throw new Error('Хоосон өгөгдөл');
    } catch {
      // Fallback to JSON
      const response = await fetch("./data/info.json");
      if (!response.ok) throw new Error('Хоол ачааллахад алдаа гарлаа');
      return await response.json();
    }
  }

  formatRecipes(recipes) {
    return recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.title,
      type: recipe.category_name || recipe.type,
      rating: recipe.rating || 0,
      view: recipe.views || 0,
      time: recipe.cook_time,
      portion: `${recipe.servings_min}-${recipe.servings_max} хүн`,
      cal: recipe.calories,
      image: recipe.image_url
    }));
  }

  createCategoryLink(category) {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = category;
    link.onclick = (e) => this.handleCategoryClick(e, category);
    return link;
  }

  handleCategoryClick(e, category) {
    e.preventDefault();
    this.currentCategory = category;
    this.updateCategoryTitle();
    this.loadFoods(category);
  }

  updateCategoryTitle() {
    const titleElement = this.querySelector(".selected-cat h2");
    if (titleElement) {
      titleElement.textContent = this.currentCategory;
    }
  }

  renderCategoryLinks() {
    const categoryBox = this.querySelector(".category");
    
    if (!categoryBox) return;

    this.categories.forEach(category => {
      const link = this.createCategoryLink(category);
      categoryBox.appendChild(link);
    });
  }

  showCategoryError() {
    const categoryBox = this.querySelector(".category");
    if (categoryBox) {
      categoryBox.innerHTML += `
        <p style="color: #777; padding: 1rem;">
          Ангилал ачааллахад алдаа гарлаа
        </p>
      `;
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.fetchCategories();
      this.renderCategoryLinks();
    } catch (error) {
      console.error('Categories ачааллахад алдаа:', error);
      this.showCategoryError();
    }
  }

  filterFoods(foods, category) {
    if (category === "Бүх хоол") {
      return foods;
    }
    return foods.filter(f => f.type === category);
  }

  createFoodCard(food) {
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

  createEmptyStateHTML(category) {
    return `
      <p style="text-align: center; width: 100%; padding: 2rem; color: #777;">
        "${category}" ангилалд хоол олдсонгүй.
      </p>
    `;
  }

  createErrorHTML() {
    return `
      <p style="text-align: center; width: 100%; padding: 2rem; color: #777;">
        Хоол ачааллахад алдаа гарлаа. Дахин оролдоно уу.
      </p>
    `;
  }

  renderFoodCards(foods) {
    const container = this.querySelector(".all-recipes");
    
    if (!container) {
      console.error('.all-recipes элемент олдсонгүй');
      return;
    }

    if (foods.length === 0) {
      container.innerHTML = this.createEmptyStateHTML(this.currentCategory);
      return;
    }

    container.innerHTML = foods.map(f => this.createFoodCard(f)).join("");
  }

  showFoodsError() {
    const container = this.querySelector(".all-recipes");
    if (container) {
      container.innerHTML = this.createErrorHTML();
    }
  }

  async loadFoods(category = "Бүх хоол") {
    try {
      this.currentCategory = category;
      
      const allFoods = await this.fetchFoods();
      const filteredFoods = this.filterFoods(allFoods, category);
      
      this.renderFoodCards(filteredFoods);
      
    } catch (error) {
      console.error('Хоол ачааллахад алдаа:', error);
      this.showFoodsError();
    }
  }

  render() {
    this.innerHTML = this.createHTML();
  }
}

customElements.define("recipes-main", RecipesMain);