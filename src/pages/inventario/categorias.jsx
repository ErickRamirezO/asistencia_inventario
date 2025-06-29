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
    nombreCategoria: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
  });

  export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [categoriaActual, setCategoriaActual] = useState(null);

    const form = useForm({
      resolver: zodResolver(FormSchema),
      defaultValues: { nombreCategoria: "" },
    });

    const cargarCategorias = async () => {
      try {
        const res = await api.get("/categorias/stock");
        setCategorias(res.data); // Espera { id, nombreCategoria, cantidad }
      } catch (err) {
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
      } catch (error) {
        toast.error("Error al guardar categoría");
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            
            <Button
              onClick={() => abrirModal()}
              className="bg-blue-600 text-white  hover:bg-blue-700 font-semibold px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"

            >
              Agregar Categoría
            </Button>
          </CardHeader>

          <CardContent>
  <div className="rounded-md border max-h-110 overflow-y-auto">
    <table className="w-full text-sm table-auto">

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
                      <td className="p-2">{categoria.nombreCategoria}</td>
                      <td className="p-2">{categoria.cantidad ?? 0}</td>
                      <td className="p-2 text-right">
                        <Button
                          size="icon"
                          onClick={() => abrirModal(categoria)}
                          className="bg-blue-300 text-black hover:bg-blue-600"
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
              <DialogTitle>{modoEdicion ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="nombreCategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Categoría</FormLabel>
                      <FormControl>
                        <Input placeholder="Ejemplo: Tecnología" {...field} />
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
