import * as React from 'react';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import { chartData, chartOptions } from '../chartOptions';
ChartJS.register(...registerables);

import { Line } from 'react-chartjs-2';


export const ChartSelector = (props) => {


    React.useEffect(()=>{
        console.log(props)
    })

    return (<>
        <Line  options={chartOptions} data={chartData(props.datos[0], props.datos[1])} />
    </>)
}