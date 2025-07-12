"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/utils/axios";
import { getUserIdFromToken } from "@/pages/auth/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // asegúrate de tener esto también

export default function RealizarInventario() {
  const { id: inventarioId } = useParams();
  const [tag, setTag] = useState("");
  const [bien, setBien] = useState(null);
  const usuarioId = getUserIdFromToken(); // Quemado por ahora
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (tag.trim() !== "") {
        api
          .put("/historial-inventarios/actualizar-estado", null, {
            params: {
              tag,
              usuarioId,
              inventarioId,
            },
          })

          .then((res) => {
            setBien(res.data);
            toast.success("Inventario actualizado con tag " + tag, {
              richColors: true,
            });
            setTag("");
          })
          .catch((err) => {
            toast.error(
              "Error: " +
                (err.response?.data?.message || "No se pudo actualizar"),
              {
                richColors: true,
              }
            );
            setTag("");
          });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tag]);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        Regresar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Escanear Tag RFID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            autoFocus
            placeholder="Escanea el tag RFID"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="text-lg"
          />
        </CardContent>
      </Card>

      {bien && (
        <Card className="border-green-600 ring-2 ring-green-500">
          <CardHeader>
            <CardTitle>Bien Inventariado</CardTitle>
          </CardHeader>
          <CardContent className="text-lg">
            <p>
              <strong>Nombre:</strong> {bien.nombreBien}
            </p>
            <p>
              <strong>Descripción:</strong> {bien.descripcionBien}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
