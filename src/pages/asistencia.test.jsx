// src/pages/asistencia.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Attendance from './asistencia';
import axios from 'axios';
import { act } from 'react-dom/test-utils';

// Mock de las dependencias
vi.mock('axios');
vi.mock('../components/check-in-dialog', () => ({
  default: () => <button data-testid="check-in-dialog">Registrar Asistencia</button>
}));

// Datos de prueba para la asistencia
const mockAttendanceData = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    departamento: 'Recursos Humanos',
    entrada: '2025-05-15T08:00:00',
    salida: '2025-05-15T17:00:00',
    estado: 1,
    fecha: '2025-05-15'
  },
  {
    id: 2,
    nombre: 'María López',
    departamento: 'Tecnología',
    entrada: '2025-05-15T09:00:00',
    salida: null,
    estado: 1,
    fecha: '2025-05-15'
  },
  {
    id: 3,
    nombre: 'Carlos Gómez',
    departamento: 'Ventas',
    entrada: null,
    salida: null,
    estado: 0,
    fecha: '2025-05-15'
  },
  // Agregar más datos para probar la paginación
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 4,
    nombre: `Empleado ${i + 4}`,
    departamento: i % 2 === 0 ? 'Ventas' : 'Tecnología',
    entrada: i % 3 === 0 ? null : `2025-05-15T0${8 + (i % 2)}:00:00`,
    salida: i % 4 === 0 ? null : `2025-05-15T1${7 + (i % 2)}:00:00`,
    estado: i % 5 === 0 ? 0 : 1,
    fecha: '2025-05-15'
  }))
];

