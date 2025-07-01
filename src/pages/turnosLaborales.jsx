"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import api from "@/utils/axios";

import { toast } from "sonner"; // Assuming 'sonner' for toasts
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper function to convert "HH:mm" string to minutes for easy comparison
const timeToMinutes = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const FormSchema = z.object({
  shiftName: z.string().min(3, {
    message: "El nombre del turno debe tener al menos 3 caracteres.",
  }).max(30).regex(/^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s-]+$/, {
    message: "El nombre del turno solo puede contener letras, números y guiones.",
  })
  .refine(val => !/<.*?>/.test(val), {
    message: "No se permiten etiquetas HTML.",
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Debe ser una hora válida en formato HH:mm.",
  }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Debe ser una hora válida en formato HH:mm.",
  })
    // RN01 (Frontend Validation): Turno no puede finalizar después de las 22:00
    .refine(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours < 22 || (hours === 22 && minutes === 0); // Allows up to 22:00:00
    }, {
      message: "El turno no puede finalizar después de las 22:00."
    }),

  startLunchTime: z.string()
    .refine(val => val === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Debe ser una hora válida en formato HH:mm."
    })
    .optional(),

  endLunchTime: z.string()
    .refine(val => val === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Debe ser una hora válida en formato HH:mm."
    })
    .optional(),
})
.superRefine((data, ctx) => {
    const startShiftMinutes = timeToMinutes(data.startTime);
    const endShiftMinutes = timeToMinutes(data.endTime);

    if (startShiftMinutes !== null && endShiftMinutes !== null && endShiftMinutes <= startShiftMinutes) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La hora de fin no puede ser anterior o igual a la hora de inicio.",
            path: ["endTime"], // Associate the error with the endTime field
        });
    }
})
// RN05 (Frontend Refinement): The lunch schedule must be contained within the shift schedule
.superRefine((data, ctx) => {
    const startShiftMinutes = timeToMinutes(data.startTime);
    const endShiftMinutes = timeToMinutes(data.endTime);
    const startLunchMinutes = timeToMinutes(data.startLunchTime);
    const endLunchMinutes = timeToMinutes(data.endLunchTime);

    // Rule: Lunch is optional if shift ends at or before 12:00
    const isLunchOptional = (endShiftMinutes !== null && endShiftMinutes <= timeToMinutes("12:00"));

    if (!isLunchOptional) { // If lunch is mandatory
        if (!data.startLunchTime || !data.endLunchTime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Debe ingresar la hora de inicio y fin del almuerzo.",
                path: ["startLunchTime"], // Associate with a field for better UX
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Debe ingresar la hora de inicio y fin del almuerzo.",
                path: ["endLunchTime"],
            });
            return; // Stop further lunch validations if fields are missing
        }

        // Validate lunch time sequence
        if (startLunchMinutes !== null && endLunchMinutes !== null && startLunchMinutes >= endLunchMinutes) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La hora de inicio del almuerzo no puede ser igual o posterior a la hora de fin del almuerzo.",
                path: ["endLunchTime"],
            });
            return;
        }

        // Validate lunch time range (12:00 to 15:00)
        const minLunchMinutes = timeToMinutes("12:00");
        const maxLunchMinutes = timeToMinutes("15:00");
        if (startLunchMinutes < minLunchMinutes || endLunchMinutes > maxLunchMinutes) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El horario de almuerzo debe estar entre las 12:00 y las 15:00 horas.",
                path: ["startLunchTime"],
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El horario de almuerzo debe estar entre las 12:00 y las 15:00 horas.",
                path: ["endLunchTime"],
            });
            return;
        }

        // Validate lunch contained within shift
        if (startLunchMinutes < startShiftMinutes || endLunchMinutes > endShiftMinutes) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El horario de almuerzo debe estar contenido dentro del horario del turno laboral.",
                path: ["startLunchTime"],
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El horario de almuerzo debe estar contenido dentro del horario del turno laboral.",
                path: ["endLunchTime"],
            });
        }
    } else { // If lunch is optional, ensure no values are provided
        if (data.startLunchTime !== "" || data.endLunchTime !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Para turnos que terminan a las 12:00 o antes, el almuerzo no debe ser especificado.",
                path: ["startLunchTime"],
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Para turnos que terminan a las 12:00 o antes, el almuerzo no debe ser especificado.",
                path: ["endLunchTime"],
            });
        }
        // IMPORTANT: Clear the form values for optional lunch if they were entered
        // This ensures they are not sent to the backend if the rule makes them optional.
        if (data.startLunchTime !== "") data.startLunchTime = "";
        if (data.endLunchTime !== "") data.endLunchTime = "";
    }
});


