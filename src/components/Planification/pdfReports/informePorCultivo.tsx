import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { style } from "@mui/system";

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
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const styles_row = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  description: {
    width: "60%",
  },
  xyz: {
    width: "40%",
  },
});

const Row = ({ value }: { value: InformePorCultivoData }) => {
  return (
    <View style={styles_row.row}>
      <Text>col1</Text>
      <Text>col2</Text>
    </View>
  );
};
//Create Document Component
export const InformePorCultivoPDF = (data: In) => {
  let title = "Informe de Planificación por cultivo";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text>{title}</Text>
        </View>

        {Object.values(data).map((v) => {
          return <Row value={v}></Row>;
        })}
      </Page>
    </Document>
  );
};
