import { useEffect, useRef } from "react";
import { useUser } from "./utils/UserContext";
import { toast } from "sonner";

const TOAST_ID = "terminos-toast";

export default function TerminosToast() {
  const { user, aceptarTerminos } = useUser();
  const toastShown = useRef(false);

  useEffect(() => {
    const aceptoTerminosLocal = localStorage.getItem("aceptoTerminos");
    if (user && !user.aceptoTerminos && aceptoTerminosLocal !== "true" && !toastShown.current) {
      toastShown.current = true;
      toast(
        "Debe aceptar los Términos y Condiciones para continuar.",
        {
          id: TOAST_ID,
          description: (
            <span>
              Lea los <a href="/terminos" className="underline text-primary" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
            </span>
          ),
          action: {
            label: "Aceptar",
            onClick: async () => {
              await aceptarTerminos();
              localStorage.setItem("aceptoTerminos", "true");
              toast.dismiss(TOAST_ID);
              toastShown.current = false;
            }
          },
          cancel: {
            label: "Rechazar",
            onClick: () => {
              localStorage.setItem("aceptoTerminos", "false");
              toast.dismiss(TOAST_ID);
              toastShown.current = false;
            }
          },
          duration: 999999,
          position: "top-center",
          closeButton: true,
        }
      );
    }
    // Oculta el toast si ya aceptó
    if (user && (user.aceptoTerminos || aceptoTerminosLocal === "true")) {
      toast.dismiss(TOAST_ID);
      toastShown.current = false;
    }
  }, [aceptarTerminos, user]);
  return null;
}