import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../utils/UserContext";

function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
}

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = token && isTokenValid(token);
  const { user } = useUser();

  // Mostrar loader mientras el usuario se inicializa si hay token válido
  if (isAuthenticated && user === null) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    // console.log("No autenticado, redirigiendo a /login");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el usuario no tiene el rol adecuado, redirigir
  if (allowedRoles && user) {
    // console.log("user.rol:", user.rol);
    if (!allowedRoles.includes(user.rol)) {
      // console.log("Rol no permitido, redirigiendo a /no-autorizado");
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // Si todo está bien, renderizar el contenido hijo
  return <Outlet />;
};

export default ProtectedRoute;