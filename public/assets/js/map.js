
console.log("UUID", uuidv4()); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

mapboxgl.accessToken = 'pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-59.2965, -35.1923],
    zoom: 12,
    attributionControl: true,
    preserveDrawingBuffer: true,
});

//onclick support for mobile devices  
let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

// navigation controls
map.addControl(new mapboxgl.NavigationControl()); // zoom controls

// scale bar
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 90,
    unit: 'imperial',
    position: 'bottom-right'
}));

// geolocation 
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

//This overides the Bootstrap modal "enforceFocus" to allow user interaction with main map 
$.fn.modal.Constructor.prototype.enforceFocus = function () { };

// print function 
var printBtn = document.getElementById('mapboxgl-ctrl-print');
var exportView = document.getElementById('export-map');

var printOptions = {
    disclaimer: "Port of Portland geospatial data is gathered, maintained and primarily used for internal reference and analysis, and is only updated as resources permit. Geospatial data refers to data and information referenced to a location on the Earth's surface such as maps, charts, air photos, satellite images, cadastre and land and water surveys, in digital or hard copy form. Geospatial data may be gathered and maintained by more than one person or department within the Port, and data distributed by one person or department may not reflect the most recent data available from the Port or from other sources. Port geospatial data is not intended for survey or engineering purposes or to describe the authoritative or precise location of boundaries, fixed human works, or the shape and contour of the earth. The Port makes no warranty of any kind, expressed or implied, including any warranty of merchantability, fitness for a particular purpose, or any other matter with respect to its geospatial data. The Port is not responsible for possible errors, omissions, misuse, or misrepresentation of its geospatial data. Port geospatial data is not intended as a final determination of such features as existing or proposed infrastructure, conservation areas, or the boundaries of regulated areas such as wetlands, all of which are subject to surveying or delineation and may change over time. No representation is made concerning the legal status of any apparent route of access identified in geospatial data. The foregoing disclaimer applies to uses of Port geospatial data in any context, including online access at Port workstations, remote access, or use in downloaded digital or hard copy form.",
    northArrow: 'assets/libs/print-export/north_arrow.svg'
}

printBtn.onclick = function (e) {
    PrintControl.prototype.initialize(map, printOptions)
}

exportView.onclick = function (e) {
    PrintControl.prototype.exportMap();
    e.preventDefault();
}


// Layer Search Event Handlers
$('#search_general').on('click', function (e) {

    var criteria = $('#general_search').val();
    var prop = $('#property-descr').text();
    var layer_mapfile = $('#json_layer').val();

    addJsonLayerFilter(layer_mapfile, prop, criteria);

});

$('#clear_general').on('click', function (e) {

    $("#general_search").val("");
    $("#property-descr").html("<br />");
    clearFilterLayer();

});




Notification.requestPermission();


// Geocoder API
// Geocoder API 
// Geocoder API
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
});

var addressTool = document.getElementById('addressAppend');
addressTool.appendChild(geocoder.onAdd(map))

map.on('load', function () {
    map.addSource('geocode-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addLayer({
        "id": "geocode-point",
        "source": "geocode-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "cyan",
            'circle-opacity': .75,
        }

    });

    geocoder.on('result', function (ev) {
        map.getSource('geocode-point').setData(ev.result.geometry);
    });

});

//Enter Lat Long
//Enter Lat Long
//Enter Lat Long

map.on('load', function () {

    $(document).ready(function () {


        //clear
        $('#findLLButtonClear').click(function () {

            map.removeLayer("enterLL");
            map.removeSource("enterLL");

            if (map.getLayer("enterLL")) {
                map.removeLayer("enterLL");
                map.removeSource("enterLL");
            }

        });

        //create
        $('#findLLButton').click(function () {

            var enterLng = +document.getElementById('lngInput').value
            var enterLat = +document.getElementById('latInput').value

            var enterLL = turf.point([enterLng, enterLat]);

            if (map.getLayer("enterLL")) {
                map.removeLayer("enterLL");
                map.removeSource("enterLL");
            }

            map.addSource('enterLL', {
                type: 'geojson',
                data: enterLL
            });

            map.addLayer({
                id: 'enterLL',
                type: 'circle',
                source: 'enterLL',
                paint: {
                    "circle-radius": 10,
                    "circle-color": "cyan",
                    'circle-opacity': .75,
                },
            });

            map.flyTo({
                center: [enterLng, enterLat]
            });

        });
    });
});


// Coordinates & Elevation Tool
// Coordinates & Elevation Tool
// Coordinates & Elevation Tool

map.on(touchEvent, function (e) {
    //coordinates tool
    document.getElementById('info').innerHTML =
        JSON.stringify(e.lngLat, function (key, val) { return val.toFixed ? Number(val.toFixed(4)) : val; }).replace('{"lng":', '').replace('"lat":', ' ').replace('}', '')

});

//sky and terrain layer
//sky and terrain layer
//sky and terrain layer
map.on('load', function () {
    // map.addSource('mapbox-dem', {
    //     'type': 'raster-dem',
    //     'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
    //     'tileSize': 512,
    //     'maxzoom': 14
    // });
    // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });
});

//Layer Tree
//Layer Tree
//Layer Tree

//Load Layers
// Layers that load first will be at the bottom of the root directory within the Layer Tree

var emptyGJ = {
    'type': 'FeatureCollection',
    'features': []
};

