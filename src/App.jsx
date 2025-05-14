import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import Layout from "./components/layout"
import Login from "./pages/auth/login"
import Attendance from "./pages/asistencia"
import ReporteAsistencia from "./pages/reporteAsistencia"
import TurnosLaborales from "./pages/turnosLaborales"
import RegistrarUsuario from "./pages/registrarUsuario"
import VerUsuario from "./pages/verUsuario"
import RegistroBienes from "./pages/inventario/registroBienes"

function App() {
  return (
    <Router>
      {/* El Toaster debe estar fuera de Routes para estar disponible en toda la app */}
      <Toaster position="top-right" />
      
      <Routes>
        {/* Ruta de login fuera del Layout */}
        {/* <Route path="/" element={<Login />} /> */}
        
        {/* Todas las demás rutas dentro del Layout */}
        <Route element={<Layout />}>
          <Route path="/reporteAsistencia" element={<ReporteAsistencia />} />
          <Route path="/verUsuarios" element={<VerUsuario />} />
          <Route path="/registrarUsuario" element={<RegistrarUsuario />} />
          <Route path="/turnosLaborales" element={<TurnosLaborales />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/bienes" element={<RegistroBienes />} />
          {/* Agregar otras rutas aquí */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App