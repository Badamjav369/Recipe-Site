export class UserRecipesPage extends HTMLElement {
  constructor() {
    super();
    this.API_BASE_URL = 'http://localhost:3000/api';
    this.recipes = [];
  }

  connectedCallback() {
    this.loadUserRecipes();
  }

  async loadUserRecipes() {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        this.innerHTML = this.renderError('Нэвтрэх шаардлагатай');
        return;
      }

      this.innerHTML = this.renderLoading();

      const response = await fetch(`${this.API_BASE_URL}/recipes/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user recipes');
      }

      const data = await response.json();
      this.recipes = data;
      this.render();
    } catch (error) {
      console.error('Error loading user recipes:', error);
      this.innerHTML = this.renderError('Оруулсан жор ачааллахад алдаа гарлаа');
    }
  }

  formatRecipe(recipe) {
    // Handle image URL - if it's a full URL use it, otherwise construct path
    let imageUrl = 'images/food-images/default.jpg';
    if (recipe.image_url) {
      if (recipe.image_url.startsWith('http')) {
        imageUrl = recipe.image_url;
      } else if (recipe.image_url.startsWith('images/')) {
        imageUrl = recipe.image_url;
      } else {
        imageUrl = `images/${recipe.image_url}`;
      }
    }
    
    return {
      id: recipe.id,
      name: recipe.title,
      image: imageUrl,
      time: recipe.cook_time || '30 мин',
      servings: `${recipe.servings_min || 2}-${recipe.servings_max || 4} хүн`,
      calories: recipe.calories || '250 ккал',
      rating: recipe.rating || '0',
      views: recipe.views || 0,
      category: recipe.category_name || 'Бусад',
      status: recipe.status || 'pending'
    };
  }

  createCardHTML(recipe) {
    const formatted = this.formatRecipe(recipe);
    const statusBadge = formatted.status === 'pending' 
      ? '<span class="status-badge pending">Хүлээгдэж буй</span>'
      : formatted.status === 'rejected'
      ? '<span class="status-badge rejected">Татгалзсан</span>'
      : '<span class="status-badge approved">Баталгаажсан</span>';

    return `
      <article class="cards" data-recipe-id="${formatted.id}">
        ${statusBadge}
        <img class="food-image" src="${formatted.image}" alt="${formatted.name}" />
        <section class="type-rate">
          <h4>${formatted.category}</h4>
          <section class="rate">
            <img src="images/icon-images/star.png" alt="rating">
            <p>${formatted.rating}</p>
            <span>(${formatted.views})</span>
          </section>
        </section>
        <h3 class="food-name">${formatted.name}</h3>
        <section class="time-member-kalore">
          <p>
            <img src="images/icon-images/time.png" alt="time">
            ${formatted.time}
          </p>
          <p>
            <img src="images/icon-images/member.png" alt="servings">
            ${formatted.servings}
          </p>
          <p>
            <img src="images/icon-images/kalore.png" alt="calories">
            ${formatted.calories}
          </p>
        </section>
      </article>
    `;
  }

  renderLoading() {
    return `
      <main>
        <section class="foods-section">
          <section class="food-title">
            <h2>Оруулсан жорууд</h2>
            <a href="#" class="back-link">&#8592; Буцах</a>
          </section>
          <p style="text-align: center; padding: 2rem;">Ачааллаж байна...</p>
        </section>
      </main>
    `;
  }

  renderError(message) {
    return `
      <main>
        <section class="foods-section">
          <section class="food-title">
            <h2>Оруулсан жорууд</h2>
            <a href="#" class="back-link">&#8592; Буцах</a>
          </section>
          <p style="text-align: center; color: #e74c3c; padding: 2rem;">${message}</p>
        </section>
      </main>
    `;
  }

  renderEmpty() {
    return `
      <main>
        <section class="foods-section">
          <section class="food-title">
            <h2>Оруулсан жорууд</h2>
            <a href="#" class="back-link">&#8592; Буцах</a>
          </section>
          <p style="text-align: center; color: #777; padding: 2rem;">
            Оруулсан жор байхгүй байна.
          </p>
        </section>
      </main>
    `;
  }

  render() {
    if (this.recipes.length === 0) {
      this.innerHTML = this.renderEmpty();
      this.attachBackListener();
      return;
    }

    const cardsHTML = this.recipes.map(recipe => this.createCardHTML(recipe)).join('');

    this.innerHTML = `
      <main>
        <section class="foods-section">
          <section class="food-title">
            <h2>Оруулсан жорууд</h2>
            <a href="#" class="back-link">&#8592; Буцах</a>
          </section>
          <section class="food-info">
            ${cardsHTML}
          </section>
        </section>
      </main>
    `;

    this.attachEventListeners();
  }

  attachBackListener() {
    const backLink = this.querySelector('.back-link');
    if (backLink) {
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.goBackToProfile();
      });
    }
  }

  attachEventListeners() {
    this.attachBackListener();

    const cards = this.querySelectorAll('.cards');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const recipeId = card.getAttribute('data-recipe-id');
        this.showRecipeDetails(recipeId);
      });
    });
  }

  goBackToProfile() {
    const profile = document.querySelector('#profile');
    const userRecipesPage = document.querySelector('#user-recipes-page');
    
    if (userRecipesPage) userRecipesPage.style.display = 'none';
    if (profile) profile.style.display = 'block';
  }

  showRecipeDetails(recipeId) {
    const recipe = document.querySelector('#recipe');
    const userRecipesPage = document.querySelector('#user-recipes-page');
    
    if (userRecipesPage) userRecipesPage.style.display = 'none';
    if (recipe) {
      recipe.style.display = 'block';
      if (typeof recipe.showRecipe === 'function') {
        recipe.showRecipe(recipeId);
      }
    }
  }
}

customElements.define('user-recipes-page', UserRecipesPage);
