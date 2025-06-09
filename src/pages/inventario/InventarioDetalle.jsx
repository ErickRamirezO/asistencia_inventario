"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";
import clsx from "clsx";

export default function InventarioDetalle() {
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
  api
    .get(`/historial-inventarios/inventario/${id}`)
    .then((res) => setHistorial(res.data))
    .catch((err) => console.error("Error al cargar historial:", err));
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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Detalle de Inventario #{id}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="bg-white rounded shadow mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Bien</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historial.map((h) => (
              <TableRow key={h.id}>
                <TableCell>{h.nombreBien}</TableCell>
                <TableCell>{h.descripcionBien}</TableCell>
                <TableCell>{`${h.nombreUsuario} ${h.apellidoUsuario}`}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
