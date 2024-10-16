import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "apexcharts/dist/apexcharts.css";
import ApexCharts from "apexcharts";
import { get_pluviometro_daily_value, get_timeseries_by_name_agregated } from "../sensores-funciones";
import { add_download_xls_button } from "../excel_boton";

const tipos_periodos = [
  { nombre: "Anual", value: "ano" },
  { nombre: "Mensual", value: "mes" },
  { nombre: "Diaria", value: "dia" },
  { nombre: "Horaria", value: "hora" },
];

interface PluviometroCardProps {
  deveui: string;
}

const PluviometroCard: React.FC<PluviometroCardProps> = ({ deveui }) => {
  const [data, setData] = useState<any>(null);
  const [showChartOnly, setShowChartOnly] = useState(false);
  const [periodo, setPeriodo] = useState<string>("2022");
  const [tipoPeriodo, setTipoPeriodo] = useState(tipos_periodos[1]);
  const [lluviaDeLaFecha, setLluviaDeLaFecha] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [chart, setChart] = useState<ApexCharts | null>(null);
  const fechaSeleccionada = "20230417"; // yyyymmdd

  useEffect(() => {
    loadData(deveui, tipoPeriodo.value, fechaSeleccionada);
  }, [deveui, tipoPeriodo, fechaSeleccionada]);

  const loadData = async (deveui: string, agregacion: string, fecha: string) => {
    const data = await get_timeseries_by_name_agregated(
      deveui,
      "pluviometro",
      Date.now() / 1000 - 3600 * 24 * 60,
      Date.now() / 1000,
      agregacion
    );
    if (chart) {
      chart.updateSeries(data);
    }
    const lluvia = await get_pluviometro_daily_value(deveui, fecha);
    setLluviaDeLaFecha(lluvia);
  };

  const renderCentralChart = async () => {
    const categorias = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    ];

    const data = [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2];

    const options = {
      series: [
        {
          name: "Precipitación",
          data: data,
        },
      ],
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: {
            position: "top",
          },
        },
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}mm`,
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },
      xaxis: {
        type: "category",
        position: "top",
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: true },
      },
      yaxis: {
        labels: {
          show: false,
          formatter: (val: number) => `${val}%`,
        },
      },
      title: {
        text: "Precipitación",
        floating: true,
        offsetY: 330,
        align: "center",
        style: { color: "#444" },
      },
    };

    const chartElement = document.getElementById("chart");
    if (chartElement) {
      const newChart = new ApexCharts(chartElement, options);
      newChart.render();
      setChart(newChart);
      add_download_xls_button(
        chartElement,
        categorias,
        data,
        options.yaxis.title
      );
    }
  };

  const toggleChartView = () => {
    setShowChartOnly(!showChartOnly);
  };

  useEffect(() => {
    renderCentralChart();
  }, [showChartOnly]);

  return (
    <div className="container-fluid row border-primary border-top p-1 mx-auto" id="contenedor">
      {!showChartOnly && (
        <div className="col-11 col-sm-11 my-auto" id="datadiv">
          <div className="row">
            <h5>
              <img src="/rain-svgrepo-com.svg" width="50" height="50" alt="Pluviómetro" />
              Hoy {lluviaDeLaFecha} mm.
            </h5>
          </div>
        </div>
      )}

      {showChartOnly && (
        <div className="col-11 col-sm-11 chart">
          <div className="toolbar">
            <select
              id="tipo-periodo-combo"
              value={tipoPeriodo.value}
              onChange={(e) =>
                setTipoPeriodo(tipos_periodos.find(t => t.value === e.target.value) || tipos_periodos[1])
              }
            >
              {tipos_periodos.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div id="chart"></div>
        </div>
      )}

      <div className="col-1 my-1" style={{ display: "flex", alignItems: "center" }} onClick={toggleChartView}>
        <span className="btn btn-warning mx-auto">{!showChartOnly ? ">" : "<"}</span>
      </div>
    </div>
  );
};

export default PluviometroCard;
