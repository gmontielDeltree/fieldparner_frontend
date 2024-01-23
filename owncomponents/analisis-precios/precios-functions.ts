import axios from "axios";

export const fetch_precios = async (ticker) => {
  //  let url = "/prices/car/" + ticker + "/precio.json"
   let url = "https://agrotools.qts-ar.com.ar/platform/" + ticker
    let prices = await axios(url).then((result) => {
        console.log(result.data);
        return result.data.data;
      })
    
    return prices as [number,number][]
    
    //   .then((b) => {
    //     console.log("B", b);
    //     this.updateChart(b);
    //     // Agregar boton de descarga Excel
    //   });
}




export const  mercados: any[] = [
    { nombre: "Cámara Arbitral de Rosario", value: "car" },
  ];
 
export const price_tickers: any[] = [
    { nombre: "Rosario - Soja (pesos)", value: "soja", cbot_eq: "chicago_soybeans" ,exchange:"rosario"},
    { nombre: "Rosario - Trigo (pesos)", value: "trigo",cbot_eq: "chicago_wheat",exchange:"rosario" },
    { nombre: "Rosario - Maiz (pesos)", value: "maiz",cbot_eq: "chicago_corn",exchange:"rosario" },
    { nombre: "Rosario - Girasol (pesos)", value: "girasol" ,exchange:"rosario"},
    { nombre: "Rosario - Sorgo (pesos)", value: "sorgo" ,exchange:"rosario"},
    {
      nombre: "Chicago (CBOT) - Soja Front Month (usd)",
      value: "chicago_soybeans",
      exchange:"cbot"
    },
    {
      nombre: "Chicago (CBOT) - Trigo Front Month (usd)",
      value: "chicago_wheat",
      exchange:"cbot"
    },
    {
      nombre: "Chicago (CBOT) - Maiz Front Month (usd)",
      value: "chicago_corn",
      exchange:"cbot"
    },
  ];