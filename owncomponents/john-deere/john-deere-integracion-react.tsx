import React from 'react';

import {createComponent} from '@lit/react';

import {JohnDeereIntegracion} from './john-deere-integracion-base';


export const JohnDeereIntegracionReact = createComponent({

  tagName: 'john-deere-integracion-base',

  elementClass: JohnDeereIntegracion,

  react: React,

   events: {

     onImportarCampo: 'importarCampo',
    onClose : 'onClose'
    //  onchange: 'change',

   },

});