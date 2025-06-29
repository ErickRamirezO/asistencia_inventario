"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function HistorialDocumentoView() {
  const { documentoId } = useParams();
  const [historial, setHistorial] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await api.get(`/bienes-inmuebles/documento/${documentoId}/historial`);
        setHistorial(res.data);
      } catch {
        toast.error("Error al cargar el historial del documento");
      }
    };
    fetchHistorial();
  }, [documentoId]);

  if (historial.length === 0) return null;

  const nuevoCustodio = `${historial[0]?.nombreUsuarioNuevo} ${historial[0]?.apellidoUsuarioNuevo}`;
  const responsable = `${historial[0]?.nombreUsuarioResponsable} ${historial[0]?.apellidoUsuarioResponsable}`;
  const fechaActa = new Date(historial[0]?.fechaCambio).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 space-y-6 print-container">
      <div className="flex justify-between items-center mb-4 no-print">
  <Button
    onClick={() => navigate("/cambio")}
    className="bg-gray-200 hover:bg-gray-300"
  >
Volver a documentos
  </Button>
  <Button
    onClick={() => window.print()}
    className="bg-blue-600 text-white hover:bg-blue-700"
  >
Imprimir acta
  </Button>
</div>

<div className="border rounded-md max-h-[500px] overflow-y-auto p-2 print:overflow-visible print:max-h-none">

  
      <Card>
        <CardHeader>
          <CardTitle>ACTA DE ENTREGA-RECEPCIÓN DE BIENES – Documento #{documentoId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-justify leading-relaxed">
            En la ciudad de <strong>Sangolquí</strong>, a <strong>{fechaActa}</strong>, los suscritos señor/a <strong>{responsable}</strong>, quien entrega los bienes, y el/la señor/a <strong>{nuevoCustodio}</strong>, quien los recibe, en conocimiento de la dirección de la empresa <strong>X Empresa Tecnológica S.A.</strong>, y en presencia del personal delegado de la unidad de bienes institucionales, se constituyeron en las instalaciones para realizar la diligencia de constatación física y entrega-recepción correspondiente.
          </p>

          <p className="text-justify leading-relaxed mt-4">
            Al efecto, con la presencia de las personas mencionadas anteriormente, se procede a la entrega-recepción de los bienes clasificados como <strong>Propiedad Planta y Equipo</strong> y <strong>Bienes de Control Administrativo</strong>, de acuerdo al siguiente detalle:
          </p>

          <div className="overflow-x-auto">
            <table className="print-table">
              <thead className="bg-gray-100">
                <tr>
                  <th>Código</th>
                  <th>Bien</th>
                  <th>Modelo</th>
                  <th>Marca</th>
                  <th>Material</th>
                  <th>Color</th>
                  <th>Dimensiones</th>
                  <th>Condición</th>
                  <th>Ubicación</th>
                  <th>Encargado Anterior</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id}>
                    <td>{h.bien?.id || "—"}</td>
                    <td>{h.bien?.nombreBien || "—"}</td>
                    <td>{h.bien?.modeloBien || "—"}</td>
                    <td>{h.bien?.marcaBien || "—"}</td>
                    <td>{h.bien?.materialBien || "—"}</td>
                    <td>—</td>
                    <td>{h.bien?.dimensionesBien || "—"}</td>
                    <td>{h.bien?.status === 1 ? "BUENO" : "REGULAR"}</td>
                    <td>{h.bien?.ubicacionBien || "—"}</td>
                    <td>
                      {h.usuarioAnterior?.nombre} {h.usuarioAnterior?.apellido}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-justify leading-relaxed mt-6">
            Se deja constancia que el custodio que recibe los bienes, señor Ing. <strong>{nuevoCustodio}</strong>, se encargará de velar por: el buen uso, la conservación, la administración y utilización, así también los custodios saliente y entrante certifican y garantizan que los bienes están siendo usados para fines Institucionales, sus condiciones son adecuadas y no se encuentran en riesgo de deterioro, de acuerdo con lo que estipulan los Arts. 7, 20, 44 y 47 del Reglamento General Sustitutivo para la Administración, Utilización, Manejo y Control de los Bienes e Inventarios del Sector Público y con las Normas de Control Interno 406-07 y 406-08.
          </p>

          <p className="text-justify leading-relaxed mt-4">
            En consecuencia y de conformidad a los datos procedentes, el señor Ing. <strong>{responsable}</strong> entrega a satisfacción al señor Ing. <strong>{nuevoCustodio}</strong>, quien recibe a satisfacción los bienes PROPIEDAD PLANTA Y EQUIPO y bienes DE CONTROL ADMINISTRATIVO, mismos que serán usados en el Departamento de Ciencias de la Computación ubicado en el edificio de postgrados bloque H planta baja.
          </p>

          <p className="text-justify leading-relaxed mt-4">
            Para constancia de lo actuado y en fe de conformidad y aceptación, suscriben la presente acta de entrega-recepción en cuatro ejemplares de igual tenor y efecto, las personas que intervienen en esta diligencia.
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
          body {
            margin: 0;
            padding: 1.5cm;
            font-size: 11px;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            width: 100%;
            max-width: 100%;
            padding: 0;
          }

          .print-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 10px;
          }

          .print-table th,
          .print-table td {
            border: 1px solid black;
            padding: 4px;
            word-break: break-word;
          }
        }

        .print-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .print-table th,
        .print-table td {
          border: 1px solid #ccc;
          padding: 6px;
          font-size: 12px;
          word-break: break-word;
        }
          @media print {
  .only-print {
    display: grid !important;
  }
}

.only-print {
  display: none;
}

      `}</style>
    </div>
  );
}