map.on('load', function () {

    //monster layers
    //Mr. Claw layer sources
    map.addSource('monster', { type: 'geojson', data: emptyGJ });
    map.addSource('mouth', { type: 'geojson', data: emptyGJ });
    map.addSource('water-line', { type: 'geojson', data: emptyGJ });
    map.addSource('eyes', { type: 'geojson', data: emptyGJ });

    map.addLayer({
        "id": "monster",
        "type": "fill",
        "source": "monster",
        "layout": {
            //"visibility": 'none'
        },
        "paint": {
            'fill-color': '#b30000',
            'fill-opacity': 1.0
        }
    });

    map.addLayer({
        "id": "mouth",
        "type": "fill",
        "source": "mouth",
        "layout": {
            //"visibility": 'none'
        },
        "paint": {
            'fill-color': 'white',
            'fill-opacity': 1.0
        }
    });

    map.addLayer({
        "id": "water-line",
        "type": "line",
        "source": "water-line",
        "layout": {
            // "visibility": 'none'
        },
        "paint": {
            'line-color': '#0099ff',
            'line-opacity': 1.0,
            "line-width": 9,
        },
    });

    map.addLayer({
        "id": "eyes",
        "type": "circle",
        "source": "eyes",
        "layout": {
            //"visibility": 'none'
        },
        "paint": {
            'circle-color': 'white',
            'circle-opacity': 1.0,
            'circle-stroke-color': 'black',
            'circle-stroke-width': 3,
            'circle-stroke-opacity': 1.0,
        }
    });

    //monster layers
    //Mr. Octo layer sources
    map.addSource('octo', { type: 'geojson', data: emptyGJ });
    map.addSource('water-line-2', { type: 'geojson', data: emptyGJ });
    map.addSource('mouth2', { type: 'geojson', data: emptyGJ });
    map.addSource('eyes2', { type: 'geojson', data: emptyGJ });


    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
        if (error) throw error;
        map.addImage('custom-marker', image);
        map.addSource('sensores', { type: 'geojson', data: '/phpiot20/apiv0/posiciones_devices.php' });
            map.addLayer({
                    "id": "sensores",
                    "type": "symbol",
                    "source": "sensores",
                    "layout": {
                        'icon-image': 'custom-marker',
                        'text-field': ['get', 'deveui'],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                        //"visibility": 'none'
                    }
                });
        });

    map.addSource('lotes', { type: 'geojson', data: '/phpiot20/lotes_by_campo_geojson.php?campoid=20' });

 

    map.addLayer({
        "id": "lotes",
        "type": "fill",
        "source": "lotes",
        "layout": {
            //"visibility": 'none'
        },
        'paint': {
            'fill-color': 'red',
            'fill-opacity': 0.4,
            'fill-outline-color': 'red',
        }
    });

    map.addLayer({
        "id": "octo",
        "type": "fill",
        "source": "octo",
        "layout": {
            //"visibility": 'none'
        },
        "paint": {
            'fill-color': 'black',
            'fill-opacity': 1.0
        }
    });

    map.addLayer({
        "id": "water-line-2",
        "type": "line",
        "source": "water-line-2",
        "layout": {
            // "visibility": 'none'
        },
        "paint": {
            'line-color': '#0099ff',
            'line-opacity': 1.0,
            "line-width": 9,
        },
    });
    map.addLayer({
        "id": "mouth2",
        "type": "fill",
        "source": "mouth2",
        "layout": {
            //"visibility": 'none'
        },
        "paint": {
            'fill-color': 'white',
            'fill-opacity': 1.0
        }
    });

    map.addLayer({
        "id": "eyes2",
        "type": "circle",
        "source": "eyes2",
        "layout": {
            //"visibility": 'none'
        },
        "paint": {
            'circle-color': 'red',
            'circle-opacity': 1.0,
            'circle-stroke-color': 'lightblue',
            'circle-stroke-width': 4,
            'circle-stroke-opacity': 1.0,
        }
    });

    //cultural layers
    //cultural layers
    map.addSource('country', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "country",
        "type": "fill",
        "source": "country",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'fill-color': '#595959',
            'fill-opacity': .5,
            'fill-outline-color': '#333333',
        }
    });


    map.addSource('populated', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "populated",
        "type": "circle",
        "source": "populated",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'circle-color': 'white',
            'circle-opacity': 1.0,
            'circle-stroke-color': '#ff8c1a',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 1.0,
        }
    });


    //physical layers
    //physical layers
    map.addSource('ocean', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "ocean",
        "type": "fill",
        "source": "ocean",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'fill-color': '#00334d',
            'fill-opacity': 0.5,
            'fill-outline-color': '#00111a',
        }
    });

    map.addSource('river', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "river",
        "type": "line",
        "source": "river",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'line-color': '#0099cc',
            'line-opacity': .8,
            "line-width": 4,
        },
    });



    // Sensores PopUp
    map.on(touchEvent, 'sensores', (e) => {
    // Copy coordinates array.
    console.log(e.features);
    const coordinates = e.features[0].geometry.coordinates.slice();
    //const description = JSON.stringify(e.features[0].properties);
    const description = "<button class=\"popup-detalles\">Detalles</button>";
     
    
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
     
    new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map)
   
    
    // Hook on click detalles
    $('.popup-detalles').on('click',()=>{
            console.log(coordinates)
            showSensorDetails()
        }
    );

    }) //End Sensores PopUp

    //Layer Info function
    //Layer Info function
    //Layer Info function
    //Layer Info function
    map.on(touchEvent, function (e) {

        document.getElementById("layer-attribute").innerHTML = "";

    });

    map.on(touchEvent, function (e) {

        var popup = new mapboxgl.Popup();
        var feature;
        var append = document.getElementById('layer-attribute');


        // Lotes - Layer Info
        if (map.queryRenderedFeatures(e.point, { layers: ['lotes'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['lotes'] })[0];

            console.log(feature);

            append.innerHTML +=
                '<h5>Lote Info</h5>' +
                '<hr>' +
                '<b>Nombre: </b>' + feature.properties.nombre +
                '<hr>' +
                '<b>Notas: </b>' + feature.properties.notas +
                '<hr>' +
                '<b>Sembrado: </b>' + 'Soja' +
                '<hr>' +
                '<b>Última: </b>' + 'Seafood Festivals' +
                '<hr>'

            $('#attributesModal').modal();
        }
        //Cultural - Layer Info
        //Cultural - Layer Info

        if (map.queryRenderedFeatures(e.point, { layers: ['populated'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['populated'] })[0];

            append.innerHTML +=
                '<h5>Populated Places</h5>' +
                '<hr>' +
                '<b>City: </b>' + feature.properties.name +
                '<hr>' +
                '<b>Country: </b>' + feature.properties.sov0name +
                '<hr>'
        }

        if (map.queryRenderedFeatures(e.point, { layers: ['country'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['country'] })[0];

            append.innerHTML +=
                '<h5>Pavement Test</h5>' +
                '<hr>' +
                '<b>Survey Quality: </b>' + feature.properties.loc_survey_quality_cd_resolved +
                '<hr>' +
                '<b>Pavement Location: </b>' + feature.properties.pavement_loc_cd_resolved +
                '<hr>' +
                '<b>Lifecycle Status: </b>' + feature.properties.lifecycle_status_cd_resolved +
                '<hr>' +
                '<b>Network ID: </b>' + feature.properties.network_id +
                '<hr>' +
                '<b>Branch ID: </b>' + feature.properties.branch_id +
                '<hr>' +
                '<b>Section ID: </b>' + feature.properties.section_id +
                '<hr>' +
                '<b>PID: </b>' + feature.properties.pid +
                '<hr>' +
                '<b>PCI: </b>' + feature.properties.PCI +
                '<hr>' +
                '<b>Square Footage: </b>' + feature.properties.FMEArea +
                '<hr>' +
                '<b>Square Footage: </b>' + feature.properties.FMEArea +
                '<hr>' +
                '<b>Work History 1: </b>' + feature.properties.WorkHistory_1 +
                '<hr>' +
                '<b>Work History 2: </b>' + feature.properties.WorkHistory_2 +
                '<hr>' +
                '<b>Work History 3: </b>' + feature.properties.WorkHistory_3 +
                '<hr>' +
                '<b>Work History 4: </b>' + feature.properties.WorkHistory_4 +
                '<hr>' +
                '<b>Work History 5: </b>' + feature.properties.WorkHistory_5 +
                '<hr>' +
                '<b>Work History 6: </b>' + feature.properties.WorkHistory_6 +
                '<hr>'
        }

        //Monster - Layer Info
        //Monster - Layer Info
        if (map.queryRenderedFeatures(e.point, { layers: ['monster'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['monster'] })[0];

            append.innerHTML +=
                '<h5>Monster Info</h5>' +
                '<hr>' +
                '<b>Name: </b>' + 'Mr. Claw' +
                '<hr>' +
                '<b>Place of Birth: </b>' + 'Atlantic Ocean' +
                '<hr>' +
                '<b>Likes: </b>' + 'Birthday Parties' +
                '<hr>' +
                '<b>Dislikes: </b>' + 'Seafood Festivals' +
                '<hr>'
        }

        //Monster - Layer Info
        //Monster - Layer Info
        if (map.queryRenderedFeatures(e.point, { layers: ['octo'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['octo'] })[0];

            append.innerHTML +=
                '<h5>Monster Info</h5>' +
                '<hr>' +
                '<b>Name: </b>' + 'Mr. Octo' +
                '<hr>' +
                '<b>Place of Birth: </b>' + 'Pacific Ocean' +
                '<hr>' +
                '<b>Likes: </b>' + 'Big Salads' +
                '<hr>' +
                '<b>Dislikes: </b>' + 'Jules Verne' +
                '<hr>'
        }


        //Physical - Layer Info
        //Physical  - Layer Info
        if (map.queryRenderedFeatures(e.point, { layers: ['ocean'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['ocean'] })[0];

            append.innerHTML +=
                '<h5>Oceans</h5>' +
                '<hr>' +
                '<b>Name: </b>' + feature.properties.name +
                '<hr>'
        }

        if (map.queryRenderedFeatures(e.point, { layers: ['river'] }).length) {

            feature = map.queryRenderedFeatures(e.point, { layers: ['river'] })[0];

            append.innerHTML +=
                '<h5>Major Rivers</h5>' +
                '<hr>' +
                '<b>Name: </b>' + feature.properties.name +
                '<hr>'
        }
    });

    //cursor = pointer on hover configuration
    map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['ocean', 'river', 'country', 'populated', 'monster', 'octo']
        });
        map.getCanvas().style.cursor = (features.length) ? 'default' : '';
    });

    //Highlight Features Function
    //Highlight Features Function
    //Highlight Features Function
    //Highlight Features Function
    map.on(touchEvent, function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["populated"] });

        if (map.getLayer("populated_hl")) {
            map.removeLayer("populated_hl");
        }

        if (features.length) {

            map.addLayer({
                "id": "populated_hl",
                "type": "circle",
                "source": "populated",
                "layout": {},
                "paint": {
                    "circle-color": "cyan",
                    "circle-radius": 7
                },
                "filter": ["==", "name", features[0].properties.name],
            });
        }
    });

    map.on(touchEvent, function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["country"] });

        if (map.getLayer("country_hl")) {
            map.removeLayer("country_hl");
        }

        if (features.length) {

            map.addLayer({
                "id": "country_hl",
                "type": "line",
                "source": "country",
                "layout": {},
                "paint": {
                    "line-color": "cyan",
                    "line-width": 3
                },
                "filter": ["==", "sovereignt", features[0].properties.sovereignt],
            });
        }
    });

    //Highlight - Mr. Claw
    map.on(touchEvent, function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["monster"] });

        if (map.getLayer("monster_hl")) {
            map.removeLayer("monster_hl");
        }

        if (features.length) {

            map.addLayer({
                "id": "monster_hl",
                "type": "line",
                "source": "monster",
                "layout": {},
                "paint": {
                    "line-color": "cyan",
                    "line-width": 3
                },
                "filter": ["==", "Id", features[0].properties.Id],
            });
        }
    });

    //Highlight - Mr. Octo
    map.on(touchEvent, function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["octo"] });

        if (map.getLayer("octo_hl")) {
            map.removeLayer("octo_hl");
        }

        if (features.length) {

            map.addLayer({
                "id": "octo_hl",
                "type": "line",
                "source": "octo",
                "layout": {},
                "paint": {
                    "line-color": "cyan",
                    "line-width": 3
                },
                "filter": ["==", "Id", features[0].properties.Id],
            });
        }
    });

    //Highlight - Physical
    map.on(touchEvent, function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["river"] });

        if (map.getLayer("river_hl")) {
            map.removeLayer("river_hl");
        }

        if (features.length) {

            map.addLayer({
                "id": "river_hl",
                "type": "line",
                "source": "river",
                "layout": {},
                "paint": {
                    "line-color": "cyan",
                    "line-width": 4
                },
                "filter": ["==", "name", features[0].properties.name],
            });
        }
    });

    map.on(touchEvent, function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ["ocean"] });

        if (map.getLayer("ocean_hl")) {
            map.removeLayer("ocean_hl");
        }

        if (features.length) {

            map.addLayer({
                "id": "ocean_hl",
                "type": "line",
                "source": "ocean",
                "layout": {},
                "paint": {
                    "line-color": "cyan",
                    "line-width": 3
                },
                "filter": ["==", "name", features[0].properties.name],
            });
        }
    });
});

