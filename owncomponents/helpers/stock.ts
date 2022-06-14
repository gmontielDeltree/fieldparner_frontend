
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

export {lineas_stock}