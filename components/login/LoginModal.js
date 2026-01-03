export class LoginModal extends HTMLElement {
  constructor() {
    super();
    this.overlay = null;
    this.form = null;
  }

  connectedCallback() {
    this.render();
    this.cacheElements();
    this.attachEventListeners();
  }

  cacheElements() {
    this.overlay = this.querySelector(".login-overlay");
    this.form = this.querySelector(".login-form");
  }

  createModalHTML() {
    return `
      <div class="login-overlay">
        <form class="login-form">
          ${this.createHeaderHTML()}
          ${this.createInputsHTML()}
          ${this.createButtonsHTML()}
        </form>
      </div>
    `;
  }

  createHeaderHTML() {
    return `<h2>Илүү их үйлдэл хийхийн тулд та нэвтрэх эсвэл бүртгүүлээрэй</h2>`;
  }

  createInputsHTML() {
    return `
      <input type="email" class="email-input" placeholder="Gmail-ээ оруулна уу" required>
      <input type="password" class="password-input" placeholder="Нууц үгээ оруулна уу" required>
    `;
  }

  createButtonsHTML() {
    return `
      <button type="submit">Нэвтрэх</button>
      <a class="links" href="#">Утсаар нэвтрэх</a>
      <p class="or-text">Эсвэл</p>
      <button type="button" class="google-login-btn">
        <img src="images/icon-images/google-logo.png" alt="Google logo">
        <span>Google-ээр үргэлжлүүлэх</span>
      </button>
      <a class="links" href="#">Бүртгүүлэх</a>
    `;
  }

  getFormData() {
    const emailInput = this.form.querySelector('.email-input');
    const passwordInput = this.form.querySelector('.password-input');
    
    return {
      email: emailInput?.value.trim() || '',
      password: passwordInput?.value.trim() || ''
    };
  }

  validateFormData(data) {
    if (!data.email || !data.password) {
      this.showError("Gmail болон нууц үгээ оруулна уу");
      return false;
    }

    if (!this.isValidEmail(data.email)) {
      this.showError("Gmail хаяг буруу байна");
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async fetchUsers() {
    const res = await fetch("./data/security.json");
    
    if (!res.ok) {
      throw new Error('Сервертэй холбогдоход алдаа гарлаа');
    }
    
    return await res.json();
  }

  findUser(users, email, password) {
    return users.find(u => u.email === email && u.password === password);
  }

  saveUserData(user) {
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("email", user.email);
  }

  async performLogin(data) {
    try {
      const users = await this.fetchUsers();
      const user = this.findUser(users, data.email, data.password);

      if (!user) {
        this.showError("Gmail эсвэл нууц үг буруу");
        return false;
      }

      this.saveUserData(user);
      this.showSuccess(`Амжилттай нэвтэрлээ: ${user.email}`);
      return true;
      
    } catch (err) {
      console.error("Login error:", err);
      this.showError("Алдаа гарлаа. Дахин оролдоно уу.");
      return false;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = this.getFormData();
    
    if (!this.validateFormData(formData)) {
      return;
    }

    const success = await this.performLogin(formData);
    
    if (success) {
      this.close();
      this.reloadPage();
    }
  }

  handleOverlayClick(e) {
    if (e.target === this.overlay) {
      this.close();
    }
  }

  attachEventListeners() {
    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => this.handleOverlayClick(e));
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  open() {
    if (this.overlay) {
      this.overlay.style.display = "flex";
      document.body.classList.add("modal-open");
    }
  }

  close() {
    if (this.overlay) {
      this.overlay.style.display = "none";
      document.body.classList.remove("modal-open");
    }
    this.resetForm();
  }

  resetForm() {
    if (this.form) {
      this.form.reset();
    }
  }

  reloadPage() {
    window.location.reload();
  }

  showError(message) {
    alert(message);
  }

  showSuccess(message) {
    alert(message);
  }

  render() {
    this.innerHTML = this.createModalHTML();
  }
}

customElements.define("login-modal", LoginModal);