// Directory Options
// Directory Options
// Directory Options - open or closed by defualt (true/false)
var directoryOptions =
    [
        {
            'name': 'Monsters',
            'open': true
        },
        {
            'name': 'Cultural',
            'open': true
        },
        {
            'name': 'Campos',
            'open': true
        },

    ];

// organize layers in the layer tree
var layers =

    [
        // Mr Claw LAYER TREE CONFIG
        // Mr Claw LAYER TREE CONFIG
        {
            'name': 'Mr Claw',
            'id': 'monster_group',
            'hideLabel': ['mouth', 'water-line', 'eyes', 'monster'],
            'icon': 'assets/images/icons/layer-stack-15.svg',
            'layerGroup': [
                {
                    'id': 'monster',
                    'source': 'monster',
                    'name': 'Mr. Claw',
                    'path': 'assets/json/monster.json',
                },
                {
                    'id': 'mouth',
                    'source': 'mouth',
                    'name': 'Mouth',
                    'path': 'assets/json/mouth.json',
                },
                {
                    'id': 'water-line',
                    'source': 'water-line',
                    'name': 'Water',
                    'path': 'assets/json/water.json',
                },
                {
                    'id': 'eyes',
                    'source': 'eyes',
                    'name': 'Eyes',
                    'path': 'assets/json/eyes.json',
                },

            ],
            'directory': 'Monsters'
        },

        // Mr Octo LAYER TREE CONFIG
        // Mr Octo LAYER TREE CONFIG
        {
            'name': 'Mr. Octo',
            'id': 'monster_group_2',
            'hideLabel': ['octo', 'water-line-2', 'eyes2', 'mouth2'],
            'icon': 'assets/images/icons/layer-stack-15.svg',
            'layerGroup': [
                {
                    'id': 'octo',
                    'source': 'octo',
                    'name': 'Mr. Octo',
                    'path': 'assets/json/octo.json',
                },
                {
                    'id': 'water-line-2',
                    'source': 'water-line-2',
                    'name': 'Water',
                    'path': 'assets/json/water2.json',
                },
                {
                    'id': 'mouth2',
                    'source': 'mouth2',
                    'name': 'Mouth',
                    'path': 'assets/json/mouth2.json',
                },
                {
                    'id': 'eyes2',
                    'source': 'eyes2',
                    'name': 'Eyes',
                    'path': 'assets/json/eyes2.json',
                },
            ],
            'directory': 'Monsters'
        },

        // Cultural LAYER TREE CONFIG
        // Cultural LAYER TREE CONFIG

        {
            'name': 'Populated Places',
            'id': 'populated',
            'source': "populated",
            'path': 'assets/json/ne_50m_populated_places_simple.geojson',
            'directory': 'Cultural',
        },
        {
            'name': 'Countries',
            'id': 'country',
            'source': 'country',
            'path': 'assets/json/ne_110m_admin_0_map_units.geojson',
            'directory': 'Cultural',
        },


        // Physical LAYER TREE CONFIG
        // Physical LAYER TREE CONFIG

        {
            'name': 'Major Rivers',
            'id': 'river',
            'source': 'river',
            'path': 'assets/json/ne_110m_rivers_lake_centerlines.geojson',
            'directory': 'Campos',
        },
        {
            'name': 'Oceans',
            'id': 'ocean',
            'source': 'ocean',
            'path': 'assets/json/ne_110m_geography_marine_polys.geojson',
            'directory': 'Campos',
        },
        {
            'name': 'Oceans',
            'id': 'ocean',
            'source': 'ocean',
            'path': 'assets/json/ne_110m_geography_marine_polys.geojson',
            'directory': 'Campos',
        },

    ];


var layerList = new LayerTree({ layers: layers, directoryOptions: directoryOptions, onClickLoad: true });

var layerTool = document.getElementById('menu');
layerTool.appendChild(layerList.onAdd(map))


//3D on/off button
function threeDbutton() {
    currentvalue = document.getElementById('threeDbutton').value;

    if (currentvalue == "3D") {

        document.getElementById("threeDbutton").value = "3D ";
        document.getElementById("threeDbutton").style.color = "#2CB5E3";
        document.getElementById("threeDbutton").style.paddingLeft = "7px";
        map.flyTo({
            pitch: 70,
        });

    } else {
        document.getElementById("threeDbutton").value = "3D";
        document.getElementById("threeDbutton").style.color = "#000";
        map.flyTo({
            pitch: 0,
        });
    }
}

