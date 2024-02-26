import {
  Actividad,
  DetallesAplicacion,
  Ejecucion
} from "../../../../interfaces/activity";
const pdf_fonts = {
  // download default Roboto font from cdnjs.com
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf"
  }
};

export const ComparisonReportPdf = (
  activity,
  execution,
  fieldName,
  lotName
) => {
  console.log("GENERANDO PDF", activity);
  let dd = differencesReportDefinition(
    activity,
    execution,
    fieldName, //nombre del campo
    lotName //nombre del lote
  );
  //console.log("DD", JSON.stringify(dd));
  // Loading
  //   this._loading_pdf = true;

  import("pdfmake/build/pdfmake.min.js").then(({ default: pdfMake }) => {
    pdfMake.fonts = pdf_fonts;
    //console.log("Generando PDF");
    pdfMake.createPdf(dd).open();
  });
};

const pdfLine = (line, hectares) => {
  console.log("line: ", line);
  return [
    {
      text: line.insumo.name.toUpperCase(),
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: line.dosis,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: line.insumo.unidad,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: hectares,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      border: [false, false, false, true],
      text: 2,
      fillColor: "#f5f5f5",
      alignment: "right",
      margin: [0, 5, 0, 5]
    }
  ];
};
export const differencesReportDefinition = (
  aplicacion: Actividad,
  execution: Ejecucion,
  fieldName: string,
  lotName: string
) => {
  let titulos = {
    aplicacion: "de Aplicación",
    siembra: "de Siembra",
    cosecha: "de Cosecha"
  };
  let tipo = aplicacion.tipo;

  let titulo = titulos[tipo];
  let hectares = aplicacion.detalles.hectareas;

  let insumos;
  let insumos_tabla;
  insumos = (aplicacion.detalles as DetallesAplicacion).dosis || [];
  insumos_tabla = insumos.map((e) => pdfLine(e, hectares));

  let insumos_exe;
  let insumos_exe_tabla;
  insumos_exe = execution.detalles.dosis || [];
  insumos_exe_tabla = insumos_exe.map((e) => executedLine(e, hectares));

  return {
    content: [
      {
        columns: [
          {
            text: "Planificación vs Ejecución " + titulo,
            width: 400,
            color: "#16a825",
            bold: true,
            fontSize: 28
          }
        ]
      },
      {
        columns: [
          [
            {
              text: "Campo",
              color: "#aaaaab",
              bold: true,
              fontSize: 14,
              alignment: "left",
              margin: [0, 20, 0, 5]
            },
            {
              text: fieldName,
              bold: true,
              color: "#333333",
              alignment: "left"
            }
          ],
          [
            {
              text: "Lote",
              color: "#aaaaab",
              bold: true,
              fontSize: 14,
              alignment: "left",
              margin: [0, 20, 0, 5]
            },
            {
              text: lotName + ", " + hectares + " has.",
              bold: true,
              color: "#333333",
              alignment: "left"
            }
          ],
          [
            {
              text: "Aplicador",
              color: "#aaaaab",
              bold: true,
              fontSize: 14,
              alignment: "left",
              margin: [0, 20, 0, 5]
            },
            {
              text: aplicacion.contratista?.nombre,
              bold: true,
              color: "#333333",
              alignment: "left"
            },
            {
              text: aplicacion.contratista?.cuit,
              bold: true,
              color: "#333333",
              alignment: "left"
            },
            {
              text: "Tel: " + aplicacion.contratista.datos_generales.telefono,
              fontSize: 10,
              color: "#333333",
              alignment: "left"
            }
          ]
        ]
      },
      {
        columns: [
          {
            text: "",
            color: "#aaaaab",
            bold: true,
            margin: [0, 7, 0, 3]
          },
          {
            text: "",
            color: "#aaaaab",
            bold: true,
            margin: [0, 7, 0, 3]
          }
        ]
      },
      {
        columns: []
      },
      "\n\n",
      "Planificación",
      {
        width: "100%",
        alignment: "center",
        text: "",
        bold: true,
        margin: [0, 10, 0, 10],
        fontSize: 15
      },
      {
        layout: {
          defaultBorder: false,
          hLineWidth: function (i, node) {
            return 1;
          },
          vLineWidth: function (i, node) {
            return 1;
          },
          hLineColor: function (i, node) {
            if (i === 1 || i === 0) {
              return "#bfdde8";
            }
            return "#eaeaea";
          },
          vLineColor: function (i, node) {
            return "#eaeaea";
          },
          hLineStyle: function (i, node) {
            // if (i === 0 || i === node.table.body.length) {
            return null;
            //}
          },
          // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
          paddingLeft: function (i, node) {
            return 10;
          },
          paddingRight: function (i, node) {
            return 10;
          },
          paddingTop: function (i, node) {
            return 2;
          },
          paddingBottom: function (i, node) {
            return 2;
          },
          fillColor: function (rowIndex, node, columnIndex) {
            return "#fff";
          }
        },
        table: {
          headerRows: 1,
          widths: ["auto", "*", "*", "*", "auto"],
          body: [
            [
              {
                text: "Insumo",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Dosis",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Unidad",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Ha.",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Total Insumo",
                border: [false, true, false, true],
                alignment: "right",
                fillColor: "#eaf2f5",
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              }
            ],
            ...insumos_tabla
          ]
        }
      },
      "\n",
      "\n\n",
      {
        text: "Comentarios Planificación",
        style: "notesTitle"
      },
      {
        text: aplicacion.comentario,
        style: "notesText"
      },
      "-----------------------------------------------------------------------------------------------------------------------",
      "\n",
      "\n\n",

      "Ejecutado",
      {
        width: "100%",
        alignment: "center",
        text: "",
        bold: true,
        margin: [0, 10, 0, 10],
        fontSize: 15
      },
      {
        layout: {
          defaultBorder: false,
          hLineWidth: function (i, node) {
            return 1;
          },
          vLineWidth: function (i, node) {
            return 1;
          },
          hLineColor: function (i, node) {
            if (i === 1 || i === 0) {
              return "#bfdde8";
            }
            return "#eaeaea";
          },
          vLineColor: function (i, node) {
            return "#eaeaea";
          },
          hLineStyle: function (i, node) {
            // if (i === 0 || i === node.table.body.length) {
            return null;
            //}
          },
          // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
          paddingLeft: function (i, node) {
            return 10;
          },
          paddingRight: function (i, node) {
            return 10;
          },
          paddingTop: function (i, node) {
            return 2;
          },
          paddingBottom: function (i, node) {
            return 2;
          },
          fillColor: function (rowIndex, node, columnIndex) {
            return "#fff";
          }
        },
        table: {
          headerRows: 1,
          widths: ["auto", "*", "*", "*", "auto"],
          body: [
            [
              {
                text: "Insumo",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Dosis",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Unidad",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Ha.",
                fillColor: "#eaf2f5",
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              },
              {
                text: "Total Insumo",
                border: [false, true, false, true],
                alignment: "right",
                fillColor: "#eaf2f5",
                margin: [0, 5, 0, 5],
                textTransform: "uppercase"
              }
            ],
            ...insumos_exe_tabla
          ]
        }
      },
      {
        text: "Comentarios Ejecución",
        style: "notesTitle"
      },
      {
        text: execution.comentario,
        style: "notesText"
      }
    ],

    styles: {
      notesTitle: {
        fontSize: 10,
        bold: true,
        margin: [0, 50, 0, 3]
      },
      notesText: {
        fontSize: 10
      }
    },
    defaultStyle: {
      columnGap: 20
      //font: 'Quicksand',
    }
  };
};
const executedLine = (line, hectares) => {
  const totalText =
    typeof line.total === "number" ? line.total.toFixed(2) : "0.00";

  return [
    {
      text: line.insumo.name.toUpperCase(),
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: line.dosis,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: line.insumo.unidad,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: hectares,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      border: [false, false, false, true],
      text: totalText,
      fillColor: "#f5f5f5",
      alignment: "right",
      margin: [0, 5, 0, 5]
    }
  ];
};
