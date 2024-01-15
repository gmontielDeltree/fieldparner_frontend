import React from 'react';

import {createComponent} from '@lit/react';
import { IndiceSelector } from '../indice-selector';


export const IndiceSelectorReact = createComponent({

  tagName: 'indice-selector',

  elementClass: IndiceSelector,

  react: React,

  events: {
    onSelectedFeatureChange : "selectedFeatureChange"
  },

});