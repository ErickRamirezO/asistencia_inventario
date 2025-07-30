"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/utils/axios";
import { useNavigate, useParams } from "react-router-dom";

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
import { Check, ChevronsUpDown, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";

const FormSchema = z.object({
  nombreBien: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, { message: "El nombre debe tener un máximo de 100 caracteres." })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  descripcion: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, {
      message: "La descripción debe tener un máximo de 100 caracteres.",
    })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  precio: z.coerce
    .number({ invalid_type_error: "El precio debe ser un número válido." })
    .min(0.01, { message: "El precio debe ser mayor que cero." })
    .max(1000000, { message: "El precio debe ser menor que un millón." }),

  serieBien: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, { message: "La serie debe tener un máximo de 100 caracteres." })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  modeloBien: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, { message: "El modelo debe tener un máximo de 100 caracteres." })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  marcaBien: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, { message: "La marca debe tener un máximo de 100 caracteres." })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  materialBien: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, {
      message: "El material debe tener un máximo de 100 caracteres.",
    })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  dimensionesBien: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres." })
    .max(100, {
      message: "Las dimensiones deben tener un máximo de 100 caracteres.",
    })
    .regex(/^[^\[\]\{\}\(\)<>]*$/, {
      message: "El nombre no puede contener caracteres especiales.",
    }),

  observacionBien: z.string().optional(),

  ubicacionBien: z.string().nonempty({ message: "Debe seleccionar un lugar." }),

  categoriaId: z.string(),
  departamentoId: z.string(),
  tagRfidNumero: z.string().min(1, { message: "Debe escanear un tag RFID." }),
  usuarioId: z.string().optional(),
  status: z.coerce.number().optional().default(1),
});

const FormSchemaDepartamento = z.object({
  nombreDepartamento: z.string().min(2),
});

const FormSchemaLugar = z.object({
  nombreLugar: z.string().min(2), // Validación de nombre del lugar
});

const FormSchemaCategoria = z.object({
  nombreCategoria: z.string().min(2), // Validación para el nombre de la categoría
});

