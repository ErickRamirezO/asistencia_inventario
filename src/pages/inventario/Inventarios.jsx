"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
import api from "@/utils/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  nombreInventario: z.string().min(2, {
    message: "Debe tener al menos 2 caracteres",
  }),
  lugarInventario: z.string().min(1, {
    message: "Seleccione un lugar",
  }),
});

export default function Inventarios() {
  const [inventarios, setInventarios] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [inventarioActual, setInventarioActual] = useState(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombreInventario: "",
      lugarInventario: "",
    },
  });

  const cargarInventarios = async () => {
    try {
      const res = await api.get("/inventarios");
      setInventarios(res.data);
    } catch {
      toast.error("Error al cargar inventarios");
    }
  };

  const cargarLugares = async () => {
    try {
      const res = await api.get("/lugares");
      setLugares(res.data);
    } catch {
      toast.error("Error al cargar lugares");
    }
  };

  useEffect(() => {
    cargarInventarios();
    cargarLugares();
  }, []);

  const abrirFormulario = (inventario = null) => {
    setModoEdicion(!!inventario);
    setInventarioActual(inventario);
    form.reset({
      nombreInventario: inventario?.nombreInventario || "",
      lugarInventario: inventario?.lugarInventario || "",
    });
    setFormVisible(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      usuariosId: 1,
    };

    try {
      if (modoEdicion) {
        await api.put(`/inventarios/${inventarioActual.id}`, payload);
        toast.success("Inventario actualizado");
      } else {
        await api.post("/inventarios", payload);
        toast.success("Inventario creado");
      }

      cargarInventarios();
      setFormVisible(false);
    } catch {
      toast.error("Error al guardar inventario");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Dialog open={formVisible} onOpenChange={setFormVisible}>
        <DialogContent className="sm:max-w-lg z-[60]">
          <DialogHeader>
            <DialogTitle>{modoEdicion ? "Editar Inventario" : "Nuevo Inventario"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombreInventario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Inventario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: Inventario Q2 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lugarInventario"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Lugar</FormLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" role="combobox" className="justify-between">
                            {field.value
                              ? lugares.find((l) => l.nombreLugar === field.value)?.nombreLugar
                              : "Seleccionar lugar"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 z-[70]">
                        <Command>
                          <CommandInput placeholder="Buscar lugar..." />
                          <CommandList>
                            <CommandEmpty>No encontrado</CommandEmpty>
                            <CommandGroup>
                              {lugares.map((lugar) => (
                                <CommandItem
                                  key={lugar.id}
                                  onSelect={() => {
                                    form.setValue("lugarInventario", lugar.nombreLugar);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === lugar.nombreLugar ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {lugar.nombreLugar}
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

              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormVisible(false);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-blue-600 text-white">
                  {modoEdicion ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">Inventarios</CardTitle>
          <Button className="bg-blue-600 text-white" onClick={() => abrirFormulario()}>
            Agregar Inventario
          </Button>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left hidden">ID</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarios.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="hidden">{inv.id}</td>
                  <td className="p-2">{inv.nombreInventario}</td>
                  <td className="p-2 text-right flex gap-2 justify-end">
  <Button
    size="icon"
    className="bg-yellow-400 hover:bg-yellow-500 text-black dark:text-white"
    onClick={() => abrirFormulario(inv)}
  >
    <Pencil className="w-5 h-5" />
  </Button>
  <Button
    size="icon"
    className="bg-blue-500 hover:bg-blue-600 text-white"
    onClick={() => navigate(`/inventarios/${inv.id}/ver`)}
  >
    <Eye className="w-5 h-5" />
  </Button>
  <Button
    size="icon"
    className="bg-green-600 hover:bg-green-700 text-white"
    onClick={() => navigate(`/inventarios/${inv.id}/realizar`)}
  >
    <ScanLine className="w-5 h-5" />
  </Button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
