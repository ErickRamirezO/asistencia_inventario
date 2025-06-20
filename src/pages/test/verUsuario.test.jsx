import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import VerUsuario from '../verUsuario';

// --- CAMBIOS AQUÍ ---

// 1. Ya no necesitas mockear 'axios' aquí.
//    El mock global ya está configurado en `src/setupTests.js` para la instancia 'api'.
//    Elimina: vi.mock('axios');

// 2. Importa directamente tu instancia 'api' desde src/utils/axios.js
import api from '../../utils/axios'; // <--- IMPORTANTE: Asegúrate de que la ruta sea correcta.

// --- FIN CAMBIOS ---


import { toast } from 'sonner';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock de módulos externos (sonner, etc., se mantienen)
vi.mock('sonner', () => {
  const mockToast = vi.fn();
  mockToast.error = vi.fn();
  mockToast.success = vi.fn();
  mockToast.info = vi.fn(); // Asegúrate de que info esté mockeado si se usa.
  return { toast: mockToast };
});

describe('VerUsuario', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Limpia los mocks antes de cada prueba

    // Configurar respuestas por defecto para las llamadas a la API
    // Ahora mockeamos los métodos directamente de la instancia 'api'
    api.get.mockImplementation((url) => { // <--- CAMBIO: usa 'api.get'
      if (url === '/usuarios') { // <--- CAMBIO: usa la ruta relativa
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

      if (url === '/horarios-laborales') { // <--- CAMBIO: usa la ruta relativa
        return Promise.resolve({
          data: [
            { id: 1, nombreHorario: "Turno Mañana", horaInicio: "08:00", horaFin: "17:00" },
            { id: 2, nombreHorario: "Turno Tarde", horaInicio: "12:00", horaFin: "21:00" }
          ]
        });
      }

      // Si una URL no está mockeada explícitamente, rechazar con un error para depuración
      return Promise.reject(new Error(`URL no mockeada para GET: ${url}`));
    });

    api.patch.mockResolvedValue({ // <--- CAMBIO: usa 'api.patch'
      data: {
        id: 1,
        nombre: "María",
        apellido: "González",
        status: 0
      }
    });

    api.post.mockResolvedValue({ data: { success: true } }); // <--- CAMBIO: usa 'api.post'
    // Añade el mock para delete si tu componente lo usa directamente
    api.delete.mockResolvedValue({ data: { success: true } }); // <--- AÑADIDO: mock para delete
  });

  it('Renderiza el componente correctamente', async () => {
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
      // Se esperan 2 llamadas a api.get (una para usuarios, otra para horarios)
      expect(api.get).toHaveBeenCalledTimes(2); // <--- CAMBIO: usa 'api.get'
    });
  });

  it('Muestra datos del usuario una vez cargado', async () => {
    render(
      <MemoryRouter>
        <VerUsuario />
      </MemoryRouter>
    );

    // Wait for data to load
    await vi.waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/usuarios'); // <--- CAMBIO: usa 'api.get' y ruta relativa
      expect(api.get).toHaveBeenCalledWith('/horarios-laborales'); // <--- CAMBIO: usa 'api.get' y ruta relativa
    });

    // Check if user data is displayed after loading
    await vi.waitFor(() => {
      expect(screen.getByText('María')).toBeDefined();
      expect(screen.getByText('González')).toBeDefined();
      expect(screen.getByText('0987654321')).toBeDefined();
    });
  });

  it('Se puede activar/desactivar usuarios', async () => {
    // Setup user
    const user = userEvent.setup();

    // Render component
    render(
      <MemoryRouter>
        <VerUsuario />
      </MemoryRouter>
    );

    // Wait for the data to load
    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument();
    });

    // Find the toggle switch
    const row = screen.getByText('María').closest('tr');
    const toggleSwitch = within(row).getByRole('switch');

    // Click the toggle to change status
    await user.click(toggleSwitch);

    // Check if API was called with correct URL (ruta relativa)
    expect(api.patch).toHaveBeenCalledWith( // <--- CAMBIO: usa 'api.patch'
      '/usuarios/1/toggle-status' // <--- CAMBIO: ruta relativa
    );

    // Check if success notification was shown
    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Usuario inhabilitado",
        {
          description: "María González ha sido desactivado correctamente.",
          richColors: true
        }
      );
    });
  });

  it('Muestra una ventana de dialogo de confirmación para eliminar un usuario', async () => {
    // Setup user
    const user = userEvent.setup();

    // Mock para la eliminación exitosa (ya está en beforeEach, pero aquí para claridad si quieres sobrescribir)
    api.delete.mockResolvedValue({ data: { success: true } }); // <--- CAMBIO: usa 'api.delete'

    // Render component
    render(
      <MemoryRouter>
        <VerUsuario />
      </MemoryRouter>
    );

    // Wait for the data to load
    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument();
    });

    // Find the delete button using aria-label
    const deleteButton = screen.getByLabelText('Eliminar usuario');

    // Click the delete button to show confirmation dialog
    await user.click(deleteButton);

    // Verify that confirmation dialog appears
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();

    // Buscar texto con una expresión más flexible que coincida con tu implementación
    expect(screen.getByText(/¿Está seguro que desea eliminar/i)).toBeInTheDocument();

    // Find and click the confirm button
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' });
    await user.click(confirmButton);

    // Check if API was called with correct URL (ruta relativa)
    expect(api.delete).toHaveBeenCalledWith('/usuarios/1'); // <--- CAMBIO: usa 'api.delete' y ruta relativa

    // Check if success notification was shown
    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Usuario eliminado",
        {
          description: expect.stringContaining("ha sido eliminado correctamente"),
          richColors: true
        }
      );
    });

    // Verify the user is no longer in the list
    await vi.waitFor(() => {
      expect(screen.queryByText('María')).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Make API calls fail
    api.get.mockRejectedValue(new Error('API Error')); // <--- CAMBIO: usa 'api.get'

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
