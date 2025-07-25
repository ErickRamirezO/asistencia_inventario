"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";

export default function HistorialDocumentoView() {
  const { user } = useUser();
  const { documentoId } = useParams();
  const [historial, setHistorial] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);

  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowSize.width >= 768; // md: 768px breakpoint
  const availableHeight = isDesktop
    ? windowSize.height - 200 // ajusta 200px según header + paddings
    : undefined;

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await api.get(
          `/bienes-inmuebles/documento/${documentoId}/historial`
        );
        setHistorial(res.data);
      } catch {
        toast.error("Error al cargar el historial del documento");
        await crearLog(
          `ERROR: Error al cargar historial del documento ${documentoId}`,
          user.userId
        );
      }
    };
    fetchHistorial();
  }, [documentoId]);

  if (historial.length === 0) return null;

  const nuevoCustodio = `${historial[0]?.nombreUsuarioNuevo} ${historial[0]?.apellidoUsuarioNuevo}`;
  const responsable = `${historial[0]?.nombreUsuarioResponsable} ${historial[0]?.apellidoUsuarioResponsable}`;
  const fechaActa = new Date(historial[0]?.fechaCambio).toLocaleDateString(
    "es-EC",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false); // Restauramos después de imprimir
      }, 1000); // Espera adicional opcional
    }, 100); // Espera mínima para que React re-renderice
  };

  return (
    <div className="p-6 space-y-6 print-container">
      <div className="flex justify-between items-center mb-4 no-print">
        <Button
          variant="outline"
          onClick={() => navigate("/cambio")}
          className="text-xs md:text-[13px] sm:text-sm"
        >
          Volver a documentos
        </Button>
        <Button
          variant="blue"
          onClick={handlePrint}
          className="text-xs md:text-[13px] sm:text-sm"
        >
          Imprimir acta
        </Button>
      </div>

      <div
        className="p-2 print:overflow-visible print:max-h-none"
        style={
          isDesktop && !isPrinting
            ? { maxHeight: availableHeight, overflowY: "auto" }
            : {}
        }
      >
        <Card className="border rounded-md print:border-0 print:rounded-none print:shadow-none print:p-0 print:m-0">
          <CardHeader>
            <CardTitle>
              ACTA DE ENTREGA-RECEPCIÓN DE BIENES – Documento #{documentoId}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 print-unlimited-height card-content-print">
            <p className="text-justify leading-relaxed">
              En la ciudad de <strong>Sangolquí</strong>, a{" "}
              <strong>{fechaActa}</strong>, los suscritos señor/a{" "}
              <strong>{responsable}</strong>, quien entrega los bienes, y el/la
              señor/a <strong>{nuevoCustodio}</strong>, quien los recibe, en
              conocimiento de la dirección de la empresa{" "}
              <strong>X Empresa Tecnológica S.A.</strong>, y en presencia del
              personal delegado de la unidad de bienes institucionales, se
              constituyeron en las instalaciones para realizar la diligencia de
              constatación física y entrega-recepción correspondiente.
            </p>

            <p className="text-justify leading-relaxed mt-4">
              Al efecto, con la presencia de las personas mencionadas
              anteriormente, se procede a la entrega-recepción de los bienes
              clasificados como <strong>Propiedad Planta y Equipo</strong> y{" "}
              <strong>Bienes de Control Administrativo</strong>, de acuerdo al
              siguiente detalle:
            </p>

            <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm print:overflow-visible print:border-0 print:shadow-none print:rounded-none">
              <table className="w-full min-w-[800px] table-auto border-collapse text-sm text-gray-700 print-table">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-2 text-left hidden">Código</th>
                    <th className="px-4 py-2 text-left">Bien</th>
                    <th className="px-4 py-2 text-left">Modelo</th>
                    <th className="px-4 py-2 text-left">Marca</th>
                    <th className="px-4 py-2 text-left">Material</th>
                    <th className="px-4 py-2 text-left">Color</th>
                    <th className="px-4 py-2 text-left">Dimensiones</th>
                    <th className="px-4 py-2 text-left">Condición</th>
                    <th className="px-4 py-2 text-left">Ubicación</th>
                    <th className="px-4 py-2 text-left">Encargado Anterior</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 hidden  ">
                        {h.bien?.id || "—"}
                      </td>
                      <td className="px-4 py-2">{h.bien?.nombreBien || "—"}</td>
                      <td className="px-4 py-2">{h.bien?.modeloBien || "—"}</td>
                      <td className="px-4 py-2">{h.bien?.marcaBien || "—"}</td>
                      <td className="px-4 py-2">
                        {h.bien?.materialBien || "—"}
                      </td>
                      <td className="px-4 py-2">—</td>
                      <td className="px-4 py-2">
                        {h.bien?.dimensionesBien || "—"}
                      </td>
                      <td className="px-4 py-2">
                        {h.bien?.status === 1 ? "BUENO" : "REGULAR"}
                      </td>
                      <td className="px-4 py-2">
                        {h.bien?.ubicacionBien || "—"}
                      </td>
                      <td className="px-4 py-2">
                        {h.usuarioAnterior?.nombre}{" "}
                        {h.usuarioAnterior?.apellido}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-justify leading-relaxed mt-6">
              Se deja constancia que el custodio que recibe los bienes, señor
              Ing. <strong>{nuevoCustodio}</strong>, se encargará de velar por:
              el buen uso, la conservación, la administración y utilización, así
              también los custodios saliente y entrante certifican y garantizan
              que los bienes están siendo usados para fines Institucionales, sus
              condiciones son adecuadas y no se encuentran en riesgo de
              deterioro, de acuerdo con lo que estipulan los Arts. 7, 20, 44 y
              47 del Reglamento General Sustitutivo para la Administración,
              Utilización, Manejo y Control de los Bienes e Inventarios del
              Sector Público y con las Normas de Control Interno 406-07 y
              406-08.
            </p>

            <p className="text-justify leading-relaxed mt-4">
              En consecuencia y de conformidad a los datos procedentes, el señor
              Ing. <strong>{responsable}</strong> entrega a satisfacción al
              señor Ing. <strong>{nuevoCustodio}</strong>, quien recibe a
              satisfacción los bienes PROPIEDAD PLANTA Y EQUIPO y bienes DE
              CONTROL ADMINISTRATIVO, mismos que serán usados en el Departamento
              de Ciencias de la Computación ubicado en el edificio de postgrados
              bloque H planta baja.
            </p>

            <p className="text-justify leading-relaxed mt-4">
              Para constancia de lo actuado y en fe de conformidad y aceptación,
              suscriben la presente acta de entrega-recepción en cuatro
              ejemplares de igual tenor y efecto, las personas que intervienen
              en esta diligencia.
            </p>

            <div className="only-print grid grid-cols-2 gap-12 mt-10 text-sm text-center">
              <div>
                <p>___________________________________</p>
                <p className="mt-1">Ing. {responsable}</p>
                <p>Quien Entrega</p>
              </div>
              <div>
                <p>___________________________________</p>
                <p className="mt-1">Ing. {nuevoCustodio}</p>
                <p>Quien Recibe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <style>{` 
  @media print {
    @page {
      size: A4 portrait;
      margin: 1cm;
    }

    body {
      font-size: 12px;
      padding: 0;
    }

    .no-print {
      display: none !important;
    }

    .print-container {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      max-height: none !important;
      overflow: visible !important;
    }

    .print-unlimited-height,
    .card-content-print {
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
    }

    .overflow-x-auto {
      overflow-x: visible !important;
    }

    .print-table {
      width: 100% !important;
      min-width: unset !important;
      table-layout: auto !important;
      border-collapse: collapse !important;
      font-size: 10px !important;
    }

    .print-table th,
    .print-table td {
      border: 1px solid black !important;
      padding: 4px 0px !important;
      word-break: break-word !important;
      white-space: normal !important;
    }

    .only-print {
      display: grid !important;
    }
  }

  /* Estilo normal (pantalla) */
  .print-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 12px;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #ccc;
    padding: 0px;
    word-break: break-word;
  }

  .only-print {
    display: none;
  }
`}</style>
    </div>
  );
}
