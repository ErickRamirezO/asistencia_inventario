"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/axios";
import { cn } from "@/lib/utils";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";
export default function MonitoreoView() {
  const { user } = useUser();
  const [lugares, setLugares] = useState([]);
  const [ubicacion, setUbicacion] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const cargarLugares = async () => {
      try {
        const res = await api.get("/lugares");
        const activos = res.data.filter((l) => l.activo);
        setLugares(activos);
      } catch (err) {
        toast.error("Error al cargar lugares",{
          richColors: true,
        });
        await crearLog(
          `ERROR: Error al cargar lugares de monitoreo`,
          user.userId
        );
      }
    };

    cargarLugares();

    const ubicacionGuardada = localStorage.getItem("ubicacionMonitoreo");
    if (ubicacionGuardada) {
      setUbicacion(ubicacionGuardada);
      setConfirmado(true);
    }
  }, [user.userId]);

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
          registrarMonitoreo(buffer.trim());
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
      await api.post("/monitoreos", {
        tag: rfid,
        lugar: ubicacion,
        timestamp: new Date().toISOString(),
      });
      toast.success("Tag registrado", { description: `RFID: ${rfid}`, richColors: true });
    } catch (error) {
      console.error("Error al registrar monitoreo:", error.response || error);
      toast.error("Error al registrar tag",{
        richColors: true,
      });
      await crearLog(
        `ERROR: No se pudo registrar el tag ${rfid} en el monitoreo`,
        user.userId
      );
    }
  };

  const iniciarMonitoreo = () => {
    localStorage.setItem("ubicacionMonitoreo", ubicacion);
    setConfirmado(true);
    crearLog(
      `INFO: Monitoreo iniciado en: ${ubicacion}`,
      user.userId
    );
  };

  const pararMonitoreo = () => {
    localStorage.removeItem("ubicacionMonitoreo");
    setConfirmado(false);
    setUbicacion("");
    toast.info("Monitoreo detenido",{
      richColors: true,
    });
    crearLog(
      `INFO: Monitoreo detenido en: ${ubicacion}`,
      user.userId
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {confirmado ? "Escuchando RFID..." : "Configurar monitoreo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!confirmado ? (
            <>
              <div>
                <label htmlFor="lugar" className="font-semibold text-xs md:text-[13px] sm:text-sm mb-1 block">
                  Seleccione el lugar de monitoreo:
                </label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="justify-between w-full text-xs md:text-[13px] sm:text-sm">
                      {ubicacion
                        ? lugares.find((l) => l.nombreLugar === ubicacion)?.nombreLugar
                        : "Seleccionar lugar"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full z-[60]">
                    <Command>
                      <CommandInput placeholder="Buscar lugar..." />
                      <CommandList>
                        <CommandEmpty>No encontrado</CommandEmpty>
                        <CommandGroup>
                          {lugares.map((lugar) => (
                            <CommandItem
                              key={lugar.id}
                              onSelect={() => setUbicacion(lugar.nombreLugar)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  ubicacion === lugar.nombreLugar ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {lugar.nombreLugar}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                onClick={iniciarMonitoreo}
                disabled={!ubicacion}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Iniciar monitoreo
              </Button>
            </>
          ) : (
            <>
              <div className="text-blue-600 text-center text-lg animate-pulse">
                Monitoreando en: <strong>{ubicacion}</strong>
              </div>
              <Button
                onClick={pararMonitoreo}
                className="w-full bg-red-100 text-red-700 hover:bg-red-200"
              >
                Parar monitoreo
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
