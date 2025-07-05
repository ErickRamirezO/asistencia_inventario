  "use client";

  import { useEffect, useState } from "react";
  import api from "@/utils/axios";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { useNavigate } from "react-router-dom";

  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "@/components/ui/card";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { toast } from "sonner";
  import { getUserIdFromToken } from "@/pages/auth/auth";


  export default function CambioEncargadoView() {
    const [bienes, setBienes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [bienesSeleccionados, setBienesSeleccionados] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [confirmarCambio, setConfirmarCambio] = useState(false);

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
    ? windowSize.height - 240 // ajusta 200px según header + paddings
    : undefined;


    const navigate = useNavigate();

    useEffect(() => {
      api.get("/bienes-inmuebles").then((res) => setBienes(res.data));
      api.get("/usuarios").then((res) => setUsuarios(res.data));
    }, []);

    const agregarBien = (id) => {
      if (!bienesSeleccionados.includes(id)) {
        setBienesSeleccionados([...bienesSeleccionados, id]);
      }
    };

    const quitarBien = (id) => {
      setBienesSeleccionados((prev) => prev.filter((b) => b !== id));
    };

    const realizarCambio = async () => {
  if (!usuarioSeleccionado || bienesSeleccionados.length === 0) return;
  const usuarioResponsableId = getUserIdFromToken();

  try {
    const res = await api.post("/bienes-inmuebles/cambiar-encargado", {
      bienesIds: bienesSeleccionados,
      nuevoUsuarioId: usuarioSeleccionado,
      usuarioResponsableId,
    });

    const documentoId = res.data?.documentoId || res.data?.id;

    toast.success("Encargado actualizado correctamente");

    setBienesSeleccionados([]);
    setUsuarioSeleccionado(null);
    setConfirmarCambio(false);

    if (documentoId) {
      navigate(`/cambio/historial/${documentoId}`);
    } else {
      const resBienes = await api.get("/bienes-inmuebles");
      setBienes(resBienes.data);
    }

  } catch (err) {
    toast.error("Error al actualizar los encargados");
  }
};


    return (
      <div className="p-6 space-y-4">
 <div className="flex justify-between items-center mb-4">
  <Button
    onClick={() => navigate("/cambio")}
    className="bg-gray-200 text-black hover:bg-gray-200 text-xs px-3 py-1 h-auto"
  >
    Volver a documentos
  </Button>
</div>
<div  style={
            isDesktop
              ? { maxHeight: availableHeight, overflowY: 'auto' }
              : {}
          }
>
        <Card>
          <CardHeader>
            <CardTitle>Selecciona un Bien</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              onChange={(e) => agregarBien(Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value="" disabled selected>
                -- Selecciona un bien --
              </option>
              {bienes
                .filter((b) => !bienesSeleccionados.includes(b.id))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombreBien}
                  </option>
                ))}
            </select>

            {bienesSeleccionados.length > 0 && (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Encargado</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bienesSeleccionados.map((id) => {
                    const bien = bienes.find((b) => b.id === id);
                    return (
                      <TableRow key={id}>
                        <TableCell>{bien?.nombreBien}</TableCell>
                        <TableCell>{bien?.descripcion || "—"}</TableCell>
                        <TableCell>{bien?.encargadoNombre || "Sin encargado"}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            onClick={() => quitarBien(id)}
                          >
                            Quitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Selecciona el Nuevo Encargado</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={usuarioSeleccionado || ""}
              onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value="" disabled>
                -- Selecciona un encargado --
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
        </div>

        <div className="flex justify-end">
          <Button
            disabled={!usuarioSeleccionado || bienesSeleccionados.length === 0}
            onClick={() => setConfirmarCambio(true)}
          >
            Confirmar cambio de encargado
          </Button>
        </div>

        <Dialog open={confirmarCambio} onOpenChange={setConfirmarCambio}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar cambio</DialogTitle>
            </DialogHeader>
            <p>
              ¿Estás seguro que deseas asignar como encargado a
              <strong>
                {" "}
                {
                  usuarios.find((u) => u.id === usuarioSeleccionado)?.nombre ||
                  ""
                }{" "}
                {
                  usuarios.find((u) => u.id === usuarioSeleccionado)?.apellido ||
                  ""
                }
              </strong>{" "}
              para los <strong>{bienesSeleccionados.length}</strong> bienes
              seleccionados?
            </p>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setConfirmarCambio(false)}>
                Cancelar
              </Button>
              <Button onClick={realizarCambio} className="bg-blue-600 text-white">
                Aceptar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
