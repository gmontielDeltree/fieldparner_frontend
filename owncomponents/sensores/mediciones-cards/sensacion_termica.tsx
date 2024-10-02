import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "apexcharts/dist/apexcharts.css";
import { DailyTelemetryCard } from "../sensores-types";
import { valor } from "../sensores";
import ChartComponent from "../chart-component";

const variable = "sensacion_termica";
const titulo = "S. Térmica";
const unidad = "°C";
const icono = "/heat-2-svgrepo-com.svg";
const componentName = "SensacionTermicaCard";

interface SensacionTermicaCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const SensacionTermicaCard: React.FC<SensacionTermicaCardProps> = ({ card, data }) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [min, setMin] = useState<number>(0);
  const [avg, setAvg] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [lastValue, setLastValue] = useState<number>(0);

  useEffect(() => {
    if (data) {
      calculateSensacionTermica();
    }
  }, [data]);

  const calculateSensacionTermica = () => {
    const viento = data.velocidad || data.viento_velocidad;
    const serie: number[] = data.temperatura.map((t: number, i: number) => {
      const v = viento[i];
      const st = 13.12 + 0.6215 * t - 11.37 * v ** 0.16 + 0.3965 * t * v ** 0.16;
      return +(st.toFixed(1));
    });

    data[variable] = serie;

    setMin(+(Math.min(...serie).toFixed(1)));
    setMax(+(Math.max(...serie).toFixed(1)));
    setAvg(+(serie.reduce((a, b) => a + b, 0) / serie.length).toFixed(1));
    setLastValue(+(serie[serie.length - 1].toFixed(1)));
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
              <img src={icono} width="50" height="50" alt="Heat Icon" />
              <span className="fw-bolder">
                {titulo} {lastValue} {unidad}
              </span>
            </h5>
          </div>
          <div className="row">
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{min} {unidad}</div>
              <div className="fw-light">Min</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{avg} {unidad}</div>
              <div className="fw-light">Promedio</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{max} {unidad}</div>
              <div className="fw-light">Max</div>
            </div>
          </div>
        </div>
      )}
      <div className={showChartOnly ? "col-11 col-sm-11 chart" : "d-none"}>
        <ChartComponent variable_name={variable} data={data} show_chart_only={showChartOnly} />
      </div>
      <div className="col-1 my-1 d-flex align-items-center" onClick={toggleChartView}>
        <span className="btn btn-warning mx-auto">{!showChartOnly ? ">" : "<"}</span>
      </div>
    </div>
  );
};

export default SensacionTermicaCard;
