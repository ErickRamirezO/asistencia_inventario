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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  const [dialogoConfirmacionAbierto, setDialogoConfirmacionAbierto] =
    useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  // const usersPerPage = 5;
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowSize.width >= 768; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 100 // ajusta 200px según header + paddings
    : undefined;

  const usersPerPage = (() => {
      if (!isDesktop) return 3;
  if (availableHeight < 350) return 3;
  if (availableHeight < 400) return 3;
  if (availableHeight < 450) return 3;
    if (availableHeight < 500) return 4;
    if (availableHeight < 550) return 7;
    if (availableHeight < 620) return 8;

    return 8;
  })();

  const columnasVisibles = isDesktop
    ? [
        "nombre",
        "apellido",
        "cedula",
        "email",
        "telefono",
        "estado",
        "departamento",
        "horario",
        "acciones",
      ]
    : ["nombre", "apellido", "estado", "horario", "acciones"];

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
        const usuariosMapeados = usuariosResponse.data.map((usuario) => ({
          ...usuario,
          habilitado: usuario.status === 1,
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
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === id
            ? {
                ...usuario,
                status: usuarioActualizado.status,
                // Para la interfaz de usuario:
                habilitado: usuarioActualizado.status === 1,
              }
            : usuario
        )
      );

      const nuevoEstado = usuarioActualizado.status === 1;
      const nombreCompleto = `${usuarioActualizado.nombre} ${usuarioActualizado.apellido}`;

      toast.success(
        nuevoEstado ? "Usuario habilitado" : "Usuario inhabilitado",
        {
          description: `${nombreCompleto} ha sido ${
            nuevoEstado ? "activado" : "desactivado"
          } correctamente.`,
          richColors: true,
        }
      );
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
      const usuario = usuarios.find((u) => u.id === id);
      const horario = horarios.find((h) => h.id === parseInt(nuevoHorarioId));

      if (!usuario || !horario) {
        throw new Error("Usuario o horario no encontrado");
      }

      await api.post(`/horarios-laborales/asignar/${id}/${nuevoHorarioId}`);
      // Actualizar el estado local
      setUsuarios(
        usuarios.map((u) =>
          u.id === id
            ? {
                ...u,
                horarioLaboralId: parseInt(nuevoHorarioId),
                horarioLaboralNombre: horario.nombreHorario, // Actualizar también el nombre para la UI
              }
            : u
        )
      );

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
  const usuariosFiltrados = usuarios.filter((usuario) => {
    // Filtrar por término de búsqueda (nombre, apellido o cédula)
    const coincideBusqueda =
      usuario.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.cedula.includes(terminoBusqueda);
    return coincideBusqueda;
  });
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const usuariosPaginados = isDesktop
    ? usuariosFiltrados.slice(indexOfFirstUser, indexOfLastUser)
    : usuariosFiltrados; // En móvil muestra todos los usuarios
  // Calcula el número total de páginas
  const totalPages = Math.ceil(usuariosFiltrados.length / usersPerPage);

  // Reemplaza la función eliminarUsuario actual con esta
  const eliminarUsuario = (id) => {
    const usuario = usuarios.find((u) => u.id === id);
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
      setUsuarios(usuarios.filter((u) => u.id !== usuarioAEliminar.id));

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

  useEffect(() => {
    setCurrentPage(1);
  }, [terminoBusqueda]);

  return (
  <div className=" space-y-10 max-w-[1200px] mx-auto">
    <div
      className="
        grid
        grid-cols-1
        grid-rows-2
        gap-4
        sm:grid-cols-1
        sm:grid-rows-1
        md:grid-cols-1
      "
      style={
        isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
      }
    >
      <Card className="border-transparent shadow-none rounded-none pt-6">
        
        <CardContent>
          {/* Buscador */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-[13px] sm:text-sm"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
          </div>
          
          {/* Tabla con estructura similar a VerBienes.jsx */}
          <div className="rounded-md border shadow-sm">
            <div
              className="max-h-none overflow-y-visible sm:overflow-y-auto"
              style={
                isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
              }
            >
              <Table className="table-fixed w-full min-w-[900px] text-xs md:text-[13px] sm:text-sm">
                <TableHeader>
                  <TableRow>
                    {columnasVisibles.includes("nombre") && (
                      <TableHead className="w-[15%] truncate">Nombre</TableHead>
                    )}
                    {columnasVisibles.includes("apellido") && (
                      <TableHead className="w-[15%] truncate">Apellido</TableHead>
                    )}
                    {columnasVisibles.includes("cedula") && (
                      <TableHead className="w-[15%] truncate">Cédula</TableHead>
                    )}
                    {columnasVisibles.includes("email") && (
                      <TableHead className="w-[15%] truncate">Email</TableHead>
                    )}
                    {columnasVisibles.includes("telefono") && (
                      <TableHead className="w-[15%] truncate">Teléfono</TableHead>
                    )}
                    {columnasVisibles.includes("estado") && (
                      <TableHead className="w-[10%] truncate">Estado</TableHead>
                    )}
                    {columnasVisibles.includes("departamento") && (
                      <TableHead className="w-[10%] truncate">Departamento</TableHead>
                    )}
                    {columnasVisibles.includes("horario") && (
                      <TableHead className="w-[20%] truncate">
                        Horario Laboral
                      </TableHead>
                    )}
                    {columnasVisibles.includes("acciones") && (
                      <TableHead className="text-right w-[10%] truncate">
                        Acciones
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosPaginados.length > 0 ? (
                    usuariosPaginados.map((usuario) => (
                      <TableRow key={usuario.id}>
                        {columnasVisibles.includes("nombre") && (
                          <TableCell className="font-medium truncate overflow-hidden whitespace-nowrap">
                            {usuario.nombre}
                          </TableCell>
                        )}
                        {columnasVisibles.includes("apellido") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            {usuario.apellido}
                          </TableCell>
                        )}
                        {columnasVisibles.includes("cedula") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            {usuario.cedula}
                          </TableCell>
                        )}
                        {columnasVisibles.includes("email") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            {usuario.email}
                          </TableCell>
                        )}
                        {columnasVisibles.includes("telefono") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            {usuario.telefono}
                          </TableCell>
                        )}
                        {columnasVisibles.includes("estado") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`status-${usuario.id}`}
                                checked={usuario.status === 1}
                                onCheckedChange={() =>
                                  toggleEstadoUsuario(
                                    usuario.id,
                                    usuario.status
                                  )
                                }
                              />
                              <Label
                                htmlFor={`status-${usuario.id}`}
                                className={`${
                                  usuario.status === 1
                                    ? "text-green-600"
                                    : "text-red-600"
                                } font-medium text-xs md:text-[13px] sm:text-sm`}
                              >
                                {usuario.status === 1 ? "Activo" : "Inactivo"}
                              </Label>
                            </div>
                          </TableCell>
                        )}
                        {columnasVisibles.includes("departamento") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            {usuario.departamentoNombre || "No asignado"}
                          </TableCell>
                        )}
                        {columnasVisibles.includes("horario") && (
                          <TableCell className="text-xs md:text-[13px] sm:text-sm truncate overflow-hidden whitespace-nowrap">
                            <Select
                              value={
                                usuario.horarioLaboralId?.toString() || ""
                              }
                              onValueChange={(value) =>
                                cambiarHorarioLaboral(
                                  usuario.id,
                                  parseInt(value)
                                )
                              }
                              disabled={!usuario.habilitado}
                            >
                              <SelectTrigger className="w-[120px] text-xs md:text-[13px] sm:text-sm">
                                <SelectValue placeholder="Seleccione horario">
                                  {usuario.horarioLaboralId
                                    ? horarios.find(
                                        (h) =>
                                          h.id === usuario.horarioLaboralId
                                      )?.nombreHorario ||
                                      usuario.horarioLaboralNombre ||
                                      "Horario no encontrado"
                                    : "Seleccionar horario"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {horarios.map((horario) => (
                                  <SelectItem
                                    key={horario.id}
                                    value={horario.id.toString()}
                                    className="text-xs md:text-[13px] sm:text-sm"
                                  >
                                    {horario.nombreHorario} ({horario.horaInicio} -{" "}
                                    {horario.horaFin})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                        {columnasVisibles.includes("acciones") && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  navigate(`/usuarios/editar/${usuario.id}`)
                                }
                                className="h-8 w-8"
                                disabled={!usuario.habilitado}
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
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columnasVisibles.length}
                        className="text-center text-xs md:text-[13px] sm:text-sm"
                      >
                        No se encontraron usuarios que coincidan con los filtros.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Paginación dentro del contenedor scrollable (como en VerBienes.jsx) */}
              {isDesktop && (
                <Pagination className="mt-4" style={{ minHeight: "48px" }}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        aria-disabled={currentPage === 1}
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        aria-disabled={currentPage === totalPages}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
          
          {/* Diálogo de confirmación */}
          <Dialog
            open={dialogoConfirmacionAbierto}
            onOpenChange={setDialogoConfirmacionAbierto}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xs md:text-[13px] sm:text-sm">
                  Confirmar eliminación
                </DialogTitle>
                <DialogDescription className="text-xs md:text-[13px] sm:text-sm">
                  ¿Está seguro que desea eliminar al usuario{" "}
                  {usuarioAEliminar?.nombre} {usuarioAEliminar?.apellido}? Esta
                  acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDialogoConfirmacionAbierto(false)}
                  className="text-xs md:text-[13px] sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmarEliminacion}
                  className="text-xs md:text-[13px] sm:text-sm"
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

// Datos de prueba para horarios (solo como respaldo)
const horariosDemo = [
  {
    id: 1,
    nombreHorario: "Turno Mañana",
    horaInicio: "08:00",
    horaFin: "17:00",
  },
  {
    id: 2,
    nombreHorario: "Turno Tarde",
    horaInicio: "12:00",
    horaFin: "21:00",
  },
  {
    id: 3,
    nombreHorario: "Turno Noche",
    horaInicio: "22:00",
    horaFin: "07:00",
  },
  {
    id: 4,
    nombreHorario: "Horario Flexible",
    horaInicio: "09:00",
    horaFin: "18:00",
  },
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
    horarioLaboralId: 1,
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
    horarioLaboralId: 3,
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
    horarioLaboralId: 4,
  },
];
