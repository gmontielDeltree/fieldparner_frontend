interface Labor {
	labor: string;
	uuid: number;
      }
      
      interface Contratista {
	labores: Labor[];
	nombre: string;
	uuid: string;
	cuit: string;
	datos_generales: { email: string; direccion: string; telefono: string };
      }

export {Labor, Contratista}