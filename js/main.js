import { InputManager } from './modules/inputManager.js';
import { ApiClient } from './modules/apiClient.js';
import { OutputManager } from './modules/outputManager.js';
import { ProgressManager } from './modules/progressManager.js';
import { StateManager } from './modules/stateManager.js';

class App {
  constructor() {
    this.inputManager = new InputManager();
    this.apiClient = new ApiClient();
    this.outputManager = new OutputManager();
    this.progressManager = new ProgressManager();
    this.stateManager = new StateManager();
    this.processing = false;
    this.setupEventListeners();
    this.loadSavedState();
    this.setupSettingsModal();
  }

  setupEventListeners() {
    const processBtn = document.getElementById('processBtn');
    processBtn.addEventListener('click', () => {
      if (this.processing) {
        this.stopProcessing();
      } else {
        this.processHighlights();
      }
    });
    this.inputManager.onInputChange(() => {
      this.validateInputs();
      this.stateManager.saveState();
    });
  }

  setupSettingsModal() {
    const modalHtml = `
      <div id="settingsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 w-96">
          <h2 class="text-xl font-semibold mb-4">Advanced Settings</h2>
          <button id="restoreDefaultBtn" class="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Restore Default
          </button>
          <button id="closeModalBtn" class="mt-4 w-full border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Add settings icon to the header
    const header = document.querySelector('h1');
    const settingsIcon = document.createElement('button');
    settingsIcon.innerHTML = `
      <svg class="w-6 h-6 text-gray-600 hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    `;
    settingsIcon.className = 'ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200';
    header.appendChild(settingsIcon);

    // Event listeners for modal
    settingsIcon.addEventListener('click', () => {
      document.getElementById('settingsModal').classList.remove('hidden');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('restoreDefaultBtn').addEventListener('click', () => {
      this.stateManager.clearState();
      this.loadSavedState();
      document.getElementById('settingsModal').classList.add('hidden');
      location.reload();
    });
  }

  loadSavedState() {
    const savedState = this.stateManager.loadState();
    if (savedState) {
      this.inputManager.setState(savedState);
    }
  }

  validateInputs() {
    const { highlights, categories, apiKey } = this.inputManager.getInputs();
    const isValid = highlights.length > 0 && categories.length > 0 && apiKey.length > 0;
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = !isValid || (this.processing && !highlights.length);
  }

  async processHighlights() {
    try {
      if (this.processing) return;
      this.processing = true;
      const processBtn = document.getElementById('processBtn');
      processBtn.disabled = false;

      const { highlights, categories, apiKey, prompt } = this.inputManager.getInputs();
      const categorizedHighlights = {};
      categories.forEach(category => categorizedHighlights[category] = []);

      this.progressManager.start(highlights.length);
      this.outputManager.clear();

      for (let i = 0; i < highlights.length; i++) {
        if (!this.processing) break;
        
        const highlight = highlights[i];
        processBtn.textContent = `${i + 1} of ${highlights.length} highlights processed — Click to stop`;

        try {
          const category = await this.apiClient.categorizeHighlight(
            highlight,
            categories,
            apiKey,
            prompt
          );

          if (category) {
            categorizedHighlights[category].push(highlight);
            this.outputManager.updateResults(categorizedHighlights);
          }
        } catch (error) {
          console.error('Error processing highlight:', error);
        }

        this.progressManager.increment();
      }
    } catch (error) {
      console.error('Processing error:', error);
      this.outputManager.showError('An error occurred while processing highlights');
    } finally {
      this.processing = false;
      const processBtn = document.getElementById('processBtn');
      processBtn.textContent = 'Process Highlights';
      this.validateInputs();
    }
  }

  stopProcessing() {
    this.processing = false;
  }
}

// Initialize the application
new App();