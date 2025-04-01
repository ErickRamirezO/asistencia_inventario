import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Calendar, Clock, Filter, Search } from "lucide-react"
import CheckInDialog from "../components/check-in-dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "../components/ui/pagination"

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 5

  return (
    <div className="w-full h-full flex flex-col p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <p className="text-muted-foreground">Controla la asistencia y horas de trabajo de los empleados</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            Ver Calendario
          </Button>
          <CheckInDialog />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { title: "Total Empleados", value: 22 },
          { title: "Presentes Hoy", value: 18 },
          { title: "Ausentes", value: 4 },
          { title: "Hora Actual", value: "10:45 AM", icon: <Clock className="mr-2 h-5 w-5" /> }
        ].map(({ title, value, icon }, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {icon} {value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de Asistencia */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Asistencia</CardTitle>
          <CardDescription>Ver y gestionar los registros de asistencia de los empleados.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar empleados..." className="pl-8" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  {["Todos", "IT", "RRHH", "Finanzas", "Marketing", "Operaciones"].map((dept) => (
                    <SelectItem key={dept} value={dept.toLowerCase()}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="today">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {["Hoy", "Ayer", "Esta Semana", "Semana Pasada", "Este Mes"].map((period) => (
                    <SelectItem key={period} value={period.toLowerCase().replace(" ", "-")}>{period}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="w-full sm:w-auto">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "EMP001", name: "John Doe", dept: "IT", in: "08:30 AM", out: "05:15 PM", status: "Presente", date: "2023-04-12" },
                  { id: "EMP002", name: "Jane Smith", dept: "RRHH", in: "09:05 AM", out: "06:00 PM", status: "Presente", date: "2023-04-12" },
                  { id: "EMP003", name: "Robert Johnson", dept: "Finanzas", in: "08:45 AM", out: "05:30 PM", status: "Presente", date: "2023-04-12" },
                  { id: "EMP004", name: "Emily Davis", dept: "Marketing", in: "--", out: "--", status: "Ausente", date: "2023-04-12" },
                  { id: "EMP005", name: "Michael Wilson", dept: "Operaciones", in: "08:15 AM", out: "--", status: "Presente", date: "2023-04-12" }
                ].map(({ id, name, dept, in: entrada, out, status, date }) => (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{id}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{dept}</TableCell>
                    <TableCell>{entrada}</TableCell>
                    <TableCell>{out}</TableCell>
                    <TableCell>
                      <Badge variant={status === "Ausente" ? "destructive" : "default"}>{status}</Badge>
                    </TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="outline" size="sm">Detalles</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
              </PaginationItem>
              <span className="px-4">Página {currentPage} de {totalPages}</span>
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  )
}
