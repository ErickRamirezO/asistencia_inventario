import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import api from "@/utils/axios";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";

export default function AsistenciaSimple() {
  const { user } = useUser();
  const [rfidTag, setRfidTag] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [scanningRFID, setScanningRFID] = useState(false);
  const [exitUserInfo, setExitUserInfo] = useState(null);
  const [savedTempRfidTag, setSavedTempRfidTag] = useState("");
  const [exitProcessing, setExitProcessing] = useState(false);
  const [exitReasonType, setExitReasonType] = useState("");
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [exitStatus, setExitStatus] = useState(null); // null, "exit", "return"
  const [forceKeepOpen, setForceKeepOpen] = useState(false);

  // Use a ref to track the last processed tag
  const lastProcessedTag = useRef("");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const fetchUserInfo = useCallback(async (tag) => {
    if (processing) return;
    setProcessing(true);
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/usuarios/tag/${tag}`);
      setUserInfo(response.data);

      setTimeout(() => {
        setUserInfo(null);
        setRfidTag("");
        if (inputRef.current) {
          inputRef.current.focus();
        }
        setProcessing(false);
        // Reset the last processed tag after the timeout
        lastProcessedTag.current = "";
      }, 3000);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Usuario no encontrado");
      setUserInfo(null);
      toast.error("Usuario no encontrado para este Tag", {
        richColors: true,
      });
      crearLog(
        `ERROR: Usuario no encontrado para el tag ${tag}`,
        user.userId
      );
      setTimeout(() => {
        setError(null);
        setRfidTag("");
        if (inputRef.current) {
          inputRef.current.focus();
        }
        setProcessing(false);
        // Reset the last processed tag after the timeout
        lastProcessedTag.current = "";
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [processing]);

  const verificarEstadoSalida = async (userId) => {
    // Validación del usuarioId
    if (!userId) {
      console.error("El ID del usuario es nulo o inválido.");
      setError("El ID del usuario es nulo o inválido.");
      await crearLog(
        `ERROR: El ID del usuario es nulo o inválido al verificar estado de salida`,
        user.userId
      );
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/asistencias/estado-salida/${userId}`);
      // Validar si alcanzó el límite de salidas temporales
      if (response.data.limiteAlcanzado) {
        return { ...response.data, puedeRegistrar: false };
      }

      return { ...response.data, puedeRegistrar: true };
    } catch (error) {
      console.error("Error al verificar el estado de salida:", error);
      setError(error.message);
      toast.error("Error al verificar el estado de salida", {
        richColors: true,
      });
      await crearLog(
        `ERROR: No se pudo verificar el estado de salida del usuario ${userId}: ${error.message}`,
        user.userId
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerAttendance = useCallback(async (tag) => {
    if (!tag) {
      return;
    }
 
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/asistencias/registrar", { rfid: tag });
      if (response.status === 200) {
        const { mensaje } = response.data;
        toast.success(mensaje,{
          richColors: true,
        });
        crearLog(
          `INFO: Asistencia registrada para el tag ${tag}`,
          user.userId
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.mensaje, {
          richColors: true,
        });
        crearLog(
          `ERROR: No se pudo registrar asistencia para el tag ${tag}: ${error.response.data.mensaje}`,
          user.userId
        );
      } else {
        toast.error("Error al registrar asistencia", {
          description: "No se pudo conectar con el servidor.",
          richColors: true,
        });
        crearLog(
          `ERROR: No se pudo registrar asistencia para el tag ${tag}: ${error.message}`,
          user.userId
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTagChange = (e) => {
    const tag = e.target.value;
    setRfidTag(tag);
    console.log("RFID Tag changed:", tag);
  };

  // Handle too long tags
  useEffect(() => {
    if (rfidTag.length < 50) {
      setRfidTag(rfidTag.substring(0, 50));
    }
  }, [rfidTag]);

  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;

    const handleKeyPress = (event) => {
      if (!scanningRFID) return;

      const currentTime = new Date().getTime();

      if (currentTime - lastKeyTime > 500 && buffer.length > 0) {
        buffer = '';
      }

      lastKeyTime = currentTime;

      if (event.key === 'Enter') {
        if (buffer.length >= 8) {
          if (!exitProcessing) { // Check if exit is already processing
            setSavedTempRfidTag(buffer);
            // Set force keep open to true immediately to prevent dialog from closing
            setForceKeepOpen(true);
            checkExitStatusAndFetchUserInfo(buffer);
          }
        }
        buffer = '';
      } else if (event.key.match(/[a-zA-Z0-9]/)) {
        buffer += event.key;
      }
    };

    if (scanningRFID) {
      window.addEventListener('keypress', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [scanningRFID, exitProcessing]);

  // New function to check exit status and fetch user info
  const checkExitStatusAndFetchUserInfo = async (tag) => {
    try {
      // First get the user info
      const userResponse = await api.get(`/usuarios/tag/${tag}`);
      console.log("User info response:", userResponse.data);
      // Validate user info
      if (!userResponse.data || !userResponse.data.id) {
        console.error("No se pudo obtener la información del usuario o el ID es inválido.");
        toast.error("No se pudo obtener la información del usuario para este Tag", {
          richColors: true,
        });
        setExitUserInfo(null);
        setExitStatus(null);
        setScanningRFID(false);
        setForceKeepOpen(true);
        return;
      }

      // Set user info first
      setExitUserInfo(userResponse.data);

      // Then use our dedicated function to check exit status
      const statusData = await verificarEstadoSalida(userResponse.data.id);

      if (!statusData) {
        // Error occurred in verificarEstadoSalida
        setForceKeepOpen(false);
        return;
      }

      // Validar si alcanzó el límite de salidas temporales
      if (statusData.limiteAlcanzado) {
        setExitStatus(null);
        setShowReasonForm(false);
        setScanningRFID(false);
        setForceKeepOpen(false);
        toast.error("Ya no puede registrar más salidas temporales hoy.", {
          richColors: true,
        });
        await crearLog(
          `ERROR: El usuario ${userResponse.data.id} alcanzó el límite de salidas temporales`,
          user.userId
        );
        return;
      }

      if (statusData.pendiente) {
        // User has a pending exit, should register return
        setExitStatus("return");
        setScanningRFID(false);
        setForceKeepOpen(false);
        toast.info("Registrando regreso de salida temporal...", {
          richColors: true,
        });
        await crearLog(
          `INFO: Registrando regreso de salida temporal para el usuario ${userResponse.data.id}`,
          user.userId
        );
      } else {
        // User doesn't have a pending exit, show the form
        setExitStatus("exit");
        setShowReasonForm(true);
        setScanningRFID(false);
        toast.success("Tarjeta detectada correctamente", {
          description: "Seleccione el motivo de la salida temporal",
          richColors: true,
        });
        setForceKeepOpen(false);
      }
    } catch (error) {
      console.error("Error checking exit status:", error);
      setExitUserInfo(null);
      setExitStatus(null);
      setScanningRFID(false);
      setForceKeepOpen(false);
      toast.error("Error al verificar el estado de salida", {
        richColors: true,
      });
      await crearLog(
        `ERROR: No se pudo verificar el estado de salida del usuario: ${error.message}`,
        user.userId
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full" style={{ height: "80vh" }}>
      <Card className="w-96">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-base sm:text-lg text-center">Registro de Asistencia</CardTitle>
          <CardDescription className="text-xs md:text-[13px] sm:text-sm text-center">Ingrese el tag RFID</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Input
            ref={inputRef}
            placeholder="Escanear Tag RFID"
            value={rfidTag}
            onChange={handleTagChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (rfidTag.length > 0 && !processing) {
                  // Procesa el tag solo cuando se presiona Enter
                  fetchUserInfo(rfidTag);
                  registerAttendance(rfidTag);
                  setRfidTag(""); // Limpia el input después de procesar
                }
              }
            }}
            className="w-full text-xs"
          />
          {isLoading && <p className="text-xs mt-2">Cargando...</p>}
          {userInfo && (
            <div className="mt-4 w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-sm">
                    {userInfo.nombre} {userInfo.apellido}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Cédula: {userInfo.cedula}</p>
                  <p>Departamento: {userInfo.departamentoNombre}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}