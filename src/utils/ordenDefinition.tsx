// import agrotools_logo_b64 from './agrotools_logo_b64.js'

const pdf_line = (linea, hectareas) => {
  return [
    {
      text: linea.insumo.name.toUpperCase(),
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: linea.dosis,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: linea.insumo.unidad,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: hectareas,
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

const pdf_linea_siembra = (siembra, hectareas) => {
  return [
    {
      text: siembra.insumo.name.toUpperCase(),
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: siembra.densidad_objetivo,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: "kg",
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      text: siembra.hectareas,
      border: [false, false, false, true],
      margin: [0, 5, 0, 5],
      alignment: "left"
    },
    {
      border: [false, false, false, true],
      text: siembra.densidad_objetivo * siembra.hectareas,
      fillColor: "#f5f5f5",
      alignment: "right",
      margin: [0, 5, 0, 5]
    }
  ];
};

const ordenDefinition = (
  aplicacion,
  nombre_campo,
  nombre_lote,
  campos_url,
  google_map_link
) => {
  let titulos = {
    aplicacion: "Orden de Trabajo",
    siembra: "Orden de Siembra",
    cosecha: "Orden de Cosecha"
  };
  let tipo = aplicacion.tipo;

  let titulo = titulos[tipo];
  let hectareas = aplicacion.detalles.hectareas;

  let insumos;
  let insumos_tabla;
  insumos = aplicacion.detalles.dosis || [];
  insumos_tabla = insumos.map((e) => pdf_line(e, hectareas));

  return {
    content: [
      {
        columns: [
          {
            text: "FieldPartner",
            width: 200,
            color: "#16a825",
            bold: true,
            fontSize: 28
          },
          [
            {
              text: titulo,
              color: "#333333",
              width: "*",
              fontSize: 20,
              bold: true,
              alignment: "right",
              margin: [0, 0, 0, 15]
            },
            {
              stack: [
                {
                  columns: [
                    {
                      text: "Orden N°",
                      color: "#aaaaab",
                      bold: true,
                      width: "*",
                      fontSize: 12,
                      alignment: "right"
                    },
                    {
                      text: "000120",
                      bold: true,
                      color: "#333333",
                      fontSize: 12,
                      alignment: "right",
                      width: 100
                    }
                  ]
                }
              ]
            },
            {
              stack: [
                {
                  columns: [
                    {
                      text: "Fecha de Ejecución",
                      color: "#aaaaab",
                      bold: true,
                      width: "*",
                      fontSize: 12,
                      alignment: "right"
                    },
                    {
                      text: aplicacion.detalles.fecha_ejecucion_tentativa,
                      bold: true,
                      color: "#333333",
                      fontSize: 12,
                      alignment: "right",
                      width: 100
                    }
                  ]
                }
              ]
            }
          ]
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
              text: nombre_campo,
              bold: true,
              color: "#333333",
              alignment: "left"
            },
            {
              text: "Aplicador",
              color: "#aaaaab",
              bold: true,
              fontSize: 12,
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
              text: "Tel: " + aplicacion.contratista?.datos_generales?.telefono,
              fontSize: 10,
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
              text: nombre_lote,
              bold: true,
              color: "#333333",
              alignment: "left"
            }
          ],
          {
            image: "camposImg",
            width: 300,
            margin: [0, 10, 0, 5]
          }
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
        columns: [
          {
            text: "",
            style: "invoiceBillingAddress"
          },
          {
            text: "Ver Localización en Google Maps",
            link: google_map_link
          }
        ]
      },
      "\n\n",
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
                text: tipo === "Aplicacion" ? "Dosis" : "Densidad",
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
        text: "Comentarios",
        style: "notesTitle"
      },
      {
        text: aplicacion.comentario,
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
    },
    images: {
      camposImg: campos_url
    }
  };
};

export default ordenDefinition;
