// src/components/NoAutorizado.jsx
import { useNavigate } from "react-router-dom";

function NoAutorizado() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior en el historial
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        No Autorizado
      </h1>
      <p className="text-gray-700 mb-4">
        No tienes permiso para acceder a esta página.
      </p>
      <button
        onClick={handleGoBack}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Volver a la página anterior
      </button>
    </div>
  );
}

export default NoAutorizado;