//TEXT TOOL
//TEXT TOOL
//TEXT TOOL

var MAP_DIV = map.getCanvasContainer();
var EDIT_NODE = document.getElementById('editTextTool');
var LABEL_NODE = document.getElementById('textTool');

//set user defined sizes/colors in palette
var TEXT_SIZES = [24, 20, 16, 12];
var TEXT_COLORS = ['#000', '#c12123', '#ee4498', '#00924d', '#00afde', '#ccbe00'];

//char count limit
var CHAR_LIMIT = 20;

//drag status
var isDragging = false;


function activateTool(el) {
    if (el.getAttribute('active') === 'true') {
        el.setAttribute('active', false);

        if (el.isEqualNode(EDIT_NODE)) {
            var activeInput = document.querySelector('.label-marker.active span');
            if (activeInput) {
                activeInput.focus();
                activeInput.blur();
            }
        }
        MAP_DIV.style.cursor = '';

    } else {
        el.isEqualNode(EDIT_NODE) ? LABEL_NODE.setAttribute('active', false) : EDIT_NODE.setAttribute('active', false);
        el.setAttribute('active', true);

        MAP_DIV.style.cursor = 'crosshair';
    }
}

//generate unique layer ids for text-labels
function generateTextID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//convert marker DOM elements to symbol layers
function markerToSymbol(e, elm) {
    if (isDragging) return;

    MAP_DIV.style.cursor = '';

    var that = this instanceof Element ? this : elm;
    var childSpan = document.querySelector('.marker-text-child');

    if (childSpan) var parent = childSpan.parentNode;

    if (that.innerText !== '' && that.innerText.length > 0) {
        parent ? parent.classList.remove('active') : that.classList.remove('active');

        var fontSize = that.style['font-size'] === '' ? TEXT_SIZES[1] : parseInt(that.style['font-size'].split('px')[0]); //textSize[1] is default
        var fontColor = that.style.color === '' ? '#000' : that.style.color;
        var coords = [that.getAttribute('lng'), that.getAttribute('lat')];

        var labelGJ = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": coords
                    }
                }
            ]
        };

        var id = generateTextID();
        var lyrID = id + '-custom-text-label';

        map.addSource(id, { type: 'geojson', data: labelGJ });

        map.addLayer({
            "id": lyrID,
            "type": "symbol",
            "source": id,
            "layout": {
                "text-field": that.innerText,
                "text-size": fontSize,
                "symbol-placement": "point",
                "text-keep-upright": true
            },
            "paint": {
                "text-color": fontColor,
                "text-halo-color": '#FFF',
                "text-halo-width": 2,
            },
        });

        //removes text-input marker after clicking off
        LABEL_NODE.setAttribute('active', false);

        that.removeEventListener('blur', markerToSymbol);
    }

    parent ? parent.remove() : that.remove();
}

//label text limit/prevent event keys
function inputText(e) {

    console.log(e.key, e.keyCode)

    //arrow keys
    if ([32, 37, 38, 39, 40, 8].indexOf(e.keyCode) > -1) {
        e.stopPropagation();
        //enter key

    } else if (e.keyCode === 13 && this.innerText.length <= CHAR_LIMIT) {
        this.blur();

        MAP_DIV.style.cursor = '';

        e.preventDefault();
        //limit
    } else if (this.innerText.length >= CHAR_LIMIT && e.keyCode !== 8) {
        e.preventDefault();
        alert(keycode);
    }
}


//pasting text into requires additional handling
//for text limit
function handlePaste(e) {
    var clipboardData, pastedData;

    e.stopImmediatePropagation();
    e.preventDefault();

    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('text/plain').slice(0, CHAR_LIMIT);

    this.innerText = pastedData;
}

function createMarker(e, el) {

    new mapboxgl.Marker(el)
        .setLngLat(e.lngLat)
        .addTo(map);
}

//populates edit palette with user defined colors/sizes
function populatePalette() {
    var palette = document.getElementById('customTextPalette');
    var textSizeDiv = document.getElementById('customTextSize');
    var textColorDiv = document.getElementById('customTextColor');

    for (var s = 0; s < TEXT_SIZES.length; s++) {
        var sElm = document.createElement('div');
        sElm.className = 'font-size-change';
        sElm.id = 'font-' + TEXT_SIZES[s];
        sElm.innerText = 'T'; //change to whatever font/image
        sElm.style['font-size'] = TEXT_SIZES[s] + 'px';
        sElm.addEventListener('mousedown', changeFontStyle);

        textSizeDiv.appendChild(sElm);
    };

    for (var c = 0; c < TEXT_COLORS.length; c++) {
        var cElm = document.createElement('div');
        cElm.className = 'font-color-change';
        cElm.id = 'font-' + TEXT_COLORS[c];
        cElm.style['background-color'] = TEXT_COLORS[c];
        cElm.addEventListener('mousedown', changeFontStyle);

        textColorDiv.appendChild(cElm);
    };
}

//update marker font styles
function changeFontStyle(e) {
    e.preventDefault();
    e.stopPropagation();

    var labelDiv = document.querySelector('.label-marker');
    var childSpan = document.querySelector('.marker-text-child');

    var mark = childSpan ? childSpan : labelDiv;

    if (mark) {
        labelDiv.classList.add('active');
        if (e.target.classList.contains('font-size-change')) {
            mark.style['font-size'] = e.target.style['font-size'];
        } else if (e.target.classList.contains('font-color-change')) {
            mark.style.color = e.target.style['background-color'];
        }

        mark.focus();
    }

    MAP_DIV.style.cursor = 'text';
}

//marker move functionality - modified GL example
//https://www.mapbox.com/mapbox-gl-js/example/drag-a-point/
function beginDrag(e) {
    e.stopImmediatePropagation();

    map.dragPan.disable();

    isDragging = true;

    MAP_DIV.style.cursor = 'cursor:-moz-grab;cursor:-webkit-grab;cursor:grab';

    map.on('mousemove', onDrag);
    map.on('touchmove', onDrag);

    map.once('mouseup', stopDrag);
    map.once('touchend', stopDrag);
}

function onDrag(e) {
    if (!isDragging) return;

    var label = document.querySelector('.label-marker');

    MAP_DIV.style.cursor = 'cursor:-moz-grabbing;cursor:-webkit-grabbing;cursor:grabbing';

    map.dragPan.disable();

    createMarker(e, label);
}

function stopDrag(e) {
    if (!isDragging) return;

    var textSpan = document.querySelector('.marker-text-child');

    textSpan.setAttribute('lng', e.lngLat.lng);
    textSpan.setAttribute('lat', e.lngLat.lat);

    isDragging = false;

    textSpan.parentNode.style.cursor = '';
    MAP_DIV.style.cursor = '';

    map.dragPan.enable();

    setTimeout(function () {
        markerToSymbol(e, textSpan);
    }, 50)

    // Unbind move events
    map.off('mousemove', onDrag);
    map.off('touchmove', onDrag);
}

