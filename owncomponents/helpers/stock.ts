
import moment from 'moment';

const lineas_stock = (result_from_pouch)=>{
	let lineas_de_stock = {};
        let entradas = result_from_pouch.rows;

        entradas.map(({ doc }) => {
          let insumos = doc.insumos;

          Object.entries(insumos).map(([k, insumo_item]) => {

            //console.log("item", insumo_item);
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
  console.log("VERI EXIS", lineas_de_stock, actividad)
  let insumos = actividad.detalles.insumos

  let faltantes = insumos.filter((insumo) => {
      if(insumo.uuid in lineas_de_stock){
        if((lineas_de_stock[insumo.uuid].cantidad) >= insumo.total){
          return false;
        }else{
          return true;
        }
      }else{
        return true
      }
  })

  if(faltantes.length > 0){
    return false;
  }else{
    return true;
  }

}

const descontar_consumo = (lineas_de_stock, actividad) => {
  // Por ahora solo aplicaciones
  // console.log("Descontar Consumo", lineas_de_stock, actividad)
  if(actividad.tipo === 'aplicacion'){
    let insumos = actividad.detalles.insumos
    insumos.map((insumo)=>{
      if(insumo.uuid in lineas_de_stock){
        lineas_de_stock[insumo.uuid].cantidad =  (lineas_de_stock[insumo.uuid].cantidad - insumo.total)
      }else{
        lineas_de_stock[insumo.uuid] = {cantidad : (0 - insumo.total), insumo:{nombre:insumo.name, uuid:insumo.uuid}}
      }
    })

    return lineas_de_stock
  }
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
  //console.log("Lineas STOCK",lineas_de_stock)
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
        
        //Iter actividades
        actividades.map((act) => {
          if(act.uuid !== actividad.uuid){
            let fecha = act.detalles.fecha
            // Contar las act que no son la que estoy midiendo
            let mtarget = moment(actividad.detalles.fecha, "DD-MM-YYYY")
            let manalisis = moment(fecha, "DD-MM-YYYY")
            if(!(mtarget.isBefore(manalisis))){
              descontar_consumo(lineas_de_stock,act)
            }
          }
        })

        

      })

    })
    
  });
}

const stock_suficiente = async (db, actividad) => {
  if(db !== undefined){
      // Calcular stock actual
  if(actividad.tipo !== 'aplicacion'){
    return Promise.resolve(true)
  }
  let lineas_de_stock = await calcular_stock_actual(db)
  //console.log("STOCK ACTUAL", await lineas_de_stock)

  // Descontar del stock las actividades con fecha anterior e igual a la actual
  let lineas_de_stock_desc = await iterar_campos_lotes_actividades(db, await lineas_de_stock, actividad)

  //console.log("STOCK DeSCONTADO", await lineas_de_stock)
  // Verificar si el stock remanente es suficiente
  return verificar_existencia(await lineas_de_stock, actividad)
  }else{
    //console.log("DB UNDEF")
    return Promise.resolve(true)
  }

}

export {lineas_stock, stock_suficiente}