export default function RegistrarBien() {
  const { user } = useUser();
  const [scanningRFID, setScanningRFID] = useState(false);
  const [rfidValue, setRfidValue] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
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
  const isDesktop = windowSize.width >= 600; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 200 // ajusta 200px según header + paddings
    : undefined;
  const inputHeight = isDesktop
    ? Math.max(18, Math.floor((availableHeight - 60 || 800) / 12)) // mínimo 32px
    : 32;
  const labelHeight = isDesktop
    ? Math.max(7, Math.floor(inputHeight / 12)) // mínimo 8px (h-2)
    : 15;

  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange", // Validar en cada cambio
    reValidateMode: "onChange", // Revalidar en cada cambio
    defaultValues: {
      nombreBien: "",
      descripcion: "",
      precio: "",
      serieBien: "",
      modeloBien: "",
      marcaBien: "",
      materialBien: "",
      dimensionesBien: "",
      observacionBien: "",
      ubicacionBien: "",
      categoriaId: "",
      departamentoId: "",
      tagRfidNumero: "",
      usuarioId: "",
      status: 1,
    },
  });

  const formDepartamento = useForm({
    resolver: zodResolver(FormSchemaDepartamento),
    defaultValues: { nombreDepartamento: "" },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dialogOpenLugar, setDialogOpenLugar] = useState(false); // Estado para el modal del lugar

  const formLugar = useForm({
    resolver: zodResolver(FormSchemaLugar),
    defaultValues: { nombreLugar: "" },
  });

  const abrirModalLugar = () => {
    formLugar.reset(); // Limpiar campos del formulario al abrir
    setDialogOpenLugar(true); // Mostrar modal
  };

  const onSubmitLugar = async (data) => {
    try {
      await api.post("/lugares", data); // Endpoint para guardar el nuevo lugar
      toast.success("Lugar creado correctamente", {
        richColors: true,
      });
      await crearLog(`INFO: Lugar creado: ${data.nombreLugar}`, user.userId);
      setDialogOpenLugar(false);
      cargarLugares(); // Recargar los lugares después de agregar uno nuevo
    } catch {
      toast.error("Error al guardar lugar", {
        richColors: true,
      });
      await crearLog(`ERROR: Error al guardar lugar`, user.userId);
    }
  };
  const cargarLugares = async () => {
    try {
      const res = await api.get("/lugares"); // Endpoint para cargar los lugares
      const options = res.data.map((lugar) => ({
        label: lugar.nombreLugar,
        value: lugar.id.toString(),
      }));
      setLugares(options);
    } catch {
      toast.error("Error al cargar lugares", {
        richColors: true,
      });
      await crearLog(`ERROR: Error al cargar lugares`, user.userId);
    }
  };

  useEffect(() => {
    cargarLugares(); // Cargar lugares cuando se monta el componente
  }, []);

  // Abrir modal para agregar un nuevo departamento
  const abrirModal = () => {
    setModoEdicion(false);
    formDepartamento.reset();
    setDialogOpen(true);
  };
  const onSubmitDepartamento = async (data) => {
    try {
      await api.post("/departamentos", data); // Aquí guardas el nuevo departamento
      toast.success("Departamento creado correctamente", {
        richColors: true,
      });
      await crearLog(
        `INFO: Departamento creado: ${data.nombreDepartamento}`,
        user.userId
      );
      setDialogOpen(false);
      cargarDepartamentos(); // Recargar departamentos después de agregar uno nuevo
    } catch {
      toast.error("Error al guardar departamento", {
        richColors: true,
      });
      await crearLog(`ERROR: Error al guardar departamento`, user.userId);
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
      toast.error("Error al cargar departamentos en registro de bienes", {
        richColors: true,
      });
      await crearLog(
        `ERROR: Error al cargar departamentos en registro de bienes`,
        user.userId
      );
    }
  };
  const [dialogOpenCategoria, setDialogOpenCategoria] = useState(false); // Estado para el modal de categoría

  const formCategoria = useForm({
    resolver: zodResolver(FormSchemaCategoria),
    defaultValues: { nombreCategoria: "" },
  });

  const abrirModalCategoria = () => {
    formCategoria.reset(); // Limpiar campos del formulario al abrir
    setDialogOpenCategoria(true); // Mostrar modal
  };

  const onSubmitCategoria = async (data) => {
    try {
      await api.post("/categorias", data); // Endpoint para guardar la nueva categoría
      toast.success("Categoría creada correctamente", {
        richColors: true,
      });
      await crearLog(
        `INFO: Categoría creada en registro de bienes: ${data.nombreCategoria}`,
        user.userId
      );
      setDialogOpenCategoria(false);
      cargarCategorias(); // Recargar las categorías después de agregar una nueva
    } catch {
      toast.error("Error al guardar categoría", {
        richColors: true,
      });
      await crearLog(
        `ERROR: Error al guardar categoría en registro de bienes`,
        user.userId
      );
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/categorias"); // Endpoint para cargar las categorías
      const options = res.data.map((categoria) => ({
        label: categoria.nombreCategoria,
        value: categoria.id.toString(),
      }));
      setCategorias(options);
    } catch {
      toast.error("Error al cargar categorías", {
        richColors: true,
      });
    }
  };

  useEffect(() => {
    cargarCategorias(); // Cargar categorías cuando se monta el componente
  }, []);

  useEffect(() => {
    if (!scanningRFID) return;

    let buffer = "";
    let lastKeyTime = 0;

    const handleKeyPress = (e) => {
      const currentTime = new Date().getTime();
      if (currentTime - lastKeyTime > 100) buffer = "";
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        const tag = buffer.trim();
        if (tag.length > 0) {
          setRfidValue(tag);
          form.setValue("tagRfidNumero", tag);
          setScanningRFID(false);
          toast.success("Tag RFID escaneado correctamente", {
            richColors: true,
          });
        }
        buffer = "";
      } else {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [scanningRFID, form]);

  useEffect(() => {
    api
      .get("/departamentos")
      .then((res) => {
        const options = res.data.map((dep) => ({
          label: dep.nombreDepartamento,
          value: dep.id.toString(),
        }));
        setDepartamentos(options);
      })
      .catch(() =>
        toast.error("Error al cargar departamentos", {
          richColors: true,
        })
      );

    api
      .get("/categorias")
      .then((res) => {
        const options = res.data.map((cat) => ({
          label: cat.nombreCategoria,
          value: cat.id.toString(),
        }));
        setCategorias(options);
      })
      .catch(() =>
        toast.error("Error al cargar categorías", {
          richColors: true,
        })
      );

    api
      .get("/usuarios")
      .then((res) => {
        const options = res.data.map((user) => ({
          label: `${user.nombre} ${user.apellido}`,
          value: user.id.toString(),
        }));
        setUsuarios(options);
      })
      .catch(() =>
        toast.error("Error al cargar usuarios", {
          richColors: true,
        })
      );
  }, []);

  useEffect(() => {
    if (id) {
      api
        .get(`/bienes-inmuebles/${id}`)
        .then((res) => {
          const bien = res.data;
          form.reset({
            nombreBien: bien.nombreBien,
            descripcion: bien.descripcion,
            precio: bien.precio,
            serieBien: bien.serieBien,
            modeloBien: bien.modeloBien,
            marcaBien: bien.marcaBien,
            materialBien: bien.materialBien,
            dimensionesBien: bien.dimensionesBien,
            observacionBien: bien.observacionBien || "",
            ubicacionBien: bien.ubicacionBien,
            categoriaId: String(bien.categoriaId),
            departamentoId: String(bien.departamentoId),
            tagRfidNumero: bien.tagRfidNumero ?? "",
            usuarioId: bien.usuarioId ? String(bien.usuarioId) : "",
            status: bien.status ?? 1,
          });
          setRfidValue(bien.tagRfidNumero);
        })
        .catch(() =>
          toast.error("No se pudo cargar el bien", {
            richColors: true,
          })
        );
    }
  }, [id, form]);

  const [lugares, setLugares] = useState([]);

  useEffect(() => {
    api
      .get("/lugares")
      .then((res) => {
        const options = res.data
          .filter((l) => l.activo) // si filtras solo los activos
          .map((l) => ({
            label: l.nombreLugar,
            value: l.nombreLugar, // usamos el nombre directamente como value
          }));
        setLugares(options);
      })
      .catch(() =>
        toast.error("Error al cargar lugares", {
          richColors: true,
        })
      );
  }, []);

  const onSubmit = async (data) => {
    console.log("Formulario enviado. Datos:", data);
    try {
      const payload = {
        ...data,
        categoriaId: parseInt(data.categoriaId),
        departamentoId: parseInt(data.departamentoId),
        tagRfidNumero: data.tagRfidNumero ?? "",
        usuarioId: data.usuarioId ? parseInt(data.usuarioId) : null,
      };

      if (id) {
        await api.put(`/bienes-inmuebles/${id}`, payload);
        toast.success("Bien actualizado correctamente", {
          richColors: true,
        });
        await crearLog(`"INFO: Bien actualizado con ID ${id}"`, user.userId);
      } else {
        await api.post("/bienes-inmuebles", payload);
        toast.success("Bien registrado correctamente", {
          richColors: true,
        });
        await crearLog(
          `"INFO: Bien registrado con nombre ${data.nombreBien}"`,
          user.userId
        );
      }

      navigate("/bienes/lista-bienes");
    } catch (error) {
      console.error("Error al guardar el bien:", error);
      toast.error("Error al guardar el bien.", {
        richColors: true,
      });
      await crearLog(
        "ERROR: No se pudo guardar el bien con nombre ${data.nombreBien}",
        user.userId
      );
    }
  };

  return (
    <div className="p-1 md:p-10 pt-0">
      {" "}
      {/* <-- pt-0 elimina padding top extra */}
      <Card className="  border-transparent shadow-none rounded-none p-0 ">
        <CardContent
          className="w-full max-w-full p-2 overflow-hidden"
          style={
            isDesktop
              ? { height: availableHeight, overflowY: "auto" }
              : undefined
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sección del formulario */}
            <div>
              <Form {...form}>
                <form
                  id="form-bien"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"
                >
                  {/* Aquí van todos tus <FormField> como ya los tienes */}
                  <FormField
                    control={form.control}
                    name="nombreBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Nombre del Bien
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: Escritorio"
                            className="w-full text-xs md:text-[13px] sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Descripción
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: De madera color negro"
                            className="w-full text-xs md:text-[13px] sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="precio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Precio
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            type="number"
                            placeholder="Ejemplo: 120.00"
                            className="w-full text-xs md:text-[13px] sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usuarioId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Usuario Encargado
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                style={{ height: inputHeight }}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between text-xs md:text-[13px] sm:text-sm ",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? usuarios.find(
                                      (u) => u.value === field.value
                                    )?.label
                                  : "Seleccionar usuario"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full max-w-full">
                            <Command>
                              <CommandInput placeholder="Buscar usuario..." />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron usuarios.
                                </CommandEmpty>
                                <CommandGroup>
                                  {usuarios.map((user) => (
                                    <CommandItem
                                      key={user.value}
                                      value={user.label}
                                      onSelect={() => {
                                        console.log(
                                          "✅ Usuario seleccionado:",
                                          user.label,
                                          "| ID:",
                                          user.value
                                        );
                                        form.setValue("usuarioId", user.value);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          user.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {user.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serieBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Serie
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: SN123456"
                            className="w-full text-xs md:text-[13px] sm:text-sm "
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modeloBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Modelo
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: X300"
                            className="w-full text-xs md:text-[13px] sm:text-sm "
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marcaBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Marca
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: HP"
                            className="w-full text-xs md:text-[13px] sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="materialBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Material
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: Acero inoxidable"
                            className="w-full text-xs md:text-[13px] sm:text-sm "
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dimensionesBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Dimensiones
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: 1.2m x 0.6m"
                            className="w-full text-xs md:text-[13px] sm:text-sm "
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacionBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="text-xs md:text-[13px] sm:text-sm"
                        >
                          Observaciones
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ height: inputHeight }}
                            placeholder="Ejemplo: Leve desgaste"
                            className="w-full text-xs md:text-[13px] sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacionBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="w-full text-xs md:text-[13px] sm:text-sm "
                        >
                          Ubicación
                        </FormLabel>
                        <Popover>
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
                                  ? lugares.find((l) => l.value === field.value)
                                      ?.label
                                  : "Seleccionar lugar"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full max-w-full">
                            <Command>
                              <CommandInput
                                placeholder="Buscar lugar..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron lugares.
                                </CommandEmpty>
                                <CommandGroup>
                                  {lugares.map((lugar) => (
                                    <CommandItem
                                      key={lugar.value}
                                      value={lugar.label}
                                      onSelect={() =>
                                        form.setValue(
                                          "ubicacionBien",
                                          lugar.value
                                        )
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          lugar.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {lugar.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                            <Button
                              type="button"
                              onClick={() => abrirModalLugar()} // Abre el modal para agregar un nuevo lugar
                              className="mt-2 w-full bg-gray-200 text-black hover:bg-gray-300 hover:text-white"
                            >
                              Agregar Nuevo Lugar
                            </Button>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departamentoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="w-full text-xs md:text-[13px] sm:text-sm"
                        >
                          Departamento
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                style={{ height: inputHeight }}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between text-xs md:text-[13px] sm:text-sm  ",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? departamentos.find(
                                      (dep) => dep.value === field.value
                                    )?.label
                                  : "Seleccionar departamento"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full max-w-full">
                            <Command>
                              <CommandInput
                                placeholder="Buscar departamento..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron departamentos.
                                </CommandEmpty>
                                <CommandGroup>
                                  {departamentos.map((dep) => (
                                    <CommandItem
                                      value={dep.label}
                                      key={dep.value}
                                      onSelect={() =>
                                        form.setValue(
                                          "departamentoId",
                                          dep.value
                                        )
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          dep.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {dep.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                            <Button
                              onClick={() => abrirModal()} // Abre el modal para agregar un nuevo departamento
                              className="mt-2 w-full bg-gray-200 text-black hover:bg-gray-300 hover:text-white"
                            >
                              Agregar Nuevo Departamento
                            </Button>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoriaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          style={{ height: labelHeight }}
                          className="w-full text-xs md:text-[13px] sm:text-sm"
                        >
                          Categoría
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                style={{ height: inputHeight }}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between text-xs md:text-[13px] sm:text-sm ",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? categorias.find(
                                      (cat) => cat.value === field.value
                                    )?.label
                                  : "Seleccionar categoría"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full max-w-full">
                            <Command>
                              <CommandInput
                                placeholder="Buscar categoría..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron categorías.
                                </CommandEmpty>
                                <CommandGroup>
                                  {categorias.map((cat) => (
                                    <CommandItem
                                      key={cat.value}
                                      value={cat.label}
                                      onSelect={() =>
                                        form.setValue("categoriaId", cat.value)
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          cat.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {cat.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                            <Button
                              type="button"
                              onClick={() => abrirModalCategoria()} // Abre el modal para agregar una nueva categoría
                              className="mt-2 w-full bg-gray-200 text-black hover:bg-gray-300 hover:text-white"
                            >
                              Agregar Nueva Categoría
                            </Button>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            {/* Panel RFID como Card */}
            <Card className="h-fit self-start w-full">
              <CardHeader>
                <CardTitle className="font-semibold text-xs md:text-[13px] sm:text-sm">
                  Tarjeta RFID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  {rfidValue ? (
                    <>
                      <p className="text-green-600 text-xs md:text-[13px] sm:text-sm mb-2">
                        Tag RFID escaneado:
                      </p>
                      <p className="bg-white dark:bg-gray-800 text-xs md:text-[13px] sm:text-sm p-2 rounded font-mono">
                        {rfidValue}
                      </p>
                      {!id && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRfidValue("");
                            form.setValue("tagRfidNumero", "");
                            setScanningRFID(true);
                            toast.info("Escaneando nuevo tag RFID...");
                          }}
                        >
                          <ScanLine className="h-4 w-4 mr-2" /> Escanear otro
                          tag
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <p
                        className={`text-xs md:text-[13px] sm:text-sm ${
                          scanningRFID
                            ? "text-blue-600 animate-pulse"
                            : "text-gray-600"
                        }`}
                      >
                        {scanningRFID
                          ? "Escanee un tag RFID..."
                          : "No se ha escaneado ningún tag RFID"}
                      </p>
                      {!scanningRFID && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setScanningRFID(true);
                            toast.info("Escaneando tag RFID...");
                          }}
                          className="w-full text-xs md:text-[13px] sm:text-sm"
                        >
                          <ScanLine className="h-4 w-4 mr-2" /> Iniciar escaneo
                        </Button>
                      )}
                    </>
                  )}
                </div>
                {form.formState.errors.tagRfidNumero && (
                  <p className="text-red-600 text-xs md:text-[13px] sm:text-sm">
                    {form.formState.errors.tagRfidNumero.message}
                  </p>
                )}


                {/* ✅ Botón de submit aquí, enlazado con el formulario principal */}
                <Button
                  type="submit"
                  form="form-bien"
                  variant="blue"
                  className="w-full text-white"
                >
                  {id ? "Actualizar Bien" : "Registrar Bien"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Departamento</DialogTitle>
          </DialogHeader>
          <Form {...formDepartamento}>
            <form
              onSubmit={formDepartamento.handleSubmit(onSubmitDepartamento)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={formDepartamento.control}
                name="nombreDepartamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Departamento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Contabilidad"
                        className="w-full text-xs md:text-[13px] sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
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
      <Dialog open={dialogOpenLugar} onOpenChange={setDialogOpenLugar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Lugar</DialogTitle>
          </DialogHeader>
          <Form {...formLugar}>
            <form
              onSubmit={formLugar.handleSubmit(onSubmitLugar)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={formLugar.control}
                name="nombreLugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Lugar</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Oficina Central"
                        className="w-full text-xs md:text-[13px] sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setDialogOpenLugar(false)} // Cerrar el modal
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit" // Enviar el formulario de lugar
                  className="bg-blue-600 text-black hover:bg-blue-700"
                >
                  Crear Lugar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={dialogOpenCategoria} onOpenChange={setDialogOpenCategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Lugar</DialogTitle>
          </DialogHeader>
          <Form {...formCategoria}>
            <form
              onSubmit={formCategoria.handleSubmit(onSubmitCategoria)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={formCategoria.control}
                name="nombreCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Categoría</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Electrónica"
                        className="w-full text-xs md:text-[13px] sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setDialogOpenCategoria(false)} // Cerrar el modal
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit" // Enviar el formulario de categoría
                  className="bg-blue-600 text-black hover:bg-blue-700"
                >
                  Crear Categoría
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}