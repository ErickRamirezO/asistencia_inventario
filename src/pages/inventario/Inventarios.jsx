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
import { getUserIdFromToken } from "@/pages/auth/auth";

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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";
const FormSchema = z.object({
  nombreInventario: z.string().min(2, {
    message: "Debe tener al menos 2 caracteres",
  }),
  lugarInventario: z.string().min(1, {
    message: "Seleccione un lugar",
  }),
});

export default function Inventarios() {
  const { user } = useUser();
  const [inventarios, setInventarios] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [inventarioActual, setInventarioActual] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reinicia la página si cambia la lista de inventarios
  useEffect(() => {
    setCurrentPage(1);
  }, [inventarios]);
  const navigate = useNavigate();
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
  const isDesktop = windowSize.width >= 600; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 230 // ajusta 200px según header + paddings
    : undefined;

  const itemsPerPage = (() => {
    if (!isDesktop) return 3;
    if (availableHeight < 350) return 3;
    if (availableHeight < 400) return 4;
    if (availableHeight < 450) return 5;
    if (availableHeight < 550) return 6;
    if (availableHeight < 600) return 8;

    return 8;
  })();
  const totalPages = Math.ceil(inventarios.length / itemsPerPage);
  const inventariosPaginados = isDesktop
    ? inventarios.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : inventarios;

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
      toast.error("Error al cargar inventarios", {
        richColors: true,
      });
      await crearLog(`ERROR: Error al cargar inventarios`, user.userId);
    }
  };

  const cargarLugares = async () => {
    try {
      const res = await api.get("/lugares");
      setLugares(res.data);
    } catch {
      toast.error("Error al cargar lugares", {
        richColors: true,
      });
      await crearLog(`ERROR: Error al cargar lugares`, user.userId);
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
    const userId = getUserIdFromToken();

    const payload = {
      ...data,
      usuariosId: userId,
    };

    try {
      if (modoEdicion) {
        await api.put(`/inventarios/${inventarioActual.id}`, payload);
        toast.success("Inventario actualizado", {
          richColors: true,
        });
        crearLog(
          `INFO: Inventario actualizado con ID ${inventarioActual.id}`,
          user.userId
        );
      } else {
        await api.post("/inventarios", payload);
        toast.success("Inventario creado", {
          richColors: true,
        });
        crearLog(
          `INFO: Inventario creado con nombre ${data.nombreInventario}`,
          user.userId
        );
      }

      cargarInventarios();
      setFormVisible(false);
    } catch {
      toast.error("Error al guardar inventario", {
        richColors: true,
      });
      crearLog(`ERROR: Error al guardar inventario`, user.userId);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Dialog open={formVisible} onOpenChange={setFormVisible}>
        <DialogContent className="sm:max-w-lg z-[60]">
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar Inventario" : "Nuevo Inventario"}
            </DialogTitle>
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
                      <Input
                        placeholder="Ejemplo: Inventario Q2 2025"
                        {...field}
                      />
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
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between"
                          >
                            {field.value
                              ? lugares.find(
                                  (l) => l.nombreLugar === field.value
                                )?.nombreLugar
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
                                    form.setValue(
                                      "lugarInventario",
                                      lugar.nombreLugar
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === lugar.nombreLugar
                                        ? "opacity-100"
                                        : "opacity-0"
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
        <CardHeader className="flex justify-end items-center">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1 h-8 sm:h-auto"
            onClick={() => abrirFormulario()}
          >
            Agregar Inventario
          </Button>
        </CardHeader>

        <CardContent
          style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
        >
          <div className="overflow-x-auto max-w-full">
            <div className=" md:overflow-y-auto">
              <table className="w-full border table-auto text-xs md:text-[13px] sm:text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left hidden">ID</th>
                    <th className="p-2 text-left text-xs md:text-[13px] sm:text-sm">
                      Nombre
                    </th>
                    <th className="p-2 text-right text-xs md:text-[13px] sm:text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventariosPaginados.length > 0 ? (
                    inventariosPaginados.map((inv) => (
                      <tr key={inv.id} className="border-t">
                        <td className="hidden">{inv.id}</td>
                        <td className="p-2 text-xs md:text-[13px] sm:text-sm">
                          {inv.nombreInventario}
                        </td>
                        <td className="p-2 text-right flex gap-2 justify-end">
                          <Button
                            size="icon"
                            className="bg-yellow-400 hover:bg-yellow-500 text-black dark:text-white text-xs md:text-[13px] sm:text-sm"
                            onClick={() => abrirFormulario(inv)}
                          >
                            <Pencil className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() =>
                              navigate(`/inventarios/${inv.id}/ver`)
                            }
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              navigate(`/inventarios/${inv.id}/realizar`)
                            }
                          >
                            <ScanLine className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center p-2 text-xs md:text-[13px] sm:text-sm"
                      >
                        No hay inventarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {isDesktop && (
                <Pagination
                  className="mt-4 text-xs md:text-[13px] sm:text-sm"
                  style={{ minHeight: "48px" }}
                >
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
