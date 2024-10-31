export class OutputManager {
  constructor() {
    this.outputElement = document.getElementById('output');
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadTxt());
    document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('clearLogBtn').addEventListener('click', () => this.clearLog());
  }

  clear() {
    this.outputElement.textContent = '';
    this.clearLog();
  }

  clearLog() {
    document.getElementById('apiLog').innerHTML = '';
  }

  updateResults(categorizedHighlights) {
    let output = '';
    
    for (const [category, highlights] of Object.entries(categorizedHighlights)) {
      if (highlights.length > 0) {
        output += `## ${category}\n`;
        highlights.forEach(highlight => {
          output += `${highlight}\n`;
        });
        output += '\n';
      }
    }

    this.outputElement.textContent = output;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-600 mt-2 p-2 bg-red-50 rounded-lg';
    errorDiv.textContent = message;
    this.outputElement.appendChild(errorDiv);
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.outputElement.textContent);
      this.showToast('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      this.showToast('Failed to copy to clipboard', true);
    }
  }

  downloadTxt() {
    const content = this.outputElement.textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categorized-highlights.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
      isError ? 'bg-red-500' : 'bg-green-500'
    } text-white transform transition-transform duration-300 translate-y-0`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(200%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  }
}