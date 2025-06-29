"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function DocumentosCambioView() {
  const [documentos, setDocumentos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    try {
      const res = await api.get("/bienes-inmuebles/documentos-cambio");
      setDocumentos(res.data);
    } catch {
      toast.error("Error al cargar los documentos de cambio");
    }
  };

  const verHistorial = async (documentoId) => {
    try {
      const res = await api.get(`/bienes-inmuebles/documento/${documentoId}/historial`);
      setHistorial(res.data);
      setDocumentoSeleccionado(documentoId);
    } catch {
      toast.error("Error al cargar el historial del documento");
    }
  };

  return (
    <div className="p-2 sm:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-xl text-center sm:text-left w-full">Documentos de Cambio de Custodio</CardTitle>
          <Button
            onClick={() => navigate("/cambio-encargado")}
            className="bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            Hacer Cambio de Custodio
          </Button>
        </CardHeader>

        <CardContent>
          <div className="max-h-[450px] overflow-x-auto border rounded-md">
            <table className="min-w-[600px] w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Nuevo Custodio</th>
                  <th className="p-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="p-2">{doc.id}</td>
                    <td className="p-2">{doc.fechaCambio}</td>
                    <td className="p-2">{doc.nombreUsuarioCompleto}</td>
                    <td className="p-2">
                      <Button
                        onClick={() => navigate(`/cambio/historial/${doc.id}`)}
                        className="bg-blue-500 text-white hover:bg-blue-600 text-xs sm:text-sm"
                      >
                        Ver Historial
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
