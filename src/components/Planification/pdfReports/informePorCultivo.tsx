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


const HeadersRow = ({ headers }: { headers: string[] }) => {
  return (
    <View style={styles_row.row}>
      {/* empty filler */}
      <Text></Text>

      {headers.map((v)=>{
        return <Text>{v}</Text>
      })}
      
    </View>
  );
};

const Row = ({ value }: { value: (string | number)[] }) => {
  return (
    <View style={styles_row.row}>
      {/* nombre de la fila */}

      <Text>{value[0]}</Text>
      
      {/* crops */}
      {value.slice(1).map((v)=>{
        return <Text>{v}</Text>
      })}
    </View>
  );
};
//Create Document Component
export const InformePorCultivoPDF = (data: In) => {
  let title = "Informe de Planificación por cultivo";


let keys_for_each_row = [ "cultivoId",
  "superficie",
  "nombre",
  "totalCostoInsumos",
  "totalCostoLabores",
  "ingresoCosechado",
  "cosechado",
  "rindePromedio",
  "precioPromedio",
  "costoInsumosPorHa",
  "costoLaboresPorHa",
  "margenBruto",
  "rendimiento",
  "rindeEquilibrio",
  "precioEquilibrio",
  "ingresoPorHa",]

let crop_column = Object.values(data)
let headers_crops = crop_column.map((v)=>v.nombre)

let rows : (string | number)[][] = []

keys_for_each_row.map((key)=>{

  let new_row = []
  new_row.push(key)

  crop_column.map((col)=>{
    new_row.push(col[key as keyof InformePorCultivoData])
  })

  rows.push(new_row)

})

console.log(rows)



  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text>{title}</Text>
        </View>


<HeadersRow headers={headers_crops} />

        {rows.map((v) => {


          return <Row value={v}></Row>;
        })}

      </Page>
    </Document>
  );
};
