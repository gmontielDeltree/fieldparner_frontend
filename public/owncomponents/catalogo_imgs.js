/* global zuix */
'use strict';
zuix.controller(function (cp) {
    cp.create = function () {


        ndvi_db.get("04c295073296abe67dbd9f1d96e825e938defab1a1db65536ad438169474cc9c").then((result)=>{
            // Populate 
            console.log(result)
        })
        // TODO: handle input

        var myOffcanvas = document.getElementById('catalogo-imgs')
        /**
         * Offcanvas object
         */
        var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas)

        /**
         * Click
         */
        document.getElementById('abrir-catalogo').addEventListener('click', () => {
            bsOffcanvas.show()
        })

        const base64_to_blob_url = async (b64) =>{
            const base64Response = await fetch(b64);
            const blob = await base64Response.blob();
            return URL.createObjectURL(blob);
        }

        $('#anadir-catalogo-btn').click(() => {
            document.getElementById('catalogo-upload-input').click();
        })

        img_input = document.getElementById('catalogo-upload-input')

        img_input.addEventListener('change', function () {
            const file = this.files[0];
            if (file.type.startsWith('image/')) {

                const img = document.createElement('img');
                const watermarkPreview = document.getElementById("catalogo-preview");

                //img.classList.add("img-fluid");
                img.classList.add("row");
                //img.classList.add("col-md-2");
                img.classList.add("mx-1");
                img.classList.add("nota-img");
                img.classList.add("img-thumbnail")
                img.setAttribute("style", "height:100px; object-fit: cover;")
                img.file = file;

                watermarkPreview.appendChild(img);


                img.addEventListener('click', (e) => {
                    // Toggle on map
                    
                    map.addSource('radar', {
                        'type': 'image',
                        'url': e.target.src,//'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
                        'coordinates': [
                            [-80.425, 46.437],
                            [-71.516, 46.437],
                            [-71.516, 37.936],
                            [-80.425, 37.936]
                        ]
                    });
                    map.addLayer({
                        id: 'radar-layer',
                        'type': 'raster',
                        'source': 'radar',
                        'paint': {
                            'raster-fade-duration': 0
                        }
                    });
                })


                const reader = new FileReader();
                reader.onload = (function (aImg) { return function (e) { aImg.src = e.target.result; } })(img);
                reader.readAsDataURL(file);
            }

        });
    };
});
