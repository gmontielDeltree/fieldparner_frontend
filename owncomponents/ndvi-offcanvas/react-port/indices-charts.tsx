import React from 'react';

import {createComponent} from '@lit/react';
import { IndicesCharts } from '../indices-charts';


export const IndiceChartsReact = createComponent({

  tagName: 'indices-charts',

  elementClass: IndicesCharts,

  react: React,

  // events: {
  //   onSelectedFeatureChange : "selectedFeatureChange"
  // },

});