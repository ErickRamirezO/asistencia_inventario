"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";

export default function MonitoreoLista() {
  const [registros, setRegistros] = useState([]);
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());

  // Obtener todos los registros
  useEffect(() => {
    axios.get("http://localhost:8002/api/monitoreos")
      .then(res => setRegistros(res.data))
      .catch(err => console.error("Error cargando monitoreos:", err));
  }, []);

  // Actualizar hora actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Contadores por tipo
  const movimientosPersonal = registros.filter(r => r.tipo === "PERSONAL").length;
  const movimientosBienes = registros.filter(r => r.tipo === "BIEN").length;
  const totalMovimientos = registros.length;

  return (
    <div className="px-6 py-10 space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mov. Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{movimientosPersonal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mov. Bienes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{movimientosBienes}</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Total Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMovimientos}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Registros de Monitoreo</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {registros.length > 0 ? (
    registros.map((r, idx) => {
      const fecha = new Date(r.fechaMonitoreo); // 🔧 Corrección aquí
      return (
        <TableRow key={idx}>
          <TableCell>{r.tag}</TableCell>
          <TableCell>{r.tipo || (r.nombreUsuarioAsignado ? "PERSONAL" : "BIEN")}</TableCell>
          <TableCell>{r.lugar}</TableCell>
          <TableCell>{fecha.toLocaleDateString()}</TableCell>
          <TableCell>{fecha.toLocaleTimeString()}</TableCell>
        </TableRow>
      );
    })
  ) : (
    <TableRow>
      <TableCell colSpan={5} className="text-center text-gray-500">
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
