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
  nombreDepartamento: z.string().min(2, {
    message: "Debe tener al menos 2 caracteres",
  }),
});

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [departamentoActual, setDepartamentoActual] = useState(null);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { nombreDepartamento: "" },
  });

  const cargarDepartamentos = async () => {
    try {
      const res = await api.get("/departamentos");

      setDepartamentos(res.data);
    } catch {
      toast.error("Error al cargar departamentos");
    }
  };

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const abrirModal = (departamento = null) => {
    setModoEdicion(!!departamento);
    setDepartamentoActual(departamento);
    form.reset({ nombreDepartamento: departamento?.nombreDepartamento || "" });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modoEdicion) {
        await api.put(`/departamentos/${departamentoActual.id}`, data);

        toast.success("Departamento actualizado");
      } else {
        await api.post("/departamentos", data);

        toast.success("Departamento creado");
      }
      cargarDepartamentos();
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar departamento");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <Button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-black hover:bg-blue-700 font-semibold"
          >
            Agregar Departamento
          </Button>
        </CardHeader>

        <CardContent>
  <div className="rounded-md border overflow-hidden max-h-110 overflow-y-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-100 sticky top-0 z-10">
        <tr>
          <th className="text-left p-2 hidden">ID</th>
          <th className="text-left p-2">Nombre</th>
          <th className="text-right p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {departamentos.map((dep) => (
          <tr key={dep.id} className="border-t">
            <td className="p-2 hidden">{dep.id}</td>
            <td className="p-2">{dep.nombreDepartamento}</td>
            <td className="p-2 text-right">
              <Button
                size="icon"
                onClick={() => abrirModal(dep)}
                className="bg-blue-500 text-blue-700 hover:bg-blue-600"
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
              {modoEdicion ? "Editar Departamento" : "Nuevo Departamento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="nombreDepartamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: Contabilidad" {...field} />
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