function addEditLabels(e) {
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();

    if (isDragging) return;

    //create a large bounding box for capture
    var clickBBox = [[e.point.x - 2, e.point.y - 2], [e.point.x + 2, e.point.y + 2]];

    //adding text
    if (LABEL_NODE.getAttribute('active') === 'true') {

        var el = document.createElement('div');
        el.className = 'label-marker';

        el.setAttribute('contenteditable', 'true');
        el.setAttribute('autocorrect', 'off');
        el.setAttribute('spellcheck', 'false');
        el.setAttribute('lng', e.lngLat.lng);
        el.setAttribute('lat', e.lngLat.lat);
        el.style['font-size'] = TEXT_SIZES[1] + 'px';  //defaulting to second size

        map.marker = createMarker(e, el);

        el.addEventListener("blur", markerToSymbol);
        el.addEventListener("keydown", inputText);
        el.addEventListener("paste", handlePaste);

        el.focus();

        //editting text
    } else if (EDIT_NODE.getAttribute('active') === 'true') {

        //filters layers for custom text labels
        function isCustomText(item) {
            return item.layer.id.indexOf('-custom-text-label') > -1
        }

        var features = map.queryRenderedFeatures(clickBBox);
        var activeInput = document.querySelector('.marker-text-child');

        if (features.length) {
            var customLabels = features.filter(isCustomText);

            if (customLabels.length) {
                //only returning the first feature
                //user is going to have to zoom in further
                var feature = customLabels[0].layer;

                var lyrID = feature.id;
                var sourceID = feature.source;
                var text = feature.layout['text-field'];
                var featureFontSize = feature.layout['text-size'] + 'px';
                var featureFontColor = feature.paint['text-color'];

                var mapSource = map.getSource(sourceID);
                var coords = mapSource._data.features[0].geometry.coordinates;

                var container = document.createElement('div');
                container.className = 'label-marker label-container active';

                var el = document.createElement('span');
                el.className = 'marker-text-child';
                el.innerText = text;

                el.style['font-size'] = featureFontSize;
                el.style.color = featureFontColor;

                el.setAttribute('lng', coords[0]);
                el.setAttribute('lat', coords[1]);
                el.setAttribute('contenteditable', 'true');
                el.setAttribute('autocorrect', 'off');
                el.setAttribute('spellcheck', 'false');

                //drag icon - using FontAwesome as an example
                var dragUI = document.createElement('i');
                dragUI.className = 'fa fa-arrows-alt fa-lg drag-icon';
                dragUI.setAttribute('aria-hidden', true);

                container.appendChild(dragUI);
                container.appendChild(el);

                map.removeSource(sourceID);
                map.removeLayer(lyrID);

                createMarker(e, container);

                dragUI.addEventListener("mousedown", beginDrag);
                dragUI.addEventListener("touchstart", beginDrag);

                el.addEventListener("blur", markerToSymbol);
                el.addEventListener("keydown", inputText);
                el.addEventListener("paste", handlePaste);

            } else if (activeInput) {
                activeInput.isEqualNode(e.originalEvent.target) ? activeInput.focus() : markerToSymbol(e, activeInput);
            }
        }
    }
}

//fire function to populate text/color custom pallete
populatePalette();

map.on('click', addEditLabels);


// custom draw styles paramaters
// custom draw styles paramaters
// custom draw styles paramaters
var drawFeatureID = '';
var newDrawFeature = false;
var trackDrawnPolygons = [];
var getLastDrawnPoly = false;

//Draw Tools function
//Draw Tools function
//Draw Tools function
var draw = new MapboxDraw({
    // this is used to allow for custom properties for styling draw features
    // it appends the word "user_" to the property
    userProperties: true,
    displayControlsDefault: false,
    controls: {
        polygon: true,
        point: true,
        line_string: true,
        trash: true,
    },
    styles: [
        // default themes provided by MB Draw
        // default themes provided by MB Draw
        // default themes provided by MB Draw
        // default themes provided by MB Draw


        {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'fill-color': '#3bb2d0',
                'fill-outline-color': '#3bb2d0',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'paint': {
                'fill-color': '#fbb03b',
                'fill-outline-color': '#fbb03b',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-midpoint',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'LineString'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-active',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'],
                ['==', 'active', 'true']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-point-point-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-opacity': 1,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#3bb2d0'
            }
        },
        {
            'id': 'gl-draw-point-stroke-active',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'active', 'true'],
                ['!=', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 7,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-active',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-polygon-fill-static',
            'type': 'fill',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Polygon']
            ],
            'paint': {
                'fill-color': '#404040',
                'fill-outline-color': '#404040',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-static',
            'type': 'line',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Polygon']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#404040',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-static',
            'type': 'line',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'LineString']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#404040',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-point-static',
            'type': 'circle',
            'filter': ['all',
                ['==', 'mode', 'static'],
                ['==', '$type', 'Point']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#404040'
            }
        },

        // end default themes provided by MB Draw
        // end default themes provided by MB Draw
        // end default themes provided by MB Draw
        // end default themes provided by MB Draw




        // new styles for toggling colors
        // new styles for toggling colors
        // new styles for toggling colors
        // new styles for toggling colors

        {
            'id': 'gl-draw-polygon-fill-inactive-color-picker',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'fill-color': ['get', 'user_portColor'],
                'fill-outline-color': ['get', 'user_portColor'],
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-fill-active-color-picker',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'fill-color': ['get', 'user_portColor'],
                'fill-outline-color': ['get', 'user_portColor'],
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-midpoint-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-inactive-color-picker',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static'],
                ['has', 'user_portColor']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': ['get', 'user_portColor'],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-active-color-picker',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon'],
                ['has', 'user_portColor']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': ['get', 'user_portColor'],
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-inactive-color-picker',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'LineString'],
                ['!=', 'mode', 'static'],
                ['has', 'user_portColor']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': ['get', 'user_portColor'],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-active-color-picker',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'],
                ['==', 'active', 'true'],
                ['has', 'user_portColor']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': ['get', 'user_portColor'],
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['!=', 'active', 'true'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-inactive-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['!=', 'active', 'true'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-active-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', 'active', 'true'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 7,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-active-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', 'active', 'true'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-point-point-stroke-inactive-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-opacity': 1,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-inactive-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': ['get', 'user_portColor']
            }
        },
        {
            'id': 'gl-draw-point-stroke-active-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'active', 'true'],
                ['!=', 'meta', 'midpoint'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'circle-radius': 7,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-active-color-picker',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': ['get', 'user_portColor']
            }
        },
        {
            'id': 'gl-draw-polygon-fill-static-color-picker',
            'type': 'fill',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Polygon'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'fill-color': ['get', 'user_portColor'],
                'fill-outline-color': ['get', 'user_portColor'],
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-static-color-picker',
            'type': 'line',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'Polygon'],
                ['has', 'user_portColor']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': ['get', 'user_portColor'],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-static-color-picker',
            'type': 'line',
            'filter': ['all', ['==', 'mode', 'static'],
                ['==', '$type', 'LineString'],
                ['has', 'user_portColor']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': ['get', 'user_portColor'],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-point-static-color-picker',
            'type': 'circle',
            'filter': ['all',
                ['==', 'mode', 'static'],
                ['==', '$type', 'Point'],
                ['has', 'user_portColor']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': ['get', 'user_portColor']
            }
        }
    ]
});

var drawTool = document.getElementById('drawAppend');

drawTool.appendChild(draw.onAdd(map)).setAttribute("style", "display: inline-flex;", "border: 0;");;

// create draw palette
function populateDrawPalette() {
    var drawFeatureColor = document.getElementById('customDrawColor');

    for (var c = 0; c < TEXT_COLORS.length; c++) {
        var cElm = document.createElement('div');
        cElm.className = 'draw-color-change';
        cElm.id = 'draw-' + TEXT_COLORS[c];
        cElm.style['background-color'] = TEXT_COLORS[c];
        cElm.addEventListener('mousedown', changeDrawColor);

        drawFeatureColor.appendChild(cElm);
    };
}

