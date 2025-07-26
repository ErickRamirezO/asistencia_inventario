"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axios";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Pencil } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";

export default function InventarioDetalle() {
  const { user } = useUser();
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [lugarInventario, setLugarInventario] = useState("");
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());
  const [bienEditar, setBienEditar] = useState(null);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
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
  const isDesktop = windowSize.width >= 768; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 150 // ajusta 200px según header + paddings
    : undefined;

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get(`/historial-inventarios/inventario/${id}`);
        setHistorial(res.data);
      } catch (err) {
        console.error("Error al cargar historial:", err);
        await crearLog(
          `ERROR: Error al cargar historial con ID ${id}`,
          user.userId
        );
      }
    };

    const cargarLugarInventario = async () => {
      try {
        const res = await api.get(`/inventarios/${id}`);
        setLugarInventario(res.data.lugarInventario);
      } catch (err) {
        console.error("Error al obtener lugar del inventario:", err);
        await crearLog(
          `ERROR: Error al obtener lugar del inventario con ID ${id}`,
          user.userId
        );
      }
    };

    cargarHistorial();
    cargarLugarInventario();
  }, [id]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const total = historial.length;
  const inventariados = historial.filter((h) => h.status === 1).length;
  const faltantes = total - inventariados;

  const guardarDescripcion = async () => {
    try {
      await api.patch(
        `/bienes-inmuebles/${bienEditar.bienesInmueblesId}/descripcion`,
        JSON.stringify(nuevaDescripcion),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      await crearLog(
        `INFO: Descripción actualizada para bien ${bienEditar.bienesInmueblesId}`,
        user.userId
      );
      setHistorial((prev) =>
        prev.map((h) =>
          h.bienesInmueblesId === bienEditar.bienesInmueblesId
            ? { ...h, descripcionBien: nuevaDescripcion }
            : h
        )
      );
      setBienEditar(null);
      setNuevaDescripcion("");
    } catch (err) {
      console.error("Error actualizando descripción:", err);
      await crearLog(
        `ERROR: Error al actualizar descripción para bien ${bienEditar.bienesInmueblesId}`,
        user.userId
      );
    }
  };
  const [searchTerm, setSearchTerm] = useState("");

  const historialFiltrado = historial.filter((h) =>
    h.nombreBien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="p-6 space-y-6 "
      style={isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}}
    >
      <Button
        className="bg-gray-200 hover:bg-gray-200 text-xs md:text-[13px] sm:text-sm px-3 py-1 h-auto"
        variant="outline"
        onClick={() => navigate(-1)}
      >
        Regresar
      </Button>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs md:text-[13px] sm:text-sm">
              Total Bienes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs md:text-[13px] sm:text-sm">
              Inventariados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{inventariados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs md:text-[13px] sm:text-sm">
              Faltantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{faltantes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs md:text-[13px] sm:text-sm">
              Hora Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5" /> {horaActual}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        <Input
          placeholder="Buscar bien por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-xs md:text-[13px] sm:text-sm"
        />
        <div className="rounded shadow overflow-x-auto">
          <div className="overflow-y-auto  max-h-none">
            <Table className="table-fixed w-full text-xs md:text-[13px] sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Nombre Bien
                  </TableHead>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Descripción
                  </TableHead>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Encargado
                  </TableHead>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Lugar
                  </TableHead>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Fecha
                  </TableHead>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialFiltrado.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {h.nombreBien}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {h.descripcionBien}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {h.nombreEncargado || "Sin encargado"}
                    </TableCell>
                    <TableCell
                      className={clsx(
                        "text-xs md:text-[13px] sm:text-sm w-[15%] truncate",
                        {
                          "text-red-600 font-semibold":
                            h.lugar !== lugarInventario,
                        }
                      )}
                    >
                      {h.lugar || "Sin ubicación"}
                    </TableCell>

                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {new Date(h.fechaInventario).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      <span
                        className={clsx("font-semibold", {
                          "text-green-600": h.status === 1,
                          "text-red-500": h.status === 0,
                        })}
                      >
                        {h.status === 1 ? "Inventariado" : "Pendiente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {h.status === 1 && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setBienEditar(h);
                            setNuevaDescripcion(h.descripcionBien);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={!!bienEditar} onOpenChange={() => setBienEditar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar descripción</DialogTitle>
          </DialogHeader>
          <Input
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            placeholder="Nueva descripción"
          />
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={guardarDescripcion}
              className="bg-blue-600 text-white"
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
