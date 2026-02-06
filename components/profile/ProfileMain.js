export class ProfileMain extends HTMLElement {
  constructor() {
    super();
    this.userData = {
      userId: null,
      email: null,
      username: null,
      token: null
    };
    this.API_BASE_URL = 'http://localhost:3000/api';
  }

  connectedCallback() {
    this.loadUserData();
    this.render();
    this.attachEventListeners();
  }

  loadUserData() {
    this.userData.userId = localStorage.getItem("userId");
    this.userData.email = localStorage.getItem("email");
    this.userData.token = localStorage.getItem("token");
    this.userData.username = this.extractUsername(this.userData.email);
  }

  extractUsername(email) {
    if (!email) return "Хэрэглэгч";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  createProfileHTML() {
    return `
      <main>
        <section class="profile-main">
          ${this.createSidebarHTML()}
          ${this.createFormSectionHTML()}
        </section>
        ${this.createSavedRecipesHTML()}
        ${this.createUserRecipesHTML()}
      </main>
    `;
  }

  createSidebarHTML() {
    return `
      <aside>
        ${this.createProfileHeaderHTML()}
        ${this.createUserInfoHTML()}
      </aside>
    `;
  }

  createProfileHeaderHTML() {
    return `
      <section class="profile-image-title">
        <img class="img-profile" src="images/icon-images/profile.svg" alt="profile picture">
        <h2>Миний Мэдээлэл</h2>
      </section>
    `;
  }

  createUserInfoHTML() {
    return `
      <section class="user-info">
        <p>Хэрэглэгчийн нэр</p>
        <span class="user-name-display">${this.userData.username}</span>
        <p>Цахим хаяг</p>
        <span class="user-email-display">${this.userData.email || 'example@gmail.com'}</span>
        <button class="logout-btn">Гарах</button>
      </section>
    `;
  }

  createFormSectionHTML() {
    return `
      <section class="right-side">
        <form class="add-recipe-form">
          <h2>Жор нэмэх</h2>
          ${this.createBasicInputsHTML()}
          ${this.createImageInputHTML()}
          ${this.createDetailInputsHTML()}
          ${this.createTextAreasHTML()}
          <button type="submit">Жор нэмэх</button>
        </form>
      </section>
    `;
  }

  createBasicInputsHTML() {
    return `
      <section class="name-type">
        <label for="name">Хоолны нэр</label><br>
        <input type="text" id="name" name="name" placeholder="Хоолны нэр" required><br>
        <label for="type">Хоолны төрөл</label><br>
        <input type="text" id="type" name="type" placeholder="Хоолны төрөл" required><br>
      </section>
    `;
  }

  createImageInputHTML() {
    return `
      <label class="upload-box" for="image">Зураг оруулах</label><br>
      <input type="file" id="image" name="image" accept="image/*"><br>
    `;
  }

  createDetailInputsHTML() {
    return `
      <section class="detail-info-recipe">
        <label for="time">Хугацаа</label><br>
        <input type="number" id="time" name="time" placeholder="Минут" required><br>
        <label for="portion">Порц</label><br>
        <input type="text" id="portion" name="portion" placeholder="Хүний тоо" required><br>
        <label for="cal">Калори</label><br>
        <input type="number" id="cal" name="cal" placeholder="Калори" required><br>
      </section>
    `;
  }

  createTextAreasHTML() {
    return `
      <label for="ingredients">Орц</label><br>
      <textarea id="ingredients" name="ingredients" placeholder="Орцоо оруулна уу (мөр бүрт нэг орц)..." required></textarea><br>
      <label for="instructions">Хийх дараалал</label><br>
      <textarea id="instructions" name="instructions" placeholder="Хийх дарааллыг оруулна уу (мөр бүрт нэг алхам)..." required></textarea><br>
      <label for="info">Нэмэлт мэдээлэл, зөвлөмж</label><br>
      <textarea id="info" name="info" placeholder="Нэмэлт зөвлөмж, санамж (мөр бүрт нэг)..."></textarea><br>
    `;
  }

  createSavedRecipesHTML() {
    return `<foods-section id="saved-recipes" title="Хадгалсан жорууд" data-type="saved"></foods-section>`;
  }

  createUserRecipesHTML() {
    return `<foods-section id="user-recipes" title="Оруулсан жорууд" data-type="user"></foods-section>`;
  }

  collectFormData(form) {
    const portionValue = form.querySelector("#portion").value.trim();
    const servings = parseInt(portionValue) || 1;

    const formData = {
      title: form.querySelector("#name").value.trim(),
      category_id: null, // Will need to map from type later
      cook_time: parseInt(form.querySelector("#time").value.trim()),
      servings_min: servings,
      servings_max: servings,
      calories: parseInt(form.querySelector("#cal").value.trim()) || null,
      image_url: '',
      ingredients: '',
      instructions: '',
      extra_info: ''
    };

    // зураг
    const imageInput = form.querySelector("#image");
    if (imageInput?.files.length > 0) {
      formData.image_url = `images/${imageInput.files[0].name}`;
    }

    // орц - join as newline-separated text
    const ingredientsText = form.querySelector("#ingredients").value.trim();
    if (ingredientsText) {
      formData.ingredients = ingredientsText;
    }

    // алхмууд - join as newline-separated text
    const instructionsText = form.querySelector("#instructions").value.trim();
    if (instructionsText) {
      formData.instructions = instructionsText;
    }

    // нэмэлт мэдээлэл
    const infoText = form.querySelector("#info").value.trim();
    if (infoText) {
      formData.extra_info = infoText;
    }

    return formData;
  }

  validateRecipeForm(data) {
    // Check required fields that backend needs
    if (!data.title || data.title.trim() === '') {
      this.showError('Хоолны нэр талбарыг бөглөнө үү');
      return false;
    }

    if (!data.cook_time || data.cook_time <= 0) {
      this.showError('Хугацаа талбарыг бөглөнө үү');
      return false;
    }

    if (!data.ingredients || data.ingredients.trim() === '') {
      this.showError('Орц оруулна уу');
      return false;
    }

    if (!data.instructions || data.instructions.trim() === '') {
      this.showError('Хийх дарааллыг оруулна уу');
      return false;
    }
    
    return true;
  }

  async submitRecipe(data) {
    try {
      console.log("Sending recipe data:", data);

      const response = await fetch(`${this.API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userData.token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Жор нэмэхэд алдаа гарлаа');
      }

      console.log("Recipe created:", result);
      this.showSuccess("Жор амжилттай нэмэгдлээ!");
      return true;

    } catch (error) {
      console.error('Submit recipe error:', error);
      this.showError(error.message || 'Серверт холбогдох явцад алдаа гарлаа');
      return false;
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = this.collectFormData(form);

    if (!this.validateRecipeForm(formData)) {
      return;
    }

    const success = await this.submitRecipe(formData);
    
    if (success) {
      form.reset();
    }
  }

  handleLogout() {
    if (confirm("Та системээс гарахдаа итгэлтэй байна уу?")) {
      this.clearUserData();
      this.showSuccess("Амжилттай гарлаа");
      this.reloadPage();
    }
  }

  clearUserData() {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
  }

  attachEventListeners() {
    const form = this.querySelector(".add-recipe-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }

    const logoutBtn = this.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }
  }

  updateUserDisplay() {
    const nameDisplay = this.querySelector(".user-name-display");
    const emailDisplay = this.querySelector(".user-email-display");

    if (nameDisplay) nameDisplay.textContent = this.userData.username;
    if (emailDisplay) emailDisplay.textContent = this.userData.email || 'example@gmail.com';
  }

  showProfile() {
    this.loadUserData();
    this.updateUserDisplay();
  }

  showError(message) {
    alert(message);
  }

  showSuccess(message) {
    alert(message);
  }

  reloadPage() {
    window.location.reload();
  }

  render() {
    this.innerHTML = this.createProfileHTML();
    // Load recipes after rendering - wait for elements to be fully connected
    requestAnimationFrame(() => {
      setTimeout(() => {
        console.log('Loading user and saved recipes...');
        this.loadUserRecipes();
        this.loadSavedRecipes();
      }, 200);
    });
  }

  async loadUserRecipes() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/recipes/user/${this.userData.userId}`, {
        headers: {
          'Authorization': `Bearer ${this.userData.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load user recipes');
      const recipes = await response.json();
      console.log('User recipes:', recipes);
      
      // Update the foods-section component
      const userRecipesSection = this.querySelector('#user-recipes');
      if (userRecipesSection && recipes.length > 0) {
        userRecipesSection.setAttribute('data-recipes', JSON.stringify(recipes));
      }
      return recipes;
    } catch (error) {
      console.error('Load user recipes error:', error);
      return [];
    }
  }

  async loadSavedRecipes() {
    try {
      console.log('Loading saved recipes...');
      const response = await fetch(`${this.API_BASE_URL}/saved-recipes`, {
        headers: {
          'Authorization': `Bearer ${this.userData.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load saved recipes');
      const recipes = await response.json();
      console.log('Saved recipes loaded:', recipes);
      
      // Update the foods-section component
      const savedRecipesSection = this.querySelector('#saved-recipes');
      console.log('Saved recipes section element:', savedRecipesSection);
      
      if (savedRecipesSection) {
        if (recipes.length > 0) {
          savedRecipesSection.setAttribute('data-recipes', JSON.stringify(recipes));
          console.log('Set data-recipes attribute with', recipes.length, 'recipes');
        } else {
          console.log('No saved recipes to display');
        }
      } else {
        console.error('Saved recipes section not found!');
      }
      return recipes;
    } catch (error) {
      console.error('Load saved recipes error:', error);
      return [];
    }
  }
}

customElements.define('profile-main', ProfileMain);