function handlePolygonOrder(clickedFeats) {
    if (clickedFeats.length > 1) {
        var tempTrack = trackDrawnPolygons.filter(function (p) {
            return clickedFeats.indexOf(p) > -1;
        });

        var lastPoly = tempTrack[tempTrack.length - 1];
        draw.changeMode('direct_select', { featureId: lastPoly });

        var feat = draw.get(lastPoly);
        var c = feat.properties.portColor ? feat.properties.portColor : '#fbb03b';
        handleVerticesColors(c);

    } else if (clickedFeats.length === 1) {

        var feat = draw.get(clickedFeats[0]);
        var c = feat.properties.portColor ? feat.properties.portColor : '#fbb03b';
        handleVerticesColors(c);
    }

    getLastDrawnPoly = false;
}


// vertices and midpoints don't inherit their parent properties
// so we need to handle those edge cases
function handleVerticesColors(color) {
    // midppoints
    map.setPaintProperty('gl-draw-polygon-midpoint-color-picker.hot', 'circle-color', color);
    map.setPaintProperty('gl-draw-polygon-midpoint-color-picker.cold', 'circle-color', color);

    // vertices
    map.setPaintProperty('gl-draw-polygon-and-line-vertex-inactive-color-picker.cold', 'circle-color', color);
    map.setPaintProperty('gl-draw-polygon-and-line-vertex-inactive-color-picker.hot', 'circle-color', color);

    //active vertex
    map.setPaintProperty('gl-draw-polygon-and-line-vertex-active-color-picker.cold', 'circle-color', color);
    map.setPaintProperty('gl-draw-polygon-and-line-vertex-active-color-picker.hot', 'circle-color', color);
}

// color change function of draw features
var changeDrawColor = function (e) {

    if (e.target.id && e.target.id.indexOf('draw-') === -1) return;

    var color = e.target.id.replace(/draw-/, '');

    if (drawFeatureID !== '' && typeof draw === 'object') {

        draw.setFeatureProperty(drawFeatureID, 'portColor', color);
        var feat = draw.get(drawFeatureID);
        draw.add(feat);

        // race conditions exist between events
        // and draw's transitions between .hot and .cold layers
        setTimeout(function () {
            handleVerticesColors(color);
        }, 50);
    }

};

// callback for draw.update and draw.selectionchange
var setDrawFeature = function (e) {
    if (e.features.length && e.features[0].type === 'Feature') {
        var feat = e.features[0];
        drawFeatureID = feat.id;

        if (feat.geometry.type === 'Polygon' && trackDrawnPolygons.length > 1 && draw.getMode() !== 'draw_polygon' &&
            feat.id !== trackDrawnPolygons[trackDrawnPolygons.length - 1]) {
            getLastDrawnPoly = true;
        } else {
            var c = feat.properties.portColor ? feat.properties.portColor : '#fbb03b';

            // race conditions exist between events
            // and draw's transitions between .hot and .cold layers
            setTimeout(function () {
                handleVerticesColors(c);
            }, 50);
        }
    }
};

// Event Handlers for Draw Tools
map.on('draw.create', function (e) {
    newDrawFeature = true;
    if (e.features.length && e.features[0].geometry.type === 'Polygon') {
        trackDrawnPolygons.push(e.features[0].id);
    }
});

// track handling for polygon features
map.on('draw.delete', function (e) {
    if (e.features.length) {
        var feats = e.features;
        var featsToRemove = [];

        for (var i = feats.length - 1; i >= 0; i--) {
            featsToRemove.push(feats[i].id);
        }

        var tempTrack = trackDrawnPolygons.filter(function (p) {
            return featsToRemove.indexOf(p) < 0;
        });

        trackDrawnPolygons = tempTrack;
    }
});

map.on('draw.update', setDrawFeature);
map.on('draw.selectionchange', setDrawFeature);

map.on('click', function (e) {
    if (getLastDrawnPoly) {
        var clickedFeats = draw.getFeatureIdsAt(e.point);
        handlePolygonOrder(clickedFeats);
    } else if (!newDrawFeature) {

        handleVerticesColors('#fbb03b');
        var drawFeatureAtPoint = draw.getFeatureIdsAt(e.point);

        //if another drawFeature is not found - reset drawFeatureID
        drawFeatureID = drawFeatureAtPoint.length ? drawFeatureAtPoint[0] : '';
    }

    newDrawFeature = false;
});


//// Turf Area Calc
var selectedUnits = '';
var selectedMeasuredFeature = '';
var measurementActive = false;


function removeMeasurementValues() {
    $('#calculated-area p').remove();
    $('#calculated-length p').remove();
}

function calculateDimensions(data) {
    if (!data.id) return;

    var area, rounded_area, areaAnswer, length, rounded_length, lineAnswer;
    //FEET
    if (selectedUnits === 'feet') {

        area = turf.area(data) / 0.09290304;
        // restrict to 2 decimal points
        rounded_area = Math.round(area * 100) / 100;
        areaAnswer = document.getElementById('calculated-area');
        areaAnswer.innerHTML = '<p>' + rounded_area + ' ft<sup>2</sup></p>';

        length = turf.lineDistance(data, 'meters') / 0.3048;
        // restrict to 2 decimal points
        rounded_length = Math.round(length * 100) / 100;
        lineAnswer = document.getElementById('calculated-length');
        lineAnswer.innerHTML = '<p>' + rounded_length + ' ft</p>';

        //METER
    } else if (selectedUnits === 'meter') {

        area = turf.area(data);
        // restrict to 2 decimal points
        rounded_area = Math.round(area * 100) / 100;
        areaAnswer = document.getElementById('calculated-area');
        areaAnswer.innerHTML = '<p>' + rounded_area + ' m<sup>2</sup></p>';

        length = turf.lineDistance(data, 'meters');
        // restrict to 2 decimal points
        rounded_length = Math.round(length * 100) / 100;
        lineAnswer = document.getElementById('calculated-length');
        lineAnswer.innerHTML = '<p>' + rounded_length + ' m</p>';

        //MILE
    } else if (selectedUnits === 'mile') {

        area = turf.area(data) / 2589988.11;
        // restrict to 4 decimal points
        rounded_area = Math.round(area * 10000) / 10000;
        areaAnswer = document.getElementById('calculated-area');
        areaAnswer.innerHTML = '<p>' + rounded_area + ' mi<sup>2</sup></p>';

        length = turf.lineDistance(data, 'meters') / 1609.344;
        // restrict  to 2 decimal points
        rounded_length = Math.round(length * 100) / 100;
        lineAnswer = document.getElementById('calculated-length');
        lineAnswer.innerHTML = '<p>' + rounded_length + ' mi</p>';

        //KILOMETER
    } else if (selectedUnits === 'kilometer') {

        area = turf.area(data) / 1000000;
        // restrict to 4 decimal points
        rounded_area = Math.round(area * 10000) / 10000;
        areaAnswer = document.getElementById('calculated-area');
        areaAnswer.innerHTML = '<p>' + rounded_area + ' km<sup>2</sup></p>';

        length = turf.lineDistance(data, 'meters') / 1000;
        // restrict to 2 decimal points
        rounded_length = Math.round(length * 100) / 100;
        lineAnswer = document.getElementById('calculated-length');
        lineAnswer.innerHTML = '<p>' + rounded_length + ' km</p>';

        //ACRE
    } else if (selectedUnits === 'acre') {

        area = turf.area(data) / 4046.85642;
        // restrict  to 4 decimal points
        rounded_area = Math.round(area * 10000) / 10000;
        areaAnswer = document.getElementById('calculated-area');
        areaAnswer.innerHTML = '<p>' + rounded_area + ' acres</p>';

        length = turf.lineDistance(data, 'meters') / 0.3048;
        // restrict to 2 decimal points
        rounded_length = Math.round(length * 100) / 100;
        lineAnswer = document.getElementById('calculated-length');
        lineAnswer.innerHTML = '<p>' + rounded_length + ' ft</p>';

    }
}

