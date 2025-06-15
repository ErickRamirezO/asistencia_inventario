"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const FormSchema = z.object({
  nombreLugar: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
});

export default function LugaresView() {
  const [lugares, setLugares] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [lugarActual, setLugarActual] = useState(null);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { nombreLugar: "" },
  });

  const cargarLugares = async () => {
    try {
      const res = await api.get("/lugares");
      setLugares(res.data);
    } catch {
      toast.error("Error al cargar lugares");
    }
  };

  useEffect(() => {
    cargarLugares();
  }, []);

  const abrirModal = (lugar = null) => {
    setModoEdicion(!!lugar);
    setLugarActual(lugar);
    form.reset({ nombreLugar: lugar?.nombreLugar || "" });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modoEdicion) {
        await api.put(`/lugares/${lugarActual.id}`, {
          ...data,
          activo: true,
        });
        toast.success("Lugar actualizado");
      } else {
        await api.post("/lugares", data);
        toast.success("Lugar creado");
      }
      cargarLugares();
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar lugar");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold">Lugares</CardTitle>
          <Button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-black hover:bg-blue-700 font-semibold"
          >
            Agregar Lugar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lugares.map((lugar) => (
                  <tr key={lugar.id} className="border-t">
                    <td className="p-2">{lugar.nombreLugar}</td>
                    <td className="p-2">
                      {lugar.activo ? "Activo" : "Inactivo"}
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        size="icon"
                        onClick={() => abrirModal(lugar)}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar Lugar" : "Nuevo Lugar"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="nombreLugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Lugar</FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: Laboratorio B" {...field} />
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
                  {modoEdicion ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
