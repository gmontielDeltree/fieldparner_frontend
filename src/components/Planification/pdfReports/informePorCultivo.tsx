import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { style } from "@mui/system";
import { Campaign } from "@types";

function con2decimales(n : number){
  return Math.round(n * 100)/100
}

interface InformePorCultivoData {
  cultivoId: string;
  superficie: number;
  nombre: string;
  totalCostoInsumos: number;
  totalCostoLabores: number;
  ingresoCosechado: number;
  cosechado: number;
  rindePromedio: number;
  precioPromedio: number;
  costoInsumosPorHa: number;
  costoLaboresPorHa: number;
  margenBruto: number;
  rendimiento: number;
  rindeEquilibrio: number;
  precioEquilibrio: number;
  ingresoPorHa: number;
}

interface In {
  [idCultivo: string]: InformePorCultivoData;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  tableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  nombre: {
    width: "30%",
  },
  cell: {
    textAlign: "right",
    backgroundColor: "red",
    width: "10%",
  },

  row: {
    flexDirection: "row",
    width: "100%",
    gap: "10px",
   
  },
  table: {
    alignSelf: "center",
    width: "90%",
    backgroundColor: "green",
    fontSize :11    

  },
});

const HeadersRow = ({ headers }: { headers: string[] }) => {
  return (
    <View style={styles.row}>
      {/* empty filler */}
      <Text style={styles.nombre}></Text>

      {headers.map((v) => {
        return <Text style={styles.cell}>{v}</Text>;
      })}
    </View>
  );
}

const Row = ({ value }: { value: (string | number)[] }) => {
  return (
    <View style={styles.row}>
      {/* nombre de la fila */}

      <Text style={styles.nombre}>{value[0]}</Text>

      {/* crops */}
      {value.slice(1).map((v) => {
        return <Text style={styles.cell}>{v}</Text>;
      })}
    </View>
  );
};
//Create Document Component
export const InformePorCultivoPDF= ({ data, campaign }: { data: In, campaign:Campaign }) => {
  let title = "Informe de planificación por cultivo";

  let keys_for_each_row = [
    "superficie",
    "rindePromedio",
    "cosechado",
    "precioPromedio",
    "ingresoCosechado",

    "totalCostoInsumos",
    "totalCostoLabores",
   
    "ingresoPorHa",
    "costoInsumosPorHa",
    "costoLaboresPorHa",

    "margenBruto",
    "rendimiento",
    "rindeEquilibrio",
    "precioEquilibrio",
  ];

  let headers_for_each_row : ({[index:string] : string}) = {
    "superficie": "Superficie (ha)",
    "rindePromedio": "Rinde Promedio (tn/ha)",
    "cosechado": "Total Cosechado (tn)",
    "precioPromedio": "Precio Promedio (USD/tn)",
    "ingresoCosechado": "Ingreso (USD)",

    "totalCostoInsumos":"Total Insumos (USD)",
    "totalCostoLabores":"Total Labores (USD)",
   
    "ingresoPorHa" : "Ingreso por Ha (USD/ha)",
    "costoInsumosPorHa": "Costo Insumos por Ha (USD/ha)",
    "costoLaboresPorHa": "Costo Labores por Ha (USD/ha)",

    "margenBruto": "Margen Bruto (USD)",
    "rendimiento": "Rendimiento (%)",
    "rindeEquilibrio" : "Rinde Equilibrio (tn/ha)",
    "precioEquilibrio": "Precio Equilibrio ($/ha)",
  };

  let crop_column = Object.values(data);
  let headers_crops = crop_column.map((v) => v.nombre);

  let rows: (string | number)[][] = [];

  keys_for_each_row.map((key) => {
    let new_row = [];
    new_row.push(headers_for_each_row[key]);

    crop_column.map((col) => {
      new_row.push(con2decimales(col[key as keyof InformePorCultivoData]));
    });

    rows.push(new_row);
  });

  console.log(rows);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text>{title}</Text>
        </View>

        <View style={styles.table}>
          <HeadersRow headers={headers_crops} />
          <View style={styles.tableContainer}>
            {rows.map((v) => {
              return <Row value={v}></Row>;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};
