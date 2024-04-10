import React from 'react';

import {createComponent} from '@lit/react';

import {AnalisisPrecios} from './analisis-precios-base';


export const AnalisisPreciosReact = createComponent({

  tagName: 'analisis-precios',

  elementClass: AnalisisPrecios,

  react: React,
   events: {

     onClose: 'onClose',

//     onchange: 'change',

   },

});