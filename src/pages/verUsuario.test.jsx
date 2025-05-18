import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerUsuario from './verUsuario';
import axios from 'axios';
import { toast } from 'sonner';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock the dependencies
vi.mock('axios');
vi.mock('sonner', () => {
  const mockToast = vi.fn();
  mockToast.error = vi.fn();
  mockToast.success = vi.fn();
  return { toast: mockToast };
});

describe('VerUsuario', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mock responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/usuarios')) {
        return Promise.resolve({ 
          data: [
            {
              id: 1,
              nombre: "María",
              apellido: "González",
              cedula: "0987654321",
              email: "maria.gonzalez@empresa.com",
              telefono: "098765432",
              status: 1,
              user: "mgonzalez",
              departamentoNombre: "Tecnología",
              horarioLaboralId: 2
            }
          ] 
        });
      }
      
      if (url.includes('/api/horarios-laborales')) {
        return Promise.resolve({ 
          data: [
            { id: 1, nombreHorario: "Turno Mañana", horaInicio: "08:00", horaFin: "17:00" },
            { id: 2, nombreHorario: "Turno Tarde", horaInicio: "12:00", horaFin: "21:00" }
          ]
        });
      }
      
      return Promise.reject(new Error('URL not mocked'));
    });
    
    axios.patch.mockResolvedValue({ 
      data: {
        id: 1,
        nombre: "María",
        apellido: "González",
        status: 0
      }
    });
    
    axios.post.mockResolvedValue({ data: { success: true } });
  });
  
  it('should render the component', async () => {
    const { container } = render(
      // Envolver el componente con MemoryRouter
      <MemoryRouter>
        <VerUsuario />
      </MemoryRouter>
    );
    // Check if the component renders initially
    expect(container).toBeDefined();
    expect(screen.getByText('Cargando usuarios...')).toBeDefined();
    
    // Wait for the async operations
    await vi.waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });
  
  it('should display user data after loading', async () => {
    render(
      <MemoryRouter>
        <VerUsuario />
      </MemoryRouter>
    );
    
    // Wait for data to load
    await vi.waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/usuarios');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/horarios-laborales');
    });
    
    // Check if user data is displayed after loading
    await vi.waitFor(() => {
      expect(screen.getByText('María')).toBeDefined();
      expect(screen.getByText('González')).toBeDefined();
      expect(screen.getByText('0987654321')).toBeDefined();
    });
  });
  
  it('should handle API errors gracefully', async () => {
    // Make API calls fail
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(
      <MemoryRouter>
        <VerUsuario />
      </MemoryRouter>
    );

    // Busca un mensaje de error en la UI
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      // o, si usas toast directamente:
      // expect(toast).toHaveBeenCalled();
    }, { timeout: 3000 });
    });
});