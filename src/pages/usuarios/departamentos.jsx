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

// 1) Esquema Zod con .max(30) y regex para prohibir especiales
const FormSchema = z.object({
  nombreDepartamento: z
    .string()
    .min(2, { message: "Debe tener al menos 2 caracteres" })
    .max(30, { message: "No debe superar los 30 caracteres" })
    .regex(/^[\p{L}\p{N} ]+$/u, {
  message: "Solo se permiten letras, números y espacios",
})

});

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [departamentoActual, setDepartamentoActual] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

   // 👇 Medir tamaño de pantalla
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowSize.width >= 768;
  const availableHeight = isDesktop ? windowSize.height - 230 : undefined;

  // 👇 Igual que VerBienes: cálculo dinámico
  const itemsPerPage = (() => {
    if (!isDesktop) return 3;
    if (availableHeight < 350) return 3;
    if (availableHeight < 400) return 4;
    if (availableHeight < 450) return 5;
    if (availableHeight < 550) return 6;
    if (availableHeight < 600) return 8;
    return 8;
  })();



  const totalPages = Math.ceil(departamentos.length / itemsPerPage);
const departamentosPaginados = isDesktop
  ? departamentos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  : departamentos;


  // Reinicia la página si cambia la lista de departamentos
  useEffect(() => {
    setCurrentPage(1);
  }, [departamentos]);

  // 2) Validación en cada cambio
  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { nombreDepartamento: "" },
  });

  const cargarDepartamentos = async () => {
    try {
      const res = await api.get("/departamentos");
      setDepartamentos(res.data);
    } catch {
      toast.error("Error al cargar departamentos", {
        richColors: true,
      });
    }
  };

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const abrirModal = (departamento = null) => {
    setModoEdicion(!!departamento);
    setDepartamentoActual(departamento);
    form.reset({
      nombreDepartamento: departamento?.nombreDepartamento || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modoEdicion) {
        await api.put(`/departamentos/${departamentoActual.id}`, data);
        toast.success("Departamento actualizado", {
          richColors: true,
        });
      } else {
        await api.post("/departamentos", data);
        toast.success("Departamento creado", {
          richColors: true,
        });
      }
      cargarDepartamentos();
      setDialogOpen(false);
    } catch {
      toast.error("Error al guardar departamento", {
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
            Agregar Departamento
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
            style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
          >
            <table className="w-full min-w-0 sm:min-w-[400px] text-xs md:text-[13px] sm:text-sm table-auto">
              <thead>
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {departamentosPaginados.length > 0 ? (
                  departamentosPaginados.map((dep) => (
                    <tr key={dep.id} className="border-t">
                      <td className="p-2 break-words whitespace-normal">
                        {dep.nombreDepartamento}
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          size="icon"
                          onClick={() => abrirModal(dep)}
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center p-2">
                      No hay departamentos.
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
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">
                      Nombre del Departamento
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ejemplo: Contabilidad"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-[13px] sm:text-sm"
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
