import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/layout"
import Login from "./pages/auth/login"
import Attendance from "./pages/asistencia"
import ReporteAsistencia from "./pages/reporteAsistencia"
import TurnosLaborales from "./pages/turnosLaborales"
import VerUsuario from "./pages/verUsuario"
import FormularioUsuario from "./pages/formularioUsuario"
import RegistroBienes from "./pages/inventario/registroBienes"
import Categoria from "./pages/inventario/categorias"
import Departamentos from "./pages/usuarios/departamentos"
import MonitoreoView from "./pages/monitoreo/MonitoreoView"
import RegistroMonitoreo from "./pages/monitoreo/RegistroMonitoreo"
import AsistenciaSimple from "./pages/asistenciaSimple"
function App() {
  return (
    <Router>
      {/* El Toaster debe estar fuera de Routes para estar disponible en toda la app */}
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Rutas públicas (accesibles sin autenticación) */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/registro" element={<Registro />} /> */}
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/monitoreo-tag" element={<MonitoreoView/>}/>
        <Route element={<ProtectedRoute />}>
          {/* Todas las demás rutas dentro del Layout */}
          <Route element={<Layout />}>
            <Route path="/reporteAsistencia" element={<ReporteAsistencia />} />
            <Route path="/verUsuarios" element={<VerUsuario />} />
            <Route path="/usuarios/editar/:id" element={<FormularioUsuario key="editar"/>} />
            <Route path="/usuarios/registrar" element={<FormularioUsuario key="registrar"/>} />
            <Route path="/turnosLaborales" element={<TurnosLaborales />} />
            <Route path="/attendance" element={<AsistenciaSimple />} />
            <Route path="/bienes" element={<RegistroBienes />} />
            <Route path="/categoria" element={<Categoria/>}/>
            <Route path="/departamentos" element={<Departamentos/>}/>
            <Route path="/lista-monitoreo" element={<RegistroMonitoreo/>}/>
          </Route>
          {/* Agregar otras rutas aquí */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App