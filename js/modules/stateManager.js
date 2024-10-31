export class StateManager {
  constructor() {
    this.storageKey = 'bookHighlightsState';
  }

  saveState() {
    const state = {
      highlights: document.getElementById('highlights').value,
      categories: document.getElementById('categories').value,
      apiKey: document.getElementById('apiKey').value,
      prompt: document.getElementById('prompt').value
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  loadState() {
    const savedState = localStorage.getItem(this.storageKey);
    return savedState ? JSON.parse(savedState) : null;
  }

  clearState() {
    localStorage.removeItem(this.storageKey);
  }
}