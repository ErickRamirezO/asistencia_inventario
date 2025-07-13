"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/input";

export default function MonitoreoLista() {
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
  api
    .get("/monitoreos")
    .then((res) => setRegistros(res.data))
    .catch((err) => console.error("Error cargando monitoreos:", err));
}, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filtrarRegistros = () => {
    return registros.filter((r) => {
      const tipo = r.nombreUsuarioAsignado ? "PERSONAL" : "BIEN";
      const nombre = r.nombreUsuarioAsignado || r.nombreBienAsignado || "";
      const fecha = new Date(r.fechaMonitoreo).toLocaleDateString();

      const coincideTipo =
        filtro === "TODOS" ||
        (filtro === "PERSONAL" && tipo === "PERSONAL") ||
        (filtro === "BIEN" && tipo === "BIEN");

      const coincideBusqueda =
        nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        fecha.includes(busqueda);

      return coincideTipo && coincideBusqueda;
    });
  };

  const movimientosPersonal = registros.filter(r => r.nombreUsuarioAsignado).length;
  const movimientosBienes = registros.filter(r => r.nombreBienAsignado).length;
  const totalMovimientos = registros.length;

  const registrosFiltrados = filtrarRegistros();

  return (
    <div className="px-6 py-10 space-y-10">
      <div className="grid grid-cols-2 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1 lg:grid-cols-4 gap-4">

        <Card
          className={clsx("cursor-pointer", filtro === "TODOS" && "ring-2 ring-blue-500")}
          onClick={() => setFiltro("TODOS")}
        >
          <CardHeader>
            <CardTitle>Total Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMovimientos}</p>
          </CardContent>
        </Card>

        <Card
          className={clsx("cursor-pointer", filtro === "BIEN" && "ring-2 ring-green-500")}
          onClick={() => setFiltro("BIEN")}
        >
          <CardHeader>
            <CardTitle>Mov. Bienes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{movimientosBienes}</p>
          </CardContent>
        </Card>

        <Card
          className={clsx("cursor-pointer", filtro === "PERSONAL" && "ring-2 ring-purple-500")}
          onClick={() => setFiltro("PERSONAL")}
        >
          <CardHeader>
            <CardTitle>Mov. Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{movimientosPersonal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hora Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold">
            <Clock className="h-5 w-5" /> {horaActual}
          </CardContent>
        </Card>
      </div>

      <div className="p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Registros de Monitoreo</h2>

        <Input
          placeholder="Buscar por nombre o fecha (ej. 26/05/2025)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:w-1/2 text-xs md:text-[13px] sm:text-sm"
        />

        <div className="overflow-x-auto md:max-h-[230px] overflow-y-auto md:overflow-y-auto max-h-none">


          <Table className="text-xs md:text-[13px] sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrosFiltrados.length > 0 ? (
                registrosFiltrados.map((r, idx) => {
                  const [fechaCompleta, horaCompleta] = r.fechaMonitoreo.split("T");
                  const hora = horaCompleta.split(".")[0]; // quitar milisegundos

                  const tipo = r.nombreUsuarioAsignado ? "PERSONAL" : "BIEN";
                  const nombre = r.nombreUsuarioAsignado || r.nombreBienAsignado || "—";

                  return (
                    <TableRow key={idx}>
                      <TableCell>{r.tag}</TableCell>
                      <TableCell>{tipo}</TableCell>
                      <TableCell>{nombre}</TableCell>
                      <TableCell>{r.lugar}</TableCell>
                      <TableCell>{fechaCompleta}</TableCell>
                      <TableCell>{hora}</TableCell>


                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Sin registros disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
