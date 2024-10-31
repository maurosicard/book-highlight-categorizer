export class ProgressTracker {
  constructor() {
    this.total = 0;
    this.current = 0;
    this.progressBar = document.getElementById('progressBar');
    this.progressStats = document.getElementById('progressStats');
  }

  start(total) {
    this.total = total;
    this.current = 0;
    this.update();
  }

  increment() {
    this.current++;
    this.update();
  }

  update() {
    const percentage = (this.current / this.total) * 100;
    this.progressBar.style.width = `${percentage}%`;
    this.progressStats.textContent = `${this.current} of ${this.total} highlights processed`;
  }
}