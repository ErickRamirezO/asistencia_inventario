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
    };
  }, [confirmado]);

  const registrarMonitoreo = async (rfid) => {
    try {
      await axios.post("http://localhost:8002/api/monitoreo", {
        tag: rfid,
        ubicacion: ubicacion,
        timestamp: new Date().toISOString(),
      });
      toast.success("Tag registrado", { description: `RFID: ${rfid}` });
    } catch (error) {
      console.error("Error al registrar monitoreo:", error);
      toast.error("Error al registrar tag");
    }
  };

  if (!confirmado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold ">Configurar monitoreo</h2>
        <Input
          placeholder="Lugar del monitoreo"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
        />
        <Button onClick={() => setConfirmado(true)} disabled={!ubicacion} className="text-blue-700">
          Iniciar monitoreo
        </Button>
      </div>
    );
  }

  return (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-white overflow-x-hidden w-full">
    <h2 className="text-3xl font-bold mb-2 text-center">Escuchando tarjetas RFID...</h2>
    <div className="text-center text-blue-600 animate-pulse text-lg">
      Monitoreando en: <strong>{ubicacion}</strong>
    </div>
    <Button
      variant="destructive"
      onClick={() => {
        setConfirmado(false);
        setUbicacion("");
        setScanning(false);
      }}
    >
      Salir del modo monitoreo
    </Button>
  </div>
);

}
