import React from 'react';

import {createComponent} from '@lit/react';

import {MagrisExtension} from './magris-base-for-react';
import { MagrisReporteOC } from './reporte-base-for-react';


export const MagrisIntegracionReact = createComponent({

  tagName: 'magris-extension',

  elementClass: MagrisExtension,

  react: React,

   events: {

    onNavigateTo: 'navigateTo',
    onClose : 'close'
    //  onchange: 'change',

   },

});


export const MagrisReporte = createComponent({

  tagName: 'magris-reporte',

  elementClass: MagrisReporteOC,

  react: React,

   events: {

    //  onImportarCampo: 'importarCampo',
    onClose : 'close'
    // //  onchange: 'change',

   },

});