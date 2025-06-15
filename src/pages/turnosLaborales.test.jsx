import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TurnosLaborales from './turnosLaborales';

// --- CAMBIOS AQUÍ ---

// 1. Ya no necesitas mockear 'axios' globalmente en este archivo.
//    El mock de 'axios' ya está configurado en `src/setupTests.js` para interceptar `axios.create()`.
//    Por lo tanto, la importación de `api` de `src/utils/axios.js` ya usará ese mock.
//    Elimina: vi.mock('axios'); // Esta línea ya no está en el `selection-tag` pero la mención es por contexto.

// 2. Importa directamente tu instancia 'api' desde src/utils/axios.js
import api from '../utils/axios'; // <--- IMPORTANTE: Asegúrate de que la ruta sea correcta.

// --- FIN CAMBIOS ---


// Mock de módulos externos (sonner, etc., se mantienen)
import { toast } from 'sonner';
vi.mock('sonner', () => ({
  toast: vi.fn()
}));


// Datos de prueba (se mantienen igual)
const mockTurnos = [
  {
    id: 1,
    nombreHorario: 'Turno Mañana',
    horaInicio: '08:00',
    horaFin: '17:00',
    horaInicioAlmuerzo: '12:00',
    horaFinAlmuerzo: '13:00'
  },
  {
    id: 2,
    nombreHorario: 'Turno Tarde',
    horaInicio: '14:00',
    horaFin: '22:00',
    horaInicioAlmuerzo: '18:00',
    horaFinAlmuerzo: '19:00'
  }
];

