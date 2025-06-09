"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/utils/axios";

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
  status: z.coerce.number().int().min(0).max(1),
 // tagInmueble: z.string().min(2),
  serieBien: z.string().min(2),
  modeloBien: z.string().min(2),
  marcaBien: z.string().min(2),
  materialBien: z.string().min(2),
  dimensionesBien: z.string().min(2),
  observacionBien: z.string().optional(),
  ubicacionBien: z.string().min(2),
  categoriaId: z.string(),
  //tagRfidId: z.coerce.number().int().optional(),
  departamentoId: z.string(),
  tagRfidNumero:z.string()
  //tagRfidCode: z.string().optional(),

});

export default function RegistrarBien() {
  const [scanningRFID, setScanningRFID] = useState(false);
  const [rfidValue, setRfidValue] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombreBien: "",
      descripcion: "",
      precio: "",
      status: 1,
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
    },
  });

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
  }, []);

  useEffect(() => {
    let buffer = "";
    let lastKeyTime = 0;

    const handleKeyPress = (event) => {
      if (!scanningRFID) return;
      const currentTime = new Date().getTime();
      if (currentTime - lastKeyTime > 500 && buffer.length > 0) buffer = "";
      lastKeyTime = currentTime;

      if (event.key === "Enter") {
        if (buffer.length >= 8) {
          setRfidValue(buffer);
          form.setValue("tagRfidNumero", buffer); // 

          setScanningRFID(false);
          toast.success("Tag RFID detectado", {
            description: `Código RFID: ${buffer}`,
            richColors: true,
          });
        }
        buffer = "";
      } else if (event.key.match(/[a-zA-Z0-9]/)) {
        buffer += event.key;
      }
    };

    if (scanningRFID) window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [scanningRFID, form]);

  const buscarIdPorCodigoRFID = async (codigo) => {
    try {
      const response = await axios.get(`http://localhost:8002/api/tags-rfid/buscar-por-codigo/${codigo}`);
      return response.data;
    } catch (error) {
      console.error("Error al buscar el ID del tag RFID:", error);
      return null;
    }
  };

  const onSubmit = async (data) => {
  try {
    const finalData = {
      ...data,
      categoriaId: parseInt(data.categoriaId),
      departamentoId: parseInt(data.departamentoId),
      tagRfidNumero: data.tagRfidNumero
    };

    // Muestra por consola el cuerpo del POST
    console.log("🔍 Enviando datos al backend:", finalData);

    const response = await axios.post("http://localhost:8002/api/bienes-inmuebles", finalData);

    toast.success(` Bien "${data.nombreBien}" registrado con éxito`);

    form.reset();
    setRfidValue("");
  } catch (error) {
    console.error(" Error al registrar bien:", error);
    toast.error("Ocurrió un error al registrar el bien.");
  }
};


  return (
    <div className="p-6 md:p-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Registrar Bien</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-hidden w-full max-w-full">
          <div className="border rounded-lg p-4 bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
            {rfidValue ? (
              <div className="text-center">
                <p className="text-green-600 text-lg mb-2">Tag RFID escaneado:</p>
                <p className="bg-white dark:bg-gray-800 text-lg p-2 rounded font-mono">{rfidValue}</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setRfidValue("");
                  form.setValue("tagRfidNumero", "");
                  setScanningRFID(true);
                  toast.info("Escaneando nuevo tag RFID...");
                }}>
                  <ScanLine className="h-4 w-4 mr-2" /> Escanear otro tag
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className={`text-lg ${scanningRFID ? "text-blue-600 animate-pulse" : "text-gray-600"}`}>
                  {scanningRFID ? "Escanee un tag RFID..." : "No se ha escaneado ningún tag RFID"}
                </p>
                {!scanningRFID && (
                  <Button variant="outline" className="mt-4" onClick={() => {
                    setScanningRFID(true);
                    toast.info("Escaneando tag RFID...");
                  }}>
                    <ScanLine className="h-4 w-4 mr-2" /> Iniciar escaneo
                  </Button>
                )}
              </div>
            )}
          </div>

          <Form {...form}>
            <form
  onSubmit={form.handleSubmit(onSubmit)}
  className="w-full max-w-full grid grid-cols-1 md:grid-cols-3 gap-4"
>

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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1 para activo, 0 para inactivo"  className="w-full" {...field} />
                </FormControl>
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
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Oficina 101"  className="w-full" {...field} />
                </FormControl>
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

              <div className="md:col-span-2">
                <Button type="submit" className="text-black w-full justify-between">Registrar Bien</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