// callback fires on the events listed below and fires the
// above calculateDimensions function
var calculateCallback = function (e) {
    if (e.features.length && (e.features[0].geometry.type === 'Polygon' || e.features[0].geometry.type === 'LineString')) {
        measurementActive = true;
        selectedMeasuredFeature = e.features[0].id;
        calculateDimensions(e.features[0]);
    }
}

map.on('draw.create', calculateCallback);
map.on('draw.update', calculateCallback);
map.on('draw.selectionchange', calculateCallback);

map.on('draw.delete', function (e) {
    selectedMeasuredFeature = '';
    measurementActive = false;
    removeMeasurementValues();
});

// apparently there's no method to track/watch a drag or vertex
// of a newly instantiated feature that has yet to be 'created'
// or perhaps it's not documented anywhere in GL Draw
// so we have to make our own
map.on('mousemove', function (e) {
    if (draw.getMode() === 'draw_line_string' || draw.getMode() === 'draw_polygon') {
        var linePts = draw.getFeatureIdsAt(e.point);

        if (linePts.length) {
            // some draw features return back as undefined
            var activeID = linePts.filter(function (feat) {
                return typeof feat === 'string';
            })

            if (activeID.length) {
                measurementActive = true;
                selectedMeasuredFeature = activeID[0];

                var fc = draw.get(selectedMeasuredFeature);
                calculateDimensions(fc);
            }
        }
    } else if (draw.getMode() === 'direct_select' && selectedMeasuredFeature !== '') {
        var fc = draw.get(selectedMeasuredFeature);

        if (fc.geometry.type === 'LineString' || fc.geometry.type === 'Polygon') {
            calculateDimensions(fc);
        }

    }
});

// remove measurements from input
map.on('click', function (e) {
    if (measurementActive) {
        var measuredFeature = draw.getFeatureIdsAt(e.point);

        if (measuredFeature.length) {
            // some draw features return back as undefined
            var mF = measuredFeature.filter(function (feat) {
                return typeof feat === 'string';
            })

            selectedMeasuredFeature = mF.length ? mF[0] : '';

        } else {
            removeMeasurementValues();
        }
    } else {
        removeMeasurementValues();
    }

    measurementActive = false;
});


$(function () {
    // set unit value
    selectedUnits = $('input[type=radio][name=unit]:checked').val();

    $('input[type=radio][name=unit]').change(function () {
        selectedUnits = this.value;

        //update values based on new units
        if (selectedMeasuredFeature !== '' || measurementActive) {
            var gj = draw.get(selectedMeasuredFeature);
            calculateDimensions(gj);
        }
    })

    populateDrawPalette();
});







/* Obs */

const addEventButton = document.getElementById('nuevaNotaBoton');

const addObsButton = document.getElementById('guardar-obs');
addObsButton.addEventListener('click', addAndPostEvent);


/* returns audio id */

async function saveAudioBlobInDB(blobUrl, newName) {
    await fetch(blobUrl).then(r => {
        console.log("BLOB Fetch", r);
        return r.blob();
    }).then(binaryBlob => saveAudioLocallyWithName(binaryBlob, newName));

}

function createAudioDB() {
    return idb.openDB('audios', 1, {
        upgrade(db) {
            db.createObjectStore('audios', {
                // The 'id' property of the object will be the key.
                keyPath: 'name',
                // If it isn't explicitly set, create a value by auto incrementing.
                autoIncrement: true,
            });
        },
    });
}

function createIndexedDB() {
    return idb.openDB('dashboardr', 1, {
        upgrade(db) {
            db.createObjectStore('events', {
                // The 'id' property of the object will be the key.
                keyPath: 'idobservaciones',
                // If it isn't explicitly set, create a value by auto incrementing.
                autoIncrement: true,
            });
        },
    });
}
/*  if (!('indexedDB' in window)) {return null;}
        return idb.open('dashboardr', 1, function(upgradeDb) {
          console.log("OPE");
          if (!upgradeDb.objectStoreNames.contains('events')) {
              console.log("DD");
            const eventsOS = upgradeDb.createObjectStore('events', {keyPath: 'idobservaciones'});
          }
        });*/


const dbPromise = createIndexedDB();
const dbAudioPromise = createAudioDB();

function saveAudioLocally(audioBlob) {
    if (!('indexedDB' in window)) { return null; }
    return dbAudioPromise.then(db => {
        const tx = db.transaction('audios', 'readwrite');
        const store = tx.objectStore('audios');

        var newBlob = audioBlob.slice(0, audioBlob.size, audioBlob.type);
        newFile = new File([newBlob], uuidv4(), { type: audioBlob.type });

        return store.put(newFile)
            .catch(() => {
                tx.abort();
                throw Error('Events were not added to the store');
            });

    });
}

function saveAudioLocallyWithName(binaryBlob, newName) {
    if (!('indexedDB' in window)) { return null; }
    return dbAudioPromise.then(db => {
        const tx = db.transaction('audios', 'readwrite');
        const store = tx.objectStore('audios');

        console.log("AudioBlob", binaryBlob);
        newFile = new File([binaryBlob], newName, { type: binaryBlob.type });

        return store.put(newFile)
            .catch(() => {
                tx.abort();
                throw Error('Events were not added to the store');
            });

    });
}





loadContentNetworkFirst();

function saveEventDataLocally(events) {
    if (!('indexedDB' in window)) { return null; }
    return dbPromise.then(db => {
        const tx = db.transaction('events', 'readwrite');
        const store = tx.objectStore('events');
        return Promise.all(events.map(event => store.put(event)))
            .catch(() => {
                tx.abort();
                throw Error('Events were not added to the store');
            });
    });
}


//$( "#stepper" ).hide();

async function addAndPostEvent(e) {
    e.preventDefault();

    // $( "#observaciones" ).hide();
    // $( "#stepper" ).show();

    // document.getElementById("test-l-1").style.visibility = 'visible';
    //1$( "#test-l-1" ).show();

    const newBaseName = uuidv4();

    const preview = document.getElementById("audio-playback");

    //If Audio
    var with_audio = false;
    if ($('#audio-playback')[0].src.includes("blob")) {
        with_audio = true;
        await saveAudioBlobInDB(preview.src, newBaseName);
    }


    // Fotos
    var elementos_img = $('.ff_fileupload_preview_image_has_preview');

    var fotos_array = [];

    for (var i = 0; i < elementos_img.length; i++) {
        foto_el = elementos_img[i];
        const matches = foto_el.style["backgroundImage"].match(/(blob:.*)"/m) || [""];
        console.log("MATCHES[1]", matches[1]);

        const img_blob_url = matches[1];

        const blob = await blob_fetch(img_blob_url);

        let { latitude, longitude } = await exifr.gps(await blob);
        console.log("LAT", latitude, "LONG", longitude);

        newName = uuidv4();

        sliced_blob = blob.slice(0, blob.size, blob.type);

        newFile = new File([sliced_blob], newName, { type: blob.type });
        console.log(newFile);
        fotos_array.push({ "filename": newName, "latitud": latitude, "longitud": longitude });

        // Upload
        uploadImage(newFile);



    }

    console.log("FOTOS", fotos_array);


    let yourDate = new Date()
    hoy = yourDate.toISOString().split('T')[0]

    const data = {
        idobservaciones: Date.now(),
        lotes_campos_campo_id: 20,
        lotes_idlotes: 3324,
        titulo: $("#titulo-obs").val(),
        notas: $("#descripcion-obs").val(),
        fecha: hoy,
        fecha_proxima_visita: hoy,
        audio: with_audio ? "fotos/audio/" + newBaseName : "",
        uuid: newBaseName,
        resultado_de_la_visita: $("#resultado-obs").val(),
        fotos: fotos_array
    };

    console.log("New Data", data);

    // Actualiza UI
    updateUI([data]);

    // Local "BackEnd"
    saveEventDataLocally([data]);


    const audioFile = await getAudioData(newBaseName);
    uploadFile(audioFile);





    // Remote "BackEnd" - Esta request es administrada por BG synch
    const headers = new Headers({ 'Content-Type': 'application/json' });

    const body = JSON.stringify(data);
    return fetch('/phpiot20/apiv0/observaciones.php', {
        method: 'POST',
        headers: headers,
        body: body
    });



    // Subir Audio

    // Subir Fotos


}

function getLocalEventData() {
    if (!('indexedDB' in window)) { return null; }
    return dbPromise.then(db => {
        const tx = db.transaction('events', 'readonly');
        const store = tx.objectStore('events');
        return store.getAll();
    });
}

function loadContentNetworkFirst() {
    getServerData()
        .then(dataFromNetwork => {
            updateUI(dataFromNetwork);
            saveEventDataLocally(dataFromNetwork)
                .then(() => {
                    setLastUpdated(new Date());
                    messageDataSaved();
                }).catch(err => {
                    messageSaveError();
                    console.warn(err);
                });
        }).catch(err => {
            console.log('Network requests have failed, this is expected if offline');
            getLocalEventData()
                .then(offlineData => {
                    if (!offlineData.length) {
                        messageNoData();
                    } else {
                        messageOffline();
                        updateUI(offlineData);
                    }
                });
        });
}


function getServerData() {
    return fetch('/phpiot20/apiv0/observaciones.php').then(response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    });
}


