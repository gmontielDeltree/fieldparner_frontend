import React from 'react';
import {createComponent} from '@lit/react';
import {MapPicker} from './map-picker.ts';

export const MapPickerReact = createComponent({
  tagName: 'map-picker-react',
  elementClass: MapPicker,
  react: React,
  events: {
    onPicked: 'positionPicked'
  },
});