const API_BASE_URL = 'http://localhost:3000';

export const api = {
  login: (email, password) => 
    fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),

  register: (username, email, password) =>
    fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    }),

  getRecipes: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/api/recipes${queryString ? '?' + queryString : ''}`);
  },

  getRecipeById: (id) =>
    fetch(`${API_BASE_URL}/api/recipes/${id}`),

  createRecipe: (recipeData, token) =>
    fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(recipeData)
    }),

  getCategories: () =>
    fetch(`${API_BASE_URL}/api/categories`),

  getRegions: () =>
    fetch(`${API_BASE_URL}/api/regions`),

  saveRecipe: (recipeId, token) =>
    fetch(`${API_BASE_URL}/api/recipes/${recipeId}/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  unsaveRecipe: (recipeId, token) =>
    fetch(`${API_BASE_URL}/api/recipes/${recipeId}/save`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getSavedRecipes: (token) =>
    fetch(`${API_BASE_URL}/api/saved-recipes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

export const getAuthToken = () => localStorage.getItem('token');

export const isLoggedIn = () => !!getAuthToken();
