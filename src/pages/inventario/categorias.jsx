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
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(categorias.length / itemsPerPage);
  
  // Reinicia la página si cambia la lista de categorías
  useEffect(() => {
    setCurrentPage(1);
  }, [categorias]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowSize.width >= 768; // md: 768px breakpoint
  const availableHeight = isDesktop
  ? windowSize.height - 280 // ajusta 200px según header + paddings
  : undefined;
  const categoriasPaginadas = isDesktop
    ? categorias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : categorias; // En móvil muestra todas las categorías
  
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
      toast.error("Error al cargar categorías", {
        richColors: true,
      });
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
        toast.success("Categoría actualizada", {
          richColors: true,
        });
      } else {
        await api.post("/categorias", data);
        toast.success("Categoría creada", {
          richColors: true,
        });
      }
      cargarCategorias();
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar categoría", {
        richColors: true,
      });
    }
  };

  return (
    <div className="p-2 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex justify-end">
          <Button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-[13px] sm:text-sm"
          >
            Agregar Categoría
          </Button>
        </CardHeader>

        <CardContent
          style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
        >
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
            <table className="w-full min-w-0 sm:min-w-[500px] text-xs md:text-[13px] sm:text-sm table-auto">
              <thead>
                <tr>
                  <th className="text-left p-2 hidden">ID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Stock</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasPaginadas.length > 0 ? (
                  categoriasPaginadas.map((categoria) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-2">
                      No hay categorías.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {isDesktop && (
              <Pagination className="mt-4" style={{ minHeight: "48px" }}>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
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
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">
                      Nombre de Categoría
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Tecnología"
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
                  className="bg-blue-600 hover:bg-blue-700 text-xs md:text-[13px] sm:text-sm text-white"
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
