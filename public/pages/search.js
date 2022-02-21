'use strict';


zuix.controller(function(cp) {
  const zx = zuix; // shorthand
  let itemsList;

  cp.create = function() {
   // let url = cp.view().attr('data-o-rss');
   // Use a proxy to prevent CORS policy restrictions errors
   // url = '//cors-anywhere.herokuapp.com/'+url;
   fetchSensores("http://listadesensores.com");
  };

  function fetchSensores(url){
	console.log(url);
	// Populate itemlist
	itemsList=[{nombre : "Sensor #1", tipo:"HC-02"},{nombre : "Sensor #2", tipo:"HC-02"},{nombre : "Sensor #3", tipo:"HC-02"}];
	refresh();
  };

  function refresh(){
	const lista_html = cp.field("lista_sensores");
	if (itemsList != null) {
		zx.$.each(itemsList, function(i, item) {
		  const options = {
		    lazyLoad:false,
		    model: item
		  };
		  let el;
		
		  
		  
		  // different layout for first 4 items (bigger)
		  el = zx.createComponent('pages/sensores/sensor', options).container();
		  // 2 columns layout
		    
		  // center the list on wide screens
		  el.setAttribute('layout', 'column stretch-center');
		  lista_html.append(el);
		});
		zuix.componentize();
	      }
  }
});