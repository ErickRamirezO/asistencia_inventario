import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom'; // Necesario para useParams y useNavigate
import FormularioUsuario from './formularioUsuario'; // Asegúrate de que esta ruta sea correcta
import api from '../utils/axios'; // Asegúrate de que esta ruta sea correcta para importar la instancia 'api'
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock de las dependencias
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Datos de prueba para mocks
const mockDepartamentos = [
  { id: 1, nombreDepartamento: "Recursos Humanos" },
  { id: 2, nombreDepartamento: "Tecnología" },
  { id: 3, nombreDepartamento: "Ventas" },
];

const mockRoles = [
  { id: 1, rol: "Administrador" },
  { id: 2, rol: "Empleado" },
];

const mockTagsRFID = [
  { id: 101, tag: "TAG001RFID" },
  { id: 102, tag: "TAG002RFID" },
];

const mockUsuarioExistente = {
  id: 1,
  nombre: "Juan",
  apellido: "Perez",
  cedula: "1234567890",
  telefono: "0991234567",
  email: "juan.perez@example.com",
  departamentoNombre: "Tecnología", // Nombre del departamento
  rolesIdroles: 2, // ID del rol (Empleado)
  tagsRFIDIdTagsRFID: 101, // ID del tag RFID
  fechaNacimiento: "1990-01-15", // Formato YYYY-MM-DD
  password: "hashedpassword", // Datos adicionales que se preservarían en la edición
  user: "juanperez",
  status: 1,
  horarioLaboralId: 1,
};


