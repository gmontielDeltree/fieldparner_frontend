import React, { useRef, useEffect } from "react";
import SensoresClass from '../SensoresClass'; // Importa directamente el componente en React

export const DeviceSidebar = ({ onClose, map, uuid, _selected_device_card }) => {
  return (
    <>
      <SensoresClass
        onClose={onClose}
        map={map}
        uuid={uuid}
        selectedDeviceCard={_selected_device_card}
      />
    </>
  );
};
