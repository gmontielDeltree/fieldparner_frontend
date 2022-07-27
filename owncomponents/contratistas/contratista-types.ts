interface Labor {
  labor: string;
  uuid: string;
}

interface Contratista {
  labores: Labor[];
  nombre: string;
  uuid: string;
  cuit: string;
  datos_generales: { email: string; direccion: string; telefono: string };
}

const empty_contratista: Contratista = {
	labores: [],
	uuid: "",
	nombre: "",
	cuit: "",
	datos_generales: { email: "", direccion: "", telefono: "" },
  } ;

export { Labor, Contratista, empty_contratista };
