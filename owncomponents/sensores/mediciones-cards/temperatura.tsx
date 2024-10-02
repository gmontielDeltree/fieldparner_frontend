import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "apexcharts/dist/apexcharts.css";
import { DailyTelemetryCard } from "../sensores-types";
import { valor } from "../sensores";
import { add_download_xls_button } from "../excel_boton";

interface TemperaturaCardProps {
  card: DailyTelemetryCard | null; // Permitimos que sea null
  data: any;
}


const TemperaturaCard: React.FC<TemperaturaCardProps> = ({ card, data }) => {
  const [showChartOnly, setShowChartOnly] = useState(false);

  useEffect(() => {
    if (data) {
      renderCentralChart();
    }
  }, [data]);

  const renderCentralChart = async () => {
    const chartElement = document.getElementById("chart");
    if (chartElement) {
      chartElement.innerHTML = "";
      const baseOptions = {
        colors: ["#F44336", "#E91E63", "#9C27B0"],
        series: [
          {
            name: "",
            data: [],
          },
        ],
        chart: {
          height: 300,
          type: "area",
          animations: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
        },
        xaxis: {
          type: "datetime",
          categories: [],
          labels: {
            style: {
              colors: "#000000",
            },
          },
        },
        yaxis: [
          {
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: "#008FFB",
            },
            labels: {
              style: {
                colors: "#000000",
              },
            },
            title: {
              text: "Humedad",
              style: {
                color: "#eb2a1c",
              },
            },
            tooltip: {
              enabled: true,
            },
          },
        ],
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm",
          },
        },
      };

      const options = {
        ...baseOptions,
        chart: {
          type: "area",
          height: "180px",
          foreColor: "#ffffff",
          animations: {
            enabled: false,
          },
        },
        title: {
          text: "Sensor 1",
          align: "left",
          margin: 10,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#ffffff",
          },
        },
      };

      const updatedOptions = { ...options };
      updatedOptions.xaxis.categories = data.ts;
      updatedOptions.series[0].data = data.temperatura;
      updatedOptions.series[0].name = "Temperatura";
      updatedOptions.title.text = "Temperatura";
      updatedOptions.yaxis[0].title = "Temperatura";

      const chart = new ApexCharts(chartElement, updatedOptions);
      chart.render();

      add_download_xls_button(
        chartElement,
        updatedOptions.xaxis.categories,
        updatedOptions.series[0].data,
        updatedOptions.yaxis[0].title
      );
    }
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
              <img src="/high-temperature-icon.svg" width="50" height="50" alt="Temperature Icon" />
              <span className="fw-bolder">{valor(card, "temperatura")} ºC</span>
            </h5>
          </div>
          <div className="row">
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{valor(card, "temperatura_min")} ºC</div>
              <div className="fw-light">Min</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{valor(card, "temperatura_mean")} ºC</div>
              <div className="fw-light">Promedio</div>
            </div>
            <div className="col-4 fw-bolder">
              <div className="fw-strong">{valor(card, "temperatura_max")} ºC</div>
              <div className="fw-light">Max</div>
            </div>
          </div>
        </div>
      )}
      {!data && (
        <div className={showChartOnly ? "" : "d-none col-12 col-sm-12 d-flex align-items-center"}>
          <strong>Cargando Datos...</strong>
          <div className="spinner-grow text-danger ms-auto" role="status" aria-hidden="true"></div>
        </div>
      )}
      <div className={showChartOnly ? "col-11 col-sm-11" : "d-none"} id="chart"></div>
      <div className="col-1 my-1 d-flex align-items-center" onClick={toggleChartView}>
        <span className="btn btn-warning mx-auto">{!showChartOnly ? ">" : "<"}</span>
      </div>
    </div>
  );
};

export default TemperaturaCard;
