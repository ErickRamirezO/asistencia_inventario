import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Calendar, Clock, Filter, Search } from "lucide-react"
import CheckInDialog from "../components/check-in-dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "../components/ui/pagination"

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState(""); // Búsqueda por empleado
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Filtro por departamento
  const [dateFilter, setDateFilter] = useState("today"); // Filtro por rango de fechas

  const recordsPerPage = 10; // Número de registros por página
  const totalPages = Math.ceil(filteredData.length / recordsPerPage); // Calcular el número total de páginas

  // Función para obtener los datos del backend
  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8002/api/asistencias/usuarios");
      const data = response.data;
      setAttendanceData(data);
      setFilteredData(data); // Inicialmente, los datos filtrados son todos los datos
      setTotalEmployees(data.length);
      setPresentToday(data.filter((item) => item.estado === 1).length); // Filtra los presentes
      setAbsentToday(data.filter((item) => item.estado !== 1).length); // Filtra los ausentes
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Llamar a fetchAttendanceData al montar el componente
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Actualizar la hora actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer); // Limpia el temporizador al desmontar el componente
  }, []);

  // Filtrar los datos según los criterios seleccionados
  useEffect(() => {
    let filtered = attendanceData;

    // Filtro por búsqueda de empleado
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por departamento
    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter((item) => item.departamento === selectedDepartment);
    }

    // Filtro por rango de fechas
    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((item) => {
        const fecha = new Date(item.fecha);
        const today = now.toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
        const itemDate = fecha.toISOString().split("T")[0]; // Fecha del registro en formato YYYY-MM-DD

        if (dateFilter === "today") {
          return itemDate === today; // Comparar solo la fecha
        } else if (dateFilter === "thisWeek") {
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          return fecha >= startOfWeek && fecha <= endOfWeek;
        } else if (dateFilter === "lastMonth") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
          const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
          return fecha >= startOfLastMonth && fecha <= endOfLastMonth;
        }
        return true;
      });
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedDepartment, dateFilter, attendanceData]);

  // Obtener los registros para la página actual
  const currentRecords = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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
          <CheckInDialog onRegister={fetchAttendanceData} />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { title: "Total Empleados", value: totalEmployees },
          { title: "Presentes Hoy", value: presentToday },
          { title: "Ausentes", value: absentToday },
          { title: "Hora Actual", value: currentTime, icon: <Clock className="mr-2 h-5 w-5" /> }
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

      {/* Filtros en una sola fila */}
      <div className="flex flex-row gap-4 mb-6 items-center">
        {/* Búsqueda por empleado */}
        <Input
          placeholder="Buscar empleado..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/4" // Ajusta el ancho aquí si es necesario
        />

        {/* Filtro por departamento */}
        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
          <SelectTrigger className="w-1/3 border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500">
            <SelectValue placeholder="Seleccionar Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span role="img" aria-label="Todos">🌎</span> Todos
            </SelectItem>
            <SelectItem value="Ventas">
              <span role="img" aria-label="Ventas">💼</span> Ventas
            </SelectItem>
            <SelectItem value="Recursos Humanos">
              <span role="img" aria-label="Recursos Humanos">👥</span> Recursos Humanos
            </SelectItem>
            <SelectItem value="Tecnología">
              <span role="img" aria-label="Tecnología">💻</span> Tecnología
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por rango de fechas */}
        <Select onValueChange={setDateFilter} value={dateFilter}>
          <SelectTrigger className="w-1/4 border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500">
            <SelectValue placeholder="Seleccionar Fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span role="img" aria-label="Todos">📅</span> Todos
            </SelectItem>
            <SelectItem value="today">
              <span role="img" aria-label="Hoy">🗓️</span> Hoy
            </SelectItem>
            <SelectItem value="thisWeek">
              <span role="img" aria-label="Esta Semana">📅</span> Esta Semana
            </SelectItem>
            <SelectItem value="lastMonth">
              <span role="img" aria-label="Mes Anterior">📆</span> Mes Anterior
            </SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Tabla de Asistencia */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Asistencia</CardTitle>
          <CardDescription>Ver y gestionar los registros de asistencia de los empleados.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Cargando datos...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <>
              {currentRecords.length === 0 ? (
                <Alert variant="destructive">
                  <AlertTitle>No hay registros</AlertTitle>
                  <AlertDescription>
                    No se encontraron registros para la búsqueda o filtros seleccionados.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                      {currentRecords.map(({ id, nombre, departamento, entrada, salida, estado, fecha }) => (
                        <TableRow key={id}>
                          <TableCell>{nombre}</TableCell>
                          <TableCell>{departamento}</TableCell>
                          <TableCell>{entrada || "--"}</TableCell>
                          <TableCell>{salida || "--"}</TableCell>
                          <TableCell>
                            <Badge variant={estado === 1 ? "presente" : "ausente"}>
                              {estado === 1 ? "Presente" : "Ausente"}
                            </Badge>
                          </TableCell>
                          <TableCell>{fecha}</TableCell>
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
              )}
            </>
          )}

          {/* Paginación */}
          {currentRecords.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                <span className="px-4">Página {currentPage} de {totalPages}</span>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}