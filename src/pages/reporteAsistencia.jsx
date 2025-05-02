import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import { CalendarIcon, FileText } from "lucide-react";
import "react-day-picker/dist/style.css";

const ReporteAsistencia = () => {
  const [dateRange, setDateRange] = useState();

  const users = [
    { id: 1, name: "Usuario 1" },
    { id: 2, name: "Usuario 2" },
    { id: 3, name: "Usuario 3" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reporte de Asistencia</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Usuarios</h2>
        <ul className="list-disc pl-5">
          {users.map((user) => (
            <li key={user.id} className="mb-1">
              {user.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Rango de Fechas</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start text-left">
              <CalendarIcon className="mr-2" />
              {dateRange?.from ? (
                dateRange.to ? (
                  `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                ) : (
                  dateRange.from.toLocaleDateString()
                )
              ) : (
                "Seleccionar rango de fechas"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={{ dayOfWeek: [0, 6] }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Button>
            <FileText /> Descargar PDF
        </Button>
      </div>
    </div>
  );
};

export default ReporteAsistencia;