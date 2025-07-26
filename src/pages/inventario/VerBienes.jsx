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
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";
export default function VerBienes() {
  const { user } = useUser();
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
    ? windowSize.height - 140 // ajusta 200px según header + paddings
    : undefined;
  const itemsPerPage = (() => {
    if (!isDesktop) return 3;
    if (availableHeight < 350) return 3;
    if (availableHeight < 400) return 4;
    if (availableHeight < 450) return 5;
    if (availableHeight < 500) return 6;
    if (availableHeight < 570) return 7;
    if (availableHeight < 620) return 8;

    return 8;
  })();

  const bienesFiltrados = bienes.filter((bien) =>
    bien.nombreBien.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = isDesktop ? 7 : 12;

  const totalPages = Math.ceil(bienesFiltrados.length / itemsPerPage);
  const bienesPaginados = isDesktop
    ? bienesFiltrados.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : bienesFiltrados; // En móvil muestra todos los bienes

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
        toast.error("No se pudieron cargar los bienes inmuebles", {
          richColors: true,
        });
        await crearLog(`ERROR: Error al cargar bienes`, user.userId);
        setLoading(false);
      }
    };

    fetchBienes();
  }, [user.userId]);

  const toggleEstadoBien = async (id) => {
    try {
      await api.patch(`/bienes-inmuebles/${id}/toggle-status`);
      setBienes(
        bienes.map((b) =>
          b.id === id ? { ...b, status: b.status === 1 ? 0 : 1 } : b
        )
      );
      toast.success("Estado actualizado correctamente", {
        richColors: true,
      });
      const bienActualizado = bienes.find((b) => b.id === id);
      const nuevoEstado = bienActualizado.status === 1 ? "desactivado" : "activado";
      await crearLog(
        `INFO: Estado de bien actualizado: ${bienActualizado.nombreBien} - ${nuevoEstado}`,
        user.userId
      );
    } catch (error) {
      console.error("Error al cambiar estado del bien:", error);
      toast.error("No se pudo actualizar el estado del bien.", {
        richColors: true,
      });
      const bienActualizado = bienes.find((b) => b.id === id);
      const nuevoEstado = bienActualizado?.status === 1 ? "desactivado" : "activado";
      await crearLog(
        `ERROR: Error al actualizar estado del bien: ${bienActualizado?.nombreBien || "Desconocido"} - Intento de ${nuevoEstado}`,
        user.userId
      );
    }
  };

  if (loading) {
    return <div className="p-6">Cargando bienes inmuebles...</div>;
  }

  return (
    <div className="p-2 sm:p-6">
      <div className="flex justify-end mb-4">
        <Button
          variant="blue"
          onClick={() => navigate("/bienes/registro")}
          className="text-xs md:text-[13px] sm:text-sm"
        >
          Agregar Bien
        </Button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full border p-2 rounded text-xs sm:text-sm"
      />
      <div className="rounded-md border shadow-sm">
        <div
          className="max-h-none overflow-y-visible  sm:overflow-y-auto"
          style={
            isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
          }
        >
          <Table className="table-fixed w-full text-xs md:text-[13px] sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                  Nombres
                </TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                  Categoría
                </TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                  Ubicación
                </TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm w-[20%]">
                  Tag RFID
                </TableHead>
                <TableHead className="text-xs md:text-[13px] sm:text-sm w-[15%]">
                  Estado
                </TableHead>
                <TableHead className="text-right text-xs md:text-[13px] sm:text-sm w-[10%]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bienesPaginados.length > 0 ? (
                bienesPaginados.map((bien) => (
                  <TableRow key={bien.id}>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {bien.nombreBien}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {bien.categoriaNombre || "Sin categoría"}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[15%] truncate">
                      {bien.ubicacionBien}
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[25%] truncate">
                      <code>{bien.tagRfidNumero || "No asignado"}</code>
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] sm:text-sm w-[10%] truncate">
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
                    <TableCell className="text-right w-[5%]">
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
      </div>
    </div>
  );
}