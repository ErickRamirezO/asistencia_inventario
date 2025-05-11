import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerUsuario from './verUsuario';
import axios from 'axios';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('axios');
vi.mock('sonner', () => ({
  toast: vi.fn()
}));

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
              nombre: "Juan",
              apellido: "Pérez",
              cedula: "1234567890",
              email: "juan@test.com",
              telefono: "099123456",
              status: 1,
              user: "jperez",
              departamentoNombre: "Recursos Humanos",
              horarioLaboralId: 1
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
        nombre: "Juan",
        apellido: "Pérez",
        status: 0
      }
    });
    
    axios.post.mockResolvedValue({ data: { success: true } });
  });
  
  it('should render the component', async () => {
    const { container } = render(<VerUsuario />);
    
    // Check if the component renders initially
    expect(container).toBeDefined();
    expect(screen.getByText('Cargando usuarios...')).toBeDefined();
    
    // Wait for the async operations
    await vi.waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });
  
  it('should display user data after loading', async () => {
    render(<VerUsuario />);
    
    // Wait for data to load
    await vi.waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/usuarios');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/horarios-laborales');
    });
    
    // Check if user data is displayed after loading
    await vi.waitFor(() => {
      expect(screen.getByText('Juan')).toBeDefined();
      expect(screen.getByText('Pérez')).toBeDefined();
      expect(screen.getByText('1234567890')).toBeDefined();
    });
  });
  
  it('should handle API errors gracefully', async () => {
    // Make API calls fail
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<VerUsuario />);
    
    // Verify error handling
    await vi.waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', expect.objectContaining({
        description: 'No se pudieron cargar los horarios laborales.'
      }));
    });
  });
});