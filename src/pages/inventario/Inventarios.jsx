"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";
import { Pencil, Eye, CalendarIcon } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormSchema = z.object({
  nombreInventario: z.string().min(2, {
    message: "Debe tener al menos 2 caracteres",
  }),
  fechaInicioInventario: z.date({
    required_error: "Seleccione una fecha de inicio",
  }),
  fechaFinInventario: z.date({
    required_error: "Seleccione una fecha de fin",
  }),
});

export default function Inventarios() {
  const [inventarios, setInventarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [inventarioActual, setInventarioActual] = useState(null);
  const [openInicio, setOpenInicio] = useState(false);
  const [openFin, setOpenFin] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombreInventario: "",
      fechaInicioInventario: undefined,
      fechaFinInventario: undefined,
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

  useEffect(() => {
    cargarInventarios();
  }, []);

  const abrirFormulario = (inventario = null) => {
    setModoEdicion(!!inventario);
    setInventarioActual(inventario);
    form.reset({
      nombreInventario: inventario?.nombreInventario || "",
      fechaInicioInventario: inventario?.fechaInicioInventario
        ? new Date(inventario.fechaInicioInventario)
        : undefined,
      fechaFinInventario: inventario?.fechaFinInventario
        ? new Date(inventario.fechaFinInventario)
        : undefined,
    });
    setFormVisible(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      fechaInicioInventario: format(data.fechaInicioInventario, "yyyy-MM-dd"),
      fechaFinInventario: format(data.fechaFinInventario, "yyyy-MM-dd"),
      usuariosId: 1, // 👈 ID quemado del usuario
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
      {formVisible && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {modoEdicion ? "Editar Inventario" : "Nuevo Inventario"}
            </CardTitle>
          </CardHeader>
          <CardContent>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaInicioInventario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover open={openInicio} onOpenChange={setOpenInicio}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full text-left pl-3 font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy")
                                  : "Seleccionar fecha"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50">
                            <DayPicker
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setOpenInicio(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaFinInventario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Fin</FormLabel>
                        <Popover open={openFin} onOpenChange={setOpenFin}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full text-left pl-3 font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy")
                                  : "Seleccionar fecha"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50">
                            <DayPicker
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setOpenFin(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
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
                  <Button type="submit" className="bg-blue-600 text-white">
                    {modoEdicion ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">Inventarios</CardTitle>
          <Button
            className="bg-blue-600 text-white"
            onClick={() => abrirFormulario()}
          >
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
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => abrirFormulario(inv)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                   <Button
  size="icon"
  className="bg-gray-400"
  onClick={() => navigate(`/inventarios/${inv.id}/ver`)}
>
  <Eye className="w-4 h-4" />
</Button>
<Button
  size="icon"
  className="bg-green-600 hover:bg-green-700"
  onClick={() => navigate(`/inventarios/${inv.id}/realizar`)}
>
  <ScanLine className="w-4 h-4" />
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
