import { useState, useEffect, useCallback } from "react";
import api from "@/utils/axios";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Calendar, Clock } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "../../components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import moment from 'moment';

export default function Asistencia() {
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [activeTab, setActiveTab] = useState("regular");
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventAttendanceData, setEventAttendanceData] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [Departments, setDepartments] = useState([]);

  const recordsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "--";
    return moment(dateString).format("YYYY-MM-DD");
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "--";
    return timeString;
  };

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/asistencias/usuarios-resumen");
      const data = response.data;
      setAttendanceData(data);
      setTotalEmployees(data.length);
      setPresentToday(data.filter((item) => item.estado === 1).length);
      setAbsentToday(data.filter((item) => item.estado === 0).length);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  const fetchRegularAttendanceTableData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/asistencias/filtradas?evento=regular");
      setFilteredData(response.data);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departamentos");
        const formattedDepartments = response.data.map(dept => ({
          label: dept.nombreDepartamento,
          value: dept.nombreDepartamento
        }));
        setDepartments([{ label: "Todos", value: "all" }, ...formattedDepartments]);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Error al cargar los departamentos.");
        setDepartments([{ label: "Todos", value: "all" }]);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
    fetchRegularAttendanceTableData();
  }, [fetchAttendanceData, fetchRegularAttendanceTableData]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await api.get("/asistencias/eventos-disponibles");
        setAvailableEvents(response.data);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        toast.error("Error al cargar eventos disponibles.");
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let currentRegularTableData = [];
    const loadInitialRegularTableData = async () => {
      try {
        const response = await api.get("/asistencias/filtradas?evento=regular");
        currentRegularTableData = response.data;
      } catch (error) {
        console.error("Error loading initial regular table data:", error);
        currentRegularTableData = [];
      }
    };

    if (activeTab === "regular") {
      loadInitialRegularTableData().then(() => {
        let filtered = currentRegularTableData;

        if (searchQuery.trim() !== "") {
          filtered = filtered.filter((item) =>
            item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (selectedDepartment && selectedDepartment !== "all") {
          filtered = filtered.filter((item) => item.departamento === selectedDepartment);
        }

        if (dateFilter && dateFilter !== "all") {
          const now = moment();
          filtered = filtered.filter((item) => {
            const itemDate = moment(item.fecha);
            if (dateFilter === "today") {
              return itemDate.isSame(now, 'day');
            } else if (dateFilter === "thisWeek") {
              const startOfWeek = now.clone().startOf('week');
              const endOfWeek = now.clone().endOf('week');
              return itemDate.isBetween(startOfWeek, endOfWeek, null, '[]');
            } else if (dateFilter === "lastMonth") {
              const lastMonth = now.clone().subtract(1, 'month');
              const startOfLastMonth = lastMonth.startOf('month');
              const endOfLastMonth = lastMonth.endOf('month');
              return itemDate.isBetween(startOfLastMonth, endOfLastMonth, null, '[]');
            }
            return true;
          });
        }
        setFilteredData(filtered);
        setCurrentPage(1);
      });
    }
  }, [searchQuery, selectedDepartment, dateFilter, activeTab]);

  const loadEventAttendance = useCallback(async (eventName) => {
    if (!eventName) {
      setEventAttendanceData([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(
        `/asistencias/filtradas?evento=${encodeURIComponent(eventName)}`
      );
      setEventAttendanceData(response.data);
    } catch (error) {
      console.error("Error loading event attendance:", error);
      toast.error("No se pudieron cargar los datos del evento.");
      setEventAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "regular") {
      setSelectedEvent("");
      fetchRegularAttendanceTableData();
    } else if (value === "events") {
      if (selectedEvent) {
        loadEventAttendance(selectedEvent);
      } else if (availableEvents.length > 0) {
        const firstEvent = availableEvents[0];
        setSelectedEvent(firstEvent);
        loadEventAttendance(firstEvent);
      } else {
        setEventAttendanceData([]);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "events" && selectedEvent) {
      loadEventAttendance(selectedEvent);
    }
  }, [activeTab, selectedEvent, loadEventAttendance]);

  const currentRecords = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-6 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Título principal de la vista */}
        
        {/* Estadísticas */}
        <div className="grid gap-2 grid-cols-2 sm:gap-4 sm:grid-cols-4 mb-6">
          {[
            { title: "Total Empleados", value: totalEmployees },
            { title: "Presentes Hoy", value: presentToday },
            { title: "Ausentes", value: absentToday },
            {
              title: "Hora Actual",
              value: currentTime,
              icon: (
                <span className="hidden sm:inline-block mr-2">
                  <Clock className="h-4 w-4" />
                </span>
              ),
            },
          ].map(({ title, value, icon }, index) => (
            <Card key={index} className="p-2 h-full flex flex-col justify-center">
              <CardHeader className="pb-1 flex-1 flex flex-col justify-center items-center">
                <CardTitle className="text-sm sm:text-sm font-medium text-center">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center">
                <div className="text-sm sm:text-2xl font-bold flex items-center justify-center text-center">
                  {icon} {value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros en una sola fila */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center">
          <div className="flex flex-col w-full sm:w-1/4">
            <label className="mb-1 text-xs sm:text-sm font-medium text-gray-700">Buscar empleado</label>
            <Input
              placeholder="Buscar empleado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-col w-full sm:w-1/4">
            <label className="mb-1 text-xs sm:text-sm font-medium text-gray-700">Departamento</label>
            <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm">
                <SelectValue placeholder="Seleccionar Departamento" className="departamento"/>
              </SelectTrigger>
              <SelectContent>
                {Departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value} className="text-xs sm:text-sm">
                    <span role="img" aria-label={dept.label}></span> {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-1/4">
            <label className="mb-1 text-xs sm:text-sm font-medium text-gray-700">Fecha</label>
            <Select onValueChange={setDateFilter} value={dateFilter}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm">
                <SelectValue placeholder="Seleccionar Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs sm:text-sm">
                  <span role="img" aria-label="Todos">📅</span> Todos
                </SelectItem>
                <SelectItem value="today" className="text-xs sm:text-sm">
                  <span role="img" aria-label="Hoy">🗓️</span> Hoy
                </SelectItem>
                <SelectItem value="thisWeek" className="text-xs sm:text-sm">
                  <span role="img" aria-label="Esta Semana">📅</span> Esta Semana
                </SelectItem>
                <SelectItem value="lastMonth" className="text-xs sm:text-sm">
                  <span role="img" aria-label="Mes Anterior">📆</span> Mes Anterior
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sección de pestañas */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4 flex flex-wrap gap-2">
            <TabsTrigger value="regular" className="text-xs sm:text-sm">Asistencia Diaria</TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">Asistencia en Eventos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regular">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Registros de Asistencia Diaria</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ver y gestionar los registros de asistencia de los empleados.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <p className="text-xs">Cargando datos...</p>}
                {error && <p className="text-red-500 text-xs">{error}</p>}
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
                        <div className="max-h-[500px] overflow-y-auto">
                          <Table className="min-w-[700px] text-xs sm:text-sm">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Departamento</TableHead>
                              <TableHead>Entrada</TableHead>
                              <TableHead>Salida</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Observación/Novedad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                          {currentRecords.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.nombre}</TableCell>
                              <TableCell>{item.departamento}</TableCell>
                              <TableCell>
                                {item.entrada ? formatTimeForDisplay(item.entrada) : "No registra entrada"}
                              </TableCell>
                              <TableCell>
                                {item.salida ? formatTimeForDisplay(item.salida) : "No registra salida"}
                              </TableCell>
                              <TableCell>
                                {item.estado === 1 ? (
                                  <Badge variant="presente">Completo</Badge>
                                ) : (
                                  <Badge variant="no_asistio">Pendiente</Badge>
                                )}
                              </TableCell>
                              <TableCell>{formatDateForDisplay(item.fecha)}</TableCell>
                              <TableCell>{item.observacion || "No registra novedades"}</TableCell>
                            </TableRow>
                          ))}
                          </TableBody>
                        </Table>
                      </div>
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
                      <span className="px-4 text-xs sm:text-sm">Página {currentPage} de {totalPages}</span>
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
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Asistencia en Eventos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Registro de asistencia por evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold mb-2">Evento:</h3>
                    <Select 
                      value={selectedEvent} 
                      onValueChange={(value) => setSelectedEvent(value)}
                    >
                      <SelectTrigger className="text-xs sm:text-sm w-[200px] sm:w-[250px]">
                        <SelectValue className="text-xs sm:text-sm" placeholder="Seleccione el evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEvents.length === 0 ? (
                          <div className="px-4 py-2 text-muted-foreground text-sm">
                            No hay eventos disponibles
                          </div>
                        ) : (
                          availableEvents.map(event => (
                            <SelectItem className="text-xs sm:text-sm" key={event} value={event}>{event}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedEvent ? (
                  <>
                    {isLoading ? (
                      <div className="text-center p-8">
                        <div className="h-6 w-6 animate-spin mx-auto mb-2">⟳</div>
                        <p>Cargando datos...</p>
                      </div>
                    ) : eventAttendanceData.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-xs sm:text-sm text-muted-foreground">No hay asistencias registradas para este evento.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table className="min-w-[600px] text-xs sm:text-sm">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Departamento</TableHead>
                              <TableHead>Entrada</TableHead>
                              <TableHead>Salida</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {eventAttendanceData.map((attendee) => {
                              const tieneEntrada = !!attendee.entrada;
                              const tieneSalida = !!attendee.salida;
                              let estadoBadge = "no_asistio";
                              let estadoTexto = "Falta registrar";
                              if (tieneEntrada && tieneSalida) {
                                estadoBadge = "presente";
                                estadoTexto = "Completo";
                              } else if (tieneEntrada && !tieneSalida) {
                                estadoBadge = "no_asistio";
                                estadoTexto = "Incompleto";
                              }
                              return (
                                <TableRow key={attendee.id}>
                                  <TableCell>{attendee.nombre}</TableCell>
                                  <TableCell>{attendee.departamento}</TableCell>
                                  <TableCell>
                                    {attendee.entrada ? formatTimeForDisplay(attendee.entrada) : "Falta registrar"}
                                  </TableCell>
                                  <TableCell>
                                    {attendee.salida ? formatTimeForDisplay(attendee.salida) : "Falta registrar"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={estadoBadge}>{estadoTexto}</Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <p className="text-muted-foreground">Selecciona un evento para ver las asistencias</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div> 
    </div>
  );
}