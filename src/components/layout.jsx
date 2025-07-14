"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom"
import { Package, Users,Shapes ,LogOut,MapPinHouse, LayoutDashboard, Clipboard, Settings,ClipboardPlus ,Bookmark,Building, UserPlus, Eye, Calendar, Archive, Box, Tag, ClipboardCheck, MapPin, FileText,LocateFixed} from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { getUserIdFromToken } from "@/pages/auth/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "./ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import logo from "../assets/LogoName.png"
import api from "@/utils/axios";
import { useUser } from "@/utils/UserContext";
import { ModeToggle } from "@/components/mode-toogle";

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [defaultOpen, setDefaultOpen] = useState(true)
  const { user, setUser } = useUser();
  const [userInitials, setUserInitials] = useState("AD");
  const [openIndex, setOpenIndex] = useState(null);

  const handleLogout = useCallback(async (event) => {
    event.stopPropagation(); // Evita la propagación del evento

    try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Enviamos el token al endpoint para invalidarlo
    await api.post('/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Eliminamos el token del localStorage
    localStorage.removeItem('token');

    setUser(null); // Establece el usuario como null
    
    // Redirigimos al login
    navigate('/login');
  } catch (error) {
    console.error('Error al cerrar sesión', error);
    // En caso de error, eliminamos igual el token local
    localStorage.removeItem('token');
    setUser(null); // Asegúrate de limpiar el contexto también en caso de error
    navigate('/login');
  }
  },[setUser, navigate]);

  // Detectar si estamos en móvil para cerrar el sidebar por defecto
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDefaultOpen(false)
      } else {
        setDefaultOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isActive = (path) => {
    return location.pathname === path
  }
useEffect(() => {
  const fetchUserInfo = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      const res = await api.get(`/usuarios/${userId}`);
      const { nombre, apellido } = res.data;
      if (nombre && apellido) {
        const initials = `${nombre[0]}${apellido[0]}`.toUpperCase();
        setUserInitials(initials);
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  fetchUserInfo();
}, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-screen ">
        <Sidebar>
          <SidebarHeader>
            <div className="flex justify-center gap-2 p-4b">
              <img src={logo} alt="Logo" className="h-20 w-auto" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {(user?.rol === "Administrador" || user?.rol === "Encargado de Bodega") && (
              <SidebarMenuItem>
                <Collapsible
                  open={openIndex === 0}
                  onOpenChange={() => setOpenIndex(openIndex === 0 ? null : 0)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Package className="h-5 w-5" />
                      <span>Gestión de Inventario</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/")} data-close-sidebar>
                          <Link to="/bienes/inventario">
                            <Package className="h-5 w-5" />
                            <span>Inventario</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")} data-close-sidebar>
                          <Link to="/bienes/registro">
                            <Archive className="h-5 w-5" />
                            <span>Registrar Bienes</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/bienes/lista-bienes">
                            <Box className="h-5 w-5" />
                            <span>Bienes Empresariales</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/cambio">
                            <Users className="h-5 w-5" />
                            <span>Cambio de Encargado</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/bienes/categoria">
                            <Tag className="h-5 w-5" />
                            <span>Categoría de Bienes</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              )}
              {user?.rol === "Administrador" && (
              <SidebarMenuItem>
                <Collapsible
                  open={openIndex === 1}
                  onOpenChange={() => setOpenIndex(openIndex === 1 ? null : 1)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Clipboard className="h-5 w-5" />
                      <span>Gestión de Asistencia</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/asistencia-dashboard")} data-close-sidebar>
                          <Link to="/asistencia-dashboard">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Ver Asistencias</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/turnosLaborales">
                            <Calendar className="h-5 w-5" />
                            <span>Crear turnos laborales</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/asistencia/evento")} data-close-sidebar>
                          <Link to="/asistencia-evento">
                            <Bookmark className="h-5 w-5" />
                            <span>Eventos</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}
            {user?.rol === "Administrador" && (
              <SidebarMenuItem>
                <Collapsible
                  open={openIndex === 2}
                  onOpenChange={() => setOpenIndex(openIndex === 2 ? null : 2)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Users className="h-5 w-5" />
                      <span>Control de Usuarios</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")} data-close-sidebar>
                          <Link to="/usuarios/registrar">
                            <UserPlus className="h-5 w-5" />
                            <span>Registrar Usuarios</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/verUsuarios">
                            <Eye className="h-5 w-5" />
                            <span>Ver Usuarios</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}
            {(user?.rol === "Administrador" || user?.rol === "Encargado de Bodega")&& (
              <SidebarMenuItem>
                <Collapsible
                  open={openIndex === 3}
                  onOpenChange={() => setOpenIndex(openIndex === 3 ? null : 3)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Building className="h-5 w-5" />
                      <span>Empresa</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {(user?.rol === "Administrador" )&& (
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")} data-close-sidebar>
                          <Link to="/departamentos">
                            <Shapes className="h-5 w-5" />
                            <span>Departamentos</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      )}
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")} data-close-sidebar>
                          <Link to="/lugar">
                            <MapPinHouse className="h-5 w-5" />
                            <span>Gestión de lugares</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}
            {(user?.rol === "Administrador" )&& (
              <SidebarMenuItem>
                <Collapsible
                  open={openIndex === 4}
                  onOpenChange={() => setOpenIndex(openIndex === 4 ? null : 4)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FileText className="h-5 w-5" />
                      <span>Reportes</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")} data-close-sidebar>
                          <Link to="/reporteAsistencia">
                            <Clipboard className="h-5 w-5" />
                            <span>Reporte de Asistencia</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/lista-monitoreo">
                            <ClipboardPlus className="h-5 w-5" />
                            <span>Reporte Monitoreo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}
            {(user?.rol === "Administrador" )&& (
              <SidebarMenuItem>
                <Collapsible
                  open={openIndex === 5}
                  onOpenChange={() => setOpenIndex(openIndex === 5 ? null : 5)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <LocateFixed className="h-5 w-5" />
                      <span>Monitoreos</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/asistencia")} data-close-sidebar>
                          <Link to="/asistencia">
                            <ClipboardCheck className="h-5 w-5" />
                            <span>Registrar Asistencia</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")} data-close-sidebar>
                          <Link to="/monitoreo-tag">
                            <MapPin className="h-5 w-5" />
                            <span>Configurar monitoreo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-8 w-8 mr-2 rounded-full bg-gray-700 text-xs md:text-[13px] sm:text-sm text-black font-semibold justify-center items-center flex">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-neutral-200 dark:bg-neutral-100 text-black">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>Mi Cuentamm</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem  onClick={() => navigate('/perfil')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        {/* Main content */}
        <div className="flex-1 flex-col flex w-full ">
          {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-gray-900 text-white md:bg-background md:text-black md:px-6">            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-white md:text-black md:dark:text-white">
                {location.pathname === "/" && "Dashboard"}
                {location.pathname === "/empresas" && "Gestión de Empresas"}
                {location.pathname === "/departamentos" && "Gestión de Departamentos"}
                {location.pathname === "/empleados" && "Gestión de Empleados"}
                {location.pathname === "/bienes/registro" && "Registro de Bienes"}
                {location.pathname === "/asistencia-dashboard" && "Control de Asistencia"}
                {location.pathname === "/asistencia" && "Toma de Asistencia"}
                {location.pathname === "/asistencia-evento" && "Gestión de eventos"}
                {location.pathname === "/cambio-encargado" && "Cambio de encargado"}
                {location.pathname === "/cambio" && "Cambio de encargado"}
                {location.pathname === "/bienes/categoria" && "Categoria"}
                {location.pathname === "/cambio/historial/:documentoId" && "Acta de Cambio"}
                {location.pathname === "/turnosLaborales" && "Turnos Laborales"}
                {location.pathname === "/bienes/inventario" && "Inventario"}
                {location.pathname === "/usuarios/registrar" && "Gestión Usuario"}
                {location.pathname === "/lista-monitoreo" && "Gestión de Monitoreo"}
                {location.pathname === "/monitoreo-tag" && "Monitoreo"}
                {location.pathname === "/reporteAsistencia" && "Reporte de Asistencia"}
                {location.pathname === "/verUsuarios" && "Lista de Usuarios"}
                {location.pathname === "/bienes/lista-bienes" && "Bienes Inmuebles Registrados"}
                {location.pathname === "/lugar" && "Lugares"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 mr-8 rounded-full bg-gray-900 text-black flex items-center justify-center text-xs font-semibold">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-black">{userInitials}</AvatarFallback>
                  </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 flex-col flex w-full">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

