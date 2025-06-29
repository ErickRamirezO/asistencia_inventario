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

const FormSchema = z.object({
  nombreBien: z.string().min(2),
  descripcion: z.string().min(2),
  precio: z.coerce.number().positive(),
  serieBien: z.string().min(2),
  modeloBien: z.string().min(2),
  marcaBien: z.string().min(2),
  materialBien: z.string().min(2),
  dimensionesBien: z.string().min(2),
  observacionBien: z.string().optional(),
  ubicacionBien: z.string().min(2),
  categoriaId: z.string(),
  departamentoId: z.string(),
  tagRfidNumero: z.string(),
  usuarioId: z.string().optional(),
  status: z.coerce.number().optional().default(1),
});

export default function RegistrarBien() {
  const [scanningRFID, setScanningRFID] = useState(false);
  const [rfidValue, setRfidValue] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const form = useForm({
    resolver: zodResolver(FormSchema),
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
          toast.success("Tag RFID escaneado correctamente");
        }
        buffer = "";
      } else {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [scanningRFID]);
  useEffect(() => {
    api.get("/departamentos").then(res => {
      const options = res.data.map(dep => ({
        label: dep.nombreDepartamento,
        value: dep.id.toString(),
      }));
      setDepartamentos(options);
    }).catch(() => toast.error("Error al cargar departamentos"));

    api.get("/categorias").then(res => {
      const options = res.data.map(cat => ({
        label: cat.nombreCategoria,
        value: cat.id.toString(),
      }));
      setCategorias(options);
    }).catch(() => toast.error("Error al cargar categorías"));

    api.get("/usuarios").then(res => {
      const options = res.data.map(user => ({
        label: `${user.nombre} ${user.apellido}`,
        value: user.id.toString(),
      }));
      setUsuarios(options);
    }).catch(() => toast.error("Error al cargar usuarios"));
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/bienes-inmuebles/${id}`).then(res => {
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
          tagRfidNumero: bien.tagRfidNumero,
          usuarioId: bien.usuarioId ? String(bien.usuarioId) : "",
          status: bien.status ?? 1,
        });
        setRfidValue(bien.tagRfidNumero);
      }).catch(() => toast.error("No se pudo cargar el bien"));
    }
  }, [id]);

  const [lugares, setLugares] = useState([]);

useEffect(() => {
  api.get("/lugares").then(res => {
    const options = res.data
      .filter(l => l.activo) // si filtras solo los activos
      .map(l => ({
        label: l.nombreLugar,
        value: l.nombreLugar, // usamos el nombre directamente como value
      }));
    setLugares(options);
  }).catch(() => toast.error("Error al cargar lugares"));
}, []);

  const onSubmit = async (data) => {
     console.log("Formulario enviado. Datos:", data);
    try {
      const payload = {
        ...data,
        categoriaId: parseInt(data.categoriaId),
        departamentoId: parseInt(data.departamentoId),
        tagRfidNumero: data.tagRfidNumero,
        usuarioId: data.usuarioId ? parseInt(data.usuarioId) : null,
      };

      if (id) {
        await api.put(`/bienes-inmuebles/${id}`, payload);
        toast.success("Bien actualizado correctamente");
      } else {
        await api.post("/bienes-inmuebles", payload);
        toast.success("Bien registrado correctamente");
      }

      navigate("/bienes/lista-bienes");
    } catch (error) {
      console.error("Error al guardar el bien:", error);
      toast.error("Error al guardar el bien.");
    }
  };

  return (
    <div className="p-1 md:p-10 pt-0"> {/* <-- pt-0 elimina padding top extra */}
  

      <Card className="w-full">
        
        <CardContent className="overflow-x-hidden w-full max-w-full p-4">
<div className="md:max-h-[460px] md:overflow-y-auto md:pr-1">

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sección del formulario */}
      <div className="md:col-span-2">
        <Form  {...form}>
          <form  id="form-bien" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {/* Aquí van todos tus <FormField> como ya los tienes */}
            <FormField
            control={form.control}
            name="nombreBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Bien</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Escritorio"  className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: De madera color negro" className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ejemplo: 120.00"  className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usuarioId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario Encargado (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                        {field.value ? usuarios.find(u => u.value === field.value)?.label : "Seleccionar usuario"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full max-w-full">
                    <Command>
                      <CommandInput placeholder="Buscar usuario..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                        <CommandGroup>
                          {usuarios.map((user) => (
                            <CommandItem
                              key={user.value}
                              value={user.label}
                              onSelect={() => {console.log("✅ Usuario seleccionado:", user.label, "| ID:", user.value); 
                                form.setValue("usuarioId", user.value)}}
                            >
                              <Check className={cn("mr-2 h-4 w-4", user.value === field.value ? "opacity-100" : "opacity-0")} />
                              {user.label}
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

                   

          <FormField
            control={form.control}
            name="serieBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: SN123456" className="w-full"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modeloBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: X300"  className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marcaBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: HP" className="w-full"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Acero inoxidable" className="w-full"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensionesBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensiones</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: 1.2m x 0.6m" className="w-full"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacionBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Leve desgaste"  className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
         <FormField
  control={form.control}
  name="ubicacionBien"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Ubicación (Lugar)</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
              {field.value ? lugares.find(l => l.value === field.value)?.label : "Seleccionar lugar"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-full">
          <Command>
            <CommandInput placeholder="Buscar lugar..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontraron lugares.</CommandEmpty>
              <CommandGroup>
                {lugares.map((lugar) => (
                  <CommandItem
                    key={lugar.value}
                    value={lugar.label}
                    onSelect={() => form.setValue("ubicacionBien", lugar.value)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", lugar.value === field.value ? "opacity-100" : "opacity-0")} />
                    {lugar.label}
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

          
          
          
          
          <FormField
            control={form.control}
            name="departamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>{
                        field.value ? departamentos.find(dep => dep.value === field.value)?.label : "Seleccionar departamento"
                      }<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
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
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>{
                        field.value ? categorias.find(cat => cat.value === field.value)?.label : "Seleccionar categoría"
                      }<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full max-w-full">
                    <Command>
                      <CommandInput placeholder="Buscar categoría..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                        <CommandGroup>
                          {categorias.map((cat) => (
                            <CommandItem value={cat.label} key={cat.value} onSelect={() => form.setValue("categoriaId", cat.value)}>
                              <Check className={cn("mr-2 h-4 w-4", cat.value === field.value ? "opacity-100" : "opacity-0")} />
                              {cat.label}
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

           
          </form>
        </Form>
      </div>

      {/* Panel RFID como Card */}
      <Card className="h-fit self-start w-full">
  <CardHeader>
    <CardTitle className="text-base font-semibold">Tarjeta RFID</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="text-center">
      {rfidValue ? (
        <>
          <p className="text-green-600 text-sm mb-2">Tag RFID escaneado:</p>
          <p className="bg-white dark:bg-gray-800 text-sm p-2 rounded font-mono">{rfidValue}</p>
          {!id && (
            <Button variant="outline" onClick={() => {
              setRfidValue("");
              form.setValue("tagRfidNumero", "");
              setScanningRFID(true);
              toast.info("Escaneando nuevo tag RFID...");
            }}>
              <ScanLine className="h-4 w-4 mr-2" /> Escanear otro tag
            </Button>
          )}
        </>
      ) : (
        <>
          <p className={`text-sm ${scanningRFID ? "text-blue-600 animate-pulse" : "text-gray-600"}`}>
            {scanningRFID ? "Escanee un tag RFID..." : "No se ha escaneado ningún tag RFID"}
          </p>
          {!scanningRFID && (
            <Button variant="outline" onClick={() => {
              setScanningRFID(true);
              toast.info("Escaneando tag RFID...");
            }}>
              <ScanLine className="h-4 w-4 mr-2" /> Iniciar escaneo
            </Button>
          )}
        </>
      )}
    </div>

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
    
  </div>
</CardContent>

      </Card>
    </div>
  );
}



