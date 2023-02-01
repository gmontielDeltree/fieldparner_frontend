interface Labor {
  labor: string;
  uuid: string;
}

interface Contratista {
  _id: string;
  _rev?: string;
  labores: Labor[];
  nombre: string;
  uuid: string;
  cuit: string;
  datos_generales: { email: string; direccion: string; telefono: string };
}

const empty_contratista: Contratista = {
  _id: "contratista:",
  labores: [],
  uuid: "",
  nombre: "",
  cuit: "",
  datos_generales: { email: "", direccion: "", telefono: "" },
};

const getContratistas = async (db: PouchDB.Database) => {
  let result = await db.allDocs({
    include_docs: true,
    startkey: "contratista:",
    endkey: "contratista:\ufff0",
  });

  if (result.rows?.length > 0) {
    // Hay Rows
    let docs = result.rows.map((r) => r.doc); // Extraer los docs
    return docs as Contratista[];
  } else {
    return []; // Retorna una promesa vacia
  }
  
};

export { Labor, Contratista, empty_contratista, getContratistas };
