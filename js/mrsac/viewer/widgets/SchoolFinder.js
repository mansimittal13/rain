define(["viewer/_ThemeWidget", "viewer/ResultList1", "esri/toolbars/draw", "dojo/_base/declare", "dojo/text!./templates/SchoolFinder.html", "js/mrsac/viewer/widgets/nls/LocateWidgetStrings.js", "dijit/form/ComboBox", "esri/tasks/locator", "esri/symbols/PictureMarkerSymbol", "esri/layers/GraphicsLayer", "dojo/query", "dojo/dom", "dojo/_base/connect", "esri/tasks/GeometryService", "esri/layers/FeatureLayer", "esri/InfoTemplate", "dojo/_base/array", "dojo/_base/lang", "esri/graphic", "dojo/string", "dojo/topic", "dojo/dom-style", "esri/geometry/Circle", "dojo/keys", "dojo/on", "esri/tasks/QueryTask", "esri/tasks/query", "dojo/store/Memory", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/Color", "esri/geometry/Point", "esri/tasks/FeatureSet", "esri/tasks/ClosestFacilityTask", "esri/tasks/ClosestFacilityParameters", "esri/tasks/ServiceAreaTask", "esri/tasks/ServiceAreaParameters", "dojo/dom-construct", "dojo/dom-class", "esri/geometry/Polygon", "dojo/_base/array", "esri/graphicsUtils", "esri/geometry/Polyline", "esri/tasks/DistanceParameters", "dojo/number", "esri/dijit/PopupTemplate", "esri/tasks/BufferParameters", "esri/SpatialReference"], function(_ThemeWidget, ResultList1, Draw, declare, template, LocateWidgetStrings, ComboBox, Locator, PictureMarkerSymbol, GraphicsLayer, query, dom, connect, GeometryService, FeatureLayer, InfoTemplate, array, lang, Graphic, string, topic, domStyle, Circle, keys, on, QueryTask, Query, Memory, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, PictureMarkerSymbol, Color, Point, FeatureSet, ClosestFacilityTask, ClosestFacilityParameters, ServiceAreaTask, ServiceAreaParameters, domConstruct, domClass, Polygon, arrayUtils, graphicsUtils, Polyline, DistanceParameters, number, PopupTemplate, BufferParameters, SpatialReference) {

	return declare("mrsac.viewer.widgets.SchoolFinder", [mrsac.viewer._ThemeWidget], {
		constructor : function(/*Object*/params) {

		},
		templateString : template,
		_initialized : false,
		geom : null,
		gsvc : null,
		gsvcurl : null,
        schoolmaping:null, 
		postMixInProperties : function() {

			try {
				this.inherited(arguments);

				if (this.configData) {
					this.gsvcurl = this.configData.buffer.url;
					this.gsvc = new GeometryService(this.gsvcurl);
					// Layers are read from config in startup
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
				if (this.configData) {
                        
					this.geometryUrl = this.configData.buffer.url;

					this.geom = new GeometryService(this.geometryUrl);

					pointL = new GraphicsLayer({
						className : "geomG"

					});
 
					this.map.addLayer(pointL);

				}
                this.schoolmaping="https://mrsac.org.in/gisserver2/rest/services/education/school_mapping/MapServer/0";
			esri.config.defaults.io.corsEnabledServers.push(this.geometryUrl);
			esri.config.defaults.io.corsEnabledServers.push("http://117.240.213.119:6080/arcgis/rest/services/network/SnapshotNA/GPServer/Script/execute");

				this.getAllNamedChildThemeDijits();
				this.messageNode = query(".resultsMsg", this.domNode)[0];
				this.messageNodeRoute = query(".resultsMsgroute", this.domNode)[0];
				this.initToolbar();
				this.SchoolFinderfacilitiesGraphicsLayer = new GraphicsLayer();
				this.map.addLayer(this.SchoolFinderfacilitiesGraphicsLayer);
				SchoolFindersymbols = {
					point : new PictureMarkerSymbol(this.iconUrl, 20, 20),
					line : new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 3),
					polygon : new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2), new Color([0, 255, 255, 0.5]))
				};
				this.themeconnects.push(connect.connect(this.themewidgets.SchoolFinderRoutes, "onResultClick", this, "onResultClickRoutes"));

				//Grab the message node for future use

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}
		},
		initToolbar : function() {
			this.tb = new Draw(this.map);
			this.tb.on("draw-end", lang.hitch(this, "doBuffer"));

		},
		drawPoly : function(evt) {
			this.tb.deactivate();
			this.map.graphics.clear();
			this.SchoolFinderfacilitiesGraphicsLayer.clear();
			this.themewidgets.SchoolFinderRoutes.clear();
			pointL.clear();

			this.resultsMsgroute.innerHTML = "";

			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
			for ( i = 0; i < query(".toolbuttonSchool", this.domNode).length; i++) {

				domStyle.set(query(".toolbuttonSchool",this.domNode)[i], "background-color", "whitesmoke");
			}

			domStyle.set(evt.target.id, "background-color", "rgb(222, 184, 135)");
			if (evt && evt.target) {

				switch (evt.target.id) {
				case ("drawPOINT"):
					this.tb.activate(Draw.POINT);

					break;
				case ("drawLINE"):
					this.tb.activate(Draw.LINE);

					break;
				case ("drawPOLYLINE"):
					this.tb.activate(Draw.POLYLINE);

					break;
				case ("drawFREEHAND_POLYLINE"):
					this.tb.activate(Draw.FREEHAND_POLYLINE);

					break;
				case ("drawPOLYGON"):
					this.tb.activate(Draw.POLYGON);

					break;
				case ("clearSearch"):
					this.clearbuttonClick();
					break;

				default:
					console.error("Unknown toolbutton pressed: " + evt.target.id);
					return;

				}

			}
			//this.tb.activate(Draw.POLYGON);

		},
		doBuffer : function(evtObj) {
			this.loadmrsac();
			this.tb.deactivate();
			var geometry = evtObj.geometry;
			gsvc = this.gsvc;
			console.log(geometry);
			var symbol;
			switch (geometry.type) {
			case "point":
				symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
				var params = new BufferParameters();
				params.distances = [dom.byId("schoolBuffer").value];
				params.bufferSpatialReference = new SpatialReference({
					wkid : 102100
				});
				params.outSpatialReference = this.map.spatialReference;
				params.unit = GeometryService["UNIT_KILOMETER"];
				params.geometries = [geometry];
				gsvc.buffer(params, lang.hitch(this, "showBuffer"));
				break;
			case "polyline":
				symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1);
				var params = new BufferParameters();
				params.distances = [dom.byId("schoolBuffer").value];
				params.bufferSpatialReference = new SpatialReference({
					wkid : 102100
				});
				params.outSpatialReference = this.map.spatialReference;
				params.unit = GeometryService["UNIT_KILOMETER"];
				params.geometries = [geometry];
				gsvc.buffer(params, lang.hitch(this, "showBuffer"));
				break;
			case "polygon":
				symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

				var queryTaskRo = new QueryTask(this.schoolmaping);

				var queryRo = new Query();

				queryRo.outFields = ["*"];

				queryRo.returnGeometry = true;

				queryRo.outSpatialReference = {
					"wkid" : 102100
				};

				queryRo.geometry = geometry;
				queryTaskRo.execute(queryRo, lang.hitch(this, this.showSchool));

				break;
			}
			var graphic = new Graphic(geometry, symbol);
			this.map.graphics.add(graphic);

		},
		showBuffer : function(bufferedGeometries) {

			var Map = this.map;

			var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255, 0.65]), 2), new Color([0, 0, 255, 0.35]));

			//array.forEach(bufferedGeometries, function(geometry) {

			var graphic = new Graphic(bufferedGeometries[0], symbol);

			Map.graphics.add(graphic);

			//});

			this.tb.deactivate();
			var queryTaskRo = new QueryTask(this.schoolmaping);

			var queryRo = new Query();

			queryRo.outFields = ["*"];

			queryRo.returnGeometry = true;

			queryRo.outSpatialReference = {
				"wkid" : 102100
			};

			queryRo.geometry = bufferedGeometries[0];
			queryTaskRo.execute(queryRo, lang.hitch(this, this.showSchool));
			//this.unloadmrsac();

		},
		showSchool : function(featureSet1) {
			var resultFeatures = featureSet1.features;
			var schoolGeometry = [];
			if (resultFeatures.length != 0) {
				array.forEach(resultFeatures, lang.hitch(this, function(f) {

					//var resultCountBeforeAddingThese = resultFeatures.length;

					var link = "";
					var freshsymbol = new PictureMarkerSymbol('js/mrsac/viewer/assets/images/icons/searchgeneral.png', 20, 20);

					var feat = new Graphic(f.geometry.type);

					var D = f.attributes.name;
					var T = f.attributes.schname;
					var E = f.attributes.state_category;
					var W = f.attributes.village_name;
					var X = f.attributes.blkname;
					var Y = f.attributes.distname;
					var Z = f.attributes.name;

					this.content = "<table><tr><td>" + "Classes:" + E + "</td></tr><table><tr><td>" + "DISTRICT:" + Y + "</td><td>" + "TALUKA:" + X + "</td></tr></table></table>";

					var attrs = {
						"title" : f.attributes.schname.toString() + "(" + f.attributes.name.toString() + ")",
						"content" : this.content,
						"link" : link
					};
					var sym = null;
					var loc = null;
					var icon_r = null;

					switch (f.geometry.type) {
					case "point":
						sym = SchoolFindersymbols.point;
						loc = f.geometry;

						break;
					case "multipoint":
						sym = SchoolFindersymbols.point;
						loc = f.geometry.getExtent().getCenter();
						break;
					case "polyline":
						sym = SchoolFindersymbols.line;
						var nPts = f.geometry.paths[0].length;
						var idx = Math.round(nPts / 2);
						loc = f.geometry.getPoint(0, idx);
						break;
					default:
						sym = SchoolFindersymbols.polygon;
						// For multiring geometries, choose one

						if (f.geometry.rings && f.geometry.rings.length > 1) {

							var p = new Polygon(f.geometry.spatialReference);
							p.addRing(f.geometry.rings[0]);
							var ext = p.getExtent();
							loc = ext.getCenter();
						} else {

							var ext = f.geometry.getExtent();

							loc = ext.getCenter();

						}
						break;
					}

					var g = new Graphic(f.geometry, freshsymbol, f.attributes);
					//SchoolFindergeneralicon = "js/mrsac/viewer/assets/images/small_icons/searchgeneral.png";

					this.themewidgets.SchoolFinderRoutes.add({
						title : attrs.title,
						content : attrs.content,
						iconUrl : "js/mrsac/viewer/assets/images/icons/searchgeneral.png",
						graphic : g,
						location : loc,
						link : attrs.link,
						count : this.themewidgets.SchoolFinderRoutes.count
					});

					this.SchoolFinderfacilitiesGraphicsLayer.add(g);
					var msg = "Total Schools found : " + resultFeatures.length;

					this.setMessageRoutes(msg);
					schoolGeometry.push(f);

				}));

				var myFeatureExtent = graphicsUtils.graphicsExtent(schoolGeometry);
				this.map.setExtent(myFeatureExtent.getExtent().expand(1), true);

			} else {
				swal("No school found");
			}

			this.unloadmrsac();

		},
		setMessageRoutes : function(/*String*/message) {

			this.resultsMsgroute.innerHTML = message;

		},
		onResultClickRoutes : function(evt) {

			var graphic = evt.resultItem.graphic;

			if (evt.resultItem) {
				routegeometry = [];
				pointL.clear();
				this.loadmrsac();

				stroke = "blue";
				fill = "#C5E1A5";
				var blinkGraph = this.finalGraphic(graphic, stroke, fill);

				var GrphcNA = new Graphic(graphic.geometry, blinkGraph);

				pointL.add(GrphcNA);
				setTimeout(lang.hitch(this, function() {
					pointL.clear();
				}), 8000);
				var e = [];
				var a = graphic;

				var title1 = evt.resultItem.title;

				this.map.infoWindow.show(evt.resultItem.location);

				if (graphic.geometry.type == "point") {
					routegeometry.push(graphic);
					var myFeatureExtent = graphicsUtils.graphicsExtent(routegeometry);
					this.map.setExtent(myFeatureExtent.getExtent().expand(1.5));

				} else {

					this.map.setExtent(graphic.geometry.getExtent().expand(1.5));
				}

				var h = a.attributes;

				var kh = Object.keys(h);

				array.forEach(kh, function(attr) {
					if (attr != "FID" && attr != "Shape" && attr != "OBJECTID" && attr != "Shape_Leng" && attr != "Shape_Area" && attr != "AREA" && attr != "PERIMETER" && attr != "ROAD_LENGT" && attr != "RAILWAY_LE" && attr != "lng" && attr != "lat") {

						e.push({
							fieldName : attr,
							visible : !0
						});

					}

				});

				var d = new PopupTemplate({
					title : title1,
					fieldInfos : e,
				});

				a.setInfoTemplate(d);

				this.map.infoWindow.setFeatures([a]);
				this.unloadmrsac();
				var element = query(".esriPopup .titleButton.close");

				on(element[0], "click", lang.hitch(this, function() {

					this.map.graphics.clear();
					pointL.clear();

				}));
			} else {

				this.unloadmrsac();
				//do nothing
			}
		},
		clearbuttonClick : function() {

			this.SchoolFinderfacilitiesGraphicsLayer.clear();
			this.map.graphics.clear();
			this.themewidgets.SchoolFinderRoutes.clear();
			this.resultsMsgroute.innerHTML = "";
			pointL.clear();
			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
		},
		shutdown : function() {

			this.SchoolFinderfacilitiesGraphicsLayer.clear();
			this.map.graphics.clear();
			this.themewidgets.SchoolFinderRoutes.clear();
			this.resultsMsgroute.innerHTML = "";
			pointL.clear();
			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
		},
	});
});

