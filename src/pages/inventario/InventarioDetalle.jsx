"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axios";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function InventarioDetalle() {
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [lugarInventario, setLugarInventario] = useState("");
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());
  const [bienEditar, setBienEditar] = useState(null);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get(`/historial-inventarios/inventario/${id}`);
        setHistorial(res.data);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    };

    const cargarLugarInventario = async () => {
      try {
        const res = await api.get(`/inventarios/${id}`);
        setLugarInventario(res.data.lugarInventario);
      } catch (err) {
        console.error("Error al obtener lugar del inventario:", err);
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
      await api.patch(`/bienes-inmuebles/${bienEditar.bienesInmueblesId}/descripcion`, JSON.stringify(nuevaDescripcion), {
        headers: { "Content-Type": "application/json" },
      });

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
    }
  };
  const [searchTerm, setSearchTerm] = useState("");

const historialFiltrado = historial.filter(h =>
  h.nombreBien.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className="p-6 space-y-6">
      
<Button className="bg-gray-200 text-black hover:bg-gray-200 text-xs px-3 py-1 h-auto" variant="outline" onClick={() => navigate(-1)}>
Regresar
</Button>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardHeader><CardTitle>Total Bienes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inventariados</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{inventariados}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Faltantes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{faltantes}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hora Actual</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold">
            <Clock className="h-5 w-5" /> {horaActual}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
  <Input
    placeholder="Buscar bien por nombre..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="max-w-sm"
  />
  <div className="bg-white rounded shadow overflow-x-auto">
   <div className="overflow-y-auto md:max-h-[300px] max-h-none">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Bien</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historialFiltrado.map((h) => (

              <TableRow key={h.id}>
                <TableCell>{h.nombreBien}</TableCell>
                <TableCell>{h.descripcionBien}</TableCell>
                <TableCell>{h.nombreEncargado || "Sin encargado"}</TableCell>
                <TableCell
                  className={clsx({
                    "text-red-600 font-semibold": h.lugar !== lugarInventario,
                  })}
                >
                  {h.lugar || "Sin ubicación"}
                </TableCell>
                <TableCell>{new Date(h.fechaInventario).toLocaleDateString()}</TableCell>
                <TableCell>
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
            <Button onClick={guardarDescripcion} className="bg-blue-600 text-white">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
