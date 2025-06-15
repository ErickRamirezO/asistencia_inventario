import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import axios from "axios"
import { toast } from "sonner"

export default function EventCheckInDialog({ availableEvents, onRegister, onCreateEvent }) {
  const [rfid, setRfid] = useState("")
  const [newEventName, setNewEventName] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("")
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleRegister = async () => {
    if (!rfid) {
      toast.error("Por favor ingrese un código RFID")
      return
    }

    // Si estamos creando un nuevo evento, verificar que tenga nombre
    if (showCreateEvent && !newEventName.trim()) {
      toast.error("Por favor ingrese un nombre para el evento")
      return
    }

    // Si estamos usando un evento existente, verificar que esté seleccionado
    if (!showCreateEvent && !selectedEvent) {
      toast.error("Por favor seleccione un evento")
      return
    }

    const eventName = showCreateEvent ? newEventName : selectedEvent
    
    setIsLoading(true)
    try {
      const response = await axios.post(
        `http://localhost:8002/api/asistencias/registrar?rfid=${rfid}&eventoNombre=${encodeURIComponent(eventName)}`
      )
      
      toast.success(response.data)
      
      // Si era un evento nuevo, notificar para actualizar la lista
      if (showCreateEvent && onCreateEvent) {
        onCreateEvent(newEventName)
      }
      
      setRfid("")
      setNewEventName("")
      setSelectedEvent("")
      if (onRegister) {
        onRegister(selectedEvent); // Pasar el evento actual
        }
        
        setOpen(false);
    } catch (error) {
      toast.error(error.response?.data || "Error al registrar asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Registrar Asistencia a Evento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Asistencia a Evento</DialogTitle>
          <DialogDescription>
            Registre la asistencia de un empleado a un evento específico.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="evento-tipo" className="text-right">
              Tipo
            </Label>
            <div className="col-span-3">
              <div className="flex space-x-2">
                <Button 
                  variant={showCreateEvent ? "default" : "outline"}
                  onClick={() => setShowCreateEvent(true)}
                  className="flex-1"
                >
                  Nuevo
                </Button>
                <Button 
                  variant={!showCreateEvent ? "default" : "outline"}
                  onClick={() => setShowCreateEvent(false)}
                  className="flex-1"
                >
                  Existente
                </Button>
              </div>
            </div>
          </div>
          
          {showCreateEvent ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nuevo-evento" className="text-right">
                Nombre
              </Label>
              <Input
                id="nuevo-evento"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="col-span-3"
                placeholder="Nombre del nuevo evento"
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="evento-select" className="text-right">
                Evento
              </Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger id="evento-select" className="col-span-3">
                  <SelectValue placeholder="Seleccionar evento" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map(event => (
                    <SelectItem key={event} value={event}>{event}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rfid" className="text-right">
              RFID
            </Label>
            <Input
              id="rfid"
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              className="col-span-3"
              placeholder="Escanee o ingrese el código RFID"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRegister} disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}