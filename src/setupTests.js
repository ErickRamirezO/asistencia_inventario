// src/setupTests.js

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock para ResizeObserver para componentes que usan ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock para scrollIntoView si no existe (útil para pruebas de UI que lo usen)
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function() {};
}


// --- INICIO del MOCK DE AXIOS MEJORADO ---

// 1. Define una plantilla/fábrica para una instancia mock de Axios.
//    Esto representa lo que `axios.create()` devolvería, o lo que `axios` mismo contiene
//    cuando se le añaden sus propiedades estáticas.
const createMockAxiosInstance = () => ({
  interceptors: {
    request: { use: vi.fn() }, // Para api.interceptors.request.use()
    response: { use: vi.fn() }, // Para api.interceptors.response.use()
  },
  // Métodos HTTP comunes, mockeados para devolver promesas resueltas con datos vacíos.
  // Usamos vi.fn() para poder espiar estas llamadas en los tests.
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  patch: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  // Si tu código usa otras propiedades de la instancia (ej. `instance.defaults`), agrégalas aquí.
  // defaults: {},
});

// 2. Crea el mock principal para `axios`.
//    Axios es una función (que se puede llamar directamente, ej. `axios('/users')`),
//    y también tiene propiedades estáticas como `axios.create`.
//    Por lo tanto, `axiosMock` debe ser una función (`vi.fn()`).
const axiosMock = vi.fn(() => Promise.resolve({ data: {} })); // Comportamiento por defecto al llamar axios() directamente.

// 3. Asigna las propiedades y métodos estáticos de Axios al `axiosMock` (que es una función).
//    Esto incluye los interceptors y los métodos HTTP que se acceden directamente desde `axios`.
Object.assign(axiosMock, createMockAxiosInstance());

// 4. Asigna el método `create` al mock principal de `axios`.
//    Cuando `axios.create()` es llamado, devolverá una *nueva* instancia mock
//    creada por `createMockAxiosInstance`.
axiosMock.create = vi.fn(createMockAxiosInstance);


// 5. Configura el mock para el módulo 'axios'.
//    Asegúrate de que el `default` exportado sea `axiosMock`,
//    que ahora tiene todas las propiedades correctas definidas y es una función espiable.
vi.mock('axios', () => ({
  default: axiosMock,
}));

// Mock global para window.matchMedia
if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  };
}

// --- FIN del MOCK DE AXIOS MEJORADO ---
