"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function MonitoreoView() {
  const [ubicacion, setUbicacion] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Cargar ubicación desde localStorage si existe
  useEffect(() => {
    const ubicacionGuardada = localStorage.getItem("ubicacionMonitoreo");
    if (ubicacionGuardada) {
      setUbicacion(ubicacionGuardada);
      setConfirmado(true); // activar modo monitoreo automáticamente
    }
  }, []);

  // Iniciar escaneo RFID cuando esté confirmado
  useEffect(() => {
    if (!confirmado) return;

    let buffer = "";
    let lastKeyTime = 0;

    const handleKeyPress = (e) => {
      const currentTime = new Date().getTime();
      if (currentTime - lastKeyTime > 500) buffer = "";
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length >= 8) {
          const rfid = buffer.trim();
          registrarMonitoreo(rfid);
        }
        buffer = "";
      } else if (e.key.match(/[a-zA-Z0-9]/)) {
        buffer += e.key;
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    setScanning(true);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      setScanning(false);
    };
  }, [confirmado]);

  const registrarMonitoreo = async (rfid) => {
    try {
      await axios.post("http://localhost:8002/api/monitoreos", {
        tag: rfid,
        lugar: ubicacion,
        timestamp: new Date().toISOString(),
      });
      toast.success("Tag registrado", { description: `RFID: ${rfid}` });
    } catch (error) {
      console.error("Error al registrar monitoreo:", error);
      toast.error("Error al registrar tag");
    }
  };

  const iniciarMonitoreo = () => {
    localStorage.setItem("ubicacionMonitoreo", ubicacion); // guardar en localStorage
    setConfirmado(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-white w-full">
      {!confirmado ? (
        <>
          <h2 className="text-2xl font-bold">Configurar monitoreo</h2>
          <Input
            placeholder="Lugar del monitoreo"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
          <Button onClick={iniciarMonitoreo} disabled={!ubicacion} className="text-blue-700">
            Iniciar monitoreo
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Escuchando tarjetas RFID...</h2>
          <div className="text-center text-blue-600 animate-pulse text-lg">
            Monitoreando en: <strong>{ubicacion}</strong>
          </div>
        </>
      )}
    </div>
  );
}
