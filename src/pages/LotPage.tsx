import React from 'react'
import LotsMenu from '../components/LotsMenu';

export const LotPage = () => {

    
  return (
    <LotsMenu
    lot={selectedLot}
    field={selectedField}
    isOpen={() =>
      function () {
        return !!selectedLot;
      }
    }
    toggle={() => toggleLotDetailsModal()}
  />
  )
}
