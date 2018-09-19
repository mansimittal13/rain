define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/BufferWidget.html", "dojo/dom", "dojo/dom-attr", "dojo/_base/array", "dojo/_base/lang", "esri/Color", "dojo/parser", "esri/config", "esri/map", "esri/graphic", "esri/tasks/GeometryService", "esri/tasks/BufferParameters","esri/tasks/Geoprocessor","esri/geometry/webMercatorUtils", "esri/SpatialReference", "esri/toolbars/draw", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "dojo/query", "dojo/dom-style"], function(_BaseWidget, declare, template, dom, domAttr, array, lang, Color, parser, esriConfig, Map, Graphic, GeometryService, BufferParameters,Geoprocessor,webMercatorUtils, SpatialReference, Draw, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, query, domStyle) {

	return declare("mrsac.viewer.widgets.BufferWidget", [mrsac.viewer._BaseWidget], {

		templateString : template,

		gsvc : null,
		gsvcurl : null,
		tb : null,

		postMixInProperties : function() {

			try {

				this.inherited(arguments);

				if (this.configData) {

					this.gsvcurl = this.configData.buffer.url;
					this.gsvc = new GeometryService(this.gsvcurl);

				}

			} catch (err) {
				console.error(err);
			}

		},
		postCreate : function() {

			try {
				this.inherited(arguments);

			} catch (err) {
				console.error(err);
			}

		},
		startup : function() {

			this.inherited(arguments);

			if (this._initialized) {
				return;
			}

			try {

				this.getAllNamedChildDijits();

				this.initToolbar();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}

		},
		initToolbar : function() {
			this.tb = new Draw(this.map);
			this.tb.on("draw-end", lang.hitch(this, "doBuffer"));

		},
		onBuffToolButtonClick : function(evt) {
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

			domStyle.set(evt.target.id, "background-color", "rgb(222, 184, 135)");
			if (evt && evt.target) {

				switch (evt.target.id) {
					case ("msgSearchPOINT"):
						this.tb.activate(Draw.POINT);

						break;
					case ("msgSearchLINE"):
						this.tb.activate(Draw.LINE);

						break;
					case ("msgSearchPOLYLINE"):
						this.tb.activate(Draw.POLYLINE);

						break;
					case ("msgSearchFREEHAND_POLYLINE"):
						this.tb.activate(Draw.FREEHAND_POLYLINE);

						break;
					case ("msgSearchPOLYGON"):
						this.tb.activate(Draw.POLYGON);

						break;

					case ("msgSearchClear"):
						this.map.graphics.clear();
						return;
					default:
						console.error("Unknown toolbutton pressed: " + evt.target.id);
						return;

				}

			}
		},
		doBuffer : function(evtObj) {
			this.loadmrsac();
			var geometry = evtObj.geometry, gsvc = this.gsvc;

			var symbol;
			switch (geometry.type) {
				case "point":
					symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
					break;
				case "polyline":
					symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1);
					break;
				case "polygon":
					symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
					break;
			}

			var graphic = new Graphic(geometry, symbol);
			this.map.graphics.add(graphic);

			//setup the buffer parameters
			var params = new BufferParameters();
			params.distances = [dom.byId("distance").value];
			params.bufferSpatialReference = new SpatialReference({
				wkid : 102100
			});
			params.outSpatialReference = this.map.spatialReference;
			params.unit = GeometryService[dom.byId("unit").value];

			if (geometry.type === "polygon") {

				//if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
				gsvc.simplify([geometry], lang.hitch(this, function(geometries) {

					params.geometries = geometries;
					gsvc.buffer(params, lang.hitch(this, "showBuffer"));
				}));
			} else {
				params.geometries = [geometry];
				gsvc.buffer(params, lang.hitch(this, "showBuffer"));

			}
		},
		showBuffer : function(bufferedGeometries) {
			this.val = bufferedGeometries;
			var Map = this.map;

			var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255, 0.65]), 2), new Color([0, 0, 255, 0.35]));

			array.forEach(bufferedGeometries, function(geometry) {

				var graphic = new Graphic(geometry, symbol);

				Map.graphics.add(graphic);

			});

			this.tb.deactivate();
			this.unloadmrsac();

		},
		downloadkml : function () {
			this.loadmrsac ();
			//console.log (this.val);
			array.forEach (this.val, lang.hitch (this, function (geometry) {
				//console.log (geometry.rings);
				endString = [];
				array.forEach (geometry.rings, lang.hitch (this, function (geo) {
					//console.log (geo);
					array.forEach (geo, lang.hitch (this, function (georesult) {
						var conv = webMercatorUtils.xyToLngLat (georesult[0], georesult[1]);
						
						//console.log (conv);
						endString.push(conv);
					}));
				}));

			}));

			var params = {
				aoiarray : JSON.stringify (endString)
			};
			console.log (params);
			var gpPrint = new Geoprocessor ("http://117.240.213.119/gp/rest/services/generatekml/BufferKml/GPServer/BufferKml");
			gpPrint.execute (params, lang.hitch (this, this.savegpComplete), lang.hitch (this, this.gpJobFailed));
		},
		savegpComplete : function (jobinfo) {

			var resultImg = jobinfo[0].value.url;
			console.log (resultImg);
			this.unloadmrsac ();
			window.open (resultImg);

		},
		shutdown : function() {

			this.tb.deactivate();
			this.map.graphics.clear();
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			document.getElementById("map_container").style.cursor = "auto";

		}
	});
});

