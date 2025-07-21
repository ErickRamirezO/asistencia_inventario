import { createContext, useContext, useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./axios";
import { useNavigate, useLocation  } from "react-router-dom";
import { toast } from "sonner";

export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const toastShown = useRef(false); // <-- bandera para controlar el toast
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
      setUser({ ...decoded, rol, aceptoTerminos });

      // Mostrar toast solo si no ha sido mostrado antes
      if (!aceptoTerminos) {
        if (!toastShown.current) {
          toastShown.current = true;
          toast(
            "Debe aceptar los Términos y Condiciones para continuar.",
            {
              description: (
                <span>
                  Lea los <a href="/terminos" className="underline text-primary" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
                </span>
              ),
              action: {
                label: "Aceptar",
                onClick: async () => {
                  await aceptarTerminos();
                  toastShown.current = false; // Permitir mostrar de nuevo si es necesario
                }
              },
              cancel: {
                label: "Rechazar",
                onClick: () => {
                  toastShown.current = false; // Permitir mostrar de nuevo si es necesario
                }
              },
              duration: 999999,
              position: "top-center",
              closeButton: true,
            }
          );
        }
      } else {
        toastShown.current = false; // Resetear si ya aceptó
        if (location.pathname === "/login" || location.pathname === "/") {
          const redirectPath = roleBasedRedirects[rol] || "/no-autorizado";
          navigate(redirectPath, { replace: true });
        }
      }
    } catch {
      setUser(null);
      toastShown.current = false;
    }
  };

  useEffect(() => {
    if (token) {
      fetchAndSetUser(token);
    } else {
      setUser(null);
      toastShown.current = false;
    }
    // eslint-disable-next-line
  }, [token]);

  const aceptarTerminos = async () => {
    if (user && user.userId) {
      await api.patch(`/usuarios/${user.userId}/aceptar-terminos`, { aceptoTerminos: true });
      setUser({ ...user, aceptoTerminos: true });
      const redirectPath = roleBasedRedirects[user.rol] || "/no-autorizado";
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, aceptarTerminos }}>
      {children}
    </UserContext.Provider>
  );
}