"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, ScanLine, Check, ChevronsUpDown, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import axios from "axios";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import bcrypt from "bcryptjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";
// Datos de respaldo en caso de fallo en la API
const departamentosRespaldo = [
  { label: "Recursos Humanos", value: "1" },
  { label: "Contabilidad", value: "2" },
  { label: "Ventas", value: "3" },
  { label: "Marketing", value: "4" },
  { label: "Tecnología", value: "5" },
];

// Datos de respaldo de roles
const rolesRespaldo = [
  { label: "Administrador", value: "1" },
  { label: "Gerente", value: "2" },
  { label: "Supervisor", value: "3" },
  { label: "Empleado", value: "4" },
];
function validarCedulaEcuatoriana(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const digitos = cedula.split("").map(Number);
  const digitoVerificador = digitos.pop();

  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    let valor = digitos[i];
    if (i % 2 === 0) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    suma += valor;
  }

  const resultado = (10 - (suma % 10)) % 10;
  return resultado === digitoVerificador;
}

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

const FormSchema = z.object({
  nombres: z.string()
  .min(2, { message: "Los nombres deben tener al menos 2 caracteres." })
  .regex(nameRegex, { message: "Los nombres solo deben contener letras." })
  .max(30)
  .refine(val => !/<.*?>/.test(val), { message: "No se permiten etiquetas HTML." }),
  apellidos: z.string()
  .min(2, { message: "Los apellidos deben tener al menos 2 caracteres." })
  .regex(nameRegex, { message: "Los apellidos solo deben contener letras." })
  .max(30)
  .refine(val => !/<.*?>/.test(val), { message: "No se permiten etiquetas HTML." }),
  telefono: z
    .string()
    .regex(/^\d{10}$/, { message: "El teléfono debe tener 10 dígitos." }),
  cedula: z
  .string()
  .length(10, { message: "La cédula debe tener 10 dígitos." })
  .refine((value) => validarCedulaEcuatoriana(value), {
    message: "Cédula ecuatoriana no válida.",
  }),

  correoElectronico: z
    .string()
    .email({ message: "Debe ser un correo electrónico válido." }),
  departamentoId: z.string({
    required_error: "Debe seleccionar un departamento.",
  }),
  rol: z.string({
    required_error: "Debe seleccionar un rol.",
  }),
  tagsRFIDTag: z
    .string()
    .regex(/^[a-zA-Z0-9]{8,50}$/, { message: "La tarjeta RFID debe tener entre 8 y 50 caracteres." })
    .optional(),
  fechaNacimiento: z
  .date({ required_error: "Debe seleccionar una fecha de nacimiento." })
  .refine((fecha) => {
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();
    return edad > 18 || (edad === 18 && (mes > 0 || (mes === 0 && dia >= 0)));
  }, {
    message: "Debe ser mayor de edad (18 años o más).",
  }),

});

  const FormSchemaDepartamento = z.object({
    nombreDepartamento: z.string().min(2),
  });

