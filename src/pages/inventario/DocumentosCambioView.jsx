"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export default function DocumentosCambioView() {
  const [documentos, setDocumentos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(documentos.length / itemsPerPage);
  const documentosPaginados = documentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reinicia la página si cambia la lista de documentos
  useEffect(() => {
    setCurrentPage(1);
  }, [documentos]);
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
    ? windowSize.height - 280 // ajusta 200px según header + paddings
    : undefined;

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

  return (
    <div className="p-2 sm:p-6 space-y-6">
      <Card>
        <CardHeader className="flex justify-end px-4 sm:px-6">
          <Button
            onClick={() => navigate("/cambio-encargado")}
            className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1 h-auto"
          >
            Cambio de Custodio
          </Button>
        </CardHeader>

        <CardContent
          style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
        >
          <div className="md:overflow-y-auto border rounded-md overflow-x-auto">
            <table className="min-w-[600px] w-full text-xs md:text-[13px] sm:text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs md:text-[13px] sm:text-sm">Fecha</th>
                  <th className="p-2 text-left text-xs md:text-[13px] sm:text-sm">Nuevo Custodio</th>
                  <th className="p-2 text-left text-xs md:text-[13px] sm:text-sm">Acción</th>
                </tr>
              </thead>
              <tbody>
                {documentosPaginados.length > 0 ? (
                  documentosPaginados.map((doc) => (
                    <tr key={doc.id} className="border-t">
                      <td className="p-2">
                        {new Date(doc.fechaCambio)
                          .toLocaleString("sv-SE", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(",", "")}
                      </td>
                      <td className="p-2">{doc.nombreUsuarioCompleto}</td>
                      <td className="p-2">
                        <Button
                          onClick={() =>
                            navigate(`/cambio/historial/${doc.id}`)
                          }
                          className="bg-blue-500 text-white hover:bg-blue-600 text-xs md:text-[13px] sm:text-sm"
                        >
                          Ver Historial
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center p-2 text-xs md:text-[13px] sm:text-sm">
                      No hay documentos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination className="mt-4" style={{ minHeight: "48px" }}>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
