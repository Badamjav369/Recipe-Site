export class LoginModal extends HTMLElement {
  constructor() {
    super();
    this.overlay = null;
    this.form = null;
    this.API_BASE_URL = 'http://localhost:3000/api';
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

  // THIS IS THE KEY CHANGE - Now calling the backend API instead of reading JSON file
  async performLogin(data) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      // If login failed
      if (!response.ok) {
        this.showError(result.error || "Gmail эсвэл нууц үг буруу");
        return false;
      }

      // If login succeeded - save ALL the data including token
      this.saveUserData(result);
      this.showSuccess(`Амжилттай нэвтэрлээ: ${result.email}`);
      return true;
      
    } catch (err) {
      console.error("Login error:", err);
      this.showError("Серверт холбогдоход алдаа гарлаа. Дахин оролдоно уу.");
      return false;
    }
  }

  // THIS IS THE OTHER KEY CHANGE - Now saving the token too!
  saveUserData(data) {
    localStorage.setItem("token", data.token);      // ← THIS WAS MISSING!
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("email", data.email);
    
    // Optional: also save username if backend returns it
    if (data.username) {
      localStorage.setItem("username", data.username);
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