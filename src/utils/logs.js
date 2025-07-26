import api from "./axios";

export const crearLog = async (descripcionTarea, usuariosIdusuarios) => {
  try {
    await api.post("/logs", {
      descripcionTarea,
      usuariosIdusuarios,
    });
  } catch (error) {
    console.error("Error al crear log:", error);
  }
};