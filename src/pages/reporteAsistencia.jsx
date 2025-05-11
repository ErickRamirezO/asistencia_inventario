import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import { CalendarIcon, FileText, X, ChevronDown, Search, UserPlus, Users, Calendar } from "lucide-react";
import "react-day-picker/dist/style.css";
import axios from "axios";
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
import { Badge } from "@/components/ui/badge";

const ReporteAsistencia = () => {
  const [dateRange, setDateRange] = useState();
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [open, setOpen] = useState(false);

  // Cargar todos los usuarios al iniciar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setCargando(true);
        const response = await axios.get("http://localhost:8002/api/usuarios");
        // Filtrar solo usuarios activos
        const usuariosActivos = response.data.filter(user => user.status === 1);
        setTodosUsuarios(usuariosActivos);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast("Error", {
          description: "No se pudieron cargar los usuarios. Usando datos de prueba.",
        });
        // Datos de respaldo en caso de error
        setTodosUsuarios(usuariosDemo);
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

  // Función para descargar el reporte
  const descargarReporte = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast("Error", {
        description: "Debes seleccionar un rango de fechas completo.",
      });
      return;
    }

    if (usuariosSeleccionados.length === 0) {
      toast("Error", {
        description: "Debes seleccionar al menos un usuario para el reporte.",
      });
      return;
    }

    toast("Descargando reporte", {
      description: `Generando PDF para ${usuariosSeleccionados.length} usuarios.`,
    });
    
    // Aquí iría la lógica para generar y descargar el PDF
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reporte de Asistencia</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Configuración del Reporte</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna 1: Selección de usuarios */}
            <div className="space-y-3">
              <div className="flex items-center mb-3">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Seleccionar Usuarios</h3>
              </div>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox" 
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <span>Seleccionar usuarios...</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar usuario..." className="h-9" icon={Search} />
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {cargando ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Cargando usuarios...
                        </div>
                      ) : usuariosDisponibles.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
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
              
              <div className="text-xs text-muted-foreground mt-2">
                {usuariosDisponibles.length} usuarios disponibles para seleccionar
              </div>
            </div>
            
            {/* Columna 2: Usuarios seleccionados */}
            <div className="space-y-3">
              <div className="flex items-center mb-3">
                <UserPlus className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Usuarios Seleccionados</h3>
              </div>
              
              <div className="border rounded-md p-3 min-h-[200px] max-h-[250px] overflow-y-auto bg-muted/30">
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
              <div className="flex items-center mb-3">
                <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Rango de Fechas</h3>
              </div>
              
              <div className="border rounded-md p-3 min-h-[200px] bg-muted/30">
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
                        "Seleccionar rango de fechas"
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
                      <p className="text-sm">
                        <span className="font-medium">Desde:</span> {dateRange.from.toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Hasta:</span> {dateRange.to.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Total: {Math.round((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24))} días
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-4">
                      Seleccione un rango de fechas para el reporte
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          <Button 
            variant={"blue"}
            onClick={descargarReporte} 
            disabled={!dateRange?.to || usuariosSeleccionados.length === 0}
            size="lg"
            className="w-full max-w-xs"
          >
            <FileText className="mr-2 h-5 w-5" /> Descargar Reporte PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Datos de prueba en caso de fallo
const usuariosDemo = [
  { id: 1, nombre: "Juan", apellido: "Pérez", cedula: "1234567890", status: 1 },
  { id: 2, nombre: "María", apellido: "Gómez", cedula: "2345678901", status: 1 },
  { id: 3, nombre: "Pedro", apellido: "Rodríguez", cedula: "3456789012", status: 1 },
  { id: 4, nombre: "Ana", apellido: "López", cedula: "4567890123", status: 1 },
  { id: 5, nombre: "Luis", apellido: "Martínez", cedula: "5678901234", status: 1 }
];

export default ReporteAsistencia;