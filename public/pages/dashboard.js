'use strict';
zuix.controller(function (cp) {
  const zx = zuix; // shorthand
  let itemsList;

  cp.create = function () {
    // console.log("DSDSDSD")
    // console.log(cp.model().deveui)

    // /* Date Picker */
    // const getDatePickerTitle = elem => {
    //   // From the label or the aria-label
    //   const label = elem.nextElementSibling;
    //   let titleText = '';
    //   if (label && label.tagName === 'LABEL') {
    //     titleText = label.textContent;
    //   } else {
    //     titleText = elem.getAttribute('aria-label') || '';
    //   }
    //   return titleText;
    // }

    // const elems = document.querySelectorAll('.datepicker_input');
    // for (const elem of elems) {
    //   const datepicker = new Datepicker(elem, {
    //     'format': 'dd/mm/yyyy', // UK format
    //     title: getDatePickerTitle(elem)
    //   });
    // }

    // charts();


  };

  cp.update = function (target, key, value, path, old) {
    console.log("Update Event", key);
  }



function charts() {
  window.Apex = {
    dataLabels: {
      enabled: false
    }
  };

  var temperatura_chart;
  var humedad_chart;
  var presion_chart;

  const base_options = {
    series: [],
    noData: {
      text: 'Cargando...'
    },
    chart: {
      id: 'area-datetime',
      type: 'area',
      group: 'charts',
      height: 350,
      zoom: {
        autoScaleYaxis: true
      }
    },
    annotations: {
      yaxis: [{
        y: 30,
        borderColor: '#999',
        label: {
          show: true,
          text: 'Support',
          style: {
            color: "#fff",
            background: '#00E396'
          }
        }
      }],
      xaxis: [{
        x: new Date('14 Nov 2012').getTime(),
        borderColor: '#999',
        yAxisIndex: 0,
        label: {
          show: true,
          text: 'Rally',
          style: {
            color: "#fff",
            background: '#775DD0'
          }
        }
      }]
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
      style: 'hollow',
    },
    xaxis: {
      type: 'datetime',
      min: new Date('01 Mar 2012').getTime(),
      tickAmount: 6,
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy HH:mm:ss'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
    title: {
      text: 'Temperatura',
      align: 'left',
      offsetY: 0,
      offsetX: 10
    },

  };


  var temp_opt = base_options;
  temp_opt.title.text = 'Temperatura';
  temp_opt.chart.id = 'chart-temperatura-id';
  console.log(temp_opt);
  temperatura_chart = new ApexCharts(document.querySelector("#chart-temperatura"), temp_opt);
  temperatura_chart.render();

  var opt = base_options;
  opt.title.text = 'Humedad';
  opt.chart.id = 'chart-humedad-id';
  console.log(opt);
  humedad_chart = new ApexCharts(document.querySelector("#chart-humedad"), opt);
  humedad_chart.render();

  opt = base_options;
  opt.title.text = 'Presion';
  opt.chart.id = 'chart-presion-id';
  console.log(opt);
  presion_chart = new ApexCharts(document.querySelector("#chart-presion"), opt);
  presion_chart.render();


  console.log(base_options);

  function buildDataSeries(tele, clave) {
    return tele.map(punto => {
      var dateMomentObject = moment(punto.tiempo_recibido, "DD/MM/YYYY, HH:mm:ss"); // 1st argument - string, 2nd argument - format
      var dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
      return [dateObject.getTime(), punto[clave]]
    })
  }

  function showCentralCharts(deveui) {
    fetch("http://localhost:8080/phpiot20/apiv0/telemetria.php?deveui=" + deveui)
      .then((res) => res.json())
      .then(body => {
        console.log();
        temperatura_chart.updateSeries([{
          name: 'Temperatura',
          data: buildDataSeries(body, "temperatura")
        }])

        humedad_chart.updateSeries([{
          name: 'Humedad',
          data: buildDataSeries(body, "humedad")
        }])

        presion_chart.updateSeries([{
          name: 'Presion',
          data: buildDataSeries(body, "presion")
        }])

      })
      .catch(e => {
        console.log(e);
        //No data
      })
  }



  showCentralCharts("bcddc2ffff106884");


  var resetCssClasses = function (activeEl) {
    var els = document.querySelectorAll('button')
    Array.prototype.forEach.call(els, function (el) {
      el.classList.remove('active')
    })

    activeEl.target.classList.add('active')
  }

  document
    .querySelector('#one-day')
    .addEventListener('click', function (e) {
      resetCssClasses(e)

      presion_chart.zoomX(
        (new Date().getTime()) - (24 * 3600 * 1000),
        new Date().getTime()
      )
    })

  document
    .querySelector('#one-week')
    .addEventListener('click', function (e) {
      resetCssClasses(e)

      presion_chart.zoomX(
        (new Date().getTime()) - (7 * 24 * 3600 * 1000),
        new Date().getTime()
      )
    })

  document
    .querySelector('#one-month')
    .addEventListener('click', function (e) {
      resetCssClasses(e)

      presion_chart.zoomX(
        (new Date().getTime()) - (30 * 24 * 3600 * 1000),
        new Date().getTime()
      )
    })


  document
    .querySelector('#one-year')
    .addEventListener('click', function (e) {
      resetCssClasses(e)
      presion_chart.zoomX(
        (new Date().getTime()) - (365 * 24 * 3600 * 1000),
        new Date().getTime()
      )
    })



  // a small hack to extend height in website sample dashboard
  presion_chart.render().then(function () {
    var ifr = document.querySelector("#wrapper");
    if (ifr.contentDocument) {
      ifr.style.height = ifr.contentDocument.body.scrollHeight + 20 + 'px';
    }
  });
}


});


// const getDatePickerTitle = elem => {
// 	// From the label or the aria-label
// 	const label = elem.nextElementSibling;
// 	let titleText = '';
// 	if (label && label.tagName === 'LABEL') {
// 	  titleText = label.textContent;
// 	} else {
// 	  titleText = elem.getAttribute('aria-label') || '';
// 	}
// 	return titleText;
//       }

//       const elems = document.querySelectorAll('.datepicker_input');
//       for (const elem of elems) {
// 	const datepicker = new Datepicker(elem, {
// 	  'format': 'dd/mm/yyyy', // UK format
// 	  title: getDatePickerTitle(elem)
// 	});
//       }