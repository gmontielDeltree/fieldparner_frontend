import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "apexcharts/dist/apexcharts.css";
import { add_download_xls_button } from "./excel_boton";

interface ChartComponentProps {
  variable_name: string;
  data: any;
  show_chart_only: boolean;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ variable_name, data, show_chart_only }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (data && data[variable_name] && data.ts && chartRef.current) {
      renderCentralChart();
    }
  }, [data, variable_name]);

  const renderCentralChart = async () => {
    if (!chartRef.current || !data?.[variable_name] || !data?.ts) return;
    
    chartRef.current.innerHTML = ""; // Clear any previous chart

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
          title: { text: "Humedad", style: { color: "#eb2a1c" } },
          tooltip: { enabled: true },
        },
      ],
      tooltip: { x: { format: "dd/MM/yy HH:mm" } },
    };

    const options = {
      ...baseOptions,
      chart: {
        type: "area",
        height: "180px",
        foreColor: "#ffffff",
        animations: { enabled: false },
      },
      title: {
        text: variable_name.toUpperCase(),
        align: "left",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: { fontSize: "14px", fontWeight: "bold", color: "#ffffff" },
      },
    };

    const thisOpts = { ...options };
    thisOpts.xaxis.categories = [...data.ts];
    thisOpts.series[0].data = [...data[variable_name]];
    thisOpts.series[0].name = variable_name.toUpperCase();
    thisOpts.title.text = variable_name.toUpperCase();
    thisOpts.yaxis[0].title = variable_name.toUpperCase();

    chartInstance.current = new ApexCharts(chartRef.current, thisOpts);
    chartInstance.current.render();

    // Add download button
    add_download_xls_button(
      chartRef.current,
      thisOpts.xaxis.categories,
      thisOpts.series[0].data,
      thisOpts.yaxis[0].title
    );
  };

  return (
    <div className="container-fluid row p-1 mx-auto">
      {/* Spinner */}
      {!data && (
        <div className={`col-12 col-sm-12 d-flex align-items-center ${show_chart_only ? "" : "d-none d-sm-block"}`}>
          <strong>Cargando Datos...</strong>
          <div className="spinner-grow text-danger ms-auto" role="status" aria-hidden="true"></div>
        </div>
      )}

      {/* Chart */}
      <div className={`col-12 col-sm-12 chart ${show_chart_only ? "" : "d-none d-sm-block"}`} ref={chartRef}></div>
    </div>
  );
};

export default ChartComponent;
