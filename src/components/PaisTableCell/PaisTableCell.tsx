import React from 'react';
import { Button } from '@mui/material';
import Swal from 'sweetalert2';


interface Pais {
  code: string;
  descriptionES: string;
  descriptionPT: string;
  descriptionEN: string;
  language: string;
  currency: string;
  taxKey: string;
  taxKeyFormat: string;
  _id: string;
  _rev: string;
}

interface PaisTableCellProps {
  pais: Pais | undefined; 
  mostrarDato: keyof Pais; 
}

export const PaisTableCell: React.FC<PaisTableCellProps> = ({ pais, mostrarDato }) => {

  const handleButtonClick = () => {
    if (!pais) {
      return;
      
    }


    const mostrarDatos = [
      'code',
      'currency',
      'descriptionEN',
      'descriptionES',
      'descriptionPT',
      'leguaje',
      'taxKey',
      'taxKeyFormat',
      
    ];
    let mensaje = '';
    console.log("datos de pais", pais)

   

    mostrarDatos.forEach((key) => {
      mensaje += `<strong>${key}:</strong> ${pais[key as keyof Pais]}<br>`;
    });

    Swal.fire({
      title: 'Datos del país',
      html: mensaje,
      icon: 'info',
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      customClass: {
        container: 'swal2-container',
        popup: 'swal2-popup',
        title: 'swal2-title',
        confirmButton: 'swal2-confirm-button',
        closeButton: 'swal2-close',
      },
    });
    
  };

  if (!pais) {
    return (
      <Button disabled>
        Datos no disponibles
      </Button>
    );
  }

  return (
    <Button onClick={handleButtonClick}>
      {pais[mostrarDato]}
    </Button>
  );
};
