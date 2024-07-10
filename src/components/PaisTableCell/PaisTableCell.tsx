import React from 'react';
import { Button } from '@mui/material';
import Swal from 'sweetalert2';
import { Country } from '../../interfaces/country';


// interface Pais {
//   code: string;
//   descriptionES: string;
//   descriptionPT: string;
//   descriptionEN: string;
//   language: string;
//   currency: string;
//   taxKey: string;
//   taxKeyFormat: string;
//   _id: string;
//   _rev: string;
// }

interface PaisTableCellProps {
  pais: Country | undefined; 
  mostrarDato: keyof Country; 
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
      mensaje += `<strong>${key}:</strong> ${pais[key as keyof Country]}<br>`;
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
