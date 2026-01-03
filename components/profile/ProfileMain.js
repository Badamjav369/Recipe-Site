export class ProfileMain extends HTMLElement {
  constructor() {
    super();
    this.userData = {
      userId: null,
      email: null,
      username: null
    };
  }

  connectedCallback() {
    this.loadUserData();
    this.render();
    this.attachEventListeners();
  }

  loadUserData() {
    this.userData.userId = localStorage.getItem("userId");
    this.userData.email = localStorage.getItem("email");
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
      <textarea id="ingredients" name="ingredients" placeholder="Орцоо оруулна уу..." required></textarea><br>
      <label for="instructions">Хийх дараалал</label><br>
      <textarea id="instructions" name="instructions" placeholder="Хийх дарааллыг оруулна уу..." required></textarea><br>
      <label for="info">Нэмэлт мэдээлэл, зөвлөмж</label><br>
      <textarea id="info" name="info" placeholder="Нэмэлт зөвлөмж, санамж..."></textarea><br>
    `;
  }

  createSavedRecipesHTML() {
    return `<foods-section title="Хадгалсан жорууд"></foods-section>`;
  }

  createUserRecipesHTML() {
    return `<foods-section title="Оруулсан жорууд"></foods-section>`;
  }

  collectFormData(form) {
    const formData = {
      name: form.querySelector("#name").value.trim(),
      type: form.querySelector("#type").value.trim(),
      time: form.querySelector("#time").value.trim(),
      portion: form.querySelector("#portion").value.trim(),
      cal: form.querySelector("#cal").value.trim(),
      ingredients: form.querySelector("#ingredients").value.trim(),
      instructions: form.querySelector("#instructions").value.trim(),
      info: form.querySelector("#info").value.trim(),
      userId: this.userData.userId
    };

    const imageInput = form.querySelector("#image");
    if (imageInput?.files.length > 0) {
      formData.image = imageInput.files[0].name;
    }

    return formData;
  }

  validateRecipeForm(data) {
    const requiredFields = ['name', 'type', 'time', 'portion', 'cal', 'ingredients', 'instructions'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        this.showError(`${field} талбарыг бөглөнө үү`);
        return false;
      }
    }
    
    return true;
  }

  async submitRecipe(data) {
    console.log("Жор нэмэх:", data);
    
    // TODO: Backend API дуудлага
    // const response = await fetch('/api/recipes/add', {
    // method: 'POST',
    // headers: { 'Content-Type': 'application/json' },
    // body: JSON.stringify(data)
    // });
    
    this.showSuccess("Жор амжилттай нэмэгдлээ! (Одоогоор backend байхгүй)");
    return true;
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
  }
}

customElements.define('profile-main', ProfileMain);