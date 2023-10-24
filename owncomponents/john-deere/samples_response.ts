export const location_sample = {
	"links": [
	  {
	    "rel": "self",
	    "uri": "https://sandboxapi.deere.com/platform/machines/4321/locationHistory"
	  }
	],
	"total": 2,
	"values": [
	  {
	    "point": {
	      "lat": 41.597164,
	      "lon": -90.54383,
	      "altitude": {
		"@type": "measurementAsDouble",
		"valueAsDouble": 0,
		"links": null,
		"unit": "meters"
	      },
	      "links": null
	    },
	    "eventTimestamp": "2010-10-20T22:32:16.000Z",
	    "gpsFixTimestamp": "1970-01-01T00:00:00.000Z",
	    "links": [
	      {
		"rel": "machine",
		"uri": "https://sandboxapi.deere.com/platform/machines/4321"
	      }
	    ]
	  },
	  {
	    "point": {
	      "lat": 41.597305,
	      "lon": -90.543884,
	      "altitude": {
		"@type": "measurementAsDouble",
		"valueAsDouble": 0,
		"links": null,
		"unit": "meters"
	      },
	      "links": null
	    },
	    "eventTimestamp": "2010-10-04T15:06:34.000Z",
	    "gpsFixTimestamp": "2010-10-04T15:06:24.000Z",
	    "links": [
	      {
		"rel": "machine",
		"uri": "https://sandboxapi.deere.com/platform/machines/4321"
	      }
	    ]
	  }
	]
      }