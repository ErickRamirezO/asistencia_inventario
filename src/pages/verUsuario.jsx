import { useState, useEffect } from "react";
import api from "@/utils/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react"; // Importamos los iconos
import { useNavigate } from "react-router-dom";
export default function VerUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogoConfirmacionAbierto, setDialogoConfirmacionAbierto] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const navigate = useNavigate();

  // Obtener usuarios y horarios al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usuariosResponse = await api.get("/usuarios");
        // Obtenemos los horarios laborales utilizando la misma ruta que en turnosLaborales.jsx
        const horariosResponse = await api.get("/horarios-laborales");
        setHorarios(horariosResponse.data);
        // Mapear los usuarios y agregar la propiedad habilitado basada en status
        const usuariosMapeados = usuariosResponse.data.map(usuario => ({
          ...usuario,
          habilitado: usuario.status === 1
        }));
        setUsuarios(usuariosMapeados);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error", {
          description: "No se pudieron cargar los horarios laborales.",
          richColors: true,
        });
        setLoading(false);
        
        // Si hay error, usamos los datos de prueba para los horarios
        setHorarios(horariosDemo);
        setUsuarios(usuariosDemo);
      }
    };

    fetchData();
  }, []);

  // Función para cambiar el estado del usuario (habilitado/inhabilitado)
  const toggleEstadoUsuario = async (id) => {
    try {
      // Llamar al endpoint que creamos en el backend
      const response = await api.patch(`/usuarios/${id}/toggle-status`);
      
      // La respuesta contiene el usuario actualizado
      const usuarioActualizado = response.data;
      
      // Actualizar el estado local con la respuesta del servidor
      setUsuarios(usuarios.map(usuario => 
        usuario.id === id ? { 
          ...usuario, 
          status: usuarioActualizado.status,
          // Para la interfaz de usuario:
          habilitado: usuarioActualizado.status === 1 
        } : usuario
      ));
      
      const nuevoEstado = usuarioActualizado.status === 1;
      const nombreCompleto = `${usuarioActualizado.nombre} ${usuarioActualizado.apellido}`;
      
      toast.success(nuevoEstado ? "Usuario habilitado" : "Usuario inhabilitado", {
        description: `${nombreCompleto} ha sido ${nuevoEstado ? "activado" : "desactivado"} correctamente.`,
        richColors: true,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el estado del usuario.",
        richColors: true,
      });
    }
  };

  // Función para cambiar el horario laboral de un usuario
  const cambiarHorarioLaboral = async (id, nuevoHorarioId) => {
    try {
      // Encontrar el usuario y el horario para mensajes personalizados
      const usuario = usuarios.find(u => u.id === id);
      const horario = horarios.find(h => h.id === parseInt(nuevoHorarioId));
      
      if (!usuario || !horario) {
        throw new Error("Usuario o horario no encontrado");
      }
      
      await api.post(`/horarios-laborales/asignar/${id}/${nuevoHorarioId}`);
    // Actualizar el estado local
      setUsuarios(usuarios.map(u => 
        u.id === id ? { 
          ...u, 
          horarioLaboralId: parseInt(nuevoHorarioId),
          horarioLaboralNombre: horario.nombreHorario  // Actualizar también el nombre para la UI
        } : u
      ));

      toast.success("Horario actualizado", {
        description: `Se ha asignado el horario "${horario.nombreHorario}" a ${usuario.nombre} ${usuario.apellido}.`,
        richColors: true,
      });
    } catch (error) {
      console.error("Error al cambiar horario:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el horario laboral.",
        richColors: true,
      });
    }
  };
  // Filtrar usuarios según el término de búsqueda, estado y departamento
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtrar por término de búsqueda (nombre, apellido o cédula)
    const coincideBusqueda = 
      usuario.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.cedula.includes(terminoBusqueda);
    return coincideBusqueda
  });

  // Reemplaza la función eliminarUsuario actual con esta
  const eliminarUsuario = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    console.log("Usuario a eliminar:", usuario);
    setUsuarioAEliminar(usuario);
    setDialogoConfirmacionAbierto(true);
  };

  // Agrega esta nueva función para confirmar la eliminación
  const confirmarEliminacion = async () => {
    try {
      // En un entorno real, esto enviaría una petición al backend
      console.log("Usuario eliminado:", usuarioAEliminar.id);
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      // Actualizar el estado local
      setUsuarios(usuarios.filter(u => u.id !== usuarioAEliminar.id));
      
      toast.success("Usuario eliminado", {
        description: `${usuarioAEliminar.nombre} ${usuarioAEliminar.apellido} ha sido eliminado correctamente.`,
        richColors: true,
      });
      
      // Cerrar el diálogo
      setDialogoConfirmacionAbierto(false);
      setUsuarioAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el usuario. Intente nuevamente.",
        richColors: true,
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lista de Usuarios</h1>
      <div className="mb-6 space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
          {terminoBusqueda && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setTerminoBusqueda("")}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="rounded-md border max-h-[400px] overflow-y-auto">
  <Table className="min-w-[900px] table-auto">

          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              
              <TableHead>Departamento</TableHead>
              <TableHead>Horario Laboral</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nombre}</TableCell>
                  <TableCell>{usuario.apellido}</TableCell>
                  <TableCell>{usuario.cedula}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.telefono}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`status-${usuario.id}`}
                        checked={usuario.status === 1} // Usar status en lugar de habilitado
                        onCheckedChange={() => toggleEstadoUsuario(usuario.id, usuario.status)}
                      />
                      <Label htmlFor={`status-${usuario.id}`} 
                        className={usuario.status === 1 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {usuario.status === 1 ? "Activo" : "Inactivo"}
                      </Label>
                    </div>
                  </TableCell>
                  
                  <TableCell>{usuario.departamentoNombre || "No asignado"}</TableCell>
                  <TableCell>
                    <Select
                      value={usuario.horarioLaboralId?.toString() || ""}
                      onValueChange={(value) => cambiarHorarioLaboral(usuario.id, parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          {usuario.horarioLaboralId 
                            ? (horarios.find(h => h.id === usuario.horarioLaboralId)?.nombreHorario || usuario.horarioLaboralNombre || "Horario no encontrado") 
                            : "Seleccionar horario"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {horarios.map((horario) => (
                          <SelectItem key={horario.id} value={horario.id.toString()}>
                            {horario.nombreHorario} ({horario.horaInicio} - {horario.horaFin})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => eliminarUsuario(usuario.id)}
                        className="h-8 w-8"
                        aria-label="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  No se encontraron usuarios que coincidan con los filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={dialogoConfirmacionAbierto} onOpenChange={setDialogoConfirmacionAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar al usuario {usuarioAEliminar?.nombre} {usuarioAEliminar?.apellido}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogoConfirmacionAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminacion}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Datos de prueba para horarios (solo como respaldo)
const horariosDemo = [
  { id: 1, nombreHorario: "Turno Mañana", horaInicio: "08:00", horaFin: "17:00" },
  { id: 2, nombreHorario: "Turno Tarde", horaInicio: "12:00", horaFin: "21:00" },
  { id: 3, nombreHorario: "Turno Noche", horaInicio: "22:00", horaFin: "07:00" },
  { id: 4, nombreHorario: "Horario Flexible", horaInicio: "09:00", horaFin: "18:00" },
];

// Datos de prueba para usuarios
const usuariosDemo = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    cedula: "1234567890",
    email: "juan.perez@empresa.com",
    telefono: "099123456",
    habilitado: true,
    nombreUsuario: "jperez",
    departamento: { id: 1, nombre: "Recursos Humanos" },
    horarioLaboralId: 1
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    cedula: "3456789012",
    email: "carlos.rodriguez@empresa.com",
    telefono: "099345678",
    habilitado: false,
    nombreUsuario: "crodriguez",
    departamento: { id: 3, nombre: "IT" },
    horarioLaboralId: 3
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "López",
    cedula: "4567890123",
    email: "ana.lopez@empresa.com",
    telefono: "099456789",
    habilitado: true,
    nombreUsuario: "alopez",
    departamento: { id: 4, nombre: "Ventas" },
    horarioLaboralId: 4
  },
];