export class InputManager {
  constructor() {
    this.highlightsInput = document.getElementById('highlights');
    this.categoriesInput = document.getElementById('categories');
    this.apiKeyInput = document.getElementById('apiKey');
    this.promptInput = document.getElementById('prompt');
    this.changeListeners = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    const inputs = [
      this.highlightsInput,
      this.categoriesInput,
      this.apiKeyInput,
      this.promptInput
    ];

    inputs.forEach(input => {
      input.addEventListener('input', () => this.notifyChangeListeners());
      input.addEventListener('change', () => this.notifyChangeListeners());
    });
  }

  onInputChange(callback) {
    this.changeListeners.push(callback);
  }

  notifyChangeListeners() {
    this.changeListeners.forEach(callback => callback());
  }

  getInputs() {
    return {
      highlights: this.getHighlights(),
      categories: this.getCategories(),
      apiKey: this.getApiKey(),
      prompt: this.getPrompt()
    };
  }

  setState(state) {
    this.highlightsInput.value = state.highlights || '';
    this.categoriesInput.value = state.categories || '';
    this.apiKeyInput.value = state.apiKey || '';
    this.promptInput.value = state.prompt || '';
    this.notifyChangeListeners();
  }

  getHighlights() {
    return this.highlightsInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  getCategories() {
    return this.categoriesInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  getApiKey() {
    return this.apiKeyInput.value.trim();
  }

  getPrompt() {
    return this.promptInput.value.trim();
  }

  clear() {
    this.highlightsInput.value = '';
    this.categoriesInput.value = '';
    this.promptInput.value = '';
    this.notifyChangeListeners();
  }
}