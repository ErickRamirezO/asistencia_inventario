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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

// Validación Zod: min 2, max 30, solo letras, dígitos y espacios
const FormSchema = z.object({
  nombreCategoria: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres" })
    .max(30, { message: "No debe superar los 30 caracteres" })
    .regex(/^[A-Za-z0-9 ]+$/, {
      message: "No se permiten caracteres especiales",
    }),
});

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState(null);

  // Validación en tiempo real
  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { nombreCategoria: "" },
  });

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/categorias/stock");
      setCategorias(res.data);
    } catch {
      toast.error("Error al cargar categorías");
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirModal = (categoria = null) => {
    setModoEdicion(!!categoria);
    setCategoriaActual(categoria);
    form.reset({ nombreCategoria: categoria?.nombreCategoria || "" });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modoEdicion) {
        await api.put(`/categorias/${categoriaActual.id}`, data);
        toast.success("Categoría actualizada");
      } else {
        await api.post("/categorias", data);
        toast.success("Categoría creada");
      }
      cargarCategorias();
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar categoría");
    }
  };

  return (
    <div className="p-2 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex justify-end">
          <Button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm"
          >
            Agregar Categoría
          </Button>
        </CardHeader>

        <CardContent>
          {/*
            Contenedor con:
             - overflow-x-hidden en móvil, overflow-x-auto en ≥ sm
             - sin scroll vertical en móvil, scroll vertical en ≥ sm
             - altura máxima de 400px en ≥ sm
          */}
          <div
            className="
              w-full
              overflow-x-hidden sm:overflow-x-auto
              overflow-y-visible sm:overflow-y-auto
              sm:max-h-[400px]
            "
          >
            <table className="w-full min-w-0 sm:min-w-[500px] text-xs sm:text-sm table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 hidden">ID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Stock</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className="border-t">
                    <td className="p-2 hidden">{categoria.id}</td>
                    <td className="p-2 break-words whitespace-normal">
                      {categoria.nombreCategoria}
                    </td>
                    <td className="p-2">{categoria.cantidad ?? 0}</td>
                    <td className="p-2 text-right">
                      <Button
                        size="icon"
                        onClick={() => abrirModal(categoria)}
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
            <DialogTitle className="text-xs sm:text-lg">
              {modoEdicion ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="nombreCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">
                      Nombre de Categoría
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Tecnología"
                        className="text-xs sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm text-white"
                  disabled={!form.formState.isValid}
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
