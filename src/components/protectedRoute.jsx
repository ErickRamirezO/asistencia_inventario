import { Navigate, Outlet } from "react-router-dom";

const protectedRoute = () => {
  // Verificar si hay un token en localStorage
  const isAuthenticated = localStorage.getItem("token") !== null;
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar el contenido hijo
  return <Outlet />;
};

export default protectedRoute;