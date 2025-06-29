"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom"
import { Package, Users,Shapes ,LogOut,MapPinHouse, LayoutDashboard, Clipboard, Settings,ClipboardPlus ,Bookmark,Building, FileText, CalendarClock, UserPlus, Eye, Calendar, Archive, Box, Tag, ClipboardCheck, MapPin, Boxes,LocateFixed} from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
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

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [defaultOpen, setDefaultOpen] = useState(true)
  const { user, setUser } = useUser();

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

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-screen ">
        <Sidebar>
          <SidebarHeader>
  <div className="flex justify-center gap-2 p-4">
    <img src={logo} alt="Logo" className="h-20 w-auto" />

  </div>
</SidebarHeader>

          
          <SidebarContent>
            <SidebarMenu>
              
               {(user?.rol === "Administrador" || user?.rol === "Encargado de Bodega") && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link to="/bienes/inventario">
                    <Package className="h-5 w-5" />
                    <span>Inventario</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )}
             {(user?.rol === "Administrador" || user?.rol === "Usuario") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/asistencia")}>
                    <Link to="/asistencia">
                      <Clipboard className="h-5 w-5" />
                      <span>Registrar Asistencia</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {user?.rol === "Administrador" && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/asistencia/evento")}>
                      <Link to="/asistencia-evento">
                        <Bookmark className="h-5 w-5" />
                        <span>Eventos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/asistencia-dashboard")}>
                      <Link to="/asistencia-dashboard">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Asistencia</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
{user?.rol === "Administrador" && (
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Users className="h-5 w-5" />
                      <span>Control de usuarios</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")}>
                          <Link to="/usuarios/registrar">
                            <UserPlus className="h-5 w-5" />
                            <span>Registrar usuarios</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/verUsuarios">
                            <Eye className="h-5 w-5" />
                            <span>Ver usuarios</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/turnosLaborales">
                            <Calendar className="h-5 w-5" />
                            <span>Crear turnos laborales</span>
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
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Boxes className="h-5 w-5" />
                      <span>Bienes</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")}>
                          <Link to="/bienes/registro">
                            <Archive className="h-5 w-5" />
                            <span>Registrar bienes de la empresa</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/bienes/lista-bienes">
                            <Box className="h-5 w-5" />
                            <span>Bienes empresariales</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                       <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/cambio">
                            <Users className="h-5 w-5" />
                            <span>Cambio de encargado</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/bienes/categoria">
                            <Tag className="h-5 w-5" />
                            <span>Categoría de Bienes empresariales</span>
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
                <Collapsible defaultOpen className="group/collapsible">
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
                        <SidebarMenuButton asChild isActive={isActive("/inventory")}>
                          <Link to="/departamentos">
                            <Shapes className="h-5 w-5" />
                            <span>Departamentos</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      )}
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")}>
                          <Link to="/lugar">
                            <MapPinHouse className="h-5 w-5" />
                            <span>Lugares de Monitoreo</span>
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
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <LocateFixed className="h-5 w-5" />
                      <span>Reportes</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/inventory")}>
                          <Link to="/reporteAsistencia">
                            <ClipboardCheck className="h-5 w-5" />
                            <span>Reporte de asistencia</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/monitoreo-tag">
                            <MapPin className="h-5 w-5" />
                            <span>Monitoreo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/lista-monitoreo">
                            <ClipboardPlus className="h-5 w-5" />
                            <span>Reporte Monitoreo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton asChild isActive={isActive("/new-feature")}>
                          <Link to="/new-feature">
                            <CalendarClock className="h-5 w-5" />
                            <span>Crear turnos laborales</span>
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
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span>Mi Cuenta</span>
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
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background  md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">
                {location.pathname === "/" && "Dashboard"}
                {location.pathname === "/empresas" && "Gestión de Empresas"}
                {location.pathname === "/departamentos" && "Gestión de Departamentos"}
                {location.pathname === "/empleados" && "Gestión de Empleados"}
                {location.pathname === "/inventory" && "Gestión de Inventario"}
                {location.pathname === "/attendance" && "Control de Asistencia"}
              </h1>
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>AD</AvatarFallback>
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
          </header>

          {/* Page content */}
          <main className="flex-1 flex-col flex w-full">
            <div className="w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

