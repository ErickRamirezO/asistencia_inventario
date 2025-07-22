"use client";
import { useEffect, useState, useMemo } from "react";

import api from "@/utils/axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
  const [filtroGeneral, setFiltroGeneral] = useState("");

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
    const isDesktop = windowSize.width >= 768; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 150 // ajusta 200px según header + paddings
    : undefined;

  useEffect(() => {
    cargarDocumentos();
  }, []);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const itemsPerPage = useMemo(() => {
  if (!isDesktop) return 3;
  if (availableHeight < 350) return 3;
  if (availableHeight < 450) return 4;
  if (availableHeight < 500) return 5;
  if (availableHeight < 550) return 6;
    if (availableHeight < 600) return 7;
  if (availableHeight < 700) return 8;
  return 8;
}, [availableHeight, isDesktop]);

  const [currentPage, setCurrentPage] = useState(1);
const documentosFiltrados = documentos.filter((doc) => {
  const texto = filtroGeneral.toLowerCase();
  const nombreCoincide = doc.nombreUsuarioCompleto.toLowerCase().includes(texto);
  const fechaFormateada = doc.fechaCambio.split("T")[0];
 // YYYY-MM-DD
  const fechaCoincide = fechaFormateada.includes(texto);
  return nombreCoincide || fechaCoincide;
});
  const totalPages = Math.ceil(documentosFiltrados.length / itemsPerPage);
const documentosPaginados = isDesktop
  ? documentosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  : documentosFiltrados;



  // Reinicia la página si cambia la lista de documentos
 useEffect(() => {
  setCurrentPage(1);
}, [documentos, itemsPerPage]);

  const navigate = useNavigate();
  
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      <Card className="border-transparent shadow-none rounded-none pt-0">
        <CardHeader className="flex justify-end px-4 sm:px-6">
          <Button
           variant="blue"
            onClick={() => navigate("/cambio-encargado")}
            className="text-xs md:text-[13px] sm:text-sm "
          >
            Cambio de Custodio
          </Button>
        </CardHeader>

        <CardContent
          style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
        >
          <input
  type="text"
  placeholder="Buscar por nombre o fecha (YYYY-MM-DD)..."
  value={filtroGeneral}
  onChange={(e) => setFiltroGeneral(e.target.value)}
  className="mb-4 w-full border p-2 rounded text-xs sm:text-sm"
/>

          <div className="md:overflow-y-auto border rounded-md overflow-x-auto">
            <table className="table-fixed w-full text-xs md:text-[13px] sm:text-sm">
  <thead>
    <tr>
      <th className="p-2 text-center w-[30%]">Fecha</th>
      <th className="p-2 text-center w-[40%]">Nuevo Custodio</th>
      <th className="p-2 text-center w-[30%]">Acción</th>
    </tr>
  </thead>
  <tbody>
    {documentosPaginados.length > 0 ? (
      documentosPaginados.map((doc) => (
        <tr key={doc.id} className="border-t">
          <td className="p-2 truncate text-center">{new Date(doc.fechaCambio).toLocaleString("sv-SE", {
              year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
            }).replace(",", "")}
          </td>
          <td className="p-2 truncate text-center">{doc.nombreUsuarioCompleto}</td>
          <td className="p-2 truncate text-center">
            <Button
              onClick={() => navigate(`/cambio/historial/${doc.id}`)}
              className="bg-blue-500 text-white hover:bg-blue-600 text-xs md:text-[13px] sm:text-sm"
            >
              Ver Historial
            </Button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={3} className="text-center p-2">
          No hay documentos.
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
)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
