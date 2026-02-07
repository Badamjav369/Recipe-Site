export class CardSection extends HTMLElement {
  constructor() {
    super();
    this.cardData = {};
  }

  connectedCallback() {
    this.initializeData();
    this.render();
    this.attachEventListeners();
  }

  initializeData() {
    this.cardData = {
      id: this.getAttribute("id"),
      name: this.getAttribute("name") ?? "-",
      type: this.getAttribute("type") ?? "-",
      rating: this.formatRating(this.getAttribute("rating")),
      time: this.getAttribute("time") ?? "-",
      portion: this.getAttribute("portion") ?? "-",
      cal: this.getAttribute("cal") ?? "-",
      view: this.getAttribute("view") ?? 0,
      image: this.getAttribute("image") ?? "./images/food-images/pizza.jpg"
    };
  }

  formatRating(rating) {
    return Number(rating ?? 0).toFixed(1);
  }

  createHeaderHTML() {
    return `
      <img class="food-image" src="${this.cardData.image}" alt="${this.cardData.name}">
    `;
  }

  createTypeRatingHTML() {
    return `
      <section class="type-rate">
        <h4>${this.cardData.type}</h4>
        <article class="rate">
          <img src="./images/food.svg" alt="food-image">
          <p>
            ${this.cardData.rating}
            <span>(${this.cardData.view})</span>
          </p>
        </article>
      </section>
    `;
  }

  createNameHTML() {
    return `<h3 class="food-name">${this.cardData.name}</h3>`;
  }

  createDetailsHTML() {
    return `
      <section class="time-member-kalore">
        ${this.createDetailItem("./images/time.svg", "time-icon", `${this.cardData.time} мин`)}
        ${this.createDetailItem("./images/people.svg", "people-icon", this.cardData.portion)}
        ${this.createDetailItem("./images/calore.svg", "calore-icon", `${this.cardData.cal} ккал`)}
      </section>
    `;
  }

  createDetailItem(icon, alt, text) {
    return `
      <section>
        <img src="${icon}" alt="${alt}">
        <span>${text}</span>
      </section>
    `;
  }

  createCardHTML() {
    return `
      <article class="cards">
        ${this.createHeaderHTML()}
        ${this.createTypeRatingHTML()}
        ${this.createNameHTML()}
        ${this.createDetailsHTML()}
      </article>
    `;
  }

  getElements() {
    return {
      recipeInfo: document.getElementById('recipe'),
      home: document.getElementById('home'),
      recipes: document.getElementById('recipes'),
      profileSection: document.querySelector('profile-main')
    };
  }

  hideAllSections(elements) {
    if (elements.home) elements.home.style.display = 'none';
    if (elements.recipes) elements.recipes.style.display = 'none';
    if (elements.profileSection) elements.profileSection.style.display = 'none';
    
    const savedRecipesPage = document.querySelector('#saved-recipes-page');
    const userRecipesPage = document.querySelector('#user-recipes-page');
    if (savedRecipesPage) savedRecipesPage.style.display = 'none';
    if (userRecipesPage) userRecipesPage.style.display = 'none';
  }

  showRecipe(recipeInfo) {
    const recipeId = Number(this.cardData.id);
    
    if (typeof recipeInfo.showRecipe === 'function') {
      recipeInfo.showRecipe(recipeId);
    } else {
      console.error('showRecipe функц олдсонгүй');
    }
  }

  handleCardClick() {
    try {
      const elements = this.getElements();

      if (!elements.recipeInfo) {
        console.error('recipe элемент олдсонгүй');
        return;
      }

      this.hideAllSections(elements);
      elements.recipeInfo.style.display = 'block';
      this.showRecipe(elements.recipeInfo);
      
    } catch (error) {
      console.error('Card дарахад алдаа гарлаа:', error);
    }
  }

  attachEventListeners() {
    this.addEventListener('click', () => this.handleCardClick());
  }

  render() {
    this.innerHTML = this.createCardHTML();
  }

  disconnectedCallback() {
  }
}

customElements.define('card-section', CardSection);