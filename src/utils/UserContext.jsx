import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./axios";
import { useNavigate, useLocation } from "react-router-dom";

export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const roleBasedRedirects = {
    Administrador: "/verUsuarios",
    Usuario: "/asistencia",
    "Encargado de Bodega": "/bienes/inventario",
  };
  const token = localStorage.getItem("token");

  const fetchAndSetUser = async (token) => {
    try {
      const decoded = jwtDecode(token);
      const [rolResponse, usuarioResponse] = await Promise.all([
        api.get(`/usuarios/${decoded.userId}/rol`),
        api.get(`/usuarios/${decoded.userId}`)
      ]);
      const rol = rolResponse.data;
      const aceptoTerminos = usuarioResponse.data.aceptoTerminos;
      const userData = { ...decoded, rol, aceptoTerminos };
      setUser(userData);

      // Redirección si corresponde
      if (aceptoTerminos && (location.pathname === "/login" || location.pathname === "/")) {
        const redirectPath = roleBasedRedirects[rol] || "/no-autorizado";
        navigate(redirectPath, { replace: true });
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAndSetUser(token);
    } else {
      setUser(null);
    }
    // eslint-disable-next-line
  }, [token]);

  const aceptarTerminos = async () => {
    if (user && user.userId) {
      await api.patch(`/usuarios/${user.userId}/aceptar-terminos`, { aceptoTerminos: true });
      setUser({ ...user, aceptoTerminos: true });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, aceptarTerminos }}>
      {children}
    </UserContext.Provider>
  );
}