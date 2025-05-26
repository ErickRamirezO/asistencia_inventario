import { useState, useEffect, useCallback } from "react"; // Add useCallback
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Calendar, Clock } from "lucide-react"; // Removed Filter, Search as they are not used directly
import CheckInDialog from "../components/check-in-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "../components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import EventCheckInDialog from "../components/event-check-in-dialog";
import { toast } from "sonner";
import moment from 'moment'; // Import moment.js for easier date manipulation

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]); // Raw data from API
  const [filteredData, setFilteredData] = useState([]); // Data after applying filters
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all"); // Default to 'all'
  const [dateFilter, setDateFilter] = useState("all"); // Default to 'all'

  const [activeTab, setActiveTab] = useState("regular");
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventAttendanceData, setEventAttendanceData] = useState([]); // Data for event attendance tab
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [Departments, setDepartments] = useState([]); // State to hold departments from backend

  const recordsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Helper to format date strings consistently for display and comparison
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "--";
    return moment(dateString).format("YYYY-MM-DD");
  };

  // Helper to format time strings consistently for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "--";
    // Assuming timeString is already "HH:mm:ss" or similar directly from backend
    return timeString;
  };

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch summary for regular attendance
      const response = await axios.get("http://localhost:8002/api/asistencias/usuarios-resumen");
      const data = response.data;
  
      setAttendanceData(data); // This holds the summary for regular attendance
      // Recalculate based on the summary data
      setTotalEmployees(data.length);
      setPresentToday(data.filter((item) => item.estado === 1).length);
      setAbsentToday(data.filter((item) => item.estado === 0).length);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []); // No dependencies, runs once on mount

  const fetchRegularAttendanceTableData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch detailed regular attendance for the table
      const response = await axios.get("http://localhost:8002/api/asistencias/filtradas?evento=regular"); // Explicitly request regular
      setFilteredData(response.data); // This data is for the table
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []); // No dependencies, runs once on mount

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:8002/api/departamentos");
        const formattedDepartments = response.data.map(dept => ({
          label: dept.nombreDepartamento,
          value: dept.nombreDepartamento // Use department name as value
        }));
        setDepartments([{ label: "Todos", value: "all" }, ...formattedDepartments]); // Add "Todos" option
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Error al cargar los departamentos.");
        setDepartments([{ label: "Todos", value: "all" }]); // Ensure "Todos" is always available
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAttendanceData(); // For the summary cards
    fetchRegularAttendanceTableData(); // For the regular attendance table
  }, [fetchAttendanceData, fetchRegularAttendanceTableData]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await axios.get("http://localhost:8002/api/asistencias/eventos-disponibles");
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

  // Filter logic for the REGULAR ATTENDANCE TABLE
  useEffect(() => {
    // Start with the raw regular attendance data for the table
    let currentRegularTableData = [];
    const loadInitialRegularTableData = async () => {
      try {
        const response = await axios.get("http://localhost:8002/api/asistencias/filtradas?evento=regular");
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
                const itemDate = moment(item.fecha); // item.fecha is "YYYY-MM-DD"
                if (dateFilter === "today") {
                    return itemDate.isSame(now, 'day');
                } else if (dateFilter === "thisWeek") {
                    const startOfWeek = now.clone().startOf('week');
                    const endOfWeek = now.clone().endOf('week');
                    return itemDate.isBetween(startOfWeek, endOfWeek, null, '[]'); // Inclusive
                } else if (dateFilter === "lastMonth") {
                    const lastMonth = now.clone().subtract(1, 'month');
                    const startOfLastMonth = lastMonth.startOf('month');
                    const endOfLastMonth = lastMonth.endOf('month');
                    return itemDate.isBetween(startOfLastMonth, endOfLastMonth, null, '[]'); // Inclusive
                }
                return true;
            });
        }
        setFilteredData(filtered);
        setCurrentPage(1); // Reset to first page on filter change
      });
    }
  }, [searchQuery, selectedDepartment, dateFilter, activeTab]); // Include activeTab as dependency

  const loadEventAttendance = useCallback(async (eventName) => {
    if (!eventName) {
      setEventAttendanceData([]);
      return;
    }
    setIsLoading(true); // Use main loading state
    try {
      const response = await axios.get(
        `http://localhost:8002/api/asistencias/filtradas?evento=${encodeURIComponent(eventName)}`
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
      setSelectedEvent(""); // Clear selected event when switching to regular
      fetchRegularAttendanceTableData(); // Reload regular data
    } else if (value === "events") {
      // If switching to events, and an event was previously selected, load its data
      if (selectedEvent) {
        loadEventAttendance(selectedEvent);
      } else if (availableEvents.length > 0) {
        // If no event selected but events exist, select the first one and load its data
        const firstEvent = availableEvents[0];
        setSelectedEvent(firstEvent);
        loadEventAttendance(firstEvent);
      } else {
        // No events available
        setEventAttendanceData([]);
      }
    }
  };

  // This effect ensures event attendance is loaded when the tab changes to 'events'
  // or when a new event is selected within the 'events' tab.
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
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <p className="text-muted-foreground">Controla la asistencia y horas de trabajo de los empleados</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            Ver Calendario
          </Button>
          {/* Pass eventType to CheckInDialog for regular attendance */}
          <CheckInDialog onRegister={fetchAttendanceData} onTableUpdate={fetchRegularAttendanceTableData} eventType="regular" />
          <EventCheckInDialog 
            availableEvents={availableEvents} 
            onCreateEvent={(newEventName) => {
              setAvailableEvents((prevEvents) => [...prevEvents, newEventName]);
              setSelectedEvent(newEventName);
              setActiveTab("events");
              // Call loadEventAttendance to fetch data for the newly created event
              // Note: loadEventAttendance is called by the useEffect when selectedEvent changes and activeTab is 'events'
              toast.success("Evento creado correctamente", {
                description: "Puede comenzar a registrar asistencias para este evento."
              });
            }}
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-10">
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
        <Input
          placeholder="Buscar empleado..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/4"
        />

        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
          <SelectTrigger className="w-1/3 border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500">
            <SelectValue placeholder="Seleccionar Departamento" className="departamento"/>
          </SelectTrigger>
          <SelectContent>
            {Departments.map(dept => (
              <SelectItem key={dept.value} value={dept.value}>
                <span role="img" aria-label={dept.label}></span> {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

      {/* Sección de pestañas */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="regular">Asistencia Diaria</TabsTrigger>
          <TabsTrigger value="events">Asistencia en Eventos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Asistencia Diaria</CardTitle>
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
                            <TableHead>Observación/Novedad</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {/* The '4 passes' logic: This needs to be implemented here in the frontend display.
                           You would group `currentRecords` by user and date, then display up to 4 entry/exit pairs.
                           For now, we'll display each entry/exit pair as a separate row from the backend.
                           To combine them into a single row, you'd need to process `currentRecords`
                           to aggregate entries/exits for the same user on the same date/event.
                        */}
                        {currentRecords.map((item) => ( // Changed 'item' from '{ id, nombre, departamento, entrada, salida, estado, fecha }'
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
                              {item.estado === 1 ? ( // 1 means complete (entry and exit)
                                <Badge variant="presente">Completo</Badge>
                              ) : ( // 0 means only entry (open) or no attendance
                                <Badge variant="no_asistio">Pendiente</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDateForDisplay(item.fecha)}</TableCell>
                            <TableCell>{item.observacion || "No registra novedades"}</TableCell> {/* Muestra la observación */}
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
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Asistencia en Eventos</CardTitle>
              <CardDescription>Registro de asistencia por evento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Evento: {selectedEvent || "Selecciona un evento"}</h3>
                <Select 
                  value={selectedEvent} 
                  onValueChange={(value) => {
                    setSelectedEvent(value);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvents.map(event => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEvent ? (
                <>
                  {isLoading ? ( // Using main isLoading for event tab as well
                    <div className="text-center p-8">
                      <div className="h-6 w-6 animate-spin mx-auto mb-2">⟳</div>
                      <p>Cargando datos...</p>
                    </div>
                  ) : eventAttendanceData.length === 0 ? (
                    <div className="text-center p-8 border rounded-md">
                      <p className="text-muted-foreground">No hay asistencias registradas para este evento.</p>
                    </div>
                  ) : (
                    <Table>
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
                        {eventAttendanceData.map((attendee) => (
                          <TableRow key={attendee.id}>
                            <TableCell>{attendee.nombre}</TableCell>
                            <TableCell>{attendee.departamento}</TableCell>
                            <TableCell>{formatTimeForDisplay(attendee.entrada) || "No registrada"}</TableCell>
                            <TableCell>{formatTimeForDisplay(attendee.salida) || "No registrada"}</TableCell>
                            <TableCell>
                              <Badge variant={attendee.estado === 1 ? "presente" : "no_asistio"}>
                                {attendee.estado === 1 ? "Completo" : "Pendiente"} {/* Estado 0 para entrada, 1 para salida */}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
  );
}