describe('FormularioUsuario Component', () => {
  let user;
  let form; // Necesitamos acceso al objeto form para simular setValue de react-hook-form

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los mocks antes de cada prueba
    user = userEvent.setup(); // Reinicia userEvent para cada prueba

    // Configurar los mocks para las llamadas a 'api.get'
    api.get.mockImplementation((url) => {
      if (url === '/departamentos') {
        return Promise.resolve({ data: mockDepartamentos });
      }
      if (url === '/roles') {
        return Promise.resolve({ data: mockRoles });
      }
      if (url === '/tags-rfid') {
        return Promise.resolve({ data: mockTagsRFID });
      }
      if (url === `/usuarios/${mockUsuarioExistente.id}`) {
        return Promise.resolve({ data: mockUsuarioExistente });
      }
      // Asegúrate de mockear todas las rutas que tu componente pueda llamar con api.get
      return Promise.resolve({ data: [] }); // Default fallback
    });

    // Configurar mocks para api.post y api.put
    api.post.mockResolvedValue({ data: { id: 99, ...mockUsuarioExistente } }); // Mock para creación
    api.put.mockResolvedValue({ data: { success: true } }); // Mock para actualización

    // Mockear useForm para poder acceder a sus métodos como setValue
    // Esto es un mock avanzado y puede requerir un poco más de configuración
    // Para simplificar, asumiremos que form.setValue es accesible a través del componente
    // o que los inputs de UI actualizan el form correctamente.
    // Si necesitas mockear `useForm` de forma más directa:
    // const mockForm = {
    //   control: {}, // un mock de control
    //   handleSubmit: vi.fn(cb => cb), // permite llamar el callback del handleSubmit
    //   setValue: vi.fn(), // mock de setValue
    //   reset: vi.fn(), // mock de reset
    //   getValues: vi.fn(), // mock de getValues
    //   setError: vi.fn(), // mock de setError
    //   clearErrors: vi.fn(), // mock de clearErrors
    //   formState: { errors: {} } // mock de formState
    // };
    // vi.mock('react-hook-form', async (importOriginal) => {
    //   const actual = await importOriginal();
    //   return {
    //     ...actual,
    //     useForm: () => mockForm,
    //   };
    // });
    // form = mockForm; // Asignar el mockForm para usarlo en los tests
  });

  afterEach(() => {
    vi.clearAllMocks(); // Limpia todos los mocks después de cada prueba
  });

  // --- Test: Registro exitoso de usuario ---
  it('Registro exitoso de usuario', async () => {
    render(
      <MemoryRouter initialEntries={['/registrar-usuario']}>
        <Routes>
          <Route path="/registrar-usuario" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
      expect(screen.getByText('Registrar Usuario', { selector: 'h2, .text-2xl' })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Nombres'), 'Nuevo');
    await user.type(screen.getByLabelText('Apellidos'), 'Usuario');
    await user.type(screen.getByLabelText('Teléfono'), '0987654321');
    await user.type(screen.getByLabelText('Cédula'), '1710089788');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'nuevo.usuario@test.com');

    // Seleccionar Departamento
    await user.click(screen.getByRole('combobox', { name: /Departamento/i }));
    await user.click(screen.getByText('Tecnología'));

    // Seleccionar Rol
    await user.click(screen.getByRole('combobox', { name: /Rol/i }));
    await user.click(screen.getByText('Empleado'));

    // Fecha de nacimiento
    const fechaNacimientoInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaNacimientoInput, { target: { value: '2000-01-01' } });

    // Enviar el formulario
    await user.click(screen.getByRole('button', { name: /Registrar Usuario/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Usuario registrado', expect.any(Object));
    });
  });

  // --- Test: Registro fallido por error del servidor ---
  it('Registro fallido por error del servidor', async () => {
    // Configurar el mock para que la llamada a post falle
    api.post.mockRejectedValueOnce({
      isAxiosError: true, // Simular un error de Axios
      response: {
        data: { message: 'El usuario ya existe con esa cédula' },
        status: 409,
      },
      message: 'Request failed with status code 409'
    });

    render(
      <MemoryRouter initialEntries={['/registrar-usuario']}>
        <Routes>
          <Route path="/registrar-usuario" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que los datos de carga inicial terminen
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Llenar formulario (mínimo para intentar enviar, validando campos de forma manual si es necesario)
    await user.type(screen.getByLabelText('Nombres'), 'Test');
    await user.type(screen.getByLabelText('Apellidos'), 'Error');
    await user.type(screen.getByLabelText('Teléfono'), '1234567890');
    await user.type(screen.getByLabelText('Cédula'), '1234567890');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'test.error@test.com');
    await user.click(screen.getByRole('button', { name: 'Seleccionar departamento' }));
    await user.click(screen.getByText('Tecnología'));
    await user.click(screen.getByRole('button', { name: 'Seleccionar rol' }));
    await user.click(screen.getByText('Empleado'));
    const fechaNacimientoInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaNacimientoInput, { target: { value: '2000-01-01' } }); // Fecha válida

    // Enviar el formulario
    await user.click(screen.getByRole('button', { name: 'Registrar Usuario' }));

    // Verificar que se muestra el toast de error con el mensaje específico del backend
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error', {
        description: 'El usuario ya existe con esa cédula',
        richColors: true,
      });
    });
  });

  // --- Test: Validación por falta de RFID (comportamiento de RFID si se ingresa incorrecto) ---
  // Nota: El campo RFID es opcional en tu ZodSchema.
  // Este test verifica la validación del regex si se ingresa un valor, no la falta del campo.
  it('Validación por formato de RFID incorrecto', async () => {
    render(
      <MemoryRouter initialEntries={['/registrar-usuario']}>
        <Routes>
          <Route path="/registrar-usuario" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Iniciar escaneo RFID
    await user.click(screen.getByRole('button', { name: 'Registrar Tarjeta RFID' }));
    expect(toast.info).toHaveBeenCalledWith('Esperando tarjeta', expect.any(Object));

    // Simular entrada de datos RFID INSUFICIENTES y presionar Enter
    fireEvent.keyPress(window, { key: '1', code: 'Digit1' });
    fireEvent.keyPress(window, { key: '2', code: 'Digit2' });
    fireEvent.keyPress(window, { key: 'Enter', code: 'Enter' }); // Menos de 8 caracteres

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error de lectura', {
        description: 'La tarjeta RFID es demasiado corta. Intente de nuevo.',
        richColors: true,
      });
    });

    // Asegurarse de que el campo RFID no se haya actualizado con el valor inválido
    expect(screen.queryByDisplayValue('12')).not.toBeInTheDocument();
  });


  // --- Test: Validación cuando la fecha de nacimiento es incorrecta (menor de edad) ---
  it('Validación cuando la fecha de nacimiento es incorrecta (menor de edad)', async () => {
    render(
      <MemoryRouter initialEntries={['/registrar-usuario']}>
        <Routes>
          <Route path="/registrar-usuario" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Llenar campos obligatorios válidos (excepto fecha)
    await user.type(screen.getByLabelText('Nombres'), 'Joven');
    await user.type(screen.getByLabelText('Apellidos'), 'Prueba');
    await user.type(screen.getByLabelText('Teléfono'), '0123456789');
    await user.type(screen.getByLabelText('Cédula'), '0101010101');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'joven.prueba@test.com');
    await user.click(screen.getByRole('combobox', { name: /Departamento/i }));
        await user.click(screen.getByText('Tecnología'));
    await user.click(screen.getByRole('combobox', { name: /Rol/i }));    
    await user.click(screen.getByText('Empleado'));

    // Simular selección de una fecha de nacimiento que haga al usuario menor de 18 (ej. hace 5 años)
    const today = new Date();
    const underageDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    
    // Interactuar con el campo de fecha de nacimiento para que Zod lo capture
    const fechaNacimientoInput = screen.getByLabelText('Fecha de Nacimiento');
    // Esto simula que el valor se establece en el input
    fireEvent.change(fechaNacimientoInput, { target: { value: format(underageDate, 'yyyy-MM-dd') } });

    // Enviar el formulario
    await user.click(screen.getByRole('button', { name: 'Registrar Usuario' }));

    // Verificar el mensaje de validación de edad
    await waitFor(() => {
      expect(screen.getByText('Debe ser mayor de edad (18 años o más).')).toBeInTheDocument();
    });
  });

  // --- Test: Validación cuando faltan campos obligatorios ---
  it('Validación cuando faltan campos obligatorios', async () => {
    render(
      <MemoryRouter initialEntries={['/registrar-usuario']}>
        <Routes>
          <Route path="/registrar-usuario" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que los datos de carga inicial terminen
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Intentar enviar el formulario vacío
    await user.click(screen.getByRole('button', { name: 'Registrar Usuario' }));

    // Verificar los mensajes de validación
    await waitFor(() => {
      expect(screen.getByText('Los nombres deben tener al menos 2 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('Los apellidos deben tener al menos 2 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('El teléfono debe tener 10 dígitos.')).toBeInTheDocument();
      expect(screen.getByText('La cédula debe tener 10 dígitos.')).toBeInTheDocument();
      expect(screen.getByText('Debe ser un correo electrónico válido.')).toBeInTheDocument();
      expect(screen.getByText('Debe seleccionar un departamento.')).toBeInTheDocument();
      expect(screen.getByText('Debe seleccionar un rol.')).toBeInTheDocument();
      expect(screen.getByText('Debe seleccionar una fecha de nacimiento.')).toBeInTheDocument();
    });
  });
});
