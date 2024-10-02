import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "apexcharts/dist/apexcharts.css";
import { DailyTelemetryCard } from "../sensores-types";
import { valor } from "../sensores";
import { add_download_xls_button } from "../excel_boton";
import RosaDeVientos from "../rosad3"; // Asumo que este componente existe como parte de tu proyecto

const puntosCardinales = [
  "    N",
  "    NNE",
  "    NE",
  "    ENE",
  "    E",
  "    ESE",
  "    SE",
  "    SSE",
  "    S",
  "    SSW",
  "    SW",
  "    WSW",
  "    W",
  "    WNW",
  "    NW",
  "    NNW",
];

const matrizDeVientos = (ts: any, dir: number[], vel: number[]) => {
  const lTotal = vel.length;
  const muestras = vel.map((velocidad, i) => ({ vel: velocidad, dir: dir[i] }));
  const rangosVel = [0, 5, 10, 15, 20, 30, 40, Infinity];
  const rangosDir = Array.from({ length: 16 }, (_, i) => i * (360 / 16));

  const result = [];
  const columns = ["angle"];

  for (let i = 1; i < rangosDir.length; i++) {
    const limiteDirInf = rangosDir[i - 1];
    const limiteDirSup = rangosDir[i];

    const binDireccion = muestras.filter((d) => d.dir > limiteDirInf && d.dir < limiteDirSup);
    let totalEjeVel = 0;
    const fila: any = { angle: puntosCardinales[i - 1] };

    for (let z = 1; z < rangosVel.length; z++) {
      const limiteVelInf = rangosVel[z - 1];
      const limiteVelSup = rangosVel[z];
      const binVel = binDireccion.filter((d) => d.vel > limiteVelInf && d.vel < limiteVelSup);

      const fraccion = (binVel.length / lTotal) * 100;
      totalEjeVel += fraccion;
      fila[`${limiteVelInf}-${limiteVelSup}`] = fraccion;

      if (!columns.includes(`${limiteVelInf}-${limiteVelSup}`)) {
        columns.push(`${limiteVelInf}-${limiteVelSup}`);
      }
    }
    fila.total = totalEjeVel;
    result.push(fila);
  }

  result.unit = "km/h";
  result.columns = columns;
  return result;
};

interface VientoDireccionCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const VientoDireccionCard: React.FC<VientoDireccionCardProps> = ({ card, data }) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [matrizDeVientos, setMatrizDeVientos] = useState<any>(null);

  useEffect(() => {
    if (data) {
      renderCentralChart();
    }
  }, [data]);

  const renderCentralChart = async () => {
    const baseOptions = {
      colors: ["#F44336", "#E91E63", "#9C27B0"],
      series: [{ name: "", data: [] }],
      chart: {
        height: 300,
        type: "area",
        animations: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: {
        type: "datetime",
        categories: [],
        labels: { style: { colors: "#000000" } },
      },
      yaxis: [
        {
          axisTicks: { show: true },
          axisBorder: { show: true, color: "#008FFB" },
          labels: { style: { colors: "#000000" } },
          title: { text: "Viento - Dirección", style: { color: "#eb2a1c" } },
          tooltip: { enabled: true },
        },
      ],
      tooltip: { x: { format: "dd/MM/yy HH:mm" } },
    };

    const options = {
      ...baseOptions,
      chart: {
        type: "scatter",
        height: "180px",
        foreColor: "#ffffff",
        animations: { enabled: false },
      },
      title: {
        text: "Sensor 1",
        align: "left",
        margin: 10,
        floating: false,
        style: { fontSize: "14px", fontWeight: "bold", color: "#ffffff" },
      },
    };

    const thisOpts = JSON.parse(JSON.stringify(options));
    thisOpts.xaxis.categories = data.ts;

    let matriz;
    if ("direccion" in data) {
      thisOpts.series[0].data = data.direccion;
      matriz = matrizDeVientos(data.ts, data.direccion, data.velocidad);
    } else if ("viento_direccion" in data) {
      thisOpts.series[0].data = data.viento_direccion;
      matriz = matrizDeVientos(data.ts, data.viento_direccion, data.viento_velocidad);
    }

    thisOpts.series[0].name = "Viento - Dirección";
    thisOpts.title.text = "Viento - Dirección";
    thisOpts.yaxis[0].title = "Viento - Dirección";

    setMatrizDeVientos(matriz);
  };

  const toggleChartView = () => {
    setShowChartOnly(!showChartOnly);
  };

  return (
    <div className="container-fluid row border-primary border-top p-1 mx-auto">
      {!showChartOnly && (
        <div className="col-11 col-sm-11 my-auto" id="datadiv">
          <div className="row">
            <h5>
              <img src="/windrose-svgrepo-com.svg" width="50" height="50" alt="Wind Rose Icon" />
              <span className="fw-bolder">
                {valor(card, "direccion") === "N/A"
                  ? valor(card, "viento_direccion")
                  : valor(card, "direccion")}{" "}
                º
              </span>
            </h5>
          </div>
          <div className="row">
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{valor(card, "viento_direccion_min")} º</div>
              <div className="fw-light">Min</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{valor(card, "viento_direccion_mean")} º</div>
              <div className="fw-light">Promedio</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{valor(card, "viento_direccion_max")} º</div>
              <div className="fw-light">Max</div>
            </div>
          </div>
        </div>
      )}
      {!data && (
        <div className={showChartOnly ? "col-11 col-sm-11 d-flex align-items-center" : "d-none"}>
          <strong>Cargando Datos...</strong>
          <div className="spinner-grow text-danger ms-auto" role="status" aria-hidden="true"></div>
        </div>
      )}
      <div className={showChartOnly ? "col-11 col-sm-11" : "d-none"} id="chart">
        {matrizDeVientos && <RosaDeVientos data={matrizDeVientos} className="mx-auto" />}
      </div>
      <div className="col-1 my-1 d-flex align-items-center" onClick={toggleChartView}>
        <span className="btn btn-warning mx-auto">{!showChartOnly ? ">" : "<"}</span>
      </div>
    </div>
  );
};

export default VientoDireccionCard;