export default function TurnosLaborales() {
  const [turnos, setTurnos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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
      const response = await api.get("/horarios-laborales");
      setTurnos(response.data);
    } catch (error) {
      console.error("Error al recuperar los horarios laborales:", error);
      toast.error("Error al cargar turnos laborales.");
    }
  }

  useEffect(() => {
    obtenerHorariosLaborales();
  }, []);

  async function onSubmit(data) {
    // The Zod schema with .superRefine handles the logic previously here.
    // If Zod validation fails, form.handleSubmit will prevent this from running.

    try {
      // Prepare payload - Zod has already ensured consistency for lunch times
      const payload = {
        nombreHorario: data.shiftName,
        horaInicio: data.startTime,
        horaFin: data.endTime,
        // These will be empty strings if lunch is optional and was cleared by Zod's superRefine
        horaInicioAlmuerzo: data.startLunchTime,
        horaFinAlmuerzo: data.endLunchTime,
      };

      const response = await api.post("/horarios-laborales", payload);
      setTurnos(prevTurnos => [...prevTurnos, response.data]);
      toast.success("Turno creado", {
        description: "El turno laboral se ha registrado correctamente.",
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al registrar el turno laboral:", error);

      let errorMessage = "No se pudo registrar el turno laboral. Intente nuevamente.";
      if (axios.isAxiosError(error) && error.response) {
        // This is the part that handles the backend's error message format
        if (error.response.data) {
            // Case 1: Backend sends a JSON object with a 'message' field (most common for Spring's ResponseStatusException)
            if (typeof error.response.data === 'object' && error.response.data.message) {
                const fullBackendMessage = error.response.data.message;
                // Try to extract the message from quotes (e.g., "409 CONFLICT "Actual message"")
                const match = fullBackendMessage.match(/"([^"]*)"$/);
                errorMessage = (match && match[1]) ? match[1] : fullBackendMessage;
            }
            // Case 2: Backend sends a plain string directly as the response body
            else if (typeof error.response.data === 'string' && error.response.data.length > 0) {
                errorMessage = error.response.data;
            }
        } else if (error.message) {
            // Fallback for Axios errors where response.data might be missing (e.g., network errors)
            errorMessage = error.message;
        }
      } else if (error.message) {
        // Fallback for non-Axios errors
        errorMessage = error.message;
      }

      toast.error("Error", {
        description: errorMessage,
        richColors: true,
      });
    }
  }

  return (
    <div className="p-2 sm:p-6">
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex justify-end mb-4">
  <DialogTrigger asChild>
    <Button
      variant="blue"
      className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1 h-auto"
    >
      Crear Turno Laboral
    </Button>
  </DialogTrigger>
</div>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-lg">Crear Turno Laboral</DialogTitle>
          </DialogHeader>
          <p className="text-xs sm:text-sm text-gray-500 mb-2">
            El formato de hora es de 24 horas (ejemplo: 08:00, 13:30, 21:45).
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shiftName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Nombre del Turno</FormLabel>
                    <FormControl>
                      <Input className="text-xs sm:text-sm" placeholder="Ejemplo: Turno Mañana" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs sm:text-sm">Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" className="text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs sm:text-sm">Hora de Fin</FormLabel>
                      <FormControl>
                        <Input type="time" className="text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="startLunchTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs sm:text-sm">Inicio de Almuerzo</FormLabel>
                      <FormControl>
                        <Input type="time" className="text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endLunchTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs sm:text-sm">Fin de Almuerzo</FormLabel>
                      <FormControl>
                        <Input type="time" className="text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" variant="blue" className="text-xs sm:text-base">
                  Crear turno
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="md:max-h-[450px] md:overflow-y-auto overflow-x-auto border rounded-md">

        <Table className="min-w-[600px] text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Nombre del Turno</TableHead>
              <TableHead className="text-xs sm:text-sm">Hora de Inicio</TableHead>
              <TableHead className="text-xs sm:text-sm">Hora de Fin</TableHead>
              <TableHead className="text-xs sm:text-sm">Inicio de Almuerzo</TableHead>
              <TableHead className="text-xs sm:text-sm">Fin de Almuerzo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turnos.length > 0 ? (
              turnos.map((turno, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs sm:text-sm">{turno.nombreHorario}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{turno.horaInicio}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{turno.horaFin}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{turno.horaInicioAlmuerzo || "—"}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{turno.horaFinAlmuerzo || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center text-xs sm:text-sm">
                  No hay turnos laborales registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}