// src/setupTests.js
import '@testing-library/jest-dom';

// Mock para ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock para scrollIntoView
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function() {};
}