describe('TurnosLaborales Component', () => {
  beforeEach(() => {
    // Configurar los mocks antes de cada prueba
    // Ahora mockeamos los métodos directamente de la instancia 'api'
    api.get.mockResolvedValue({ data: mockTurnos }); // <--- CAMBIO: usa 'api.get'
    api.post.mockResolvedValue({ // <--- CAMBIO: usa 'api.post'
      data: {
        id: 3,
        nombreHorario: 'Nuevo Turno',
        horaInicio: '09:00',
        horaFin: '18:00',
        horaInicioAlmuerzo: '13:00',
        horaFinAlmuerzo: '14:00'
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test de renderizado básico (descomentado y corregido)
  it('renderiza el componente correctamente', async () => {
    render(<TurnosLaborales />);

    // Verificar que el título está presente
    expect(screen.getByText('Turnos Laborales')).toBeInTheDocument();

    // Verificar que el botón para crear turnos está presente
    expect(screen.getByText('Crear Turno Laboral')).toBeInTheDocument();

    // Verificar que se llamó a la API para obtener turnos con la ruta relativa
    expect(api.get).toHaveBeenCalledWith('/horarios-laborales'); // <--- CAMBIO: ruta relativa

    // Esperar a que los datos se carguen y verificar la tabla
    await waitFor(() => {
      expect(screen.getByText('Turno Mañana')).toBeInTheDocument();
      expect(screen.getByText('Turno Tarde')).toBeInTheDocument();
    });

    // Verificar que se muestran los encabezados de la tabla
    expect(screen.getByText('Nombre del Turno')).toBeInTheDocument();
    expect(screen.getByText('Hora de Inicio')).toBeInTheDocument();
    expect(screen.getByText('Hora de Fin')).toBeInTheDocument();
    expect(screen.getByText('Inicio de Almuerzo')).toBeInTheDocument();
    expect(screen.getByText('Fin de Almuerzo')).toBeInTheDocument();
  });

  it('muestra el mensaje cuando no hay turnos', async () => {
    // Modificar el mock para devolver un array vacío
    api.get.mockResolvedValueOnce({ data: [] }); // <--- CAMBIO: usa 'api.get'

    render(<TurnosLaborales />);

    // Esperar y verificar el mensaje cuando no hay turnos
    await waitFor(() => {
      expect(screen.getByText('No hay turnos laborales registrados.')).toBeInTheDocument();
    });
  });

  it('abre el diálogo al hacer clic en el botón Crear Turno Laboral', async () => {
    const user = userEvent.setup();
    render(<TurnosLaborales />);

    // Hacer clic en el botón para abrir el diálogo
    const createButton = screen.getByText('Crear Turno Laboral');
    await user.click(createButton);

    // Verificar que el diálogo está abierto y muestra el título
    expect(screen.getByText('Crear Turno Laboral', { selector: 'h2' })).toBeInTheDocument();

    // Verificar que todos los campos del formulario están presentes
    expect(screen.getByLabelText('Nombre del Turno')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora de Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora de Fin')).toBeInTheDocument();
    expect(screen.getByLabelText('Inicio de Almuerzo')).toBeInTheDocument();
    expect(screen.getByLabelText('Fin de Almuerzo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear turno' })).toBeInTheDocument();
  });

  it('valida los campos del formulario antes de enviar', async () => {
    const user = userEvent.setup();
    render(<TurnosLaborales />);

    // Abrir el diálogo
    const createButton = screen.getByText('Crear Turno Laboral');
    await user.click(createButton);

    // Intentar enviar el formulario sin completar campos
    const submitButton = screen.getByRole('button', { name: 'Crear turno' });
    await user.click(submitButton);

    // Verificar mensajes de validación
    await waitFor(() => {
      expect(screen.getByText('El nombre del turno debe tener al menos 3 caracteres.')).toBeInTheDocument();
      expect(screen.getAllByText('Debe ser una hora válida en formato HH:mm.').length).toBeGreaterThan(0);
    });
  });

  // it('crea un nuevo turno correctamente', async () => {
  //   const user = userEvent.setup();
  //   render(<TurnosLaborales />);

  //   // Abrir el diálogo
  //   const createButton = screen.getByText('Crear Turno Laboral');
  //   await user.click(createButton);

  //   // Completar el formulario
  //   await user.type(screen.getByLabelText('Nombre del Turno'), 'Nuevo Turno');

  //   // Para los campos de hora, necesitamos un enfoque diferente ya que son inputs de tipo time
  //   const startTimeInput = screen.getByLabelText('Hora de Inicio');
  //   const endTimeInput = screen.getByLabelText('Hora de Fin');
  //   const startLunchTimeInput = screen.getByLabelText('Inicio de Almuerzo');
  //   const endLunchTimeInput = screen.getByLabelText('Fin de Almuerzo');

  //   // Usar fireEvent para inputs de tipo time
  //   fireEvent.change(startTimeInput, { target: { value: '09:00' } });
  //   fireEvent.change(endTimeInput, { target: { value: '18:00' } });
  //   fireEvent.change(startLunchTimeInput, { target: { value: '13:00' } });
  //   fireEvent.change(endLunchTimeInput, { target: { value: '14:00' } });

  //   // Enviar el formulario
  //   const submitButton = screen.getByRole('button', { name: 'Crear turno' });
  //   await user.click(submitButton);

  //   // Verificar que se llamó a la API con la ruta relativa
  //   await waitFor(() => {
  //     expect(api.post).toHaveBeenCalledWith('/horarios-laborales', { // <--- CAMBIO: ruta relativa
  //       nombreHorario: 'Nuevo Turno',
  //       horaInicio: '09:00',
  //       horaFin: '18:00',
  //       horaInicioAlmuerzo: '13:00',
  //       horaFinAlmuerzo: '14:00'
  //     });
  //   });

  //   // Verificar que se muestra el toast de éxito
  //   expect(toast).toHaveBeenCalledWith('Turno creado', {
  //     description: 'El turno laboral se ha registrado correctamente.'
  //   });

  //   // Verificar que el diálogo se cerró
  //   await waitFor(() => {
  //     expect(screen.queryByText('Crear Turno Laboral', { selector: 'h2' })).not.toBeInTheDocument();
  //   });
  // });

  // Test de manejo de errores al obtener turnos (descomentado y corregido)
  it('maneja errores al obtener turnos', async () => {
    // Simular un error en la API
    api.get.mockRejectedValueOnce(new Error('Error al obtener turnos')); // <--- CAMBIO: usa 'api.get'

    // Espiar console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<TurnosLaborales />);

    // Verificar que se llamó a console.error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al recuperar los horarios laborales:', expect.any(Error));
    });

    // Restaurar console.error
    consoleErrorSpy.mockRestore();
  });

  it('verifica la validación de formato de hora', async () => {
    const user = userEvent.setup();
    render(<TurnosLaborales />);

    // Abrir el diálogo
    const createButton = screen.getByText('Crear Turno Laboral');
    await user.click(createButton);

    // Completar solo el nombre y usar formatos inválidos para las horas
    await user.type(screen.getByLabelText('Nombre del Turno'), 'Nuevo Turno');
    fireEvent.change(screen.getByLabelText('Hora de Inicio'), { target: { value: '25:00' } }); // Formato inválido

    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: 'Crear turno' });
    await user.click(submitButton);

    // Verificar mensajes de validación para el formato de hora
    await waitFor(() => {
      expect(screen.getAllByText('Debe ser una hora válida en formato HH:mm.').length).toBeGreaterThan(0);
    });
  });

});
