"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import{
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";

const FormSchema = z.object({
  shiftName: z.string().min(3, {
    message: "El nombre del turno debe tener al menos 3 caracteres.",
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Debe ser una hora válida en formato HH:mm.",
  }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Debe ser una hora válida en formato HH:mm.",
  }),
  startLunchTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Debe ser una hora válida en formato HH:mm.",
  }),
  endLunchTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Debe ser una hora válida en formato HH:mm.",
  }),
});

export default function TurnosLaborales() {
  const [turnos, setTurnos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      shiftName: "",
      startTime: "",
      endTime: "",
      startLunchTime: "",
      endLunchTime: "",
    },
  });

  async function obtenerHorariosLaborales() {
    try {
      const response = await axios.get("http://localhost:8002/api/horarios-laborales");
      setTurnos(response.data);
    } catch (error) {
      console.error("Error al recuperar los horarios laborales:", error);
    }
  }

  useEffect(() => {
    obtenerHorariosLaborales();
  }, []);

  async function onSubmit(data) {
    try {
      // Convertir las horas a formato compatible con LocalTime (HH:mm)
      const payload = {
        nombreHorario: data.shiftName,
        horaInicio: data.startTime,
        horaFin: data.endTime,
        horaInicioAlmuerzo: data.startLunchTime,
        horaFinAlmuerzo: data.endLunchTime,
      };
      console.log("Payload enviado:", payload); // Verifica los datos enviados

    
      const response = await axios.post("http://localhost:8002/api/horarios-laborales", payload);
  
      setTurnos([...turnos, response.data]); // Agrega el nuevo turno a la tabla
      toast("Turno creado", {
        description: "El turno laboral se ha registrado correctamente.",
      });
      form.reset();
      setIsDialogOpen(false); // Cierra el modal después de crear el turno
    } catch (error) {
      console.error(error);
      toast("Error", {
      description: "No se pudo registrar el turno laboral.",
    });
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Turnos Laborales</h1>

      {/* Botón para abrir el dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="blue" className="mb-6">
            Crear Turno Laboral
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Turno Laboral</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shiftName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Turno</FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: Turno Mañana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-x-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hora de Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-x-4">
                <FormField
                  control={form.control}
                  name="startLunchTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Inicio de Almuerzo</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endLunchTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Fin de Almuerzo</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" variant="blue">
                  Crear turno
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tabla de turnos laborales */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Turno</TableHead>
            <TableHead>Hora de Inicio</TableHead>
            <TableHead>Hora de Fin</TableHead>
            <TableHead>Inicio de Almuerzo</TableHead>
            <TableHead>Fin de Almuerzo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {turnos.length > 0 ? (
            turnos.map((turno, index) => (
              <TableRow key={index}>
                <TableCell>{turno.nombreHorario}</TableCell>
                <TableCell>{turno.horaInicio}</TableCell>
                <TableCell>{turno.horaFin}</TableCell>
                <TableCell>{turno.horaInicioAlmuerzo}</TableCell>
                <TableCell>{turno.horaFinAlmuerzo}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5" className="text-center">
                No hay turnos laborales registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}