import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

export default function VerBienes() {
  const [bienes, setBienes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    ? windowSize.height - 100 // ajusta 200px según header + paddings
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

  const bienesFiltrados = bienes.filter((bien) =>
    bien.nombreBien.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [currentPage, setCurrentPage] = useState(1);
 // const itemsPerPage = isDesktop ? 7 : 12;


  const totalPages = Math.ceil(bienesFiltrados.length / itemsPerPage);
  const bienesPaginados = bienesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reinicia la página si cambia el filtro de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchBienes = async () => {
      try {
        const response = await api.get("/bienes-inmuebles");
        setBienes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los bienes:", error);
        toast.error("No se pudieron cargar los bienes inmuebles",{
          richColors: true,
        });
        setLoading(false);
      }
    };

    fetchBienes();
  }, []);

  const toggleEstadoBien = async (id) => {
    try {
      await api.patch(`/bienes-inmuebles/${id}/toggle-status`);
      setBienes(
        bienes.map((b) =>
          b.id === id ? { ...b, status: b.status === 1 ? 0 : 1 } : b
        )
      );
      toast.success("Estado actualizado correctamente",{
        richColors: true,
      });
    } catch (error) {
      console.error("Error al cambiar estado del bien:", error);
      toast.error("No se pudo actualizar el estado del bien.",{
        richColors: true,
      });
    }
  };

  if (loading) {
    return <div className="p-6">Cargando bienes inmuebles...</div>;
  }

  return (
    <div className="p-2 sm:p-6">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full border p-2 rounded text-xs sm:text-sm"
      />
      <div className="rounded-md bordershadow-sm">
        <div
          className="max-h-none overflow-y-visible  sm:overflow-y-auto"
          style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
        >
          <Table className="min-w-full w-full table-auto text-xs md:text-[13px] sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-[13px] sm:text-sm">Nombres</TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm">Categoría</TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm">Ubicación</TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm">Tag RFID</TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm">Estado</TableHead>
                <TableHead className="text-right text-xs md:text-[13px] sm:text-sm">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bienesPaginados.length > 0 ? (
                bienesPaginados.map((bien) => (
                  <TableRow key={bien.id}>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm">
                      {bien.nombreBien}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm">
                      {bien.categoriaNombre || "Sin categoría"}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm">
                      {bien.ubicacionBien}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm">
                      <code>{bien.tagRfidNumero || "No asignado"}</code>
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`status-${bien.id}`}
                          checked={bien.status === 1}
                          onCheckedChange={() => toggleEstadoBien(bien.id)}
                        />
                        <Label
                          htmlFor={`status-${bien.id}`}
                          className={
                            (bien.status === 1
                              ? "text-green-600"
                              : "text-red-600") +
                            " font-medium text-xs md:text-[13px] sm:text-sm"
                          }
                        >
                          {bien.status === 1 ? "Activo" : "Inactivo"}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/bienes/registro/${bien.id}`)}
                        className="h-8 w-8"
                        disabled={bien.status !== 1}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-xs md:text-[13px] sm:text-sm"
                  >
                    No se encontraron bienes que coincidan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
      </div>
    </div>
  );
}
