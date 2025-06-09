"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import { Pencil, Eye } from "lucide-react";


const navigate = useNavigate();

const FormSchema = z.object({
  nombreInventario: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
});

export default function Inventarios() {
  const [inventarios, setInventarios] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [inventarioActual, setInventarioActual] = useState(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { nombreInventario: "" },
  });

  const cargarInventarios = async () => {
    try {
      const res = await axios.get("http://localhost:8002/api/inventarios");
      setInventarios(res.data);
    } catch (err) {
      toast.error("Error al cargar inventarios");
    }
  };

  useEffect(() => {
    cargarInventarios();
  }, []);

  const abrirModal = (inventario = null) => {
    setModoEdicion(!!inventario);
    setInventarioActual(inventario);
    form.reset({ nombreInventario: inventario?.nombreInventario || "" });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modoEdicion) {
        await axios.put(`http://localhost:8002/api/inventarios/${inventarioActual.id}`, data);
        toast.success("Inventario actualizado");
      } else {
        await axios.post("http://localhost:8002/api/inventarios", data);
        toast.success("Inventario creado");
      }
      cargarInventarios();
      setDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar inventario");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold">Inventarios</CardTitle>
          <Button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-black hover:bg-blue-700 font-semibold"
          >
            Agregar Inventario
          </Button>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 hidden">ID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventarios.map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="p-2 hidden">{inv.id}</td>
                    <td className="p-2">{inv.nombreInventario}</td>
                    <td className="p-2 text-right flex justify-end gap-2">
                      <Button
                        size="icon"
                        onClick={() => abrirModal(inv)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                     <Button
  size="icon"
  className="bg-green-500 hover:bg-green-600"
  onClick={() => navigate(`/bienes/inventario/${inv.id}/bienes`)} // o la ruta que uses
>
  <Eye className="w-4 h-4" />
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
            <DialogTitle>{modoEdicion ? "Editar Inventario" : "Nuevo Inventario"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
