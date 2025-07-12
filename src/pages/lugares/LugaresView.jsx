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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const FormSchema = z.object({
  nombreLugar: z
  .string()
  .min(2, { message: "Debe tener al menos 2 caracteres" })
  .max(30, { message: "No debe superar los 30 caracteres" })
    .regex(/^[A-Za-z0-9 ]+$/, {
      message: "No se permiten caracteres especiales",
    }),
});

export default function LugaresView() {
  const [lugares, setLugares] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [lugarActual, setLugarActual] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(lugares.length / itemsPerPage);
  const lugaresPaginados = lugares.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reinicia la página si cambia la lista de lugares
  useEffect(() => {
    setCurrentPage(1);
  }, [lugares]);
  // Estado para tamaño de ventana
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detectar si estamos en escritorio según breakpoint Tailwind 'sm' (640px)
  const isDesktop = windowSize.width >= 640;
  // Calcular altura disponible restando altura del header/nav (ajusta 100px según tu layout)
  const availableHeight = isDesktop
    ? windowSize.height - 250
    : undefined;


  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { nombreLugar: "" },
  });

  const cargarLugares = async () => {
    try {
      const res = await api.get("/lugares");
      setLugares(res.data);
    } catch {
      toast.error("Error al cargar lugares",{
        richColors: true,
      });
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
        toast.success("Lugar actualizado",{
          richColors: true,
        });
      } else {
        await api.post("/lugares", data);
        toast.success("Lugar creado",{
          richColors: true,
        });
      }
      cargarLugares();
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar lugar",{
        richColors: true,
      });
    }
  };

  const { formState } = form;

  return (
    <div className="p-2 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex justify-end">
          <Button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs md:text-[13px] sm:text-sm w-auto ml-auto text-white"
          >
            Agregar Lugar
          </Button>
        </CardHeader>

        <CardContent>
          <div
            className={`
              w-full
              overflow-x-auto sm:overflow-x-visible
              ${isDesktop ? "overflow-y-auto" : "overflow-y-visible"}
            `}
            style={isDesktop ? { maxHeight: availableHeight } : {}}
          >
            <table className="w-full min-w-0 sm:min-w-[400px] table-auto text-xs md:text-[13px] sm:text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lugaresPaginados.length > 0 ? (
                  lugaresPaginados.map((lugar) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center p-2">
                      No hay lugares.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination className="mt-4" style={{ minHeight: "48px" }}>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xs sm:text-lg">
              {modoEdicion ? "Editar Lugar" : "Nuevo Lugar"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="nombreLugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">
                      Nombre del Lugar
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Laboratorio B"
                        className="text-xs md:text-[13px] sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs md:text-[13px] sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!formState.isValid}
                  className="bg-blue-600 hover:bg-blue-700 text-xs md:text-[13px] sm:text-sm disabled:opacity-50"
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