function messageOffline() {
    // alert user that data may not be current
    const lastUpdated = getLastUpdated();

}

function messageNoData() {
    // alert user that there is no data available

}

function messageDataSaved() {
    // alert user that data has been saved for offline
    const lastUpdated = getLastUpdated();

}

function messageSaveError() {
    // alert user that data couldn't be saved offline

}

/* Storage functions */

function getLastUpdated() {
    return localStorage.getItem('lastUpdated');
}

function setLastUpdated(date) {
    localStorage.setItem('lastUpdated', date);
}

/*****************************************  ** ***********************************************/

var fetchNotas = function (userid) {

}

const updateUI = async function (notas) {
    // Es importante que esto haga append
    console.log("Updating", notas);
    var append = document.getElementById('lista-observaciones');

    mispromises = notas.map(async function (item) {

        // var soundURL = URL.createObjectURL(audioFile);

        var audio = `<p class="card-text"><small class="text-muted">Sin audio disponible</small></p>`;

        if (item.audio !== null) {


            const posibleAudioinDB = item.audio.slice(12);
            console.log("REAUDI POR", posibleAudioinDB, item.audio);

            try {
                const audioFile = await getAudioData(posibleAudioinDB);
                console.log("Audio File", audioFile);
                var soundURL = URL.createObjectURL(audioFile);
                audio = `<audio controls style='width:100%;max-width:300px;'>
                          <source src=${soundURL} type="audio/webm">
                        Your browser does not support the audio element.
                        </audio>
                        `;

            } catch (e) {
                // No audio in DB
                console.log(e); // 30
                audio = `<audio controls style='width:100%;max-width:300px;'>
                          <source src=/phpiot20/${item.audio} type="audio/ogg">
                        Your browser does not support the audio element.
                        </audio>
                        `;
            }
        }


        //"WhatsApp Audio 2021-06-12 at 17.23.05.ogg"  ${item.audio}


        // card = `  <li class="list-group-item bg-danger"><div class="card" style="">                  <div class="card-body">           <h4 class="card-title">${item.titulo}</h4>          <p class="card-text">${item.resultado_de_la_visita}</p>   ${audio}         <input type="file" accept="image/x-png,image/jpeg,image/gif"/> </div>        </div>  </li>`
        item.fotos = item.fotos.replace(/"/g, '\\\"');

        card = `<li class="list-group-item px-0"> <div class="card">
                  <h5 class="card-header">${item.resultado_de_la_visita}</h5>
                  <div class="card-body">
                    <h5 class="card-title">${item.titulo}</h5>
                    <p class="card-text">${item.notas}</p>
                    ${audio}
                    <a href="#" onclick='mostrarImagenes("${item.fotos}", "${item.titulo}", "${item.notas}");' class="btn btn-primary">Ver Imagenes</a>
                  </div>
                  </div> </li>`;

        /*  card = `<div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
      <div class="card-header">Header</div>
      <div class="card-body">
        <h5 class="card-title">Danger card title</h5>
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
      </div>
    </div>`;*/
        return card;
    }
    ); // close each()

    Promise.all(mispromises).then(function (results) {
        $('#lista-observaciones').append(results.join(''));
    })

}


function getAudioData(key) {
    return dbAudioPromise.then(db => {
        const tx = db.transaction('audios', 'readonly');
        const store = tx.objectStore('audios');
        return store.get(key)
    });
}



const uploadFile = (file) => {

    // add file to FormData object
    const fd = new FormData();
    fd.append('files', file);
    // send `POST` request
    fetch('/phpiot20/apiv0/upload_audio.php', {
        method: 'POST',
        body: fd
    })
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error(err));
}


const uploadImage = (file) => {

    // add file to FormData object
    const fd = new FormData();
    fd.append('files', file);
    // send `POST` request
    fetch('/phpiot20/apiv0/upload_image.php', {
        method: 'POST',
        body: fd
    })
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error(err));
}


async function blob_fetch(url) {
    var r = await fetch(url);
    return (await r.blob());

}

function mostrarImagenes(array_img, titulo, notas) {

    array_img = JSON.parse(array_img);

    array_img.map((current_img) => {

        img_url = "http://localhost:8080/phpiot20/fotos/obs/" + current_img.filename;

        const el = document.createElement('div');
        const width = 50;
        const height = 50;
        el.className = 'marker';
        el.style.backgroundImage = 'url(' + img_url + ')';
        el.style.backgroundSize = '50px 50px';
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        console.log("MARKEr", el);

        /*      el.addEventListener('click', () => {
              window.alert("ima cloi");
              });
              */

        new mapboxgl.Marker(el)
            .setLngLat([current_img.longitud, current_img.latitud])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(
                        `<h3>${titulo}</h3><p>${notas}</p>`
                    )
            )
            .addTo(map);

    })

}


/* -------------------------------------  SENSORES -------------------------------------------------------------- */

popular_sensores = async () => {
    listado_de_sensores = await getSensoresData();
    console.log(listado_de_sensores);

    html_lista = document.getElementById('lista-sensores');



    listado_de_sensores.map((sensor)=>{
            el = `<a href="#" class="list-group-item list-group-item-action lista-sensores">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${sensor.nombre}</h5>
                    <small>${sensor.ultima_telemetria ? sensor.ultima_telemetria : "N/D"}</small>
                </div>
                <p class="mb-1">${sensor.tipo}</p>
                <small>${sensor.deveui}</small>
            </a>`;

        html_lista.innerHTML += el;
    })

    $('.list-group-item, .lista-sensores').on('click', function() {
        var $this = $(this);
        var $alias = $this.data('alias');
    
        $('.active').removeClass('active');
        $this.toggleClass('active')
    
        // Pass clicked link element to another function
        myfunction($this, $alias)
    })

    // Add Layer and markers


    
};

popular_sensores();


$('.list-group-item, .lista-sensores').on('click', function() {
    var $this = $(this);
    var $alias = $this.data('alias');

    $('.active').removeClass('active');
    $this.toggleClass('active')

    // Pass clicked link element to another function
    myfunction($this, $alias)
})

function myfunction($this,  $alias) {
    console.log($this.text());  // Will log Paris | France | etc...

    console.log($alias);  // Will output whatever is in data-alias=""
    $('#dashboards').removeClass('d-none');
    $('#map').addClass('d-none');
}
