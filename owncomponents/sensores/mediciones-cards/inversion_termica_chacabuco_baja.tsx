import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "apexcharts/dist/apexcharts.css";
import { DailyTelemetryCard } from "../sensores-types";
import ChartComponent from "../chart-component";
import { Devices } from "../sensores";

const variable = "inversion_termica_chacabuco_baja";
const titulo = "Inv. Térmica";
const unidad = "";
const icono = "/invert-svgrepo-com.svg";

interface InversionTermicaChacabucoBajaCardProps {
  card: DailyTelemetryCard;
  data: any;
}

const InversionTermicaChacabucoBajaCard: React.FC<InversionTermicaChacabucoBajaCardProps> = ({
  card,
  data,
}) => {
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [min, setMin] = useState<number>(0);
  const [avg, setAvg] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [lastValue, setLastValue] = useState<number>(0);
  const devices = new Devices();

  useEffect(() => {
    if (data) {
      calculateInversionTermica();
    }
  }, [data]);

  const calculateInversionTermica = async () => {
    const humedad = data.humedad;
    const temperatura = data.temperatura;

    const serie: number[] = temperatura.map((t: number, i: number) => {
      const h = humedad[i];
      const pc = (h / 100) ** (1 / 8) * (112 + 0.9 * t) + 0.1 * t - 112;
      return +pc.toFixed(1);
    });

    data[variable] = serie;

    setMin(+Math.min(...serie).toFixed(1));
    setMax(+Math.max(...serie).toFixed(1));
    setAvg(+(serie.reduce((a, b) => a + b, 0) / serie.length).toFixed(1));
    setLastValue(+serie[serie.length - 1].toFixed(1));

    const dataBaja = await devices.get_raw_data_for_charts_generic("sfdfsd");
    console.log("Data for Charts Chaca Baja", dataBaja);
  };

  const toggleChartView = () => {
    setShowChartOnly(!showChartOnly);
  };

  return (
    <div className="container-fluid row border-primary border-top p-1 mx-auto">
      <div
        className="row btn btn-primary d-block d-sm-none mx-auto my-1"
        onClick={toggleChartView}
      >
        {!showChartOnly ? "Gráfico" : "Datos"}
      </div>
      {!showChartOnly && (
        <div className="col-11 col-sm-11 my-auto" id="datadiv">
          <div className="row">
            <h5>
              <img src={icono} width="50" height="50" alt="Inversión Térmica" />
              <span className="fw-bolder">
                {titulo} {lastValue} {unidad}
              </span>
            </h5>
          </div>
          <div className="row">
            <div className="col-4 fw-bolder">
              <div className="fw-strong">
                {min} {unidad}
              </div>
              <div className="fw-light">Min</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">
                {avg} {unidad}
              </div>
              <div className="fw-light">Promedio</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">
                {max} {unidad}
              </div>
              <div className="fw-light">Max</div>
            </div>
          </div>
        </div>
      )}
      {showChartOnly && (
        <div className="col-11 col-sm-11 chart">
          <ChartComponent
            variable_name={variable}
            data={data}
            show_chart_only={showChartOnly}
          />
        </div>
      )}
      <div className="col-1 my-1 d-flex align-items-center" onClick={toggleChartView}>
        <span className="btn btn-warning mx-auto">{!showChartOnly ? ">" : "<"}</span>
      </div>
    </div>
  );
};

export default InversionTermicaChacabucoBajaCard;
