export class HeaderSection extends HTMLElement {
  constructor() {
    super();
    this.elements = {};
    this.eventListeners = [];
    this.searchTimeout = null;
  }

  connectedCallback() {
    this.render();
    this.cacheElements();
    this.checkAuthentication();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.cleanupEventListeners();
  }

  createHTML() {
    return `
      <header>
        ${this.createLogoHTML()}
        ${this.createNavHTML()}
        ${this.createSearchSectionHTML()}
      </header>
    `;
  }

  createLogoHTML() {
    return `
      <a href="#" class="logo-link">
        <img class="logo" src="images/icon-images/logo.png" alt="Logo">
      </a>
    `;
  }

  createNavHTML() {
    return `
      <nav>
        <a class="nav-home" href="#">Нүүр хуудас</a>
        <a class="nav-recipes" href="#">Жорууд</a>
      </nav>
    `;
  }

  createSearchSectionHTML() {
    return `
      <section class="nevtreh-search">
        <input type="text" placeholder="Хайх..." class="search-input">
        <img class="search-logo" src="images/icon-images/search-logo.svg" alt="Search">
        <button class="login-btn enter-btn">Нэвтрэх</button>
        <button class="more-search">Дэлгэрэнгүй хайлт</button>
      </section>
    `;
  }

  cacheElements() {
    this.elements = {
      home: document.querySelector("#home"),
      recipes: document.querySelector("#recipes"),
      recipeInfo: document.querySelector("#recipe"),
      searchInput: this.querySelector(".search-input"),
      searchSection: this.querySelector(".nevtreh-search"),
      loginBtn: this.querySelector(".login-btn"),
      loginModal: document.querySelector("login-modal"),
      profileSection: document.querySelector("profile-main"),
      homeLink: this.querySelector(".nav-home"),
      recipesLink: this.querySelector(".nav-recipes")
    };
  }

  isUserLoggedIn() {
    return !!localStorage.getItem("userId");
  }

  createProfileButton() {
    const profileBtn = document.createElement("button");
    profileBtn.classList.add("profile-btn");
    profileBtn.innerHTML = `<img class="profile-button" src="images/icon-images/profile.svg" alt="profile">`;
    return profileBtn;
  }

  insertProfileButton(profileBtn) {
    const moreSearchBtn = this.elements.searchSection?.querySelector(".more-search");
    if (this.elements.searchSection && moreSearchBtn) {
      this.elements.searchSection.insertBefore(profileBtn, moreSearchBtn);
    }
  }

  addProfileButtonListener(profileBtn) {
    const handler = () => this.showProfile();
    profileBtn.addEventListener("click", handler);
    this.eventListeners.push({ element: profileBtn, event: "click", handler });
  }

  checkAuthentication() {
    if (!this.isUserLoggedIn()) return;

    if (this.elements.loginBtn) {
      this.elements.loginBtn.remove();
    }

    const profileBtn = this.createProfileButton();
    this.insertProfileButton(profileBtn);
    this.addProfileButtonListener(profileBtn);
  }

  hideAllSections() {
    const sections = ['home', 'recipes', 'recipeInfo', 'profileSection'];
    sections.forEach(section => {
      if (this.elements[section]) {
        this.elements[section].style.display = "none";
      }
    });
  }

  showProfile() {
    if (!this.elements.profileSection) {
      console.error('Элемент олдсонгүй');
      return;
    }

    this.hideAllSections();
    this.elements.profileSection.style.display = "block";
    
    if (typeof this.elements.profileSection.showProfile === 'function') {
      this.elements.profileSection.showProfile();
    }
  }

  showHome() {
    this.hideAllSections();
    if (this.elements.home) {
      this.elements.home.style.display = "block";
    }
  }

  showRecipes() {
    this.hideAllSections();
    if (this.elements.recipes) {
      this.elements.recipes.style.display = "block";
      if (typeof this.elements.recipes.loadFoods === 'function') {
        this.elements.recipes.loadFoods();
      }
    }
  }

  openLoginModal() {
    if (this.elements.loginModal && typeof this.elements.loginModal.open === 'function') {
      this.elements.loginModal.open();
    }
  }

  async fetchFoods() {
    const response = await fetch("./data/info.json");
    
    if (!response.ok) {
      throw new Error('Хайлт хийхэд алдаа гарлаа');
    }
    
    return await response.json();
  }

  filterFoodsByQuery(foods, query) {
    return foods.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.type.toLowerCase().includes(query)
    );
  }

  // Food card HTML үүсгэх
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

  // Хайлтын үр дүн харуулах
  renderSearchResults(filteredFoods, query) {
    const container = this.elements.recipes?.querySelector(".all-recipes");
    if (!container) return;

    if (filteredFoods.length === 0) {
      container.innerHTML = `
        <p style="text-align: center; width: 100%; padding: 2rem; color: #777;">
          "${query}" хайлтын үр дүн олдсонгүй.
        </p>
      `;
      return;
    }

    container.innerHTML = filteredFoods.map(f => this.createFoodCard(f)).join("");
  }

  // Хайлт хийх
  async performSearch(query) {
    try {
      const trimmedQuery = query.trim().toLowerCase();
      
      if (!trimmedQuery) {
        this.showRecipes();
        return;
      }

      const foods = await this.fetchFoods();
      const filteredFoods = this.filterFoodsByQuery(foods, trimmedQuery);

      this.hideAllSections();
      if (this.elements.recipes) {
        this.elements.recipes.style.display = "block";
      }

      this.renderSearchResults(filteredFoods, trimmedQuery);
      
    } catch (error) {
      console.error('Хайлтад алдаа гарлаа:', error);
      alert('Хайлт хийхэд алдаа гарлаа. Дахин оролдоно уу.');
    }
  }

  handleSearchInput(e) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(e.target.value);
    }, 300);
  }

  handleHomeClick(e) {
    e.preventDefault();
    this.showHome();
  }

  handleRecipesClick(e) {
    e.preventDefault();
    this.showRecipes();
  }

  handleLoginClick(e) {
    e.preventDefault();
    this.openLoginModal();
  }

  registerEventListener(element, event, handler) {
    if (element) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }
  }

  attachEventListeners() {
    this.registerEventListener(
      this.elements.homeLink,
      "click",
      (e) => this.handleHomeClick(e)
    );

    this.registerEventListener(
      this.elements.recipesLink,
      "click",
      (e) => this.handleRecipesClick(e)
    );

    this.registerEventListener(
      this.elements.searchInput,
      "input",
      (e) => this.handleSearchInput(e)
    );

    this.registerEventListener(
      this.elements.loginBtn,
      "click",
      (e) => this.handleLoginClick(e)
    );
  }

  cleanupEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element) {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners = [];
  }

  render() {
    this.innerHTML = this.createHTML();
  }
}

customElements.define("header-section", HeaderSection);