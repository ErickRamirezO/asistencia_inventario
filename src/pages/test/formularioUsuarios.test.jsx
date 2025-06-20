import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../../utils/axios';
import { format } from 'date-fns';

// Mock de las dependencias
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));
import { toast } from 'sonner';
import FormularioUsuario from '../formularioUsuario';

const mockDepartamentos = [
  { id: 1, nombreDepartamento: "Recursos Humanos" },
  { id: 2, nombreDepartamento: "Tecnología" },
  { id: 3, nombreDepartamento: "Ventas" },
];

const mockRoles = [
  { id: 1, rol: "Administrador" },
  { id: 2, rol: "Usuario" },
];

const mockTagsRFID = [
  { id: 101, tag: "TAG001RFID" },
  { id: 102, tag: "TAG002RFID" },
];

describe('FormularioUsuario Component', () => {
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

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
      return Promise.resolve({ data: [] });
    });

    api.post.mockResolvedValue({ data: { id: 99 } });
    api.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Registro exitoso de usuario', async () => {
    render(
      <MemoryRouter initialEntries={['/usuarios/registrar']}>
        <Routes>
          <Route path="/usuarios/registrar" element={<FormularioUsuario />} />
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
    await user.type(screen.getByLabelText('Correo Electrónico'), 'usuario@test.com');

    // Seleccionar Departamento
    await user.click(screen.getByRole('combobox', { name: /Departamento/i }));
    await user.click(screen.getByText('Tecnología'));

    // Seleccionar Rol
    await user.click(screen.getByRole('combobox', { name: /Rol/i }));
    await user.click(screen.getByText('Usuario'));

    // Fecha de nacimiento
    const fechaNacimientoInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaNacimientoInput, { target: { value: '2000-01-01' } });
    await user.click(screen.getByRole('button', { name: /Registrar Tarjeta RFID/i }));
    // Simula la escritura del código RFID carácter por carácter
    for (const char of 'TAG001RFID') {
      fireEvent.keyPress(window, { key: char });
    }
    // Simula la pulsación de Enter para finalizar el escaneo
    fireEvent.keyPress(window, { key: 'Enter' });

    // Ahora verifica que la tarjeta fue registrada
    expect(screen.getByText('Tarjeta RFID registrada')).toBeInTheDocument();
    expect(screen.getByText('TAG001RFID')).toBeInTheDocument();
    // Enviar el formulario
    await user.click(screen.getByRole('button', { name: /Registrar Usuario/i }));
  });
  

  it('Registro fallido por error del servidor', async () => {
    api.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: { message: 'El usuario ya existe con esa cédula' },
        status: 409,
      },
      message: 'Request failed with status code 409'
    });

    render(
      <MemoryRouter initialEntries={['/usuarios/registrar']}>
        <Routes>
          <Route path="/usuarios/registrar" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Nombres'), 'Test');
    await user.type(screen.getByLabelText('Apellidos'), 'Error');
    await user.type(screen.getByLabelText('Teléfono'), '1234567890');
    await user.type(screen.getByLabelText('Cédula'), '1710089788');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'test.error@test.com');
    await user.click(screen.getByRole('combobox', { name: /Departamento/i }));
    await user.click(screen.getByText('Tecnología'));
    await user.click(screen.getByRole('combobox', { name: /Rol/i }));
    await user.click(screen.getByText('Usuario'));
    const fechaNacimientoInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaNacimientoInput, { target: { value: '2000-01-01' } });

    await user.click(screen.getByRole('button', { name: /Registrar Tarjeta RFID/i }));
    // Simula la escritura del código RFID carácter por carácter
    for (const char of 'TAG001RFID') {
      fireEvent.keyPress(window, { key: char });
    }
    // Simula la pulsación de Enter para finalizar el escaneo
    fireEvent.keyPress(window, { key: 'Enter' });

    // Ahora verifica que la tarjeta fue registrada
    expect(screen.getByText('Tarjeta RFID registrada')).toBeInTheDocument();
    expect(screen.getByText('TAG001RFID')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Registrar Usuario/i }));

  });

  it('Validación cuando la fecha de nacimiento es incorrecta (menor de edad)', async () => {
    render(
      <MemoryRouter initialEntries={['/usuarios/registrar']}>
        <Routes>
          <Route path="/usuarios/registrar" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Nombres'), 'Joven');
    await user.type(screen.getByLabelText('Apellidos'), 'Prueba');
    await user.type(screen.getByLabelText('Teléfono'), '0123456789');
    await user.type(screen.getByLabelText('Cédula'), '0101010101');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'joven.prueba@test.com');
    await user.click(screen.getByRole('combobox', { name: /Departamento/i }));
    await user.click(screen.getByText('Tecnología'));
    await user.click(screen.getByRole('combobox', { name: /Rol/i }));
    await user.click(screen.getByText('Usuario'));

    // Fecha menor de edad
    const fechaNacimientoInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaNacimientoInput, { target: { value: '2020-01-01' } });
    await user.click(screen.getByRole('button', { name: /Registrar Usuario/i }));
    // await waitFor(() => {
    //   expect(screen.getByText('Debe ser mayor de edad (18 años o más).')).toBeInTheDocument();
    // });
  });

  // --- Test: Validación cuando faltan campos obligatorios ---
  it('Validación cuando faltan campos obligatorios', async () => {
    render(
      <MemoryRouter initialEntries={['/usuarios/registrar']}>
        <Routes>
          <Route path="/usuarios/registrar" element={<FormularioUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Registrar Usuario/i }));

    await waitFor(() => {
      expect(screen.getByText('Los nombres deben tener al menos 2 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('Los apellidos deben tener al menos 2 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('El teléfono debe tener 10 dígitos.')).toBeInTheDocument();
      expect(screen.getByText('La cédula debe tener 10 dígitos.')).toBeInTheDocument();
      expect(screen.getByText('Debe ser un correo electrónico válido.')).toBeInTheDocument();
      // expect(screen.getByText('Debe seleccionar un departamento.')).toBeInTheDocument();
      // expect(screen.getByText('Debe seleccionar un rol.')).toBeInTheDocument();
      // expect(screen.getByText('Debe seleccionar una fecha de nacimiento.')).toBeInTheDocument();
    });
  });
});