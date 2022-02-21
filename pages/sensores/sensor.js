'use strict';
zuix.controller(function (cp) {
    const zx = zuix; // shorthand
    cp.create = function () {
        // cp.field('container')
        //     .css('background-image', 'url('+cp.model().cover+')')
        //     .on('click', function() {
        //         window.open(cp.model().link);
        //     });
        cp.field('sensor').on('click', function () {

            console.log("itempmodel", cp.model())
            const sensor_model = cp.model()
            const model_d = zx.context('dashboard-ctx').model();
            model_d.nombre = sensor_model.nombre
            model_d.tipo = sensor_model.tipo
            model_d.deveui = "ddsds"
            if (viewPagerSensores) {
                viewPagerSensores.next();
            }

            // show context menu


            //     console.log(cp.field('sensores_1'));
            //  console.log("Click en un sensor");

            //      if(viewPagerSensores){
            //      viewPagerSensores.next();
            //     //  const lista_html = cp.field("dashboard");
            //       dashboard_model.model = {deveui : "ssdsfsw"};
            //       console.log(dashboard_model);
            //  console.log(zuix.context('dashboard').model().deveui);


        });
    };



});
