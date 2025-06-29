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
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

export default function VerBienes() {
  const [bienes, setBienes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBienes = async () => {
      try {
        const response = await api.get("/bienes-inmuebles");
        setBienes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los bienes:", error);
        toast.error("No se pudieron cargar los bienes inmuebles");
        setLoading(false);
      }
    };

    fetchBienes();
  }, []);


  const toggleEstadoBien = async (id) => {
  try {
    await api.patch(`/bienes-inmuebles/${id}/toggle-status`);
    setBienes(bienes.map(b => 
      b.id === id ? { ...b, status: b.status === 1 ? 0 : 1 } : b
    ));
    toast.success("Estado actualizado correctamente");
  } catch (error) {
    console.error("Error al cambiar estado del bien:", error);
    toast.error("No se pudo actualizar el estado del bien.");
  }
};


  const bienesFiltrados = bienes.filter((bien) =>
    bien.nombreBien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Cargando bienes inmuebles...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">Bienes Inmuebles Registrados</h1>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full border p-2 rounded"
      />
      <div className="rounded-md border overflow-x-auto max-w-full">
  <div className="max-h-[400px] overflow-y-auto">
    <Table className="min-w-[500px] w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Tag RFID</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bienesFiltrados.length > 0 ? (
              bienesFiltrados.map((bien) => (
                <TableRow key={bien.id}>
                  <TableCell>{bien.nombreBien}</TableCell>
                  <TableCell>{bien.categoriaNombre || "Sin categoría"}</TableCell>
                  <TableCell>{bien.ubicacionBien}</TableCell>
                  <TableCell>
                    <code>{bien.tagRfidNumero || "No asignado"}</code>
                  </TableCell>
                  <TableCell>
  <div className="flex items-center space-x-2">
    <Switch
      id={`status-${bien.id}`}
      checked={bien.status === 1}
      onCheckedChange={() => toggleEstadoBien(bien.id)}
    />
    <Label
      htmlFor={`status-${bien.id}`}
      className={bien.status === 1 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
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
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No se encontraron bienes que coincidan.
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
