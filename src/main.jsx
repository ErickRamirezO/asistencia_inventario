import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from "virtual:pwa-register";
import { UserProvider } from "./utils/UserContext";
import { BrowserRouter } from "react-router-dom";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Nueva versión disponible. ¿Deseas actualizar?")) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("La aplicación está lista para usarse offline.");
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
