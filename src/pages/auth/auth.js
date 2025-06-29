import { jwtDecode } from "jwt-decode"; 

export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token"); // o sessionStorage
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.userId || null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};
