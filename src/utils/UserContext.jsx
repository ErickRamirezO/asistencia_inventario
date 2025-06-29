import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./axios";
import { useNavigate, useLocation  } from "react-router-dom";

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

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Solo pide el rol si el usuario aún no está seteado o si cambió el userId
        if (!user || user.userId !== decoded.userId) {
          api.get(`/usuarios/${decoded.userId}/rol`).then((rolResponse) => {
            const rol = rolResponse.data;
            setUser({ ...decoded, rol: rol });
            // Solo redirige si está en /login o /
            if (location.pathname === "/login" || location.pathname === "/") {
              const redirectPath = roleBasedRedirects[rol] || "/no-autorizado";
              navigate(redirectPath, { replace: true });
            }
          });
        }
      } catch {
        setUser(null);
      }
    }
    // eslint-disable-next-line
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}