describe('Attendance Component', () => {
  beforeEach(() => {
    // Configurar el mock de axios antes de cada prueba
    axios.get.mockResolvedValue({ data: mockAttendanceData });
    
    // Mock para Date.prototype.toLocaleTimeString
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:30:00');
    
    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renderiza el componente correctamente', async () => {
    render(<Attendance />);
    
    // Verificar elementos de carga inicial
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Verificar elementos del encabezado
    expect(screen.getByText('Controla la asistencia y horas de trabajo de los empleados')).toBeInTheDocument();
    expect(screen.getByText('Ver Calendario')).toBeInTheDocument();
    expect(screen.getByTestId('check-in-dialog')).toBeInTheDocument();
    
    // Verificar tarjetas de estadísticas
    expect(screen.getByText('Total Empleados')).toBeInTheDocument();
    expect(screen.getByText('Presentes Hoy')).toBeInTheDocument();
    expect(screen.getByText('Ausentes')).toBeInTheDocument();
    expect(screen.getByText('Hora Actual')).toBeInTheDocument();
    
    // Verificar filtros
    expect(screen.getByPlaceholderText('Buscar empleado...')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar Departamento')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar Fecha')).toBeInTheDocument();
    
    // Verificar tabla de asistencia
    expect(screen.getByText('Registros de Asistencia')).toBeInTheDocument();
    expect(screen.getByText('Ver y gestionar los registros de asistencia de los empleados.')).toBeInTheDocument();
    
    // Verificar encabezados de la tabla
    const tableHeaders = ['Nombre', 'Departamento', 'Entrada', 'Salida', 'Estado', 'Fecha', 'Acciones'];
    tableHeaders.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
    
    // Verificar que se muestran los datos en la tabla
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
  },10000);

  it('maneja correctamente la carga de datos desde la API', async () => {
    render(<Attendance />);
    
    // Verificar que se llamó a la API
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/asistencias/usuarios-resumen');
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestran los valores correctos en las estadísticas
    // El total de empleados es la longitud de mockAttendanceData
    expect(screen.getByText(mockAttendanceData.length.toString())).toBeInTheDocument();
    
    // Los presentes son los que tienen estado === 1
    const presentCount = mockAttendanceData.filter(item => item.estado === 1).length;
    expect(screen.getByText(presentCount.toString())).toBeInTheDocument();
    
    // Los ausentes son los que tienen estado === 0
    const absentCount = mockAttendanceData.filter(item => item.estado === 0).length;
    expect(screen.getByText(absentCount.toString())).toBeInTheDocument();
  });

  it('actualiza la hora actual periódicamente', async () => {
    render(<Attendance />);
    
    // Verificar la hora inicial
    await waitFor(() => {
      expect(screen.getByText('10:30:00')).toBeInTheDocument();
    });
    
    // Cambiar el mock para simular el paso del tiempo
    Date.prototype.toLocaleTimeString.mockReturnValue('10:30:01');
    
    // Avanzar el timer 1 segundo
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Verificar que la hora se ha actualizado
    await waitFor(() => {
      expect(screen.getByText('10:30:01')).toBeInTheDocument();
    });
  });

  it('filtra correctamente por nombre de empleado', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Attendance />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Buscar por nombre
    const searchInput = screen.getByPlaceholderText('Buscar empleado...');
    await user.clear(searchInput);
    await user.type(searchInput, 'Juan');
    
    // Verificar que solo se muestra el empleado buscado
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María López')).not.toBeInTheDocument();
  });

  it('filtra correctamente por departamento', async () => {
    const user = userEvent.setup();
    render(<Attendance />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Abrir el select de departamento
    const departmentSelect = screen.getByText('Seleccionar Departamento');
    await user.click(departmentSelect);
    
    // Seleccionar el departamento de Tecnología
    const technologyOption = screen.getByText('Tecnología', { exact: false });
    await user.click(technologyOption);
    
    // Verificar que solo se muestran empleados de Tecnología
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Gómez')).not.toBeInTheDocument();
  });

  it('filtra correctamente por fecha', async () => {
    const user = userEvent.setup();
    render(<Attendance />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Abrir el select de fecha
    const dateSelect = screen.getByText('Seleccionar Fecha');
    await user.click(dateSelect);
    
    // Seleccionar "Hoy"
    const todayOption = screen.getByText('Hoy', { exact: false });
    await user.click(todayOption);
    
    // Como todos los datos de prueba son de hoy, deberían mostrarse todos
    // Por lo tanto, verificamos la presencia de algunos empleados
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
  });

  it('muestra el mensaje de "No hay registros" cuando no hay coincidencias', async () => {
    const user = userEvent.setup();
    render(<Attendance />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Buscar un empleado que no existe
    const searchInput = screen.getByPlaceholderText('Buscar empleado...');
    await user.clear(searchInput);
    await user.type(searchInput, 'EmpleadoInexistente');
    
    // Verificar que se muestra el mensaje de no hay registros
    expect(screen.getByText('No hay registros')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron registros para la búsqueda o filtros seleccionados.')).toBeInTheDocument();
  });

  it('maneja correctamente la paginación', async () => {
    const user = userEvent.setup();
    render(<Attendance />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Verificar que estamos en la página 1
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    
    // Verificar que se muestran los primeros 10 registros
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    // Ir a la siguiente página
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);
    
    // Verificar que estamos en la página 2
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    
    // Verificar que ahora se muestran otros registros
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    
    // Intentar ir a la página siguiente cuando estamos en la última página
    // El botón debería estar deshabilitado
    expect(nextButton).toBeDisabled();
    
    // Volver a la página anterior
    const prevButton = screen.getByRole('button', { name: /anterior/i });
    await user.click(prevButton);
    
    // Verificar que volvimos a la página 1
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('maneja correctamente los errores de la API', async () => {
    // Configurar axios para simular un error
    axios.get.mockRejectedValueOnce(new Error('Error de conexión a la API'));
    
    render(<Attendance />);
    
    // Verificar que inicialmente se muestra el estado de carga
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    
    // Esperar a que se maneje el error
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestra el mensaje de error
    expect(screen.getByText('Error de conexión a la API')).toBeInTheDocument();
  });

  it('formatea correctamente las fechas y horas en la tabla', async () => {
    // Mock para Date.prototype.toLocaleTimeString específico para formatear horas de entrada/salida
    const dateToLocaleTimeStringOriginal = Date.prototype.toLocaleTimeString;
    Date.prototype.toLocaleTimeString = function() {
      if (this.toISOString().includes('08:00:00')) return '08:00 AM';
      if (this.toISOString().includes('17:00:00')) return '05:00 PM';
      return '10:30:00'; // Default for clock
    };
    
    render(<Attendance />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Verificar que las horas se formatean correctamente
    expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    expect(screen.getByText('05:00 PM')).toBeInTheDocument();
    
    // Verificar que se muestra "No registra entrada/salida" cuando corresponde
    expect(screen.getByText('No registra entrada')).toBeInTheDocument();
    expect(screen.getByText('No registra salida')).toBeInTheDocument();
    
    // Restaurar el método original
    Date.prototype.toLocaleTimeString = dateToLocaleTimeStringOriginal;
  });
});