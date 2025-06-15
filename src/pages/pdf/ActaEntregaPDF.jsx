"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

export default function ActaEntregaPDF({ bienes, usuario }) {
  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text(
      "ACTA DE CONSTATACIÓN FÍSICA Y ENTREGA-RECEPCIÓN DE BIENES PROPIEDAD PLANTA Y EQUIPO, BIENES DE CONTROL ADMINISTRATIVO DEL DEPARTAMENTO DE CIENCIAS DE LA COMPUTACIÓN; ENTRE EL SEÑOR ING. KLEBER AUGUSTO AGUILAR LEMA QUIEN ENTREGA Y EL SEÑOR ING. ___________________, QUIEN RECIBE.",
      10,
      15,
      { maxWidth: 190, align: "justify" }
    );

    doc.text(
      `En la ciudad de Sangolquí, a ${new Date().toLocaleDateString()}, los suscritos señor Ing. Kléber Augusto Aguilar Lema, quien entrega los bienes, señor Ing. ${usuario.nombre} ${usuario.apellido}, quien recibe los bienes, en conocimiento de la señora Ing. Sonia Elizabeth Cárdenas Delgado PhD., Directora del Departamento de Ciencias de la Computación y el señor Ing. Eduardo Arroyo, en calidad de delegado de la Sección Bienes, nos constituimos en el Departamento de Ciencias de la Computación con el objeto de realizar la diligencia de entrega – recepción correspondiente.`,
      10,
      40,
      { maxWidth: 190, align: "justify" }
    );

    doc.text(
      "Al efecto con la presencia de las personas mencionadas anteriormente se procede a la constatación física y entrega-recepción de los bienes PROPIEDAD PLANTA Y EQUIPO y bienes DE CONTROL ADMINISTRATIVO, de acuerdo con el siguiente detalle:",
      10,
      95,
      { maxWidth: 190, align: "justify" }
    );

    autoTable(doc, {
      startY: 110,
      head: [[
        "Código del Bien",
        "Bien",
        "Modelo",
        "Marca",
        "Material",
        "Color",
        "Dimensiones",
        "Condición",
        "Descripción"
      ]],
      body: bienes.map(b => [
        b.codigo || "—",
        b.nombreBien,
        b.modeloBien || "—",
        b.marcaBien || "—",
        b.materialBien || "—",
        b.colorBien || "—",
        b.dimensionesBien || "—",
        b.condicionBien || "—",
        b.descripcion || "—"
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.text(
      `Se deja constancia que el custodio que recibe los bienes, señor Ing. ${usuario.nombre} ${usuario.apellido}, se encargará de velar por: el buen uso, la conservación, la administración y utilización, así también los custodios saliente y entrante certifican y garantizan que los bienes están siendo usados para fines Institucionales, sus condiciones son adecuadas y no se encuentran en riesgo de deterioro, de acuerdo con lo que estipulan los Arts. 7, 20, 44 y 47 del Reglamento General Sustitutivo para la Administración, Utilización, Manejo y Control de los Bienes e inventarios del Sector Público y con las Normas de Control Interno 406-07 y 406-08.`,
      10,
      doc.lastAutoTable.finalY + 10,
      { maxWidth: 190, align: "justify" }
    );

    doc.save("Acta_Entrega_Bienes.pdf");
  };

  return (
    <Button className="bg-green-600 text-white" onClick={generarPDF}>
      Descargar Acta de Entrega
    </Button>
  );
}
