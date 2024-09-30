// import React from "react";

// import {createComponent} from '@lit/react';
// import {SensoresClass} from '../sensores-offcanvas copy 2.ts';

// export const DeviceSidebar = createComponent({
//   tagName: 'sensores-oc',
//   elementClass: SensoresClass,
//   react: React,
//   events:{
//     onClose : 'onClose'
//   }
// });



import React, { useRef } from "react";
import SensoresClass from '../SensoresClass'; // Importa directamente el componente en React

const DeviceSidebar = () => {
  const sensorRef = useRef(); // Usa una referencia para acceder a métodos públicos del componente

  const handleShowSensor = (deviceCard) => {
    // Llamar a la función 'show' del componente SensoresClass a través de la referencia
    if (sensorRef.current) {
      sensorRef.current.show(deviceCard);
    }
  };

  return (
    <>
      <h1>Device Sidebar</h1>
      {/* Renderiza el componente React convertido */}
      <SensoresClass ref={sensorRef} onClose={() => console.log("Sidebar cerrado")} />
      
      <button onClick={() => handleShowSensor({ device_id: '123' })}>
        Mostrar Sensor
      </button>
    </>
  );
};

export default DeviceSidebar;
