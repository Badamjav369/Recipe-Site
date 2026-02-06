const API_BASE_URL = 'http://localhost:3000';

export class FoodsSection extends HTMLElement {
  constructor() {
    super();
    this.category = null;
    this.foods = [];
  }

  async connectedCallback() {
    console.log('FoodsSection connected:', this.title);
    this.initializeAttributes();
    
    // Check if recipes are provided via attribute
    const recipesData = this.getAttribute('data-recipes');
    if (recipesData) {
      try {
        this.foods = this.formatRecipes(JSON.parse(recipesData));
      } catch (error) {
        console.error('Error parsing recipes data:', error);
        await this.loadData();
      }
    } else {
      await this.loadData();
    }
    
    console.log('FoodsSection foods loaded:', this.foods.length);
    this.render();
  }

  static get observedAttributes() {
    return ['data-recipes'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-recipes' && newValue && newValue !== oldValue) {
      try {
        this.foods = this.formatRecipes(JSON.parse(newValue));
        this.render();
      } catch (error) {
        console.error('Error parsing recipes data:', error);
      }
    }
  }

  initializeAttributes() {
    this.title = this.getAttribute("title") ?? "Онцлох хоолнууд";
    this.category = this.getAttribute("category") ?? null;
  }

  async loadData() {
    try {
      // Fetch from backend API
      const params = new URLSearchParams();
      if (this.category) {
        params.append('category', this.category);
      }
      params.append('status', 'approved'); // Only show approved recipes
      
      // Check if mobile screen
      const isMobile = window.innerWidth <= 480;
      const limit = isMobile ? 2 : 4;
      params.append('limit', limit.toString());
      
      const result = await fetch(`${API_BASE_URL}/api/recipes?${params}`);
      
      if (!result.ok) {
        throw new Error('API алдаа гарлаа');
      }
      
      const data = await result.json();
      
      // If API returns empty, fallback to JSON
      if (data && data.length > 0) {
        this.foods = this.formatRecipes(data);
      } else {
        throw new Error('Хоосон өгөгдөл');
      }
      
    } catch (error) {
      console.error('FoodsSection өгөгдөл ачааллахад алдаа:', error);
      // Fallback to JSON file if API fails or returns empty
      try {
        const result = await fetch("./data/info.json");
        const data = await result.json();
        this.foods = this.filterFoods(data);
      } catch {
        this.foods = [];
      }
    }
  }

  // Format backend data to match frontend structure
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
    
    // Check if mobile screen
    const isMobile = window.innerWidth <= 480;
    const limit = isMobile ? 2 : 4;
    
    return formatted.slice(0, limit);
  }

  filterFoods(data) {
    // Check if mobile screen
    const isMobile = window.innerWidth <= 480;
    const limit = isMobile ? 2 : 4;
    
    if (this.category) {
      return data.filter(f => f.category === this.category).slice(0, limit);
    }
    return data.slice(0, limit);
  }

  createCardHTML(food) {
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

  createCardsHTML() {
    return this.foods.map(f => this.createCardHTML(f)).join('');
  }

  renderError() {
    return `
      <section class="foods-section">
        <section class="food-title">
          <h2>${this.title}</h2>
        </section>
        <p style="text-align: center; color: #777; padding: 1rem;">
          Өгөгдөл ачааллахад алдаа гарлаа.
        </p>
      </section>
    `;
  }

  renderSuccess() {
    return `
      <section class="foods-section">
        <section class="food-title">
          <h2>${this.title}</h2>
          <a href="#" class="view-all-link">Бүгдийг үзэх &#8594;</a>
        </section>
        <section class="food-info">
          ${this.createCardsHTML()}
        </section>
      </section>
    `;
  }

  showAllRecipes() {
    const dataType = this.getAttribute('data-type');
    
    // Handle saved recipes "see more"
    if (dataType === 'saved') {
      const profile = document.querySelector("#profile");
      const savedRecipesPage = document.querySelector("#saved-recipes-page");
      
      if (profile) profile.style.display = "none";
      if (savedRecipesPage) savedRecipesPage.style.display = "block";
      return;
    }
    
    // Handle user uploaded recipes "see more"
    if (dataType === 'user') {
      const profile = document.querySelector("#profile");
      const userRecipesPage = document.querySelector("#user-recipes-page");
      
      if (profile) profile.style.display = "none";
      if (userRecipesPage) userRecipesPage.style.display = "block";
      return;
    }
    
    // Default behavior for other recipe sections
    const recipes = document.querySelector("#recipes");
    const home = document.querySelector("#home");
    
    if (home) home.style.display = "none";
    if (recipes) {
      recipes.style.display = "block";
      if (typeof recipes.loadFoods === 'function') {
        recipes.loadFoods();
      }
    }
  }

  attachEventListeners() {
    const viewAllLink = this.querySelector(".view-all-link");
    if (viewAllLink) {
      viewAllLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.showAllRecipes();
      });
    }
  }

  render() {
    if (this.foods.length === 0) {
      // Show empty state message instead of error for saved/user recipes
      const dataType = this.getAttribute('data-type');
      if (dataType === 'saved') {
        this.innerHTML = `
          <section class="foods-section">
            <section class="food-title">
              <h2>${this.title}</h2>
            </section>
            <p style="text-align: center; color: #777; padding: 1rem;">
              Хадгалсан жор байхгүй байна.
            </p>
          </section>
        `;
      } else if (dataType === 'user') {
        this.innerHTML = `
          <section class="foods-section">
            <section class="food-title">
              <h2>${this.title}</h2>
            </section>
            <p style="text-align: center; color: #777; padding: 1rem;">
              Оруулсан жор байхгүй байна.
            </p>
          </section>
        `;
      } else {
        this.innerHTML = this.renderError();
      }
    } else {
      this.innerHTML = this.renderSuccess();
      this.attachEventListeners();
    }
  }
}

customElements.define('foods-section', FoodsSection);