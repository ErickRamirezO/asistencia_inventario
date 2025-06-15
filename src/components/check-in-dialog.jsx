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

export default function CheckInDialog({ onRegister, onTableUpdate }) {
  const [rfid, setRfid] = useState("");
  const [open, setOpen] = useState(false);

  // Cargar los conteos de tarjetas desde localStorage
  const loadRfidCounts = () => {
    const storedCounts = localStorage.getItem("rfidCounts");
    return storedCounts ? JSON.parse(storedCounts) : {};
  };

  const [rfidCounts, setRfidCounts] = useState(loadRfidCounts);

  // Guardar los conteos de tarjetas en localStorage
  const saveRfidCounts = (counts) => {
    localStorage.setItem("rfidCounts", JSON.stringify(counts));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && rfid.trim() !== "") {
      verifyAndRegisterAttendance(rfid.trim());
      setRfid(""); // Limpia el campo para la siguiente tarjeta
    } else if (e.key !== "Enter") {
      setRfid((prev) => prev + e.key);
    }
  };

  const verifyAndRegisterAttendance = async (rfid) => {
    try {
      const response = await axios.post("http://localhost:8002/api/asistencias/registrar", { rfid });
      if (response.status === 200) {
        const { mensaje } = response.data;
        toast.success("Tarjeta leída correctamente");
        toast.success(mensaje);

        if (onRegister) onRegister(); // Update summary cards
        if (onTableUpdate) onTableUpdate(); // **Crucial: Update the detailed table data**
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.mensaje,{
          richColors: true,
        });
      } else {
        toast.error("Error al registrar asistencia", { description: "No se pudo conectar con el servidor.", 
          richColors: true
        });
      }
    } finally {
      setRfid("");
    }
  };

  useEffect(() => {
    if (open) {
      window.addEventListener("keypress", handleKeyPress);
    } else {
      window.removeEventListener("keypress", handleKeyPress);
    }
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [open, rfid]);

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