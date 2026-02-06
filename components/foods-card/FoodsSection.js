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
    
    // Attribute-аар дамжуулсан жорыг шалгах
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

    // Дэлгэцийн хэмжээ өөрчлөгдөхөд карт шинэчлэх
    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  disconnectedCallback() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.foods && this.foods.length > 0) {
        this.render();
      }
    }, 250);
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
      const params = new URLSearchParams();
      if (this.category) {
        params.append('category', this.category);
      }
      params.append('status', 'approved');
      
      // Дэлгэцийн хэмжээгээр картын тоо тогтоох
      const limit = this.getCardLimitForScreenSize();
      params.append('limit', limit.toString());
      
      const result = await fetch(`${API_BASE_URL}/api/recipes?${params}`);
      
      if (!result.ok) {
        throw new Error('API алдаа гарлаа');
      }
      
      const data = await result.json();
      
      // API хоосон бол JSON файл руу буцах
      if (data && data.length > 0) {
        this.foods = this.formatRecipes(data);
      } else {
        throw new Error('Хоосон өгөгдөл');
      }
      
    } catch (error) {
      console.error('FoodsSection өгөгдөл ачааллахад алдаа:', error);
      // API амжилтгүй бол JSON файлаас унших
      try {
        const result = await fetch("./data/info.json");
        const data = await result.json();
        this.foods = this.filterFoods(data);
      } catch {
        this.foods = [];
      }
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

  // Backend өгөгдлийг frontend бүтэцэд хөрвүүлэх
  formatRecipes(recipes) {
    const formatted = recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.title,
      type: recipe.category_name || recipe.type || 'Хоол',
      rating: recipe.rating || 0,
      view: recipe.views || 0,
      time: recipe.cook_time,
      portion: `${recipe.servings_min || 2}-${recipe.servings_max || 4} хүн`,
      cal: recipe.calories,
      image: recipe.image_url || '.images/.food-images/.default.png'
    }));
    
    const limit = this.getCardLimitForScreenSize();
    return formatted.slice(0, limit);
  }

  filterFoods(data) {
    const limit = this.getCardLimitForScreenSize();
    
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
    const limit = this.getCardLimitForScreenSize();
    const displayFoods = this.foods.slice(0, limit);
    return displayFoods.map(f => this.createCardHTML(f)).join('');
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
    
    // Хадгалсан жорын "дэлгэрэнгүй"
    if (dataType === 'saved') {
      const profile = document.querySelector("#profile");
      const savedRecipesPage = document.querySelector("#saved-recipes-page");
      
      if (profile) profile.style.display = "none";
      if (savedRecipesPage) savedRecipesPage.style.display = "block";
      return;
    }
    
    // Хэрэглэгчийн оруулсан жорын "дэлгэрэнгүй"
    if (dataType === 'user') {
      const profile = document.querySelector("#profile");
      const userRecipesPage = document.querySelector("#user-recipes-page");
      
      if (profile) profile.style.display = "none";
      if (userRecipesPage) userRecipesPage.style.display = "block";
      return;
    }
    
    // Бусад жорын хэсгийн үндсэн үйлдэл
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