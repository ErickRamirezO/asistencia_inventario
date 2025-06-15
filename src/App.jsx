import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
//import ProtectedRoute from "./components/ProtectedRoute"
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
import ListaMonitoreo from "./pages/monitoreo/ListaMonitoreo"
import Inventarios from "./pages/inventario/Inventarios";
import InventarioDetalle from "./pages/inventario/InventarioDetalle"
import RealizarInventario  from "./pages/inventario/RealizarInventario"
import VerBienes from "./pages/inventario/VerBienes"
import CategoriaStock from "./pages/inventario/CategoriaStock"
import LugaresView from "./pages/lugares/LugaresView"
import CambioEncargadoView from "./pages/inventario/CambioEncargadoView"
//import BienesInventario from "./pages/inventario/Inventarios";

//import Inventarios from "./pages/inventario/Inventarios"
//import AsistenciaSimple from "./pages/asistenciaSimple"

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

        
        {/* Todas las demás rutas dentro del Layout */}
        <Route element={<Layout />}>
          <Route path="/reporteAsistencia" element={<ReporteAsistencia />} />
          <Route path="/verUsuarios" element={<VerUsuario />} />
          <Route path="/usuarios/editar/:id" element={<FormularioUsuario key="editar"/>} />
          <Route path="/usuarios/registrar" element={<FormularioUsuario key="registrar"/>} />
          <Route path="/turnosLaborales" element={<TurnosLaborales />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/bienes/registro" element={<RegistroBienes />} />
          <Route path="/bienes/categoria" element={<Categoria/>}/>
          <Route path="/departamentos" element={<Departamentos/>}/>
          <Route path="/lista-monitoreo" element={<ListaMonitoreo/>}/>
          <Route path="/monitoreo-tag" element={<MonitoreoView/>}/>
          <Route path="/bienes/inventario" element={<Inventarios/>}/>
          <Route path="/inventarios/:id/ver" element={<InventarioDetalle />} />
          <Route path="/inventarios/:id/realizar" element={<RealizarInventario />} />
          <Route path="/bienes/lista-bienes" element={<VerBienes/>} />
          <Route path="/bienes/registro/:id" element={<RegistroBienes />} />
          <Route path="/bienes/categoria/stock" element={<CategoriaStock />}/>
          <Route path="/lugar" element={<LugaresView/>} />
          <Route path="/cambio-encargado" element={<CambioEncargadoView/>}/>
          {/* Agregar otras rutas aquí */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App