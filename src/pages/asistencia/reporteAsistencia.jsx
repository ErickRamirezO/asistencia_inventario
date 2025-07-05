import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import { CalendarIcon, FileText, X, ChevronDown, Search, UserPlus, Users, Calendar } from "lucide-react";
import "react-day-picker/dist/style.css";
import axios from "axios";
import api from "@/utils/axios";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

const ReporteAsistencia = () => {
  const [dateRange, setDateRange] = useState();
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [open, setOpen] = useState(false);
  const [descargando, setDescargando] = useState(false); // Nuevo estado para control de descarga
  const [asistenciaPreview, setAsistenciaPreview] = useState([]);
  const [cargandoPreview, setCargandoPreview] = useState(false);

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
    ? windowSize.height - 380 // ajusta 200px según header + paddings
    : undefined;

  //Vista previa de asistencia
  useEffect(() => {
    const fetchPreview = async () => {
      if (!dateRange?.from || !dateRange?.to || usuariosSeleccionados.length === 0) {
        setAsistenciaPreview([]);
        return;
      }
      setCargandoPreview(true);
      try {
        const usuarioIds = usuariosSeleccionados.map(u => u.id);
        const fechaInicio = dateRange.from.toISOString().split('T')[0];
        const fechaFin = dateRange.to.toISOString().split('T')[0];
        const response = await api.post("/reportes/preview", {
          usuarioIds, fechaInicio, fechaFin
        });
        console.log("Vista previa de asistencia:", response.data);
        setAsistenciaPreview(response.data);
      } catch (error) {
        setAsistenciaPreview([]);
        toast.error("No se pudo cargar la asistencia previa.",{
          description: error.response?.data?.message || "Error al cargar la vista previa de asistencia.",
          richColors: true
        });
      } finally {
        setCargandoPreview(false);
      }
    };
    fetchPreview();
  }, [dateRange, usuariosSeleccionados]);

  // Cargar todos los usuarios al iniciar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setCargando(true);
        const response = await api.get("/usuarios");
        // Filtrar solo usuarios activos
        const usuariosActivos = response.data.filter(user => user.status === 1);
        setTodosUsuarios(usuariosActivos);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast.warning("Error", {
          description: "No se pudieron cargar los usuarios. Recargue la página.",
          richColors: true
        });
        setTodosUsuarios([]); // Asegurarse de que no haya datos de prueba en prod
        setCargando(false);
      }
    };

    cargarUsuarios();
  }, []);

  // Usuarios disponibles (excluye los ya seleccionados)
  const usuariosDisponibles = todosUsuarios.filter(
    usuario => !usuariosSeleccionados.some(seleccionado => seleccionado.id === usuario.id)
  );

  // Función para añadir un usuario a la selección
  const agregarUsuario = (usuario) => {
    setUsuariosSeleccionados([...usuariosSeleccionados, usuario]);
    setOpen(false);
  };

  // Función para eliminar un usuario de la selección
  const eliminarUsuario = (id) => {
    setUsuariosSeleccionados(usuariosSeleccionados.filter(usuario => usuario.id !== id));
  };

  const verificarDatosReporte = async () => {
    if (!dateRange?.from || !dateRange?.to || usuariosSeleccionados.length === 0) {
      toast.warning("Debes seleccionar usuarios y un rango de fechas.");
      return false;
    }
    try {
      const usuarioIds = usuariosSeleccionados.map(u => u.id);
      const fechaInicio = dateRange.from.toISOString().split('T')[0];
      const fechaFin = dateRange.to.toISOString().split('T')[0];

      const response = await api.post(
        "/reportes/asistencia/has-data",
        { usuarioIds, fechaInicio, fechaFin }
      );
      return response.data === true;
    } catch (error) {
      toast.error("Error al verificar datos del reporte.",{
        description: error.response?.data?.message || "No se pudo verificar la disponibilidad de datos.",
        richColors: true
      });
      return false;
    }
  };

  // Función para descargar el reporte
  const descargarReporte = async (reportFormat) => { // Añadimos reportFormat como parámetro
    if (!dateRange?.from || !dateRange?.to) {
      toast.warning("Error", {
        description: "Debes seleccionar un rango de fechas completo.",
        richColors: true
      });
      return;
    }

    if (usuariosSeleccionados.length === 0) {
      toast.warning("Error", {
        description: "Debes seleccionar al menos un usuario para el reporte.",
        richColors: true
      });
      return;
    }

    const hayDatos = await verificarDatosReporte();
    if (!hayDatos) {
      toast.warning("No hay datos para el reporte en ese rango y usuarios seleccionados",{
        richColors: true,
      });
      return;
    }

    setDescargando(true);
    const toastId = toast.loading("Generando reporte", {
      description: `Por favor espera...`,
      richColors: true,
    });

    try {
      const usuarioIds = usuariosSeleccionados.map(u => u.id);
      const fechaInicio = dateRange.from.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const fechaFin = dateRange.to.toISOString().split('T')[0]; // Formato YYYY-MM-DD

      const response = await api.post(
        "/asistencias/reporte",
        {
          usuarioIds,
          fechaInicio,
          fechaFin,
          reportFormat // "pdf" o "xlsx"
        },
        {
          responseType: 'blob', // Importante: para manejar el archivo binario
        }
      );

      // Crear un URL blob y forzar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `reporte_asistencia_${fechaInicio}_a_${fechaFin}.${reportFormat}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Liberar el URL

      toast.success("Reporte generado", {
        description: `El reporte se ha descargado como ${filename}.`,
        richColors: true,
        id: toastId
      });

    } catch (error) {
      console.error("Error al descargar el reporte:", error);
      let errorMessage = "Ocurrió un error desconocido al generar el reporte.";
      if (error.response && error.response.data) {
        // Intentar leer el mensaje de error del backend si es un Blob
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const errorText = reader.result;
            // Si el backend envía un String, úsalo directamente.
            // Si es un JSON, parsealo para extraer el mensaje.
            errorMessage = errorText; // Por defecto asumimos que es el mensaje
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.message) {
                errorMessage = errorJson.message;
              } else if (errorJson.error) {
                errorMessage = errorJson.error;
              }
            } catch {
              // No es JSON, usar el texto plano
            }
          } catch (e) {
            console.error("Error al leer el blob de error:", e);
          } finally {
            toast.error("Error al generar reporte", {
              description: errorMessage,
              richColors: true,
              id: toastId
            });
          }
        };
        reader.readAsText(error.response.data);
      } else {
        toast.error("Error al generar reporte", {
          description: "No se pudo conectar con el servidor o hubo un problema de red.",
          richColors: true,
          id: toastId
        });
      }
    } finally {
      setDescargando(false);
    }
  };

  // Agrupa la asistencia por usuario y calcula los totales
  const asistenciaPorUsuario = asistenciaPreview.reduce((acc, registro) => {
    const key = registro.cedulaUsuario || registro.nombreCompletoUsuario;
    if (!acc[key]) {
      acc[key] = {
        registros: [],
        totalHorasLaboradas: 0,
        totalHorasExtras: 0,
      };
    }
    acc[key].registros.push(registro);

    // Función para convertir horas en formato HH:MM a minutos
    const toMinutes = (time) => {
      if (typeof time !== 'string' || time.includes('Aún no completa asistencia para cálculo')) {
        return 0;
      }
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Convertir las horas laboradas y extras a minutos
    const horasLaboradasMinutes = toMinutes(registro.horasLaboradasDisplay);
    const horasExtrasMinutes = toMinutes(registro.horasExtrasDisplay);

    // Sumar los minutos a los totales
    acc[key].totalHorasLaboradas += horasLaboradasMinutes;
    acc[key].totalHorasExtras += horasExtrasMinutes;

    return acc;
  }, {});

  // Función para formatear los minutos totales en HH:MM
  const formatMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  };

  const getBadgeColor = (text) => {
    if (text === "Pendiente") {
      return "bg-yellow-100 text-yellow-800";
    } else if (text === "Completo") {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-gray-100 text-gray-800"; // Default color
    }
  };

  const getAlmuerzoBadgeColor = (time) => {
    return time === "Pendiente" ? getBadgeColor("Pendiente") : getBadgeColor("");
  };

  return (
    <div className="p-6 sm-p-6">
     
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-xl">Configuración del Reporte</CardTitle>
        </CardHeader>
        
        <CardContent  style={
            isDesktop
              ? { maxHeight: availableHeight, overflowY: 'auto' }
              : {}
          }>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Columna 1: Selección de usuarios */}
            <div className="space-y-3">
              <div className="flex items-center mb-2 sm:mb-3">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-xs sm:text-sm">Seleccionar Usuarios</h3>
              </div>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox" 
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <span className="text-xs sm:text-sm">Seleccionar usuarios...</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar usuario..." className="h-9" icon={Search} />
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {cargando ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          Cargando usuarios...
                        </div>
                      ) : usuariosDisponibles.length === 0 ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          Todos los usuarios han sido seleccionados
                        </div>
                      ) : (
                        usuariosDisponibles.map(usuario => (
                          <CommandItem
                            key={usuario.id}
                            value={`${usuario.nombre} ${usuario.apellido}`}
                            onSelect={() => agregarUsuario(usuario)}
                            className="cursor-pointer"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {usuario.nombre} {usuario.apellido}
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({usuario.cedula})
                            </span>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              <div className="text-xs sm:text-sm text-muted-foreground mt-2">
                {usuariosDisponibles.length} usuarios disponibles para seleccionar
              </div>
            </div>
            
            {/* Columna 2: Usuarios seleccionados */}
            <div className="space-y-3">
              <div className="flex items-center mb-2 sm:mb-3">
                <UserPlus className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-xs sm:text-sm">Usuarios Seleccionados</h3>
              </div>
              
              <div className="border rounded-md p-2 sm:p-3 min-h-[120px] sm:min-h-[200px] max-h-[180px] sm:max-h-[250px] overflow-y-auto bg-muted/30">
                {usuariosSeleccionados.length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Total: {usuariosSeleccionados.length} usuarios
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {usuariosSeleccionados.map(usuario => (
                        <Badge 
                          key={usuario.id} 
                          variant="secondary" 
                          className="pl-2 pr-1 py-1.5 flex items-center gap-1"
                        >
                          <span>{usuario.nombre} {usuario.apellido}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 ml-1 rounded-full"
                            onClick={() => eliminarUsuario(usuario.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground">
                    <Users className="h-8 w-8 mb-2 opacity-30" />
                    <p>No hay usuarios seleccionados</p>
                    <p className="text-xs mt-1">Seleccione al menos un usuario para el reporte</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Columna 3: Rango de fechas */}
            <div className="space-y-3">
              <div className="flex items-center mb-2 sm:mb-3">
                <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-xs sm:text-sm">Rango de Fechas</h3>
              </div>
              
              <div className="border rounded-md p-2 sm:p-3 min-h-[120px] sm:min-h-[200px] bg-muted/30">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                        ) : (
                          dateRange.from.toLocaleDateString()
                        )
                      ) : (
                        <span className="text-xs sm:text-sm">
                          Seleccionar rango de fechas
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={{ dayOfWeek: [0, 6] }}
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="mt-4">
                  {dateRange?.from && dateRange?.to ? (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">Desde:</span> {dateRange.from.toLocaleDateString()}
                      </p>
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">Hasta:</span> {dateRange.to.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Total: {Math.round((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24))} días
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                      Seleccione un rango de fechas para el reporte
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Tabla previa de asistencia */}
          <div className="mt-8 sm:mt-8">
            <h3 className="font-semibold mb-2 text-sm sm:text-sm">Vista previa de asistencia</h3>
            {cargandoPreview ? (
              <div className="text-xs sm:text-sm">Cargando asistencia...</div>
            ) : asistenciaPreview.length === 0 ? (
              <div className="text-muted-foreground text-xs sm:text-sm">No hay registros para mostrar.</div>
            ) : (
              Object.entries(asistenciaPorUsuario).map(([key, data]) => (
                <div key={key} className="mb-8 sm:mb-8">
                  <div className="font-bold mb-2 text-xs sm:text-sm">
                    {data.registros[0].nombreCompletoUsuario} - {data.registros[0].departamentoUsuario}
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="min-w-[700px] text-xs sm:text-sm">
                      <TableCaption>Resumen de Asistencia por Usuario</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 py-1">Fecha</TableHead>
                          <TableHead className="px-2 py-1">Entrada</TableHead>
                          <TableHead className="px-2 py-1">Salida</TableHead>
                          <TableHead className="px-2 py-1">Inicio almuerzo</TableHead>
                          <TableHead className="px-2 py-1">Fin Almuerzo</TableHead>
                          <TableHead className="px-2 py-1">Evento</TableHead>
                          <TableHead className="px-2 py-1">Observación</TableHead>
                          <TableHead className="px-2 py-1">Estado</TableHead>
                          <TableHead className="px-2 py-1">Horas Trabajadas</TableHead>
                          <TableHead className="px-2 py-1">Horas Extra</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.registros.map((a, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="px-2 py-1">{a.fechaAsistenciaFormatted}</TableCell>
                            <TableCell className="px-2 py-1">{a.horaEntradaFormatted}</TableCell>
                            <TableCell className="px-2 py-1">{a.horaSalidaFormatted}</TableCell>
                            <TableCell className="px-2 py-1">
                              {a.eventoNombre !== "Asistencia Normal"
                                ? "----"
                                : (
                                  <Badge className={getAlmuerzoBadgeColor(a.horaInicioAlmuerzoFormatted ? a.horaInicioAlmuerzoFormatted : "Pendiente")}>
                                    {a.horaInicioAlmuerzoFormatted || "Pendiente"}
                                  </Badge>
                                )
                              }
                            </TableCell>
                            <TableCell className="px-2 py-1">
                              {a.eventoNombre !== "Asistencia Normal"
                                ? "----"
                                : (
                                  <Badge className={getAlmuerzoBadgeColor(a.horaFinAlmuerzoFormatted ? a.horaFinAlmuerzoFormatted : "Pendiente")}>
                                    {a.horaFinAlmuerzoFormatted || "Pendiente"}
                                  </Badge>
                                )
                              }
                            </TableCell>
                            <TableCell className="px-2 py-1">{a.eventoNombre}</TableCell>
                            <TableCell className="px-2 py-1">{a.observacionDisplay}</TableCell>
                            <TableCell className="px-2 py-1">
                              <Badge className={getBadgeColor(a.statusAsistencia)}>
                                {a.statusAsistencia}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 py-1">{a.horasLaboradasDisplay}</TableCell>
                            <TableCell className="px-2 py-1">
                              {a.eventoNombre !== "Asistencia Normal"
                                ? "----"
                                : a.horasExtrasDisplay
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={8} className="px-2 py-1 font-bold text-right">
                            Total:
                          </TableCell>
                          <TableCell className="px-2 py-1 font-bold">
                            {formatMinutesToTime(data.totalHorasLaboradas)}
                          </TableCell>
                          <TableCell className="px-2 py-1 font-bold">
                            {formatMinutesToTime(data.totalHorasExtras)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
            )}
          </div>

        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4 sm:pt-6 gap-4">
          <Button 
            variant={"blue"}
            onClick={() => descargarReporte("pdf")} // Llamada para PDF
            disabled={descargando || !dateRange?.to || usuariosSeleccionados.length === 0}
            size="lg"
            className="w-full max-w-xs text-xs sm:text-sm"
          >
            <FileText className="mr-2 h-5 w-5" /> 
            {descargando ? "Generando PDF..." : "Descargar Reporte PDF"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Eliminar usuariosDemo si no los usas en producción
// const usuariosDemo = [
//   { id: 1, nombre: "Juan", apellido: "Pérez", cedula: "1234567890", status: 1 },
//   { id: 2, nombre: "María", apellido: "Gómez", cedula: "2345678901", status: 1 },
//   { id: 3, nombre: "Pedro", apellido: "Rodríguez", cedula: "3456789012", status: 1 },
//   { id: 4, nombre: "Ana", apellido: "López", cedula: "4567890123", status: 1 },
//   { id: 5, nombre: "Luis", apellido: "Martínez", cedula: "5678901234", status: 1 }
// ];

export default ReporteAsistencia;