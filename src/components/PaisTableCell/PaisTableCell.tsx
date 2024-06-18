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
  pais: Pais | undefined; // Hacemos opcional el objeto Pais
  mostrarDato: keyof Pais; // Clave de Pais que queremos mostrar inicialmente
}

export const PaisTableCell: React.FC<PaisTableCellProps> = ({ pais, mostrarDato }) => {

  const handleButtonClick = () => {
    if (!pais) {
      // Si pais es undefined, no hacemos nada
      return;
      
    }

    // Definimos las claves que queremos mostrar en el SweetAlert
    const mostrarDatos = [
      'Codigo',
      'Moneda',
      'descriptionEN',
      'descriptionES',
      'descriptionPT',
      'lenguaje',
      'taxKey',
      'taxKeyFormat',
      
    ];

    console.log("datos de pais", pais)

    let mensaje = '';

    // Construimos el mensaje basado en las claves seleccionadas
    mostrarDatos.forEach((key) => {
      mensaje += `${key}: ${pais[key as keyof Pais]}\n`;
    });

    Swal.fire({
      title: 'Datos del país',
      html: `<pre style="text-align: left; white-space: pre-wrap;">${mensaje}</pre>`,
      confirmButtonText: 'Aceptar',
    });
    
  };

  if (!pais) {
    // Si pais es undefined, podemos renderizar un mensaje indicando que no hay datos disponibles
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
