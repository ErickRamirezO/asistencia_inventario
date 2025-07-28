import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
vi.mock('@/utils/UserContext', () => ({
  useUser: () => ({ user: { userId: 1, nombre: "Test" } }),
}));
import Attendance from '../asistencia/asistencia'; 

// --- CAMBIOS AQUÍ ---

// 1. No necesitas mockear 'axios' globalmente en este archivo.
//    El mock de 'axios' ya está configurado en `src/setupTests.js` para interceptar `axios.create()`.
//    Por lo tanto, la importación de `api` de `src/utils/axios.js` ya usará ese mock.
//    Elimina: vi.mock('axios', ...);

// 2. Importa directamente tu instancia 'api' desde src/utils/axios.js
import api from '../../utils/axios'; // <--- IMPORTANTE: Asegúrate de que la ruta sea correcta
import { toast } from 'sonner';

// --- FIN CAMBIOS ---


// Mock de módulos externos (sonner, etc., se mantienen)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('@/utils/UserContext', () => ({
  useUser: () => ({ user: { userId: 1, nombre: "Test" } }),
}));
// Datos de prueba (se mantienen igual)
const mockAttendanceData = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    departamento: 'Recursos Humanos',
    entrada: '2025-05-19T08:00:00',
    salida: '2025-05-19T17:00:00',
    estado: 1,
    fecha: '2025-05-19'
  },
  {
    id: 2,
    nombre: 'María López',
    departamento: 'Ventas',
    entrada: '2025-05-19T08:15:00',
    salida: '2025-05-19T17:30:00',
    estado: 1,
    fecha: '2025-05-19'
  },
  {
    id: 3,
    nombre: 'Carlos Gómez',
    departamento: 'Tecnología',
    entrada: null,
    salida: null,
    estado: 0,
    fecha: '2025-05-19'
  }
];

const mockEvents = ['Capacitación Anual', 'Reunión Departamental', 'Taller de Seguridad'];

const mockEventAttendance = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    departamento: 'Recursos Humanos',
    entrada: '09:00',
    salida: '11:00',
    estado: 1
  },
  {
    id: 2,
    nombre: 'María López',
    departamento: 'Ventas',
    entrada: '09:15',
    salida: null,
    estado: 0
  }
];

const mockNewAttendance = {
  id: 4,
  nombre: 'Pedro Rodríguez',
  departamento: 'Marketing',
  entrada: '2025-05-19T09:30:00',
  salida: null,
  estado: 1,
  fecha: '2025-05-19'
};

describe('Componente de Asistencia', () => {
  beforeEach(() => {
    // Configurar respuestas por defecto para las llamadas a la API
    // Ahora mockeamos los métodos directamente de la instancia 'api'
    api.get.mockImplementation((url) => { // <--- CAMBIO: usa 'api.get'
      if (url === '/asistencias/usuarios-resumen') {
        return Promise.resolve({ data: mockAttendanceData });
      }
      else if (url === '/asistencias/eventos-disponibles') {
        return Promise.resolve({ data: mockEvents });
      }
      else if (url.includes('/asistencias/filtradas')) {
        return Promise.resolve({ data: mockEventAttendance });
      }
      return Promise.resolve({ data: [] });
    });

    // Asegúrate de mockear también 'api.post' y 'api.put' si tu componente los usa
    // Por ejemplo, si tu componente envía datos de asistencia o los actualiza:
    api.post.mockResolvedValue({ data: mockNewAttendance }); // <--- EJEMPLO: usa 'api.post'
    api.put.mockResolvedValue({ data: {} }); // <--- EJEMPLO: usa 'api.put'
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renderiza correctamente y muestra datos de asistencia', async () => {
    render(<Attendance />);

    // Verificar que se muestra el mensaje de carga inicialmente
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Verificar que se muestran las estadísticas
    expect(screen.getByText('Total Empleados')).toBeInTheDocument();
    expect(screen.getByText('Presentes Hoy')).toBeInTheDocument();
    expect(screen.getByText('Ausentes')).toBeInTheDocument();

    // Verificar que se muestran los datos de asistencia
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();

    // Verificar que se llamó a la API correctamente
    expect(api.get).toHaveBeenCalledWith('/asistencias/usuarios-resumen'); // <--- CAMBIO: usa 'api.get'
  });

  test('Filtra empleados por nombre correctamente', async () => {
    render(<Attendance />);

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Buscar a María
    const searchInput = screen.getByPlaceholderText('Buscar empleado...');
    fireEvent.change(searchInput, { target: { value: 'María' } });

    // Verificar que solo se muestra María y no los otros empleados
    await waitFor(() => {
      expect(screen.getByText('María López')).toBeInTheDocument();
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      expect(screen.queryByText('Laura Salazar')).not.toBeInTheDocument();
    });
  });


  test('Muestra mensaje cuando no hay resultados en la búsqueda', async () => {
    render(<Attendance />);

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Buscar algo que no existe
    const searchInput = screen.getByPlaceholderText('Buscar empleado...');
    fireEvent.change(searchInput, { target: { value: 'XYZ123' } });

    // Verificar que se muestra el mensaje de no resultados
    await waitFor(() => {
      expect(screen.getByText('No hay registros')).toBeInTheDocument();
      expect(screen.getByText('No se encontraron registros para la búsqueda o filtros seleccionados.')).toBeInTheDocument();
    });
  });
});
