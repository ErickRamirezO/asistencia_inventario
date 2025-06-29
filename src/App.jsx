import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import ProtectedRoute from "./components/protectedRoute"
import Layout from "./components/layout"
import Login from "./pages/auth/login"
import AsistenciaSimple from "./pages/asistencia/asistenciaSimple"
import Asistencia from "./pages/asistencia/asistencia"
import ReporteAsistencia from "./pages/asistencia/reporteAsistencia"
import TurnosLaborales from "./pages/turnosLaborales"
import VerUsuario from "./pages/verUsuario"
import FormularioUsuario from "./pages/formularioUsuario"
import RegistroBienes from "./pages/inventario/registroBienes"
import Categoria from "./pages/inventario/categorias"
import Departamentos from "./pages/usuarios/departamentos"
import MonitoreoView from "./pages/monitoreo/MonitoreoView"
import ListaMonitoreo from "./pages/monitoreo/ListaMonitoreo"
import Inventarios from "./pages/inventario/Inventarios";
import InventarioDetalle from "./pages/inventario/InventarioDetalle"
import RealizarInventario  from "./pages/inventario/RealizarInventario"
import VerBienes from "./pages/inventario/VerBienes"
import CategoriaStock from "./pages/inventario/CategoriaStock"
import LugaresView from "./pages/lugares/LugaresView"
import CambioEncargadoView from "./pages/inventario/CambioEncargadoView"
import AsistenciaEvento from "./pages/asistencia/asistenciaEvento"
import RecuperarContrasena from "./pages/auth/recuperarContrasena"
import CambiarContrasena from "./pages/auth/cambiarContrasena"
import ProfilePage from "./pages/perfil"
import DocumentosCambioView from "./pages/inventario/DocumentosCambioView"
import HistorialDocumentoView from "./pages/inventario/HistorialDocumentoView"

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />

        {/* Rutas que requieren estar logueado */}
        <Route element={<ProtectedRoute allowedRoles={["Administrador", "Encargado de Bodega", "Usuario"]} />}>
          <Route element={<Layout />}>
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/asistencia" element={<AsistenciaSimple />} />
            {/* Rutas solo para Administrador */}
            <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
              <Route path="/reporteAsistencia" element={<ReporteAsistencia />} />
              <Route path="/verUsuarios" element={<VerUsuario />} />
              <Route path="/usuarios/editar/:id" element={<FormularioUsuario key="editar"/>} />
              <Route path="/usuarios/registrar" element={<FormularioUsuario key="registrar"/>} />
              <Route path="/turnosLaborales" element={<TurnosLaborales />} />
              <Route path="/asistencia-dashboard" element={<Asistencia />} />
              <Route path="/asistencia-evento" element={<AsistenciaEvento/>} />
            </Route>

            {/* Rutas compartidas: Administrador y Encargado de Bodega */}
            <Route element={<ProtectedRoute allowedRoles={["Administrador", "Encargado de Bodega"]} />}>
              <Route path="/bienes/registro" element={<RegistroBienes />} />
              <Route path="/bienes/categoria" element={<Categoria/>}/>
              <Route path="/departamentos" element={<Departamentos/>}/>
              <Route path="/lista-monitoreo" element={<ListaMonitoreo/>}/>
              <Route path="/monitoreo-tag" element={<MonitoreoView/>}/>
              <Route path="/bienes/inventario" element={<Inventarios/>}/>
              <Route path="/inventarios/:id/ver" element={<InventarioDetalle />} />
              <Route path="/inventarios/:id/realizar" element={<RealizarInventario />} />
              <Route path="/cambio" element={<DocumentosCambioView />} />
              <Route path="/cambio/historial/:documentoId" element={<HistorialDocumentoView />} />

            </Route>          <Route path="/bienes/lista-bienes" element={<VerBienes/>} />
          <Route path="/bienes/registro/:id" element={<RegistroBienes />} />
          <Route path="/bienes/categoria/stock" element={<CategoriaStock />}/>
          <Route path="/lugar" element={<LugaresView/>} />
          <Route path="/cambio-encargado" element={<CambioEncargadoView/>}/>
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App