var po = org.polymaps;

var div = document.getElementById("map");

var map = po.map()
	.container(div.appendChild(po.svg("svg")))
	.center({ lat: 53.289, lon: -340.939 })
	.zoom(7)
	.add(po.interact())
	.add(po.hash());

/*
 * Load the "AerialWithLabels" metadata. "Aerial" and "Road" also work. For more
 * information about the Imagery Metadata service, see
 * http://msdn.microsoft.com/en-us/library/ff701716.aspx
 * You should register for your own key at https://www.bingmapsportal.com/.
 */
var script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", "http://dev.virtualearth.net"
	+ "/REST/V1/Imagery/Metadata/Aerial"
	+ "?key=Ala0zezv7xYEJpWjwN7mhAwt9Lp5j07z0j9e7yo0X6c7qei0fXEcUCuMFxIjlaEv"
	+ "&jsonp=callback");
document.body.appendChild(script);

function callback(data) {
	/* Display each resource as an image layer. */
	var resourceSets = data.resourceSets;
	for (var i = 0; i < resourceSets.length; i++) {
		var resources = data.resourceSets[i].resources;
		for (var j = 0; j < resources.length; j++) {
			var resource = resources[j];
			map.add(po.image()
				.url(template(resource.imageUrl, resource.imageUrlSubdomains)))
				.tileSize({ x: resource.imageWidth, y: resource.imageHeight });
		}
	}

	map.add(po.compass()
		.pan("none"));

}


function CallRestService(request, callback) {
	$.ajax({
		url: request,
		dataType: "jsonp",
		jsonp: "jsonp",
		success: function (r) {
			callback(r);
		},
		error: function (e) {
			alert(e.statusText);
		}
	});
}

var request = "http://dev.virtualearth.net"
	+ "/REST/v1/Routes?"
	+ "waypoint.1=Gdansk&waypoint.2=Warszawa"
	+ "&key=Ala0zezv7xYEJpWjwN7mhAwt9Lp5j07z0j9e7yo0X6c7qei0fXEcUCuMFxIjlaEv";

CallRestService(request, drawPoints);

function drawPoints(data) {
	const points = data.resourceSets[0].resources[0].routeLegs[0].itineraryItems.map(item => item.maneuverPoint.coordinates);

	points.forEach(p => {
		var point = {
			type: "Feature",
			geometry: {
				"type": "Point",
				"coordinates": [ p[1], p[0] ]
			}
		};
		map.add(po.geoJson()
			.features([point]));
	});
}

/** Returns a Bing URL template given a string and a list of subdomains. */
function template(url, subdomains) {
	var n = subdomains.length,
		salt = ~~(Math.random() * n); // per-session salt

	/** Returns the given coordinate formatted as a 'quadkey'. */
	function quad(column, row, zoom) {
		var key = "";
		for (var i = 1; i <= zoom; i++) {
			key += (((row >> zoom - i) & 1) << 1) | ((column >> zoom - i) & 1);
		}
		return key;
	}

	return function (c) {
		var quadKey = quad(c.column, c.row, c.zoom),
			server = Math.abs(salt + c.column + c.row + c.zoom) % n;
		return url
			.replace("{quadkey}", quadKey)
			.replace("{subdomain}", subdomains[server]);
	};
}


// map.add(po.geoJson()
//     .url("streets.json")
//     .id("streets")
//     .zoom(12)
//     .tile(false)
// 	.on("load", function (e) { e.features[i].element.setAttribute('fill', '#eb6a52'); }));