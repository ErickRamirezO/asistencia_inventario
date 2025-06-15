import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./axios";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 
  const roleBasedRedirects = {
    Administrador: "/verUsuarios",
    Usuario: "/asistencia",
    "Encargado de Bodega": "/bienes/inventario",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        api.get(`/usuarios/${decoded.userId}/rol`).then((rolResponse) => {
          const rol = rolResponse.data;
          setUser({ ...decoded, rol: rol});
          // Redirigir a la ruta por defecto según el rol
          const redirectPath = roleBasedRedirects[rol] || "/no-autorizado";
          navigate(redirectPath);
        });
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}