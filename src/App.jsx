import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import Layout from "./components/layout"
import Attendance from "./pages/asistencia"

function App() {
  return (
    // <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            {/* <Route path="/inventory" element={<Inventory />} /> */}
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    // </ThemeProvider>
  )
}

export default App

