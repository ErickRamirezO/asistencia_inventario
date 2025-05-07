import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import Layout from "./components/layout"
import Attendance from "./pages/asistencia"
import ReporteAsistencia from "./pages/reporteAsistencia"
import TurnosLaborales from "./pages/turnosLaborales"
import RegistrarUsuario from "./pages/registrarUsuario"
import VerUsuario from "./pages/verUsuario"
import RegistroBienes from "./pages/inventario/registroBienes"


function App() {
  return (
    // <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            {/* <Route path="/inventory" element={<Inventory />} /> */}
            <Route path="/reporteAsistencia" element={<ReporteAsistencia />} />
            <Route path="/verUsuarios" element={<VerUsuario />} />
            <Route path="/registrarUsuario" element={<RegistrarUsuario />} />
            <Route path="/turnosLaborales" element={<TurnosLaborales/>} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/bienes" element ={<RegistroBienes/>} />
            
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    // </ThemeProvider>
  )
}

export default App

