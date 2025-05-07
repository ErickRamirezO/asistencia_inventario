"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, ScanLine, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
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
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const FormSchema = z.object({
  nombres: z.string().min(2, { message: "Los nombres deben tener al menos 2 caracteres." }),
  apellidos: z.string().min(2, { message: "Los apellidos deben tener al menos 2 caracteres." }),
  telefono: z
    .string()
    .regex(/^\d{10}$/, { message: "El teléfono debe tener 10 dígitos." }),
  cedula: z
    .string()
    .regex(/^\d{10}$/, { message: "La cédula debe tener 10 dígitos." }),
  correoElectronico: z
    .string()
    .email({ message: "Debe ser un correo electrónico válido." }),
  departamento: z.string({
    required_error: "Debe seleccionar un departamento.",
  }),
  rol: z.string({
    required_error: "Debe seleccionar un rol.",
  }),
  tarjetaRFID: z
    .string()
    .regex(/^[a-zA-Z0-9]{8,16}$/, { message: "La tarjeta RFID debe tener entre 8 y 16 caracteres." })
    .optional(),
  fechaNacimiento: z.date({
    required_error: "Debe seleccionar una fecha de nacimiento.",
  }),
});

export default function RegistrarUsuario() {
  const [scanningRFID, setScanningRFID] = useState(false);
  const [rfidValue, setRfidValue] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      telefono: "",
      cedula: "",
      correoElectronico: "",
      departamento: "",
      rol: "",
      tarjetaRFID: "",
      fechaNacimiento: undefined,
    },
  });

  // Cargar departamentos y roles desde la API
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        // Obtenemos los departamentos
        const respDepartamentos = await axios.get("http://localhost:8002/api/departamentos");
        // Transformamos la respuesta al formato esperado
        const departamentosFormateados = respDepartamentos.data.map(dept => ({
          label: dept.nombreDepartamento,
          value: dept.id.toString()
        }));
        setDepartamentos(departamentosFormateados);
        console.log(departamentosFormateados);
        
        // Obtenemos los roles
        const respRoles = await axios.get("http://localhost:8002/api/roles");
        // Transformamos la respuesta al formato esperado
        const rolesFormateados = respRoles.data.map(rol => ({
          label: rol.rol,
          value: rol.id.toString()
        }));
        setRoles(rolesFormateados);

      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast("Error", {
          description: "No se pudieron cargar los departamentos o roles. Usando datos de respaldo.",
        });
        // En caso de error, usamos los datos de respaldo
        setDepartamentos(departamentosRespaldo);
        setRoles(rolesRespaldo);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para iniciar el modo de escucha del lector RFID
  function startRFIDReader() {
    setScanningRFID(true);
    toast("Esperando tarjeta", {
      description: "Acerque la tarjeta al lector RFID..."
    });
  }
  
  // Función para detener el modo de escucha del lector RFID
  function stopRFIDReader() {
    setScanningRFID(false);
  }
  
  // Función para reiniciar y escanear una nueva tarjeta
  function resetRFID() {
    setRfidValue("");
    form.setValue("tarjetaRFID", "");
  }
  
  // Efecto para manejar eventos del teclado (simulando un lector RFID que actúa como teclado)
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
      
      // Si es Enter, procesa el código completo
      if (event.key === 'Enter') {
        if (buffer.length >= 8) {
          setRfidValue(buffer);
          form.setValue("tarjetaRFID", buffer);
          setScanningRFID(false);
          toast("Tarjeta detectada", {
            description: `Código RFID registrado correctamente`,
          });
        }
        buffer = '';
      } else if (event.key.match(/[a-zA-Z0-9]/)) {
        // Solo acepta caracteres alfanuméricos
        buffer += event.key;
      }
    };
    
    // Añadir/quitar event listeners
    if (scanningRFID) {
      window.addEventListener('keypress', handleKeyPress);
    }
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [scanningRFID, form]);

  function onSubmit(data) {
    console.log("Datos del usuario:", data);
    toast("Usuario registrado", {
      description: "El usuario ha sido registrado exitosamente."
    });
    form.reset();
    setRfidValue("");
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Registrar Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda - Campos de datos personales */}
                <div className="space-y-6">
                  {/* Campo de nombres */}
                  <FormField
                    control={form.control}
                    name="nombres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombres</FormLabel>
                        <FormControl>
                          <Input placeholder="Ejemplo: Juan Carlos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de apellidos */}
                  <FormField
                    control={form.control}
                    name="apellidos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input placeholder="Ejemplo: Pérez Gómez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de cédula */}
                  <FormField
                    control={form.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula</FormLabel>
                        <FormControl>
                          <Input placeholder="Ejemplo: 1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de teléfono */}
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Ejemplo: 0987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de correo electrónico */}
                  <FormField
                    control={form.control}
                    name="correoElectronico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="Ejemplo: usuario@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Campo de fecha de nacimiento */}
                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de departamento (Combobox) */}
                  <FormField
                    control={form.control}
                    name="departamento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Departamento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? departamentos.find(
                                      (dept) => dept.value === field.value
                                    )?.label
                                  : "Seleccionar departamento"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar departamento..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No se encontraron departamentos.</CommandEmpty>
                                <CommandGroup>
                                  {departamentos.map((dept) => (
                                    <CommandItem
                                      value={dept.label}
                                      key={dept.value}
                                      onSelect={() => {
                                        form.setValue("departamento", dept.value);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          dept.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {dept.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de rol (Combobox) */}
                  <FormField
                    control={form.control}
                    name="rol"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Rol</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
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
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar rol..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No se encontraron roles.</CommandEmpty>
                                <CommandGroup>
                                  {roles.map((rol) => (
                                    <CommandItem
                                      value={rol.label}
                                      key={rol.value}
                                      onSelect={() => {
                                        form.setValue("rol", rol.value);
                                      }}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Columna derecha - Campo de tarjeta RFID */}
                <div className="flex flex-col h-full">
                  <FormField
                    control={form.control}
                    name="tarjetaRFID"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col">
                        <FormLabel>Tarjeta RFID</FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 flex-1 flex flex-col justify-center">
                          {rfidValue ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="text-green-600 font-medium mb-4 text-lg">
                                Tarjeta RFID registrada
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded p-4 w-full text-center font-mono text-lg mb-6">
                                {rfidValue}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                className="mt-3"
                                onClick={resetRFID}
                              >
                                <ScanLine className="h-5 w-5 mr-2" />
                                Escanear otra tarjeta
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className={`text-center mb-6 text-lg ${scanningRFID ? "text-blue-500 animate-pulse" : "text-gray-600"}`}>
                                {scanningRFID ? "Acerque la tarjeta al lector..." : "No se ha registrado ninguna tarjeta"}
                              </div>
                              {scanningRFID ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="lg"
                                  className="flex items-center gap-2"
                                  onClick={stopRFIDReader}
                                >
                                  Cancelar escaneo
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="lg"
                                  className="flex items-center gap-2"
                                  onClick={startRFIDReader}
                                >
                                  <ScanLine className="h-5 w-5" />
                                  Registrar Tarjeta RFID
                                </Button>
                              )}
                              <p className="text-sm text-gray-500 mt-6 text-center">
                                Al presionar el botón, acerque la tarjeta RFID al lector para registrarla en el sistema.
                              </p>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="blue">
                  Registrar Usuario
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}