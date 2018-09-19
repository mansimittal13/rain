/**
 * @author Richa
 */

define(['dojo/_base/kernel', 'dojo/io/script', 'dojo/_base/loader', 'dojo/string', 'dojo/_base/lang'], function(dojo, ioScript, string, lang) {

	dojo.provide("mrsac.viewer.util");

	mrsac.viewer.util.getSmallIcon = function(/*URL*/fullSizeIconUrl) {
		// full-size icons are in assets/images/icons/
		// small icons are in assets/images/small_icons/
		return fullSizeIconUrl.replace(/assets\/images\/icons\//, "assets/images/small_icons/");
	};
	
	mrsac.viewer.util.urlPattern = /^\s*(https?):\/\/([\-\w\.]+)+(:\d+)?(\/([\w\/_\.\-]*(\?\S+)?)?)?\s*$/;

	mrsac.viewer.util.isUrl = function(/*String*/value) {
		if (value) {
			value = value + "";
			// ensure it's a string
			return mrsac.viewer.util.urlPattern.test(value);
		}
		return false;
	};

	mrsac.viewer.util.parseUrl = function(/*URL*/url) {

		/* Parses url into an associative array of strings
		 *  [0] - full url  "http://www.w3schools.com:8080/jsref/tryit.asp?filename=tryjsref_match_regexp"
		 *  [1] - protocol  "http"
		 *  [2] - host      "www.w3schools.com"
		 *  [3] - port      ":8080"
		 *  [4] - path      "/jsref/tryit.asp?filename=tryjsref_match_regexp"
		 *  [5] - rel. path "jsref/tryit.asp?filename=tryjsref_match_regexp"
		 *  [6] - GET args  "?filename=tryjsref_match_regexp"
		 */
		var theArrayOfParts = [];
		if (url) {
			url = url + "";
			// ensure it's a string
			theArrayOfParts = url.match(mrsac.viewer.util.urlPattern);
		}

		theArrayOfParts.fullUrl = theArrayOfParts[0];
		theArrayOfParts.protocol = theArrayOfParts[1];
		theArrayOfParts.host = theArrayOfParts[2];
		theArrayOfParts.port = theArrayOfParts[3];
		theArrayOfParts.path = theArrayOfParts[4];
		theArrayOfParts.relativePath = theArrayOfParts[5];
		theArrayOfParts.getArgs = theArrayOfParts[6];

		return theArrayOfParts;
	};

	mrsac.viewer.util.round = function(number, numPlaces) {
		//console.debug("round(" + number + ", " + numPlaces + ")");
		if (!numPlaces) {
			numPlaces = 0;
		}
		if (numPlaces > 5) {
			numPlaces = 5;
		}
		if (numPlaces < -5) {
			numPlaces = -5;
		}
		numPlaces = Math.round(numPlaces);

		//console.debug("rounding " + number + " to " + numPlaces + " places");
		var factor = Math.pow(10, numPlaces);

		return Math.round(number * factor) / factor;
	};

	mrsac.viewer.util.significantDigits = function(number, numSignificantDigits) {
		var text = number + "";
		//console.debug("significantDigits(" + text + ", " + numSignificantDigits + ")");
		var output = "";

		var bCounting = false;
		var count = 0;
		var bFoundDot = false;
		for (var i = 0; i < text.length; i++) {
			var char = text.substr(i, 1);
			bFoundDot = bFoundDot || char == ".";
			bCounting = bCounting || (char != "-" && char != "." && char != "0");

			if (bCounting && char != ".") {
				count++;
			}

			if (count == numSignificantDigits) {
				if (char == ".") {
					break;
				}
				if (i == text.length - 1) {
					output += char;
				} else {
					var next = text.substr(i + 1, 1);
					if (next == ".") {
						next = text.substr(i + 2, 1);
					}
					var frag = char + "." + next;
					output += Math.round(parseFloat(frag));
				}
			} else if (count > numSignificantDigits) {
				if (bFoundDot) {
					break;
				} else {
					output += 0;
				}
			} else {
				output += char;
			}
		}
		//console.debug(output);
		if (output.length > 0) {
			output = parseFloat(output);
		}
		return output;
	};

	mrsac.viewer.util.atan2 = function(y, x) {
		var out;
		if (x < 0) {
			out = Math.atan(y / x) + Math.PI;
		}
		if ((x > 0) && (y >= 0)) {
			out = Math.atan(y / x);
		}
		if ((x > 0) && (y < 0)) {
			out = Math.atan(y / x) + 2 * Math.PI;
		}
		if ((x === 0) && (y > 0)) {
			out = Math.PI / 2;
		}
		if ((x === 0) && (y < 0)) {
			out = 3 * Math.PI / 2;
		}
		if ((x === 0) && (y === 0)) {
			console.error("mrsac.viewer.util.atan2(0,0) undefined");
			out = 0.0;
		}
		return out;
	};

	mrsac.viewer.util.pageBox = function() {
		var theBox = {
			l : 0,
			t : 0,
			w : 0,
			h : 0
		};
		try {
			if (window.innerHeight) {
				theBox.w = window.innerWidth;
				theBox.h = window.innerHeight;
			} else if (document.documentElement.clientHeight) {
				theBox.w = document.documentElement.clientWidth;
				theBox.h = document.documentElement.clientHeight;
			} else if (document.body.clientHeight) {
				theBox.w = document.body.clientWidth;
				theBox.h = document.body.clientHeight;
			}
		} catch (err) {
			console.error("Measuring pageBox", err);
		}
		return theBox;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////
	mrsac.viewer.util.xml = {};
	///////////////////////////////////////////////////////////////////////////////////////////////

	mrsac.viewer.util.xml.parseObject = function(/*DOMNode*/node) {
		// recursively build object from xml doc
		if (node) {
			try {
				//console.debug(node.nodeType);
				if (node.nodeType === 3 || node.nodeType === 4) {
					var trimmed = dojo.string.trim(node.nodeValue);
					if (trimmed.length === 0) {
						return null;
					}
					return trimmed;
				} else if (node.nodeType === 1) {
					//console.debug(node.nodeName);
					var o = {};
					var childCount = 0;

					// attributes
					dojo.forEach(node.attributes, function(attr) {
						//console.debug("attribute " + attr.nodeName + " = " + attr.nodeValue);
						o[attr.nodeName] = attr.nodeValue;
					});

					// child nodes
					var childNodes = node.childNodes;
					dojo.forEach(childNodes, function(child) {
						var childValue = mrsac.viewer.util.xml.parseObject(child);
						if (childValue) {
							childCount++;
							// Has there been a previous node with the same name?
							// If so, convert to an array of nodes with this name
							if (o[child.nodeName]) {
								if (dojo.isArray(o[child.nodeName]) === false) {
									o[child.nodeName] = [o[child.nodeName]];
								}
								o[child.nodeName].push(childValue);
							} else {
								o[child.nodeName] = childValue;
							}
						}
					});

					if (childCount === 1 && o["#text"]) {
						// Only child was a text node
						return o["#text"];
					}
					if (childCount === 1 && o["#cdata-section"]) {
						// Only child was a cdata node
						return o["#cdata-section"];
					}
					return o;
				}
			} catch (err) {
				console.error("util.xml::parseObject ", err);
			}
		}
		return null;
	};

	mrsac.viewer.util.xml.getAllNodes = function(/*DOMNode*/node) {
		//var allEntryChildren = dojo.query("*", node);
		//var allEntryChildren = node.childNodes;
		var nodes = new dojo.NodeList();
		if (dojo.isIE) {
			var childNodes = node.childNodes;
			for (var i = 0; i < childNodes.length; i++) {
				nodes.push(childNodes[i]);
			}

		} else {
			nodes = dojo.query("*", node);
		}
		return nodes;
	};

	mrsac.viewer.util.xml.getNodes = function(/*String*/parentTagName, /*String*/childTagName, /*Document*/doc) {
		var nodes = new dojo.NodeList();
		if (dojo.isIE) {
			var parentNodes = doc.getElementsByTagName(parentTagName);
			dojo.forEach(parentNodes, function(parent, idx, arr) {
				var childNodes = parent.getElementsByTagName(childTagName);
				dojo.forEach(childNodes, function(child, idx, arr) {
					nodes.push(child);
				});
			});
		} else {
			nodes = dojo.query(parentTagName + " > " + childTagName, doc);
		}
		return nodes;
	};

	mrsac.viewer.util.xml.getValue = function(/* String|Node */source, /*DOMNode*/document) {
		//console.debug("ConfigManager::getValue(" + source + ", " + document + ")");
		if (source) {

			var node = source;
			if (dojo.isString(source)) {

				var arr = source.split(" > ");

				var nlist = this.getNodes(arr[0], arr[1], document);

				node = nlist[0];

			}

			if (node.firstChild && node.firstChild.nodeValue) {

				return node.firstChild.nodeValue;
			}
			return "Node not valid";
		}
		return "No Value";
	};

	mrsac.viewer.util.xml.getAttribute = function(/* Node */node, /* String */attrName) {

		//console.debug("ConfigManager::getAttribute(node, " + attrName + ")");
		if (node) {
			if (dojo.isIE) {

				for (var i = 0; i < node.attributes.length; i++) {

					if (node.attributes[i].nodeName == attrName) {

						return node.attributes[i].nodeValue;
					}
				}
				return null;
			} else {
				return node.getAttribute(attrName);
			}

			return "Non-XMLNode passed to GeoRSSConfigWidget.getAttribute";
		}
		return "No Value";
	};

	///////////////////////////////////////////////////////////////////////////////////////////////
	mrsac.viewer.util.scale = {};
	///////////////////////////////////////////////////////////////////////////////////////////////

	mrsac.viewer.util.scale.calculateScale = function(map) {
		var mapLayer = map.getLayer(map.layerIds[0]);
		var mapUnits = mapLayer.units;
		var extent = map.extent;

		var mapWidthMapUnits = extent.xmax - extent.xmin;

		var mapWidthMeters;

		if (mapUnits == "esriFeet") {
			mapWidthMeters = 0.3048 * mapWidthMapUnits;
		} else if (mapUnits == "esriMeters") {
			mapWidthMeters = mapWidthMapUnits;
		} else if (mapUnits == "esriDecimalDegrees") {
			lon1 = mrsac.viewer.util.measure.degreesToRadians(extent.xmin);
			lon2 = mrsac.viewer.util.measure.degreesToRadians(extent.xmax);
			lat1 = mrsac.viewer.util.measure.degreesToRadians((extent.ymin) / 2);
			lat2 = lat1;

			mapWidthMeters = 6373000 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
		}

		var imageWidthPixels = map.width;
		var imageWidthMeters = (0.0254 / 96) * imageWidthPixels;

		return Math.round(mapWidthMeters / imageWidthMeters);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////
	mrsac.viewer.util.measure = {};
	///////////////////////////////////////////////////////////////////////////////////////////////

	mrsac.viewer.util.measure.getDistanceXYXY = function(x1, y1, x2, y2) {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	};

	mrsac.viewer.util.measure.getDistance = function(p1, p2) {
		return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
	};

	/*mrsac.viewer.util.measure.getDistanceInMetersFromDegrees1 = function(p1, p2){
	 lat1 = mrsac.viewer.util.measure.degreesToRadians(p1.y);
	 lon1 = mrsac.viewer.util.measure.degreesToRadians(p1.x);
	 lat2 = mrsac.viewer.util.measure.degreesToRadians(p2.y);
	 lon2 = mrsac.viewer.util.measure.degreesToRadians(p2.x);

	 distance = 6373000 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));

	 return distance;
	 };

	 mrsac.viewer.util.measure.getDistanceInMetersFromDegrees2 = function(lat1, lon1, lat2, lon2){
	 lat1 = mrsac.viewer.util.measure.degreesToRadians(lat1);
	 lon1 = mrsac.viewer.util.measure.degreesToRadians(lon1);
	 lat2 = mrsac.viewer.util.measure.degreesToRadians(lat2);
	 lon2 = mrsac.viewer.util.measure.degreesToRadians(lon2);

	 distance = 6373000 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));

	 return distance;
	 };*/

	mrsac.viewer.util.measure.getGreatCircleDistance1 = function(/*esri.geometry.Point*/p1, /*esri.geometry.Point*/p2) {
		mrsac.viewer.util.measure.getGreatCircleDistance2(p1.y, p1.x, p2.y, p2.x);
	};

	mrsac.viewer.util.measure.getGreatCircleDistance2 = function(/*Number*/lat1, /*Number*/lon1, /*Number*/lat2, /*Number*/lon2) {
		try {
			var m = mrsac.viewer.util.measure;
			var rlat1 = m.degreesToRadians(lat1);
			var rlon1 = m.degreesToRadians(lon1);
			var rlat2 = m.degreesToRadians(lat2);
			var rlon2 = m.degreesToRadians(lon2);

			var ellipse = {
				name : "WGS80",
				a : 6378.137 / 1.852,
				invf : 298.257223563
			};

			// Some util functions
			var mod = function(x, y) {
				return x - y * Math.floor(x / y);
			};

			var modcrs = function(x) {
				return mod(x, 2 * Math.PI);
			};

			var a = ellipse.a;
			var f = 1 / ellipse.invf;

			var r, tu1, tu2, cu1, su1, cu2, s1, b1, f1;
			var x, sx, cx, sy, cy, y, sa, c2a, cz, e, c, d;
			var EPS = 0.00000000005;
			var faz, baz, s;
			var iter = 1;
			var MAXITER = 100;
			if ((rlat1 + rlat2 === 0.0) && (Math.abs(rlon1 - rlon2) == Math.PI)) {
				
				rlat1 = rlat1 + 0.00001;
				// allow algorithm to complete
			}
			if (rlat1 == rlat2 && (rlon1 == rlon2 || Math.abs(Math.abs(rlon1 - rlon2) - 2 * Math.PI) < EPS)) {
				//console.warn("Points 1 and 2 are identical- course undefined");
				return 0;
			}
			r = 1 - f;
			tu1 = r * Math.tan(rlat1);
			tu2 = r * Math.tan(rlat2);
			cu1 = 1.0 / Math.sqrt(1.0 + tu1 * tu1);
			su1 = cu1 * tu1;
			cu2 = 1.0 / Math.sqrt(1.0 + tu2 * tu2);
			s1 = cu1 * cu2;
			b1 = s1 * tu2;
			f1 = b1 * tu1;
			x = rlon2 - rlon1;
			d = x + 1;
			// force one pass

			var atan2 = mrsac.viewer.util.atan2;
			while ((Math.abs(d - x) > EPS) && (iter < MAXITER)) {
				iter = iter + 1;
				sx = Math.sin(x);
				cx = Math.cos(x);
				tu1 = cu2 * sx;
				tu2 = b1 - su1 * cu2 * cx;
				sy = Math.sqrt(tu1 * tu1 + tu2 * tu2);
				cy = s1 * cx + f1;
				y = atan2(sy, cy);
				sa = s1 * sx / sy;
				c2a = 1 - sa * sa;
				cz = f1 + f1;
				if (c2a > 0.0) {
					cz = cy - cz / c2a;
				}
				e = cz * cz * 2.0 - 1.0;
				c = ((-3.0 * c2a + 4.0) * f + 4.0) * c2a * f / 16.0;
				d = x;
				x = ((e * cy * c + cz) * sy * c + y) * sa;
				x = (1.0 - c) * x * f + rlon2 - rlon1;
			}
			faz = modcrs(atan2(tu1, tu2));
			baz = modcrs(atan2(cu1 * sx, b1 * cx - su1 * cu2) + Math.PI);
			x = Math.sqrt((1 / (r * r) - 1) * c2a + 1);
			x += 1;
			x = (x - 2.0) / x;
			c = 1.0 - x;
			c = (x * x / 4.0 + 1.0) / c;
			d = (0.375 * x * x - 1.0) * x;
			x = e * cy;
			s = ((((sy * sy * 4.0 - 3.0) * (1.0 - e - e) * cz * d / 6.0 - x) * d / 4.0 + cz) * sy * d + y) * c * a * r;
			var out = {};
			out.d = s;
			out.dist = s * 1852;
			// to meters
			out.crs12 = faz;
			out.crs21 = baz;
			if (Math.abs(iter - MAXITER) < EPS) {
				
			}
			return out.dist;
		} catch (err) {
			console.error("Error calculating great circle distance", err);
			return 0;
		}
	};

	mrsac.viewer.util.measure.degreesToRadians = function(degrees) {
		return Math.PI * degrees / 180;
	};

	mrsac.viewer.util.measure.radiansToDegrees = function(radians) {
		return radians * 180 / Math.PI;
	};

	mrsac.viewer.util.measure.knownDistanceUnits = ["Meters", "Kilometers", "Feet", "Yards", "Miles"];

	mrsac.viewer.util.measure.convertDistanceUnits = function(distance, fromUnits, toUnits) {
		if (fromUnits == "DecimalDegrees") {
			console.error("convertDistanceUnits: DecimalDegrees are not a distance unit");
			return 0;
		}

		// Number of meters in a unit
		var cFactors = {
			"Feet" : 0.3048,
			"Meters" : 1,
			"Miles" : 1609.344,
			"Kilometers" : 1000,
			"Yards" : 0.9144
		};

		if (!cFactors[fromUnits]) {
			console.error("convertDistanceUnits: Unknown units '" + fromUnits + "'");
			return 0;
		}
		if (!cFactors[toUnits]) {
			console.error("convertDistanceUnits: Unknown units '" + toUnits + "'");
			return 0;
		}

		// Convert to meters
		var dInMeters = distance * cFactors[fromUnits];

		// Convert to output units
		var convDistance = dInMeters / cFactors[toUnits];

		return convDistance;
	};

	mrsac.viewer.util.measure.knownAreaUnits = ["Meters", "Kilometers", "Feet", "Yards", "Miles", "Acres", "Hectares"];

	mrsac.viewer.util.measure.convertAreaUnits = function(area, fromUnits, toUnits) {
		if (fromUnits == "DecimalDegrees") {
			console.error("convertDistanceUnits: DecimalDegrees are not an area unit");
			return 0;
		}

		// Number of square meters in a unit
		var cFactors = {
			"Feet" : 0.09290304,
			"Meters" : 1,
			"Miles" : 2589988.11,
			"Kilometers" : 1000000,
			"Yards" : 0.83612736,
			"Acres" : 4046.85642,
			"Hectares" : 10000
		};

		if (!cFactors[fromUnits]) {
			console.error("convertAreaUnits: Unknown units '" + fromUnits + "'");
			return 0;
		}
		if (!cFactors[toUnits]) {
			console.error("convertAreaUnits: Unknown units '" + toUnits + "'");
			return 0;
		}

		// Convert to meters
		var aInMeters = area * cFactors[fromUnits];

		// Convert to output units
		var convArea = aInMeters / cFactors[toUnits];

		return convArea;
	};

	mrsac.viewer.util.measure.calculateLength = function(polyline, isGeographic) {
		var length = [];
		if (polyline && polyline.type && polyline.type == "polyline") {
			for (var i in polyline.paths) {
				var l = 0;

				for (var j = 0; j < polyline.paths[i].length - 1; j++) {
					var x1 = polyline.paths[i][j][0];
					var y1 = polyline.paths[i][j][1];
					var x2 = polyline.paths[i][j+1][0];
					var y2 = polyline.paths[i][j+1][1];

					var d;
					if (isGeographic) {
						d = mrsac.viewer.util.measure.getGreatCircleDistance2(y1, x1, y2, x2);
					} else {
						d = mrsac.viewer.util.measure.getDistanceXYXY(x1, y1, x2, y2);
					}

					l += d;
				}
				length.push(l);
			}
		}
		return length;
	};

	mrsac.viewer.util.measure.calculatePerimeter = function(polygon) {
		var perimeter = [];
		if (polygon && polygon.type && polygon.type == "polygon") {
			for (var i in polygon.rings) {
				var p = 0;
				for (var j = 0; j < polygon.rings[i].length; j++) {
					var x1 = polygon.rings[i][j][0];
					var y1 = polygon.rings[i][j][1];
					var x2, y2;
					if (j + 1 < polygon.rings[i].length) {
						x2 = polygon.rings[i][j + 1][0];
						y2 = polygon.rings[i][j + 1][1];
					} else {
						x2 = polygon.rings[i][0][0];
						y2 = polygon.rings[i][0][1];
					}

					var d = mrsac.viewer.util.measure.getDistanceXYXY(x1, y1, x2, y2);

					p += d;
				}
				perimeter.push(p);
			}
		}
		return perimeter;
	};

	mrsac.viewer.util.measure.calculateArea = function(polygon) {
		var area = [];
		if (polygon && polygon.type && polygon.type == "polygon") {
			for (var i in polygon.rings) {
				var a = 0;

				for (var j = 0; j < polygon.rings[i].length - 1; j++) {
					var x1 = polygon.rings[i][j][0];
					var y1 = polygon.rings[i][j][1];
					var x2 = polygon.rings[i][j+1][0];
					var y2 = polygon.rings[i][j+1][1];

					var dX = x2 - x1;
					var dY = y2 - y1;

					a += x1 * dY - y1 * dX;
				}
				a *= -2;
				area.push(a);
			}
		}
		return area;
	};

	mrsac.viewer.util.measure.getRingExtent = function(polygon, ringIndex) {
		var ext = null;
		if (polygon && polygon.type && polygon.type == "polygon") {
			var minX = null;
			var maxX = null;
			var minY = null;
			var maxY = null;

			for (var j = 0; j < polygon.rings[ringIndex].length; j++) {
				x = polygon.rings[ringIndex][j][0];
				y = polygon.rings[ringIndex][j][1];

				if (minX) {
					minX = Math.min(minX, x);
				} else {
					minX = x;
				}

				if (minY) {
					minY = Math.min(minY, y);
				} else {
					minY = y;
				}

				if (maxX) {
					maxX = Math.max(maxX, x);
				} else {
					maxX = x;
				}

				if (maxY) {
					maxY = Math.max(maxY, y);
				} else {
					maxY = y;
				}
			}

			ext = new esri.geometry.Extent(minX, minY, maxX, maxY, polygon.spatialReference);
		}
		return ext;
	};

	mrsac.viewer.util.measure.getMidPoint = function(p1, p2) {
		var theReturn = null;
		if (p1 && p1.type && p1.type == "point" && p2 && p2.type && p2.type == "point") {
			var x = (p1.x + p2.x) / 2;
			var y = (p1.y + p2.y) / 2;
			theReturn = new esri.geometry.Point(x, y, p1.spatialReference);
		}
		return theReturn;
	};

	mrsac.viewer.util.measure.getAngle = function(p1, p2) {
		var theReturn = 0;
		if (p1 && p1.type && p1.type == "point" && p2 && p2.type && p2.type == "point") {
			var dx = (p1.x - p2.x);
			var dy = (p1.y - p2.y);
			var rad = Math.PI / 2;
			if (dx !== 0) {
				rad = Math.atan(dy / dx) * -1;
			}
			theReturn = mrsac.viewer.util.measure.radiansToDegrees(rad);
		}
		return theReturn;
	};
	mrsac.viewer.util.showpopup = function() {
		
	};

});

