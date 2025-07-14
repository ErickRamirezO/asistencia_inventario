import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import api from "@/utils/axios";

const nombreEventoValido = (nombre) =>
  /^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü0-9\s-]+$/.test(nombre);

export default function AsistenciaEvento() {
  const [rfidTag, setRfidTag] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    nombre: "",
    horaIngreso: "07:00",
    horaSalida: "09:00",
  });
  const inputRef = useRef(null);
  const lastProcessedTag = useRef("");
  const [showEditHoraFin, setShowEditHoraFin] = useState(false);
  const [nuevaHoraFin, setNuevaHoraFin] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [horaError, setHoraError] = useState("");
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
    ? windowSize.height - 200 // ajusta 200px según header + paddings
    : undefined;
  const inputHeight = isDesktop
    ? Math.max(15, Math.floor((availableHeight || 400) / 13))
    : 32;
  const labelHeight = isDesktop
    ? Math.max(8, Math.floor(inputHeight / 12))
    : 15;

  useEffect(() => {
    if (newEvent.nombre && !nombreEventoValido(newEvent.nombre)) {
      setNombreError(
        "El nombre solo puede contener letras, números, espacios y guiones."
      );
    } else {
      setNombreError("");
    }

    if (newEvent.horaIngreso && newEvent.horaSalida) {
      if (newEvent.horaSalida <= newEvent.horaIngreso) {
        setHoraError("La hora de fin debe ser mayor a la hora de inicio.");
      } else {
        setHoraError("");
      }
    } else {
      setHoraError("");
    }
  }, [newEvent.nombre, newEvent.horaIngreso, newEvent.horaSalida]);

  // Cargar eventos disponibles al montar y después de crear uno nuevo
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/asistencias/eventos-disponibles");
      setAvailableEvents(response.data);
    } catch (error) {
      toast.error("Error al cargar eventos disponibles.", {
        description: error.message,
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (inputRef.current && selectedEvent && !showCreateEvent) {
      inputRef.current.focus();
    }
  }, [selectedEvent, showCreateEvent]);

  // Crear nuevo evento
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.nombre || !newEvent.horaIngreso || !newEvent.horaSalida) {
      toast.warning("Complete todos los campos para crear el evento.");
      return;
    }
    if (!nombreEventoValido(newEvent.nombre)) {
      setNombreError(
        "El nombre solo puede contener letras, números, espacios y guiones."
      );
      return;
    } else {
      setNombreError("");
    }
    try {
      setIsLoading(true);
      await api.post("/asistencias/crear-evento", {
        nombre: newEvent.nombre,
        horaIngreso: newEvent.horaIngreso,
        horaSalida: newEvent.horaSalida,
      });
      toast.success("Evento creado correctamente.", {
        richColors: true,
      });
      setShowCreateEvent(false);
      setNewEvent({ nombre: "", horaIngreso: "07:00", horaSalida: "09:00" });
      await fetchEvents();
    } catch (error) {
      toast.error("Error al crear evento.", {
        description: error?.response?.data?.mensaje || error.message,
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener info de usuario
  const fetchUserInfo = useCallback(
    async (tag) => {
      if (processing) return;
      setProcessing(true);
      setIsLoading(true);
      try {
        const response = await api.get(`/usuarios/tag/${tag}`);
        setUserInfo(response.data);

        setTimeout(() => {
          setUserInfo(null);
          setRfidTag("");
          if (inputRef.current) {
            inputRef.current.focus();
          }
          setProcessing(false);
          lastProcessedTag.current = "";
        }, 3000);
      } catch (error) {
        setUserInfo(null);
        toast.error("Usuario no encontrado para este Tag", {
          description:
            error?.response?.data?.mensaje ||
            "No se pudo conectar con el servidor.",
          richColors: true,
        });
        setTimeout(() => {
          setRfidTag("");
          if (inputRef.current) {
            inputRef.current.focus();
          }
          setProcessing(false);
          lastProcessedTag.current = "";
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    },
    [processing]
  );

  // Registrar asistencia en evento
  const registerEventAttendance = useCallback(
    async (tag) => {
      if (!tag || !selectedEvent) {
        toast.warning("Seleccione un evento antes de registrar asistencia.", {
          richColors: true,
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.post(
          "/asistencias/registrar-asistencia-evento",
          { rfid: tag, eventoNombre: selectedEvent }
        );
        console.log(response.data);
        if (response.status === 200) {
          const { mensaje } = response.data;
          toast.success(mensaje, {
            richColors: true,
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data.mensaje, {
            richColors: true,
          });
        } else {
          toast.error("Error al registrar asistencia en evento", {
            description: "No se pudo conectar con el servidor.",
            richColors: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedEvent]
  );

  // Escaneo de tag
  const handleTagChange = (e) => {
    const tag = e.target.value;
    setRfidTag(tag);
  };

  useEffect(() => {
    if (rfidTag.length < 50) {
      setRfidTag(rfidTag.substring(0, 50));
    }
  }, [rfidTag]);

  const horaFinActual =
    availableEvents.find(
      (ev) => ev === selectedEvent || ev.nombre === selectedEvent
    )?.horaSalida || "";
  const handleEditarHoraFin = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !nuevaHoraFin) return;
    try {
      setIsLoading(true);
      await api.put("/asistencias/evento/editar-hora-fin", {
        eventoNombre: selectedEvent,
        nuevaHoraFin,
      });
      toast.success("Hora de fin actualizada correctamente.", {
        richColors: true,
      });
      setShowEditHoraFin(false);
      setNuevaHoraFin("");
      await fetchEvents();
    } catch (error) {
      toast.error("Error al actualizar hora de fin.", {
        description: error?.response?.data?.mensaje || error.message,
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  //Obtener hora de fin del evento seleccionado
  const fetchHoraFinEvento = async (eventoNombre) => {
    try {
      const response = await api.post("/asistencias/evento/hora-fin", {
        eventoNombre: eventoNombre,
      });
      return response.data.horaFin || "";
    } catch (error) {
      toast.error("No se pudo obtener la hora de fin del evento.", {
        description: error?.response?.data?.mensaje || error.message,
        richColors: true,
      });
      setShowEditHoraFin(false); // Cierra el modal de edición
      setNuevaHoraFin("");
      return "";
    }
  };

  return (
    <div className=" w-full flex items-center justify-center px-1 sm:px-0 mt-20 ">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg mt-0">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>Registro de Asistencia en Evento</CardTitle>
          <CardDescription>
            {selectedEvent
              ? "Escanee el tag RFID para registrar asistencia en el evento seleccionado."
              : "Seleccione o cree un evento para iniciar el registro."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Botón para crear evento, arriba y centrado */}
          <div className="w-full flex justify-center mb-2  gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateEvent(true)}
              className="text-xs sm:text-sm md:text-[13px]"
            >
              Crear nuevo evento
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!selectedEvent}
              onClick={async () => {
                setShowEditHoraFin(true);
                const horaFin = await fetchHoraFinEvento(selectedEvent);
                setNuevaHoraFin(horaFin || "09:00");
              }}
              className="text-xs sm:text-sm md:text-[13px]"
            >
              Editar hora de fin
            </Button>
          </div>
          {/* Selector de eventos */}
          <Select
            value={selectedEvent}
            onValueChange={setSelectedEvent}
            disabled={showCreateEvent}
          >
            <SelectTrigger
              className="w-full text-sm sm:text-sm md:text-[13px]"
              style={{ minHeight: inputHeight }}
            >
              <SelectValue placeholder="Seleccionar evento" />
            </SelectTrigger>
            <SelectContent>
              {availableEvents.length === 0 ? (
                <div className="px-4 py-2 text-muted-foreground text-sm sm:text-sm md:text-[13px]">
                  No hay eventos disponibles
                </div>
              ) : (
                availableEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {/* Dialog para crear evento */}
          <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nuevo evento</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-3"
                onSubmit={handleCreateEvent}
              >
                <Input
                  placeholder="Nombre del evento"
                  value={newEvent.nombre}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, nombre: e.target.value })
                  }
                  required
                  style={{ minHeight: inputHeight }}
                />
                {nombreError && (
                  <span
                    className="text-xs md:text-[13px] sm:text-sm text-red-500"
                    style={{ minHeight: labelHeight }}
                  >
                    {nombreError}
                  </span>
                )}
                <label
                  className="text-xs md:text-[13px] sm:text-sm text-muted-foreground mb-1"
                  style={{ minHeight: labelHeight }}
                >
                  Establezca la hora de inicio y fin del evento
                </label>
                <Input
                  type="time"
                  placeholder="Hora de ingreso"
                  value={newEvent.horaIngreso}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, horaIngreso: e.target.value })
                  }
                  required
                  style={{ minHeight: inputHeight }}
                />
                <Input
                  type="time"
                  placeholder="Hora de salida"
                  value={newEvent.horaSalida}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, horaSalida: e.target.value })
                  }
                  required
                  style={{ minHeight: inputHeight }}
                />
                {horaError && (
                  <span
                    className="text-xs md:text-[13px] sm:text-sm text-red-500"
                    style={{ minHeight: labelHeight }}
                  >
                    {horaError}
                  </span>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateEvent(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !!nombreError || !!horaError}
                  >
                    Guardar evento
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Dialog para editar hora de fin */}
          <Dialog open={showEditHoraFin} onOpenChange={setShowEditHoraFin}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar hora de fin</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-3"
                onSubmit={handleEditarHoraFin}
              >
                <label
                  className="text-xs md:text-[13px] sm:text-sm text-muted-foreground mb-1"
                  style={{ minHeight: labelHeight }}
                >
                  Nueva hora de fin para <b>{selectedEvent}</b>
                </label>
                <Input
                  type="time"
                  value={nuevaHoraFin}
                  onChange={(e) => setNuevaHoraFin(e.target.value)}
                  required
                  style={{ minHeight: inputHeight }}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditHoraFin(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Guardar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Input para escanear tag */}
          <Input
            ref={inputRef}
            placeholder="Escanear Tag RFID"
            value={rfidTag}
            onChange={handleTagChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (
                  rfidTag.length > 0 &&
                  !processing &&
                  selectedEvent &&
                  !showCreateEvent
                ) {
                  fetchUserInfo(rfidTag);
                  registerEventAttendance(rfidTag);
                  setRfidTag(""); // Limpia el input después de procesar
                }
              }
            }}
            style={{ minHeight: inputHeight }}
            disabled={!selectedEvent || showCreateEvent}
          />
          {isLoading && <p>Cargando...</p>}
          {userInfo && (
            <div className="mt-4 w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {userInfo.nombre} {userInfo.apellido}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cédula: {userInfo.cedula}</p>
                  <p>Departamento: {userInfo.departamentoNombre}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
