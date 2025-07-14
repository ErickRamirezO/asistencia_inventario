import { useState, useEffect, useCallback } from "react";
import api from "@/utils/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Clock } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "../../components/ui/pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { toast } from "sonner";
import moment from "moment";

export default function Asistencia() {
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
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

  const recordsPerPage = 5;
  const eventRecordsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);

  const eventTotalPages = Math.ceil(
    eventAttendanceData.length / eventRecordsPerPage
  );
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, dateFilter]);

  useEffect(() => {
    setEventCurrentPage(1);
  }, [selectedEvent]);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowSize.width >= 768; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 170 // ajusta 200px según header + paddings
    : undefined;
  const inputHeight = isDesktop
    ? Math.max(15, Math.floor((availableHeight || 400) / 13))
    : 32;
  const labelHeight = isDesktop
    ? Math.max(8, Math.floor(inputHeight / 12))
    : 15;

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
        const formattedDepartments = response.data.map((dept) => ({
          label: dept.nombreDepartamento,
          value: dept.nombreDepartamento,
        }));
        setDepartments([
          { label: "Todos", value: "all" },
          ...formattedDepartments,
        ]);
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
        const response = await api.get(
          "/asistencias/eventos-disponibles-todos"
        );
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
          filtered = filtered.filter(
            (item) => item.departamento === selectedDepartment
          );
        }

        if (dateFilter && dateFilter !== "all") {
          const now = moment();
          filtered = filtered.filter((item) => {
            const itemDate = moment(item.fecha);
            if (dateFilter === "today") {
              return itemDate.isSame(now, "day");
            } else if (dateFilter === "thisWeek") {
              const startOfWeek = now.clone().startOf("week");
              const endOfWeek = now.clone().endOf("week");
              return itemDate.isBetween(startOfWeek, endOfWeek, null, "[]");
            } else if (dateFilter === "lastMonth") {
              const lastMonth = now.clone().subtract(1, "month");
              const startOfLastMonth = lastMonth.startOf("month");
              const endOfLastMonth = lastMonth.endOf("month");
              return itemDate.isBetween(
                startOfLastMonth,
                endOfLastMonth,
                null,
                "[]"
              );
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

  const currentRecords = isDesktop
    ? filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
      )
    : filteredData;
  const eventCurrentRecords = isDesktop
    ? eventAttendanceData.slice(
        (eventCurrentPage - 1) * eventRecordsPerPage,
        eventCurrentPage * eventRecordsPerPage
      )
    : eventAttendanceData;

  return (
    <div className="p-6 sm:p-6">
      <div
        className="max-w-6xl mx-auto"
        style={
          isDesktop ? { maxHeight: availableHeight, overflowY: "auto" } : {}
        }
      >
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
            <Card
              key={index}
              className="p-1 sm:p-2 h-full flex flex-col justify-center min-h-0"
              style={{ minHeight: 60, height: "auto" }}
            >
              <CardHeader className="pb-0 flex-1 flex flex-col items-center">
                <CardTitle className="text-xs md:text-[13px] sm:text-sm font-medium text-center leading-tight">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-1">
                <div className="text-sm sm:text-xl font-bold flex items-center justify-center text-center">
                  {icon} {value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros en una sola fila */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center">
          <div className="flex flex-col w-full sm:w-1/4">
            <label
              className="mb-1 text-xs md:text-[13px] sm:text-sm font-medium"
              style={{ minHeight: labelHeight }}
            >
              Buscar empleado
            </label>
            <Input
              placeholder="Buscar empleado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs md:text-[13px] sm:text-sm"
              style={{ minHeight: inputHeight }}
            />
          </div>

          <div className="flex flex-col w-full sm:w-1/4">
            <label
              className="mb-1 text-xs md:text-[13px] sm:text-sm font-medium"
              style={{ minHeight: labelHeight }}
            >
              Departamento
            </label>
            <Select
              onValueChange={setSelectedDepartment}
              value={selectedDepartment}
            >
              <SelectTrigger
                className="w-full border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 text-xs md:text-[13px] sm:text-sm"
                style={{ minHeight: inputHeight }}
              >
                <SelectValue
                  placeholder="Seleccionar Departamento"
                  className="departamento"
                />
              </SelectTrigger>
              <SelectContent>
                {Departments.map((dept) => (
                  <SelectItem
                    key={dept.value}
                    value={dept.value}
                    className="text-xs md:text-[13px] sm:text-sm"
                  >
                    <span role="img" aria-label={dept.label}></span>{" "}
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-1/4">
            <label
              className="mb-1 text-xs md:text-[13px] sm:text-sm font-medium"
              style={{ minHeight: labelHeight }}
            >
              Fecha
            </label>
            <Select onValueChange={setDateFilter} value={dateFilter}>
              <SelectTrigger
                className="w-full border border-gray-300 rounded-md bg-white p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 text-xs md:text-[13px] sm:text-sm"
                style={{ minHeight: inputHeight }}
              >
                <SelectValue placeholder="Seleccionar Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className="text-xs md:text-[13px] sm:text-sm"
                >
                  <span role="img" aria-label="Todos">
                    📅
                  </span>{" "}
                  Todos
                </SelectItem>
                <SelectItem
                  value="today"
                  className="text-xs md:text-[13px] sm:text-sm"
                >
                  <span role="img" aria-label="Hoy">
                    🗓️
                  </span>{" "}
                  Hoy
                </SelectItem>
                <SelectItem
                  value="thisWeek"
                  className="text-xs md:text-[13px] sm:text-sm"
                >
                  <span role="img" aria-label="Esta Semana">
                    📅
                  </span>{" "}
                  Esta Semana
                </SelectItem>
                <SelectItem
                  value="lastMonth"
                  className="text-xs md:text-[13px] sm:text-sm"
                >
                  <span role="img" aria-label="Mes Anterior">
                    📆
                  </span>{" "}
                  Mes Anterior
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sección de pestañas */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-4 flex flex-wrap gap-2">
            <TabsTrigger
              value="regular"
              className="text-xs md:text-[13px] sm:text-sm"
            >
              Asistencia Diaria
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="text-xs md:text-[13px] sm:text-sm"
            >
              Asistencia en Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="regular">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Registros de Asistencia Diaria
                </CardTitle>
                <CardDescription className="text-xs md:text-[13px] sm:text-sm">
                  Ver y gestionar los registros de asistencia de los empleados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <p className="text-xs md:text-[13px] sm:text-sm">
                    Cargando datos...
                  </p>
                )}
                {error && (
                  <p className="text-red-500 text-xs md:text-[13px] sm:text-sm">
                    {error}
                  </p>
                )}
                {!isLoading && !error && (
                  <>
                    {currentRecords.length === 0 ? (
                      <Alert variant="destructive">
                        <AlertTitle>No hay registros</AlertTitle>
                        <AlertDescription>
                          No se encontraron registros para la búsqueda o filtros
                          seleccionados.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <div className="max-h-[500px] overflow-y-auto">
                          <Table className="min-w-[700px] text-xs md:text-[13px] sm:text-sm">
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
                                    {item.entrada
                                      ? formatTimeForDisplay(item.entrada)
                                      : "No registra entrada"}
                                  </TableCell>
                                  <TableCell>
                                    {item.salida
                                      ? formatTimeForDisplay(item.salida)
                                      : "No registra salida"}
                                  </TableCell>
                                  <TableCell>
                                    {item.estado === 1 ? (
                                      <Badge variant="presente">Completo</Badge>
                                    ) : (
                                      <Badge variant="no_asistio">
                                        Pendiente
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {formatDateForDisplay(item.fecha)}
                                  </TableCell>
                                  <TableCell>
                                    {item.observacion ||
                                      "No registra novedades"}
                                  </TableCell>
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
                {currentRecords.length > 0 && isDesktop && (
                  <Pagination className="mt-4" style={{ minHeight: "48px" }}>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          aria-disabled={currentPage === 1}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          aria-disabled={currentPage === totalPages}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
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
                <CardTitle className="text-base sm:text-lg">
                  Asistencia en Eventos
                </CardTitle>
                <CardDescription className="text-xs md:text-[13px] sm:text-sm">
                  Registro de asistencia por evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs md:text-[13px] sm:text-sm font-semibold mb-2">
                      Evento:
                    </h3>
                    <Select
                      value={selectedEvent}
                      onValueChange={(value) => setSelectedEvent(value)}
                    >
                      <SelectTrigger className="text-xs md:text-[13px] sm:text-sm w-[200px] sm:w-[250px]">
                        <SelectValue
                          className="text-xs md:text-[13px] sm:text-sm"
                          placeholder="Seleccione el evento"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEvents.length === 0 ? (
                          <div className="px-4 py-2 text-muted-foreground text-sm">
                            No hay eventos disponibles
                          </div>
                        ) : (
                          availableEvents.map((event) => (
                            <SelectItem
                              className="text-xs md:text-[13px] sm:text-sm"
                              key={event}
                              value={event}
                            >
                              {event}
                            </SelectItem>
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
                        <div className="h-6 w-6 animate-spin mx-auto mb-2">
                          ⟳
                        </div>
                        <p>Cargando datos...</p>
                      </div>
                    ) : eventAttendanceData.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-xs md:text-[13px] sm:text-sm text-muted-foreground">
                          No hay asistencias registradas para este evento.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table className="min-w-[600px] text-xs md:text-[13px] sm:text-sm">
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
                            {eventCurrentRecords.map((attendee) => {
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
                                    {attendee.entrada
                                      ? formatTimeForDisplay(attendee.entrada)
                                      : "Falta registrar"}
                                  </TableCell>
                                  <TableCell>
                                    {attendee.salida
                                      ? formatTimeForDisplay(attendee.salida)
                                      : "Falta registrar"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={estadoBadge}>
                                      {estadoTexto}
                                    </Badge>
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
                    <p className="text-muted-foreground">
                      Selecciona un evento para ver las asistencias
                    </p>
                  </div>
                )}
                {eventCurrentRecords.length > 0 && isDesktop && (
                  <Pagination className="mt-4" style={{ minHeight: "48px" }}>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setEventCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          aria-disabled={eventCurrentPage === 1}
                          className={
                            eventCurrentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: eventTotalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={eventCurrentPage === i + 1}
                            onClick={() => setEventCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setEventCurrentPage((prev) =>
                              Math.min(prev + 1, eventTotalPages)
                            )
                          }
                          aria-disabled={eventCurrentPage === eventTotalPages}
                          className={
                            eventCurrentPage === eventTotalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
