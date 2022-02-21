
'use strict';
zuix.controller(function (cp) {

	const zx = zuix; // shorthand
	let itemsList;
	let map;

	var yourJWTToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ1NDczMjgzLCJleHAiOjE2NDgwNjUyODN9.zTdkovErL8Qo8LLDlKRcZ4kK1T53L2c3VpT6_Jq8qTE"
	yourConfig = {
		headers: {
			Authorization: "Bearer " + yourJWTToken
		}
	}

	var emptyGJ = {
		'type': 'FeatureCollection',
		'features': []
	};

	const draw = new MapboxDraw({
		displayControlsDefault: false,
		// Select which mapbox-gl-draw control buttons to add to the map.
		controls: {
			polygon: false,
			trash: false
		},
		//defaultMode: 'draw_polygon'
	});

	let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

	cp.create = function () {
		mapboxgl.accessToken = 'pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw';

		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/satellite-v9',
			center: [-59.2965, -35.1923],
			zoom: 12,
			attributionControl: true,
			preserveDrawingBuffer: false,
		});



		map.addControl(draw);// Sin controles

		map.on('render', function () {
			map.resize();
		});

		map.resize();

		map.on('load', function () {

			campos_layer()
			sensores_layer()
			campos_agregar_ctrl()

			notas_layer()
			notas_agregar_ctrl()



		});
	}



	const campos_layer = () => {
		//map.addSource('lotes', { type: 'geojson', data: '/phpiot20/lotes_by_campo_geojson.php?campoid=20' });
		map.addSource('lotes', { type: 'geojson', data: emptyGJ });
		lotes_source = map.getSource('lotes');
		lotes_collection = emptyGJ

		axios.get(api_root + "/api/campos", yourConfig).then(
			function (response) {
				console.log("API CAMPOS", response.data.data)
				lotes_collection.features = response.data.data.map((campo) => {
					campo_geojson = campo.attributes.geojson
					campo_geojson.properties = {
						id: campo.id,
						nombre: campo.attributes.nombre,
						cultivo: campo.attributes.cultivo
					}
					return campo_geojson;
				})

				lotes_source.setData(lotes_collection)
			}
		)
			.catch(function (error) {
				// handle error
				console.log(error);
			})
			.then(function () {
				// always executed
			});


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


		map.on('click', 'lotes', (e) => {
			new mapboxgl.Popup()
				.setLngLat(e.lngLat)
				.setHTML(e.features[0].properties.nombre)
				.addTo(map);
		});



	}

	const sensores_layer = () => {
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
			$('.popup-detalles').on('click', () => {
				console.log(coordinates)
				showSensorDetails()
			}
			);

		}) //End Sensores PopUp
	} // Enb sensores_layer()

	const campos_agregar_ctrl = () => {
		/* ------------add campo -------------*/
		map.on('draw.create', updateArea);
		map.on('draw.delete', updateArea);
		map.on('draw.update', updateArea);
		map.on('draw.render', renderCB);

		var toast_step = 0;

		const api_post_campo = (nombre, geojson, id_cultivo, variedad) => {
			axios.post(api_root + '/api/campos', {
				data: {
					nombre: nombre,
					geojson: geojson,
					cultivo: id_cultivo
				}
			}, yourConfig)
				.then(function (response) {
					console.log("POST /api/campos response", response);
				})
				.catch(function (error) {
					console.log(error);
				});
		}

		function renderCB(args) {
			if (toast_step < 3 && (draw.getMode() === 'draw_polygon')) {

				const current_feature_coll = draw.getAll()
				const features = current_feature_coll.features
				const geometry_coor = features[features.length - 1].geometry.coordinates[0]
				if (toast_step === 0 && (geometry_coor.length === 3)) {
					// Primer punto añadido
					console.log("Un punto añadido")
					//toast_updated_flag = true
					toast_step = 1;
					const toast_body = document.getElementById('toast-body');
					toast_body.innerHTML = "Indica el siguiente punto"

				}
				if ((toast_step === 1) && (geometry_coor.length === 4)) {
					// Primer punto añadido
					console.log("Un punto añadido")
					//toast_updated_flag = true
					toast_step = 2
					const toast_body = document.getElementById('toast-body');
					toast_body.innerHTML = "Indica el siguiente punto"

				}

				if ((toast_step === 2) && (geometry_coor.length === 5)) {
					// Primer punto añadido
					console.log("Un punto añadido")
					//toast_updated_flag = true
					toast_step = 3
					const toast_body = document.getElementById('toast-body');
					toast_body.innerHTML = "Toca el primer punto para completar el campo"

				}

			}
		}

		function updateArea(e) {
			const data = draw.getAll();
			const answer = document.getElementById('toast-body');
			const next_btn = document.getElementById('agregar-campo-siguiente-btn')

			console.log(data.features);
			if (data.features.length > 0) {
				// Canpo fue agragado
				const area = turf.area(data);
				// Restrict the area to 2 decimal points.
				const rounded_area = Math.round(area / 10000 * 100) / 100;
				answer.innerHTML = `El campo seleccionado tiene ${rounded_area} has`;
				next_btn.removeAttribute('disabled');
				$('#offcanvas-1-title').text("1 campo seleccionado")
			} else {
				answer.innerHTML = '';
				if (e.type !== 'draw.delete')
					alert('Click the map to draw a polygon.');
			}
		}



		const salir_btn = document.getElementById('salir-edicion-btn')
		const next_btn = document.getElementById('agregar-campo-siguiente-btn')

		salir_btn.addEventListener('click', () => {
			salir_edit_mode()
			var offcanvas = document.getElementById('offcanvasBottom')
			offcanvas.classList.remove('show')
		})

		next_btn.addEventListener('click', () => {
			draw.changeMode('simple_select')
		})



		/* Boton Agregar Campos */
		var agregar_campos_btn = document.getElementById('agregar-campos-btn')
		var toastLiveExample = document.getElementById('liveToast')
		var toast;
		if (agregar_campos_btn) {

			agregar_campos_btn.addEventListener('click', function () {
				// Toast
				// Clean the toast
				toast_step = 0
				$('#toast-body').text('Indica el primer punto')
				toast = new bootstrap.Toast(toastLiveExample)
				toast.show()
				// Draw polygon
				draw.changeMode("draw_polygon")
				//Disable Siguiente btn
				next_btn.setAttribute('disabled', "")
				// Clean title
				$('#offcanvas-1-title').text("")
			})
		}

		/* Guardar ----------------------------------------*/
		var guardar_btn = document.getElementById('guardar-campo-btn')
		guardar_btn.addEventListener('click', () => {
			var offcanvas = document.getElementById('offcanvasCampoForm')
			offcanvas.classList.remove('show')


			nombre = $("#inputNombreCampo").val()
			variedad = $("#variedad-input").val()
			cultivo = $("#cultivo-btn").text()
			id = $("#input-cultivo").val()

			campo_geojson = draw.getAll().features[0]

			console.log("GeoJSON", campo_geojson)
			console.log("Guardar Campo '", nombre, "' con", cultivo, "variedad", variedad)

			api_post_campo(nombre, campo_geojson, id, variedad)


			salir_edit_mode()
		})

		/* Cerrar btn */
		var offcanvas_paso_1_cerrar = document.getElementById('map-edit-btn')
		offcanvas_paso_1_cerrar.addEventListener('click', function () {
			/* Guardar */

			salir_edit_mode()


		})

		var offcanvas_cultivo = document.getElementById("offcanvas-cultivo")
		var bs_offcanvas_cultivo = new bootstrap.Offcanvas(offcanvas_cultivo)

		offcanvas_cultivo.addEventListener('hide.bs.offcanvas', () => {
			var offcanvas = document.getElementById('offcanvasCampoForm')
			//offcanvas.setAttribute("show","")
			var bsOffcanvas = new bootstrap.Offcanvas(offcanvas)
			bsOffcanvas.show()
		})

		const salir_edit_mode = () => {
			// hide toast
			toast.hide()
			draw.deleteAll()
			draw.changeMode('simple_select')
			next_btn.setAttribute('disabled', "")

		}


		axios.get(api_root + '/api/cultivos', yourConfig)
			.then(function (response) {
				// handle success
				cultivos = response.data.data
				console.log("Cultivo", cultivos)
				lista_cultivos = document.getElementById("lista-cultivos")
				cultivos.map((cultivo) => {
					var el = document.createElement("a")
					el.setAttribute("href", "#")
					el.classList.add("list-group-item")
					el.classList.add("list-group-item-action")
					el.classList.add("el-cultivo")

					el.setAttribute("data-nombre", cultivo.attributes.nombre)
					el.setAttribute("data-id", cultivo.id)
					el.innerText = cultivo.attributes.nombre
					lista_cultivos.appendChild(el)

				})

				$(".el-cultivo").click((e) => {
					//nombre = b.data()
					nombre = $(e.currentTarget).data('nombre')
					id_cultivo = $(e.currentTarget).data('id')
					console.log("Click en ", nombre)
					$("#cultivo-btn").text(nombre)
					$("#input-cultivo").val(id_cultivo)
					//Cerrar el offcanvas cultivos
					bs_offcanvas_cultivo.hide()
				})

				$("#buscar-cultivo-input").on("keyup", function () {
					var value = $(this).val().toLowerCase();
					$("#lista-cultivos a").filter(function () {
						$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
					});
				});

				console.log(response.data.data);
			})
			.catch(function (error) {
				// handle error
				console.log(error);
			})
			.then(function () {
				// always executed
			});

	}

	const notas_agregar_ctrl = () => {
		// Marker
		const marker = new mapboxgl.Marker()
			.setLngLat(map.getCenter())
			.addTo(map);

		map.on("move", () => {
			marker.setLngLat(map.getCenter())
		})

		var offcanvas_nueva_nota_el = document.getElementById("offcanvas-nueva-nota")
		const offcanvas_nueva_nota = new bootstrap.Offcanvas(offcanvas_nueva_nota_el)

		$('#nueva-nota-btn').click(() => {
			offcanvas_nueva_nota.show()
		})

		$('#anadir-foto-btn').click(() => {
			document.getElementById('foto-upload-input').click();
		})

		img_input = document.getElementById('foto-upload-input')

		img_input.addEventListener('change', function () {
			const file = this.files[0];
			if (file.type.startsWith('image/')) {
				const img = document.createElement('img');
				const watermarkPreview = document.getElementById("img-preview");

				img.classList.add("img-fluid");
				img.classList.add("col-4");
				img.classList.add("img-thumbnail")
				img.file = file;
				watermarkPreview.appendChild(img);

				const reader = new FileReader();
				reader.onload = (function (aImg) { return function (e) { aImg.src = e.target.result; } })(img);
				reader.readAsDataURL(file);
			}

		});



	}

	const notas_layer = () => { }
})