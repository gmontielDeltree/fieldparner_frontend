export const chartOptions = {
  responsive: true,
  scales: {
    y: {
    display:false,},
    x: {
    display:false,},
  },

    elements:{line:{tension : 0.4}},
  plugins: {
    
    legend: {
        display:false,
      position: "top" as const,
    },
    title: {
      display: false,
      text: "Chart.js Line Chart",
    },
  },
};

const labels = ["-1"];

export const chartData = (data, bin_limits) => { 
    bin_limits[0] = 10;
    return {
   labels:[1,2,3,4,5,6,7,8,9,10,11,12],
  datasets: [
    {
      fill: true,
      label: "Dataset 2",
      data: [...data],
      pointStyle: false,
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
}};
