"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";
import { Clock } from "lucide-react";

export default function CheckInDialog({ onRegister }) {
  const [rfid, setRfid] = useState("");
  const [open, setOpen] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (rfid.trim() !== "") {
        verifyAndRegisterAttendance(rfid.trim());
        setRfid("");
      }
    } else {
      setRfid((prev) => prev + e.key);
    }
  };

  const verifyAndRegisterAttendance = async (rfid) => {
    try {
      const response = await axios.post("http://localhost:8002/api/asistencias/registrar", { rfid });
      if (response.status === 200) {
        const { mensaje } = response.data; // Obtener el mensaje del backend
        console.log(response.data);
        toast.success(mensaje); // Mostrar el mensaje específico
        if (onRegister) onRegister(); // Llama a la función para actualizar los datos
      }
    } catch (error) {
      toast.error("Error al registrar asistencia", { description: "No se pudo conectar con el servidor." });
    }
  };

  useEffect(() => {
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [rfid]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Clock className="mr-2 h-4 w-4" />
          Registrar Asistencia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Registrar Asistencia</DialogTitle>
          <DialogDescription>
            Pase su tarjeta RFID para registrar la asistencia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-center text-muted-foreground">
            Esperando lectura de tarjeta...
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}