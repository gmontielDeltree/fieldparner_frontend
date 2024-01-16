import React from "react";

import {createComponent} from '@lit/react';
import {SensoresClass} from '../sensores-offcanvas copy 2.ts';

export const DeviceSidebar = createComponent({
  tagName: 'sensores-oc',
  elementClass: SensoresClass,
  react: React,
  events:{
    onClose : 'onClose'
  }
});