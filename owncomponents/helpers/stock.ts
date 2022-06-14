
import moment from 'moment';

const lineas_stock = (result_from_pouch)=>{
	let lineas_de_stock = {};
        let entradas = result_from_pouch.rows;

        entradas.map(({ doc }) => {
          let insumos = doc.insumos;

          Object.entries(insumos).map(([k, insumo_item]) => {

            console.log("item", insumo_item);
            let cantidad = insumo_item.cantidad;
            let current_cantidad = lineas_de_stock[k]?.cantidad || 0;
            let updated_cantidad = current_cantidad + cantidad;
            if (!(k in lineas_de_stock)) {
              lineas_de_stock[k] = {};
            }
            lineas_de_stock[k].cantidad = updated_cantidad;
            lineas_de_stock[k].insumo = insumo_item.insumo;
          });
	  
        });

	return lineas_de_stock;
}

const verificar_existencia = (lineas_de_stock, actividad) => {
  
  return false;
}

const descontar_consumo = (lineas_de_stock, actividad) => {
  
} 

/**
 * Calcular los stocks usando todos los depositos
 * @param fecha 
 * @returns 
 */
const calcular_stock_actual = async (db) => {
  return db
  .allDocs({
    include_docs: true,
    startkey: "entrada:",
    endkey: "entrada:" + "\ufff0",
  })
  .then((e) => {
    // Tiene el stock total
    return lineas_stock(e);
    
  });
}

const iterar_campos_lotes_actividades = async (db, lineas_de_stock, actividad) => {
  return db
  .allDocs({
    include_docs: true,
    startkey: "campos_",
    endkey: "campos_" + "\ufff0",
  })
  .then((e) => {
    //Iter Campos
    e.rows.map(({doc})=>{
      let lotes = doc.lotes
      //Iter Lotes
      lotes.map(({properties}) => {
        let actividades = properties.actividades
        let fecha = actividades.detalles.fecha
        //Iter actividades
        actividades.map((act) => {
          if(act.uuid !== actividad.uuid){
            // Contar las act que no son la que estoy midiendo
            let mtarget = moment(actividad.detalles.fecha, "DD-MM-YYYY")
            let manalisis = moment(fecha, "DD-MM-YYYY")
            if(!(mtarget.isBefore(manalisis))){
              lineas_de_stock = descontar_consumo(lineas_de_stock,act)
            }
          }
        })

      })

      return lineas_de_stock;
    })
    
  });
}

const stock_suficiente = async (db, actividad) => {
  if(db){
      // Calcular stock actual
  let lineas_de_stock = await calcular_stock_actual(db)


  // Descontar del stock las actividades con fecha anterior e igual a la actual
  lineas_de_stock = await iterar_campos_lotes_actividades(db, lineas_de_stock, actividad)
  // Verificar si el stock remanente es suficiente
  return verificar_existencia(await lineas_de_stock, actividad)
  }else{
    return true
  }

}

export {lineas_stock, stock_suficiente}