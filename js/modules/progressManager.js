export class ProgressManager {
  constructor() {
    this.progressBar = document.getElementById('progressBar');
    this.progressStats = document.getElementById('progressStats');
    this.total = 0;
    this.current = 0;
  }

  start(total) {
    this.total = total;
    this.current = 0;
    this.updateUI();
  }

  increment() {
    this.current++;
    this.updateUI();
  }

  updateUI() {
    const percentage = (this.current / this.total) * 100;
    this.progressBar.style.width = `${percentage}%`;
    this.progressStats.textContent = `${this.current} of ${this.total} highlights processed`;
  }

  reset() {
    this.total = 0;
    this.current = 0;
    this.updateUI();
  }
}