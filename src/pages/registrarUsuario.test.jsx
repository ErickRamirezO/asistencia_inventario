// src/pages/registrarUsuario.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrarUsuario from './formularioUsuario';
import axios from 'axios';
import { toast } from 'sonner';

// Al inicio de registrarUsuario.test.jsx después del mock de ResizeObserver
beforeAll(() => {
  // Mock ResizeObserver
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // Mock scrollIntoView
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = function() {};
  }
});

// Mock de las dependencias
vi.mock('axios');
vi.mock('sonner', () => ({
  toast: vi.fn()
}));

// Datos de prueba
const mockDepartamentos = [
  { id: 1, nombreDepartamento: 'Recursos Humanos' },
  { id: 2, nombreDepartamento: 'Contabilidad' },
  { id: 3, nombreDepartamento: 'Tecnología' }
];

const mockRoles = [
  { id: 1, rol: 'Administrador' },
  { id: 2, rol: 'Gerente' },
  { id: 3, rol: 'Empleado' }
];

describe('RegistrarUsuario Component', () => {
  beforeEach(() => {
    // Configurar los mocks antes de cada prueba
    axios.get.mockImplementation((url) => {
      if (url.includes('departamentos')) {
        return Promise.resolve({ data: mockDepartamentos });
      }
      if (url.includes('roles')) {
        return Promise.resolve({ data: mockRoles });
      }
      return Promise.reject(new Error('URL no manejada en el mock'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario correctamente', async () => {
    render(<RegistrarUsuario />);
    
    // Verificar que se muestra la pantalla de carga inicialmente
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // Esperar a que se carguen los datos
    await waitFor(() => {
        expect(screen.getByText('Registrar Usuario', { 
        selector: 'div[data-slot="card-title"]' 
        })).toBeInTheDocument();
    });
    
    // Verificar que se muestran todos los campos del formulario básicos
    expect(screen.getByLabelText(/nombres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
    
    // Para la sección RFID, verificar los elementos específicos
    // 1. Verificar la etiqueta (usando un selector específico para la etiqueta)
    expect(screen.getByText('Tarjeta RFID', { selector: 'label[data-slot="form-label"]' })).toBeInTheDocument();
    
    // 2. Verificar el mensaje inicial cuando no hay tarjeta
    expect(screen.getByText('No se ha registrado ninguna tarjeta')).toBeInTheDocument();
    
    // 3. Verificar el botón de registro RFID
    expect(screen.getByRole('button', { name: /registrar tarjeta rfid/i })).toBeInTheDocument();
    
    // 4. Verificar el texto explicativo
    expect(screen.getByText(/al presionar el botón, acerque la tarjeta rfid/i)).toBeInTheDocument();
    
    // Verificar el botón de registro de usuario
    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    });

  it('carga los departamentos y roles desde la API', async () => {
    render(<RegistrarUsuario />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
        expect(screen.getByText('Registrar Usuario', { 
        selector: 'div[data-slot="card-title"]' 
        })).toBeInTheDocument();
    });
    
    // Verificar que se hicieron las llamadas a la API
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/departamentos');
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8002/api/roles');
  });

  it('muestra los datos de respaldo cuando falla la API', async () => {
    // Simular fallo en la API
    axios.get.mockRejectedValue(new Error('Error de API'));
    
    render(<RegistrarUsuario />);
    
    // Esperar a que se muestre el toast de error
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'No se pudieron cargar los departamentos o roles. Usando datos de respaldo.',
      });
    });
    
    // Comprobar que sigue mostrando el formulario
    await waitFor(() => {
        expect(screen.getByText('Registrar Usuario', { 
        selector: 'div[data-slot="card-title"]' 
        })).toBeInTheDocument();
    });
  });

  it('habilita el modo de escaneo RFID', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuario />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
        expect(screen.getByText('Registrar Usuario', { 
        selector: 'div[data-slot="card-title"]' 
        })).toBeInTheDocument();
    });
    
    // Buscar y hacer clic en el botón de registro RFID
    const registrarRFIDButton = screen.getByRole('button', { name: /registrar tarjeta rfid/i });
    await user.click(registrarRFIDButton);
    
    // Verificar que se muestra el mensaje de escaneo
    expect(screen.getByText(/acerque la tarjeta al lector/i)).toBeInTheDocument();
    
    // Verificar que el toast fue llamado
    expect(toast).toHaveBeenCalledWith('Esperando tarjeta', {
      description: 'Acerque la tarjeta al lector RFID...'
    });
    
    // Verificar que aparece el botón de cancelar
    expect(screen.getByRole('button', { name: /cancelar escaneo/i })).toBeInTheDocument();
  });

  it('simula el escaneo de una tarjeta RFID', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuario />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
        expect(screen.getByText('Registrar Usuario', { 
        selector: 'div[data-slot="card-title"]' 
        })).toBeInTheDocument();
    });
    
    // Activar el modo RFID
    const registrarRFIDButton = screen.getByRole('button', { name: /registrar tarjeta rfid/i });
    await user.click(registrarRFIDButton);
    
    // Simular keypress events para un código RFID
    const rfidCode = 'ABC12345';
    
    // Simular una serie de keypresses rápidos
    for (const char of rfidCode) {
      fireEvent.keyPress(document, { key: char, code: `Key${char.toUpperCase()}`, charCode: char.charCodeAt(0) });
    }
    
    // Simular Enter para finalizar
    fireEvent.keyPress(document, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Como el manejo de eventos del teclado se realiza con efecto secundario,
    // puede ser difícil probar exactamente. Verificamos el comportamiento aproximado.
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Tarjeta detectada', expect.anything());
    });
  });

  it('valida los campos obligatorios del formulario', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuario />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
        expect(screen.getByText('Registrar Usuario', { 
        selector: 'div[data-slot="card-title"]' 
        })).toBeInTheDocument();
    });
    
    // Intentar enviar el formulario sin completar campos
    const submitButton = screen.getByRole('button', { name: /registrar usuario/i });
    await user.click(submitButton);
    
    // Verificar mensajes de validación
    await waitFor(() => {
      expect(screen.getByText(/los nombres deben tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/los apellidos deben tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument();
    });
  });

  it('completa y envía un formulario válido', async () => {
    const user = userEvent.setup();
    
    // Mockear axios.post para simular registro exitoso
    axios.post.mockResolvedValueOnce({ data: { id: 1, message: 'Usuario registrado con éxito' } });
    
    render(<RegistrarUsuario />);
    
    // Esperar a que cargue el formulario
    await waitFor(() => {
        expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
    
    // Completar campos básicos
    await user.type(screen.getByLabelText(/nombres/i), 'Juan');
    await user.type(screen.getByLabelText(/apellidos/i), 'Pérez');
    await user.type(screen.getByLabelText(/cédula/i), '1234567890');
    await user.type(screen.getByLabelText(/teléfono/i), '0987654321');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
    
    // Para la fecha de nacimiento, busca por el texto "Seleccionar fecha" sin especificar el rol
    const fechaNacimientoButton = screen.getByText('Seleccionar fecha');
    await user.click(fechaNacimientoButton);
    
    // Seleccionar una fecha del calendario (por ejemplo, día 15)
    const día15 = screen.getByRole('gridcell', { name: '15' });
    await user.click(día15);
    
    // Seleccionar departamento
    const departamentoButton = screen.getByText('Seleccionar departamento');
    await user.click(departamentoButton);
    await user.click(screen.getByText('Recursos Humanos'));
    
    // Seleccionar rol
    const rolButton = screen.getByText('Seleccionar rol');
    await user.click(rolButton);
    await user.click(screen.getByText('Administrador'));
    
    // Simular registro de tarjeta RFID
    const registrarRFIDButton = screen.getByRole('button', { name: /registrar tarjeta rfid/i });
    await user.click(registrarRFIDButton);
    
    // Verificar que se muestra el primer toast (esperando tarjeta)
    expect(toast).toHaveBeenCalledWith('Esperando tarjeta', {
        description: 'Acerque la tarjeta al lector RFID...'
    });
    
    // Limpiar llamadas anteriores a toast para facilitar verificaciones
    toast.mockClear();
    
    // === CAMBIO AQUÍ: USAR EL ENFOQUE DE KEYPRESS QUE YA FUNCIONA ===
    // Simular keypress events para un código RFID
    const rfidCode = 'ABC12345';
    
    // Simular una serie de keypresses rápidos
    for (const char of rfidCode) {
        fireEvent.keyPress(document, { key: char, code: `Key${char.toUpperCase()}`, charCode: char.charCodeAt(0) });
    }
    
    // Simular Enter para finalizar
    fireEvent.keyPress(document, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // IMPORTANTE: Usar waitFor para darle tiempo al componente a procesar eventos
    await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Tarjeta detectada', {
        description: 'Código RFID registrado correctamente'
        });
    });
    
    // Limpiar llamadas nuevamente
    toast.mockClear();
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /registrar usuario/i });
    await user.click(submitButton);
    
    // Verificar que se muestra el toast de éxito
    await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Usuario registrado', {
        description: 'El usuario ha sido registrado exitosamente.'
        });
    });
    });
});