export default function FormularioUsuario() {
  const { user } = useUser();
  const { id } = useParams(); // Obtenemos el ID si existe (modo edición)
  const navigate = useNavigate();
  const [scanningRFID, setScanningRFID] = useState(false);
  const [rfidValue, setRfidValue] = useState("");
  const [tarjetasRFID, setTarjetasRFID] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const modoEdicion = !!id;
  const [openDepartamento, setOpenDepartamento] = useState(false);
  const [openRol, setOpenRol] = useState(false);
  const [openFechaNacimiento, setOpenFechaNacimiento] = useState(false);
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
    ? windowSize.height - 230 // ajusta 200px según header + paddings
    : undefined;
        const inputHeight = isDesktop
  ? Math.max(15, Math.floor((availableHeight || 400) /9 )) // mínimo 32px
  : 32;
  const labelHeight = isDesktop
  ? Math.max(1, Math.floor(inputHeight / 10)) // mínimo 8px (h-2)
  : 10;



  const formDepartamento = useForm({
    resolver: zodResolver(FormSchemaDepartamento),
    defaultValues: { nombreDepartamento: "" },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [modoEdicion, setModoEdicion] = useState(false);

  // Abrir modal para agregar un nuevo departamento
  const abrirModal = () => {
    formDepartamento.reset();
    setDialogOpen(true);
  };
 const onSubmitDepartamento = async (data) => {
    try {
      await api.post("/departamentos", data); // Aquí guardas el nuevo departamento
      toast.success("Departamento creado correctamente",{
        richColors: true,
      });
      await crearLog(
        `INFO Departamento creado por el usuario ${user.id}`,
        user.userId
      );
      setDialogOpen(false);
      cargarDepartamentos(); // Recargar departamentos después de agregar uno nuevo
    } catch(error) {
      toast.error("Error al guardar departamento",{
        richColors: true,
      });
      await crearLog(
        `ERROR: Error al crear departamento: ${error.message}`,
        user.userId
      );
    }
  };

  // Cargar departamentos, categorías y usuarios
  const cargarDepartamentos = async () => {
    try {
      const res = await api.get("/departamentos");
      const options = res.data.map((dep) => ({
        label: dep.nombreDepartamento,
        value: dep.id.toString(),
      }));
      setDepartamentos(options);
    } catch {
      toast.error("Error al cargar departamentos");
      await crearLog(
        `ERROR: Error al cargar departamentos`,
        user.userId
      );
    }
  };

  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange", // Validar en cada cambio
    reValidateMode: "onChange", // Revalidar en cada cambio
    defaultValues: {
      nombres: "",
      apellidos: "",
      telefono: "",
      cedula: "",
      correoElectronico: "",
      departamento: "",
      rol: "",
      tagsRFIDTag: "",
      fechaNacimiento: undefined,
    },
  });
  // Cargar departamentos, roles y datos del usuario si estamos en modo edición
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        // Obtenemos los departamentos
        const respDepartamentos = await api.get("/departamentos");
        const departamentosFormateados = respDepartamentos.data.map(dept => ({
          label: dept.nombreDepartamento,
          value: dept.id.toString()
        }));
        setDepartamentos(departamentosFormateados);
        
        // Obtenemos los roles
        const respRoles = await api.get("/roles");
        const rolesFormateados = respRoles.data.map(rol => ({
          label: rol.rol,
          value: rol.id.toString()
        }));
        setRoles(rolesFormateados);

        // Obtenemos las tarjetas RFID disponibles
        const respTarjetas = await api.get("/tags-rfid");
        const tarjetasRFID = respTarjetas.data;

        // Si estamos en modo edición, cargamos los datos del usuario
        if (modoEdicion) {
          // Obtener datos del usuario a editar
          const respUsuario = await api.get(`/usuarios/${id}`);
          const datosUsuario = respUsuario.data;
          setUsuario(datosUsuario);

          const departamentoEncontrado = departamentosFormateados.find(
              dept => dept.label === datosUsuario.departamentoNombre
          );

          const rolEncontrado = rolesFormateados.find(
              rol => rol.value === datosUsuario.rolesIdroles?.toString()
          );

          const tarjetaEncontrada = tarjetasRFID.find(
            tag => tag.id.toString() === datosUsuario.tagsRFIDIdTagsRFID?.toString()
          );
          console.log("Tarjeta encontrada:", tarjetaEncontrada);
          
          // Actualizar el formulario con los datos del usuario
          form.reset({
            nombres: datosUsuario.nombre,
            apellidos: datosUsuario.apellido,
            telefono: datosUsuario.telefono,
            cedula: datosUsuario.cedula,
            correoElectronico: datosUsuario.email,
            departamentoId: departamentoEncontrado ? departamentoEncontrado.value : "", 
            rol: rolEncontrado ? rolEncontrado.value : "", 
            tagsRFIDTag: tarjetaEncontrada ? tarjetaEncontrada.tag : "",
            fechaNacimiento: datosUsuario.fechaNacimiento ? new Date(datosUsuario.fechaNacimiento) : undefined,
          });
          
          // Actualizar el valor RFID si existe
          if (tarjetaEncontrada) {
            setRfidValue(tarjetaEncontrada.tag);
          }
        }

      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error", {
          description: "No se pudieron cargar los datos. Intente nuevamente.",
          richColors: true,
        });
        await crearLog(
          `ERROR: Error al cargar datos: ${error.message}`,
          user.userId
        );
        // En caso de error, usamos los datos de respaldo para departamentos y roles
        setDepartamentos(departamentosRespaldo);
        setRoles(rolesRespaldo);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id, form, modoEdicion, user.userId]);

  // Función para iniciar el modo de escucha del lector RFID
  function startRFIDReader() {
    setScanningRFID(true);
    toast.info("Esperando tarjeta", {
      description: "Acerque la tarjeta al lector RFID...",
      richColors: true,
    });
  }
 

  // Función para detener el modo de escucha del lector RFID
  function stopRFIDReader() {
    setScanningRFID(false);
  }
  
  // Función para reiniciar y escanear una nueva tarjeta
  function resetRFID() {
    setRfidValue("");
    form.setValue("tagsRFIDTag", "");
  }
  
  // Efecto para manejar eventos del teclado (simulando un lector RFID)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;
    
    const handleKeyPress = (event) => {
      if (!scanningRFID) return;
      
      const currentTime = new Date().getTime();
      
      if (currentTime - lastKeyTime > 500 && buffer.length > 0) {
        buffer = '';
      }
      
      lastKeyTime = currentTime;
      
      if (event.key === 'Enter') {
        if (buffer.length >= 8) {
          setRfidValue(buffer);
          form.setValue("tagsRFIDTag", buffer);
          setScanningRFID(false);
          toast.success("Tarjeta detectada", {
            description: `Código RFID registrado correctamente`,
            richColors: true,
          });
        }
        buffer = '';
      } else if (event.key.match(/[a-zA-Z0-9]/)) {
        buffer += event.key;
      }
    };
    
    if (scanningRFID) {
      window.addEventListener('keypress', handleKeyPress);
    }
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [scanningRFID, form]);

  // Función para manejar el envío del formulario
  async function onSubmit(formData) {
    let error = false;
    if (!formData.departamentoId) {
      toast.error("Debe seleccionar un departamento", { richColors: true });
      error = true;
    }
    if (!formData.rol) {
      toast.error("Debe seleccionar un rol", { richColors: true });
      error = true;
    }
    if (error) return; // Detener el envío si falta alguno

    try {
        
        const apiData = {
            nombre: formData.nombres,
            apellido: formData.apellidos,
            telefono: formData.telefono,
            cedula: formData.cedula,
            user: formData.correoElectronico.split('@')[0],
            email: formData.correoElectronico,
            departamentosIddepartamentos: parseInt(formData.departamentoId),
            rolesIdroles: parseInt(formData.rol),
            fechaNacimiento: formData.fechaNacimiento ? format(formData.fechaNacimiento, 'yyyy-MM-dd') : null,
            tagsRFIDTag: formData.tagsRFIDTag,
            tagsRFIDIdTagsRFID: null
        };

        if (modoEdicion) {
            // Preservar campos adicionales que no están en el formulario pero son necesarios
            const datosCompletos = {
                ...apiData,
                // Conservar datos existentes del usuario que no se editan en el formulario
                password: usuario.password,
                status: usuario.status !== undefined ? usuario.status : 1,
                horarioLaboralId: usuario.horarioLaboralId || 1
            };

            console.log("Datos completos a enviar en actualización:", datosCompletos);
            
            // Modo edición: Actualizar usuario existente con todos los campos requeridos
            await api.put(`/usuarios/${id}`, datosCompletos);
            
            toast.success("Usuario actualizado", {
                description: "Los datos del usuario han sido actualizados exitosamente.",
                richColors: true,
            });

            await crearLog(
              `INFO: Usuario actualizado (${usuario.id})`,
              user.userId
            );
            
            // Navegar de vuelta a la lista de usuarios
            navigate("/verUsuarios");
        } else {
            // En caso de nuevo registro necesitamos incluir los campos obligatorios
            const defaultPassword = import.meta.env.VITE_DEFAULT_USER_PASSWORD;
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            const datosCompletos = {
              ...apiData,
              password: hashedPassword, // Contraseña configurable por .env
              user: formData.correoElectronico.split('@')[0], // Generar nombre de usuario a partir del correo
              status: 1, // Activo por defecto
              horarioLaboralId: 1 // Horario por defecto
            };
            
            // Modo registro: Crear nuevo usuario
            await api.post("/usuarios", datosCompletos);
            
            toast.success("Usuario registrado", {
                description: "El usuario ha sido registrado exitosamente.",
                richColors: true,
            });

            await crearLog(
              `INFO: Usuario creado por el usuario ${user.userId}`,
              user.userId
            );
            
            // Limpiar el formulario en modo registro
            form.reset();
            setRfidValue("");
        }
    } catch (error) {
        console.error("Error al procesar usuario:", error);
        await crearLog(
          `ERROR: Error al procesar usuario: ${error.message}`,
          user.userId
        );
        let errorMessage = "Ocurrió un error inesperado. Intente nuevamente."; // Mensaje genérico por defecto
        // Verifica si el error es de Axios y tiene una respuesta
        if (axios.isAxiosError(error) && error.response) {
            // Accede a la propiedad 'message' dentro de 'error.response.data'
            if (error.response.data && typeof error.response.data === 'object' && error.response.data.message) {
                const fullBackendMessage = error.response.data.message;
                
                // Intenta extraer el texto dentro de las comillas dobles al final de la cadena
                const match = fullBackendMessage.match(/"([^"]*)"$/); 
                if (match && match[1]) {
                    errorMessage = match[1]; // Si se encuentra, usa el contenido de las comillas
                } else {
                    // Si no hay comillas, usa el mensaje completo del backend (ej. "409 CONFLICT")
                    errorMessage = fullBackendMessage; 
                }
            } 
            // Esto es un fallback por si 'data' no es un objeto o no tiene 'message'
            else if (error.message) {
                errorMessage = error.message;
            }
        } else if (error.message) {
            // Para otros errores que no son de Axios (ej. errores de red, errores de lógica en el frontend)
            errorMessage = error.message;
        }

        toast.error("Error", {
            description: errorMessage, // ¡Usamos el mensaje específico aquí!
            richColors: true,
        });
    }
}

  // Mostrar estado de carga mientras se obtienen los datos
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Reemplazar el div principal del return por esto:
return (
  <div className="w-full max-w-6xl mx-auto overflow-hidden">
    {/* Contenedor externo con overflow-hidden */}
    
    <div className="px-2 sm:px-4 py-4 sm:py-6">
      {/* Contenedor interno con padding seguro */}
      
      {/* Botón de regreso solo en modo edición */}
      {modoEdicion && (
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/verUsuarios")} 
            className="flex items-center text-xs sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Usuarios
          </Button>
        </div>
      )}
      
      <Card className="border-transparent shadow-none rounded-none pt-6">
        
        <CardContent className="px-2 sm:px-6" >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4" style={
    isDesktop
      ? { maxHeight: availableHeight, overflowY: 'auto' }
      : {}
  }>
                {/* Columna izquierda - Reorganizada en 4x2 */}
                <div className="space-y-6">
                  {/* Primera fila - 2 campos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nombres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Nombres</FormLabel>
                          <FormControl>
                            <Input style={{ height: inputHeight }} className="text-xs md:text-[13px] sm:text-sm" placeholder="Ejemplo: Juan Carlos" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm"/>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="apellidos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Apellidos</FormLabel>
                          <FormControl>
                            <Input style={{ height: inputHeight }} className="text-xs md:text-[13px] sm:text-sm"placeholder="Ejemplo: Pérez Gómez" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm"/>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Segunda fila - 2 campos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cedula"
                      min={10}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }}    className="text-xs md:text-[13px] sm:text-sm">Cédula</FormLabel>
                          <FormControl>
                            <Input style={{ height: inputHeight }} className="text-xs md:text-[13px] sm:text-sm" placeholder="Ejemplo: 1234567890" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm"/>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel  style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Teléfono</FormLabel>
                          <FormControl>
                            <Input style={{ height: inputHeight }} className="text-xs md:text-[13px] sm:text-sm" placeholder="Ejemplo: 0987654321" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Tercera fila - 2 campos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="correoElectronico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input style={{ height: inputHeight }} className="text-xs md:text-[13px] sm:text-sm" placeholder="usuario@correo.com" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm"/>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fechaNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Fecha de Nacimiento</FormLabel>
                          <Popover open={openFechaNacimiento} onOpenChange={setOpenFechaNacimiento}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button style={{ height: inputHeight }}
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal text-xs md:text-[13px] sm:text-sm",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 max-w-[300px]" align="start">
                              <DayPicker
                                mode="single"
                                animate
                                captionLayout="dropdown"
                                navLayout="around"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpenFechaNacimiento(false);
                                }}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                required
                                weekStartsOn={1}                                
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm"/>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Cuarta fila - 2 campos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    

                    <FormField
                      control={form.control}
                      name="departamentoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Departamento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                style={{ height: inputHeight }}
                                  variant="outline"
                                  role="combobox"
                                  className={cn("w-full justify-between text-xs md:text-[13px] sm:text-sm", !field.value && "text-muted-foreground")}
                                >
                                  {field.value
                                    ? departamentos.find(dep => dep.value === field.value)?.label
                                    : "Seleccionar departamento"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full max-w-full">
                              <Command>
                                <CommandInput placeholder="Buscar departamento..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>No se encontraron departamentos.</CommandEmpty>
                                  <CommandGroup>
                                    {departamentos.map((dep) => (
                                      <CommandItem value={dep.label} key={dep.value} onSelect={() => form.setValue("departamentoId", dep.value)}>
                                        <Check className={cn("mr-2 h-4 w-4", dep.value === field.value ? "opacity-100" : "opacity-0")} />
                                        {dep.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                              <Button
                                onClick={() => abrirModal()} // Abre el modal para agregar un nuevo departamento
                                className="mt-2 w-full bg-gray-200 text-black hover:bg-gray-300 hover:text-white text-xs md:text-[13px] sm:text-sm"
                              >
                                Agregar Nuevo Departamento
                              </Button>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ height: labelHeight }} className="text-xs md:text-[13px] sm:text-sm">Rol</FormLabel>
                          <Popover open={openRol} onOpenChange={setOpenRol}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                style={{ height: inputHeight }}
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between text-xs md:text-[13px] sm:text-sm",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? roles.find(
                                        (rol) => rol.value === field.value
                                      )?.label
                                    : "Seleccionar rol"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar rol..."
                                  className="text-xs md:text-[13px] sm:text-sm"
                                />
                                <CommandList>
                                  <CommandEmpty className="text-xs md:text-[13px] sm:text-sm">No hay resultados.</CommandEmpty>
                                  <CommandGroup>
                                    {roles.map((rol) => (
                                      <CommandItem
                                        value={rol.label}
                                        key={rol.value}
                                        onSelect={() => {
                                          form.setValue("rol", rol.value);
                                          setOpenRol(false);
                                        }}
                                        className="text-xs md:text-[13px] sm:text-sm"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            rol.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {rol.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-xs md:text-[13px] sm:text-sm"/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Columna derecha - Campo de tarjeta RFID (sin cambios) */}
                <div className="flex flex-col h-full">
                  {/* Este elemento se mantiene sin cambios como solicitaste */}
                  <FormField
                    control={form.control}
                    name="tagsRFIDTag"
                    render={() => (
                      <FormItem className="flex-1 flex flex-col">
                        <FormLabel style={{ height: labelHeight }} className="text-xs sm:text-sm md:text-[13px]">Tarjeta RFID</FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 flex-1 flex flex-col justify-center">
                          {/* Contenido existente sin cambios */}
                          {rfidValue ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="text-green-600 font-medium mb-4 text-xs md:text-[13px] sm:text-lg">
                                Tarjeta RFID registrada
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded p-4 w-full text-center font-mono text-xs md:text-[13px] sm:text-lg mb-6">
                                {rfidValue}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                className="mt-3 text-xs sm:text-base"
                                onClick={resetRFID}
                              >
                                <ScanLine className="h-5 w-5 mr-2" />
                                Escanear otra tarjeta
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className={`text-center mb-6 text-base sm:text-lg ${scanningRFID ? "text-blue-500 animate-pulse" : "text-gray-600"}`}>
                                {scanningRFID ? "Acerque la tarjeta al lector..." : "No se ha registrado ninguna tarjeta"}
                              </div>
                              {scanningRFID ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="lg"
                                  className="flex items-center gap-2 text-xs sm:text-sm md:text-[13px]"
                                  onClick={stopRFIDReader}
                                >
                                  Cancelar escaneo
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="lg"
                                  className="flex items-center gap-2 text-xs md:text-[13px] sm:text-sm"
                                  onClick={startRFIDReader}
                                >
                                  <ScanLine className="h-5 w-5" />
                                  Registrar Tarjeta RFID
                                </Button>
                              )}
                              <p className="text-xs sm:text-base text-gray-500 mt-6 text-center">
                                Al presionar el botón, acerque la tarjeta RFID al lector para registrarla en el sistema.
                              </p>
                            </div>
                          )}
                        </div>
                        <FormMessage className="text-xs sm:text-base"/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {modoEdicion && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/verUsuarios")}
                    className="text-xs md:text-[13px] sm:text-sm"
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" variant="blue" className=" text-xs md:text-[13px] sm:text-sm">
                  {modoEdicion ? "Guardar Cambios" : "Registrar Usuario"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Departamento</DialogTitle>
          </DialogHeader>
          <Form {...formDepartamento}>
            <form onSubmit={formDepartamento.handleSubmit(onSubmitDepartamento)} className="space-y-4 mt-4">
              <FormField
                control={formDepartamento.control}
                name="nombreDepartamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ height: labelHeight }}>Nombre del Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: Contabilidad" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-black hover:bg-blue-700"
                >
                  Crear Departamento
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  </div>
);
}