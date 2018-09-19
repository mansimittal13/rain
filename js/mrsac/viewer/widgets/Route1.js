define(["viewer/_ThemeWidget", "viewer/util", "dojo/_base/declare", "dojo/text!./templates/Route.html", "dojo/query", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "esri/SpatialReference", "dojo/_base/connect", "esri/graphicsUtils", "esri/tasks/query", "dojo/_base/lang", "esri/tasks/QueryTask", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/TextSymbol", "esri/symbols/SimpleLineSymbol", "dojo/number", "esri/Color", "esri/symbols/Font", "esri/graphic", "esri/layers/GraphicsLayer", "esri/InfoTemplate", "esri/units", "esri/lang", "esri/geometry/Circle", "dojo/dom", "dojo/on", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/connect", "dojo/parser", "dojo/ready", "dojo/dom-construct", "dijit/form/FilteringSelect", "dojo/store/Memory", "dojo/_base/array", "dijit/registry", "dgrid/Grid", "dijit/Tooltip", "dojo/data/ItemFileReadStore", "esri/geometry/Point", "esri/toolbars/draw", "dijit/layout/BorderContainer", "dijit/form/RadioButton", "dijit/form/CheckBox", "dijit/Dialog"], function(ThemeWidget, util, declare, template, query, RouteTask, RouteParameters, FeatureSet, SpatialReference, connect, graphicsUtils, Query, lang, QueryTask, PictureMarkerSymbol, SimpleMarkerSymbol, TextSymbol, SimpleLineSymbol, number, Color, Font, Graphic, GraphicsLayer, InfoTemplate, Units, esriLang, Circle, dom, on, domAttr, style, connect, parser, ready, domConstruct, FilteringSelect, Memory, array, registry, Grid, Tooltip, ItemFileReadStore, Point, Draw) {

	return declare("mrsac.viewer.widgets.Route", [mrsac.viewer._ThemeWidget], {

		constructor : function() {

			newlist = [];
			stopList = [];
			stopList1 = [];
			directionsInfo = [];
			data = [];
		},

		templateString : template,

		map : null,
		routeTask : null,
		routeParams : null,
		routeGraphicLayer : null,
		selectionSymbolR : null,
		segmentGraphic : null,
		directionFeatures : null,
		grid : null,
		newStops : null,
		stopS : null,
		stopR : null,
		polylineBarrierSymbol : null,
		globalroutegraphic : null,

		directions : null,
		textSymbol : null,
		intrvlId : null,
		selectionSymbolR : null,
		routeSymbol : null,
		routeSymbolS : null,
		mapOnClick_addStops_connect : null,
		mapOnClick_addBarriers_connect : null,
		mapOnClick_addBarriers_connect : null,
		drawEnd_connect : null,
		stoplistNode : null,
		routetext : null,
		routetextc : null,
		directionDiv : null,

		postMixInProperties : function() {

			try {
				this.inherited(arguments);

				if (this.configData) {

				}

			} catch (err) {

				alert("err" + err);

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

			//this.inherited(arguments);

			if (this._initialized) {
				return;
			}

			try {

				this.getAllNamedChildThemeDijits();

				var DDiv = dom.byId("DirectionsDiv");

				this.directionDiv = query(DDiv, this.domNode)[0];

				var node = document.getElementById('gradient-style1');

				var noderoutetext = dom.byId("routetext");
				var noderoutetextc = dom.byId("routetextc");
				this.routetext = query(noderoutetext, this.domNode)[0];
				this.routetextc = query(noderoutetextc, this.domNode)[0];
				this.stoplistNode = query(node, this.domNode)[0];

				this.createwidget();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}

		},
		createwidget : function() {

			map = this.map;

			routeTask = new RouteTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/network/cf_sa/NAServer/Route");

			routeParams = new RouteParameters();

			routeParams.stops = new FeatureSet();

			routeParams.barriers = new FeatureSet();
			routeParams.polylineBarriers = new FeatureSet();
			routeParams.returnRoutes = true;
			routeParams.returnDirections = true;
			routeParams.returnPolylineBarriers = true;

			routeParams.findBestSequence = false;
			routeParams.preserveFirstStop = true;
			routeParams.preserveLastStop = true;
			routeParams.returnStops = true;

			routeParams.directionsLengthUnits = Units.KILOMETERS;

			routeParams.outSpatialReference = new SpatialReference({
				wkid : 102100
			});

			//var routenode = document.getElementById("stoplink1");;
			//var handleroute = on(routeTask, "onSolveComplete", showRoute);

			connect.connect(routeTask, "onSolveComplete", this, "showRoute");

			//	alert(handleroute)

			//var handleerror = on(routeTask, "onError", errorHandler);

			connect.connect(routeTask, "onError", this, "errorHandler");

			//handleroute.remove();

			routeGraphicLayer = new GraphicsLayer({
				id : "routeGraphicLayer"
			});
			map.addLayer(routeGraphicLayer);

			selectionSymbolR = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#FFFF00"), 2), new Color("#cdefa0"));

			routeSymbolS = new SimpleLineSymbol().setColor(new Color("#00FFFF")).setWidth(2);

			routeSymbol = new SimpleLineSymbol().setColor(new Color("#893BFF")).setWidth(4);

			polylineBarrierSymbol = new SimpleLineSymbol().setColor(new Color([255, 0, 0]));

			try {
				var queryTask = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/network/cf_sa/MapServer/21");
				var query = new Query();
				query.returnGeometry = false;
				query.outFields = ["*"];
				query.where = "LOCATION  <>''"
				queryTask.execute(query, lang.hitch(this, "populateList"));

			} catch (err) {

				alert("err" + err);
			}

		},
		populateList : function(results) {

			var zone;
			var values = [];
			var testVals = {};

			var features = results.features;

			array.forEach(features, function(feature) {

				zone = feature.attributes.uniqueSCODE;

				newlist.push(zone);
				if (zone) {
					if (!testVals[zone]) {
						testVals[zone] = true;
						values.push({
							name : zone
						});
					}
				}
			});

			var dataItems = {
				identifier : 'name',
				label : 'name',
				items : values
			};
			var store = new Memory({
				data : dataItems
			});

			registry.byId("firststopC").set('store', store);

			registry.byId("laststopC").set('store', store);
			registry.byId("stopC").set('store', store);

		},
		SearchByAddress : function() {
			//RemoveChildren(dom.byId('tblAddressResults'));

			dom.byId("tdsearchme").className = "tdSearchByUnSelectedPrecinct";
			dom.byId("tdSearchname").className = "tdSearchByAddress";

			dom.byId("Locateclick").style.display = "block";

			dom.byId("onmapclick").style.display = "none";
			dom.byId("stoplink1").style.visibility = "visible";
			dom.byId("barrierlink1").style.visibility = "visible";
			dom.byId("optionsDiv").style.display = "none";

			this.HideListPanel();
			this.HideListstop();
			this.HideListoptions();
			this.clearAll();

		},
		SearchByclick : function() {

			//RemoveChildren(dom.byId('tblAddressResults'));

			dom.byId("tdsearchme").className = "tdSearchByPrecinct";
			dom.byId("tdSearchname").className = "tdSearchByUnSelectedAddress";

			dom.byId("onmapclick").style.display = "block";

			dom.byId("Locateclick").style.display = "none";
			dom.byId("stoplink1").style.visibility = "hidden";
			dom.byId("barrierlink1").style.visibility = "hidden";
			dom.byId("optionsDiv").style.display = "none";

			this.HideListPanel();
			this.HideListstop();
			this.HideListoptions();

			this.clearAll();

		},
		appendstop : function() {

			var setattr = domAttr.get("stoplink1", "state");

			if (setattr == "maximized") {

				this.HideListstop();
			} else {

				this.ShowListstop();
			}

		},
		ShowListstop : function() {
			style.set("stopstab", "display", "block");

			style.set("stoplink1", "display", "none");
			style.set("stoplinkhide", "display", "block");

			domAttr.set("stoplink1", "state", "maximized");
		},
		HideListstop : function() {

			style.set("stopstab", "display", "none");

			style.set("stoplink1", "display", "block");

			style.set("stoplinkhide", "display", "block");

			domAttr.set("stoplink1", "state", "minimized");
		},
		ShowHideListPanel : function() {

			var showhide = domAttr.get("stoplistshow", "state");

			if (showhide == "maximized") {

				this.HideListPanel();
			} else {

				this.ShowListPanel();
			}
		},
		HideListPanel : function() {
			style.set("stoplistshow", "cursor", "pointer");

			style.set("gradient-style1", "width", "0px");

			style.set("gradient-style1", "height", "0px");
			style.set("gradient-style1", "display", "none");

			domAttr.set("stoplistshow", "state", "minimized");
			dom.byId("stoplistshow").title = "Show stops";
			dom.byId("stoplistshow").src = "img/blueatt.png";
		},
		ShowListPanel : function() {
			style.set("stoplistshow", "cursor", "pointer");

			style.set("gradient-style1", "width", "auto");

			style.set("gradient-style1", "height", "138px");
			style.set("gradient-style1", "display", "block");

			domAttr.set("stoplistshow", "state", "maximized");

			dom.byId("stoplistshow").title = "Hide stops";
			dom.byId("stoplistshow").src = "img/blueatt1.png";

		},
		remrecshow : function() {
			var remrec = document.getElementById("remrec");

			on(remrec, "click", remrecshow);

		},
		appendbarrier : function() {
			var showhideB = domAttr.get("barrierlink1", "state");

			if (showhideB == "maximized") {

				this.HideListbarrier();
			} else {

				this.ShowListbarrier();
			}
		},
		ShowListbarrier : function() {
			style.set("barriertab", "display", "block");

			dom.byId("barrierlink1").innerHTML = "Hide Barriers";
			domAttr.set("barrierlink1", "state", "maximized");
		},
		HideListbarrier : function() {

			style.set("barriertab", "display", "none");

			dom.byId("barrierlink1").innerHTML = "Show Barriers";
			domAttr.set("barrierlink1", "state", "minimized");

		},
		appendoptions : function() {
			var optionsshow = domAttr.get("optionsDiv", "state");

			if (optionsshow == "maximized") {

				this.HideListoptions();
			} else {

				this.ShowListoptions();
			}
		},
		ShowListoptions : function() {
			style.set("optionsDiv", "display", "block");

			dom.byId("optionlink").innerHTML = "Hide options";

			domAttr.set("optionsDiv", "state", "maximized");

			style.set("optionsDiv", "margin", "10px");
		},
		HideListoptions : function() {
			style.set("optionsDiv", "display", "none");

			dom.byId("optionlink").innerHTML = "Show options";

			domAttr.set("optionsDiv", "state", "minimized");
		},
		clearAll : function() {

			map.graphics.clear();
			routeGraphicLayer.clear();

			routes = [];
			stopList = [];

			document.getElementById('gradient-style1').innerHTML = "";
			routeParams.stops.features = [];

			routeParams.barriers.features = [];
			this.HideListPanel();

			dom.byId("firststopC").value = [];

			dom.byId("laststopC").value = [];

			dom.byId("stopC").value = [];

			dom.byId("DirectionsDiv").style.display = "none";

			dom.byId("routetext").innerHTML = "";
			dom.byId("routetextc").innerHTML = "";

			if (this.grid) {

				this.grid.refresh();

			}
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			document.getElementById("map_container").style.cursor = "auto";
		},
		addbrr : function() {

			document.getElementsByTagName("body")[0].style.cursor = "url('./img/Arrow.yellow2.cur'), auto";
			document.getElementById("map_container").style.cursor = "url('./img/Arrow.yellow2.cur'), auto";

			mapOnClick_addBarriers_connect = connect.connect(map, "onClick", this, "addBarrierclick");

		},
		addpolyline : function() {

			mapOnClick_addLine_connect = connect.connect(map, "onClick", this, "createToolbar");

		},
		createToolbar : function() {

			var polylineBarrierSymbol = new SimpleLineSymbol().setColor(new Color([255, 0, 0]));

			var toolbar = new Draw(map);

			//toolbar.activate(Draw.POINT);

			toolbar.activate(Draw.FREEHAND_POLYLINE);

			var drawEnd_connect = connect.connect(toolbar, "onDrawEnd", function(geometry) {

				routeParams.polylineBarriers.features.push(map.graphics.add(new Graphic(geometry, polylineBarrierSymbol)));

				toolbar.deactivate();

			});
		},
		getlatlong : function() {
			registry.byId("dialogColor").show();

		},
		getlocationchange : function() {

			if (this.latlongselectdms.checked) {

				dom.byId("tabledms").style.display = "block";
				dom.byId("tabledd").style.display = "none";

			} else {

				dom.byId("tabledms").style.display = "none";
				dom.byId("tabledd").style.display = "block";

			}
		},
		getlocationif : function() {
			registry.byId("dialogColor").hide();

			if (this.latlongselectdms.checked) {

				this.getlocationdms();

			} else if (this.latlongselectdd.checked) {

				this.getlocationdd();

			} else {

				alert("select the value first");

			}
		},
		getlocationdms : function() {

			var Latd = this.dtextlat.value;
			var Latm = this.mtextlat.value;
			var Lats = this.stextlat.value;

			var Longd = this.dtextlong.value;
			var Longm = this.mtextlong.value;
			var Longs = this.stextlong.value;

			var decimal1 = (Latm / 60) + Lats / (60 * 60);

			var answer1 = Latd + decimal1;

			var ddlatf = answer1 / 10;

			var decimal2 = (Longm / 60) + Longs / (60 * 60);

			var answer2 = Longd + decimal2;

			var ddlongf = answer2 / 10;

			var pt = new Point(ddlongf, ddlatf, new SpatialReference({
				wkid : 4326
			}));

			var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(new Color([255, 0, 0, 0.5]));

			var graphic = new Graphic(pt, sms);

			map.graphics.add(graphic);

			routeParams.barriers.features.push(graphic);

		},
		getlocationdd : function() {

			var Lat = this.latitudeText.value;

			var Long = this.longitudeText.value;

			var geolatlong = new Point(Long, Lat, new SpatialReference({
				wkid : 4326
			}));

			var latlongbarrier = new Graphic(geolatlong, new SimpleMarkerSymbol().setColor(new Color([255, 0, 0, 0.5])))

			map.graphics.add(latlongbarrier);

			routeParams.barriers.features.push(latlongbarrier);
		},

		addBarrierclick : function(evt) {
			var font = new Font("18px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
			var textSymbol = new TextSymbol(String(routeParams.barriers.features.length + 1), font, new Color("#FFFFFF"));
			textSymbol.yoffset = -5;
			var picturebarrierSymbol = new PictureMarkerSymbol('img/esriDMTStopDestination.png', 25, 25);
			var barriergraphic = map.graphics.add(new Graphic(evt.mapPoint, picturebarrierSymbol))
			routeParams.barriers.features.push(barriergraphic);

			map.graphics.add(new Graphic(evt.mapPoint, textSymbol));

			var radius = 10;

			var circle = new Circle({
				center : evt.mapPoint,

				radius : radius
			});

			var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.barriers.features);

			map.setExtent(myFeatureExtent.getExtent(), true);

			connect.disconnect(mapOnClick_addBarriers_connect);

		},
		selectSCODEC : function() {

			//showLoading();

			var stopB = dom.byId("laststopC").value;
			if (dom.byId("laststopC").value == dom.byId("firststopC").value) {
				alert("Origin and Destination can not be the same !!!choose another");
				dom.byId("laststopC").value = "";
			} else if (dom.byId("firststopC").value == "") {

				alert("choose Origin first");
				dom.byId("laststopC").value = "";

			} else {

				var BS = stopB;

				var queryBS = new Query();

				var queryTaskBS = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/network/cf_sa/MapServer/21");

				queryBS.returnGeometry = true;

				queryBS.outFields = ["*"];

				queryBS.where = "uniqueSCODE = '" + BS + "' ";

				queryBS.outSpatialReference = {
					"wkid" : 102100
				};
				queryTaskBS.execute(queryBS, lang.hitch(this, "selectscodel1"));

				queryTaskBS.execute(queryBS, function(zoom2) {

					array.forEach(zoom2.features, function(feature) {

						var features2 = feature;

						var geometry = features2.geometry;

						var toSymbol = new PictureMarkerSymbol('img/taglaststop.png', 45, 45);

						var graphic1 = new Graphic(geometry, toSymbol);

						var stopsL = routeParams.stops.features.length;

						if (stopsL >= 2) {

							map.graphics.add(graphic1);

							map.graphics.remove(routeParams.stops.features.splice(-1, 1,graphic1)[0]);
							graphic1.attributes = new Object();
							graphic1.attributes.Name = feature.attributes.LOCATION;

							var infoTemplateF = new InfoTemplate();
							infoTemplateF.setTitle("Location");
							infoTemplateF.setContent("<b> Location Name :" + feature.attributes.LOCATION + "<br/>" + "<b> District Name :" + feature.attributes.D_NAME + "<br/>" + "<b> Tehsil Name :" + feature.attributes.T_NAME + "<br/>");

							graphic1.setInfoTemplate(infoTemplateF);
							//hideLoading();

						} else {

							routeParams.stops.features.push(graphic1);
							map.graphics.add(graphic1);
							graphic1.attributes = new Object();
							graphic1.attributes.Name = feature.attributes.LOCATION;

							var infoTemplateF = new InfoTemplate();
							infoTemplateF.setTitle("Location");
							infoTemplateF.setContent("<b> Location Name :" + feature.attributes.LOCATION + "<br/>" + "<b> District Name :" + feature.attributes.D_NAME + "<br/>" + "<b> Tehsil Name :" + feature.attributes.T_NAME + "<br/>");

							graphic1.setInfoTemplate(infoTemplateF);
							//hideLoading();

						}

						var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.stops.features);

						map.setExtent(myFeatureExtent.getExtent(), true);

					});
				});
			}
		},
		selectSCODE : function() {

			var stopB = dom.byId("firststopC").value;

			var BS = stopB;

			var queryBS = new Query();

			var queryTaskBS = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/network/cf_sa/MapServer/21");

			queryBS.returnGeometry = true;

			queryBS.outFields = ["*"];

			queryBS.where = "uniqueSCODE  = '" + BS + "' ";

			queryBS.outSpatialReference = {
				"wkid" : 102100
			};

			queryTaskBS.execute(queryBS, lang.hitch(this, "selectscodel"));

			try {
				queryTaskBS.execute(queryBS, function(zoom2) {

					array.forEach(zoom2.features, function(feature) {

						var features2 = feature;

						var geometry = features2.geometry;

						var fromSymbol = new PictureMarkerSymbol('img/tagfirststop.png', 45, 45);

						var graphic1 = new Graphic(geometry, fromSymbol);

						var infoTemplateF = new InfoTemplate();

						infoTemplateF.setTitle("Location");
						infoTemplateF.setContent("<b> Location Name :" + feature.attributes.LOCATION + "<br/>" + "<b> District Name :" + feature.attributes.D_NAME + "<br/>" + "<b> Tehsil Name :" + feature.attributes.T_NAME + "<br/>");

						graphic1.setInfoTemplate(infoTemplateF);

						//hideLoading();

						graphic1.attributes = new Object();
						graphic1.attributes.Name = feature.attributes.LOCATION;

						map.graphics.add(graphic1);

						map.graphics.remove(routeParams.stops.features.splice(0, 1,graphic1)[0]);

						var radius = 10;

						var circle = new Circle({
							center : geometry,

							radius : radius
						});

						//map.setExtent(circle.getExtent(18).expand(2));

						var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.stops.features);

						map.setExtent(myFeatureExtent.getExtent(), true);

						//map.setExtent(circle.getExtent().expand(9));

					});
				})
			} catch(e) {

			}
		},
		selectSCODES : function() {

			if (dom.byId("laststopC").value == "" || (dom.byId("firststopC").value == "" )) {
				alert("choose origin and Destination first and add stops in between");
				dom.byId("stopC").value = "";

			} else {

				stopS = dom.byId("stopC").value;

				//showLoading();
				this.checkredundanancy();

			}
		},
		checkredundanancy : function() {

			if (stopS == dom.byId('firststopC').value || stopS == dom.byId('laststopC').value || this.isOptionAlreadyExist()) {
				alert("you have already chosen this location!!!choose another");
				dom.byId("stopC").value = "";
				//hideLoading();

			} else if (this.isdatabasseExist()) {

				alert("This location does not exists in database");
				dom.byId("stopC").value = "";
				//hideLoading();

			} else {
				stopList.push(stopS);
				for ( i = 0; i < stopList.length; i++) {

					newStops = " <table style='border-style:solid;'>  <tr style='height:10px'><td><img id='remrec' src ='img/gtk_close.png' style='height:15px;width:15px;cursor:pointer' onClick='removeRecord(" + i + ");' /></td><td class='tableclass'>" + stopList[i] + "</td>  <td><img  src='img/spherestop.png' onClick='glow(" + i + ");'  style='height:20px;width:20px;cursor:pointer'></img> </td>   </tr> </table>";

				}
				window.removeRecord = function(i) {

					//function removeRecord(i) {

					stopList.splice(i, 1);
					map.graphics.remove(routeParams.stops.features.splice(i+1, 1)[0]);

					newStops = "";
					for (var i = 0; i < stopList.length; i++) {
						newStops += " <table style='border-style:solid;'>  <tr style='height:10px'><td><img id='remrec' src ='img/gtk_close.png' style='height:15px;width:15px;cursor:pointer' onClick='removeRecord(" + i + ");' /></td><td class='tableclass'>" + stopList[i] + "</td>  <td><img id='black' src='img/spherestop.png' onClick='glow(" + i + ");'  style='height:20px;width:20px;cursor:pointer'></img> </td>   </tr> </table>";

					};
					document.getElementById('gradient-style1').innerHTML = newStops;
				}

				window.glow = function(i) {

					//function glow(i) {

					var queryBS = new Query();

					var queryTaskBS = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/network/cf_sa/MapServer/21");

					queryBS.returnGeometry = true;

					queryBS.outFields = ["*"];

					queryBS.where = "uniqueSCODE = '" + stopList[i] + "' ";

					queryBS.outSpatialReference = {
						"wkid" : 102100
					};

					queryTaskBS.execute(queryBS, function(zoom2) {

						array.forEach(zoom2.features, function(feature) {

							var features2 = feature;

							var geometry = features2.geometry;

							var graphic1 = new Graphic(geometry);

							var radius = 10;

							var circle = new Circle({
								center : geometry,

								radius : radius
							});

							//map.setExtent(circle.getExtent(18).expand(2));
							animateGraphic(graphic1);

						});
					});

				}
				function animateGraphic(graphic1) {

					var f = 0;
					intrvlId = setInterval(function() {
						if (f == 0) {
							selectionSymbolR.setSize("24");

							f = 1;
						} else if (f == 1) {
							selectionSymbolR.setSize("26");
							f = 2;
						} else if (f == 2) {
							selectionSymbolR.setSize("28");
							f = 3;
						} else if (f == 3) {
							selectionSymbolR.setSize("20");
							f = 4;
						} else if (f == 4) {
							selectionSymbolR.setSize("0");
							// f=0;
						}
						graphic1.setSymbol(selectionSymbolR);
						map.graphics.add(graphic1);
					}, 200);
				}


				dom.byId('gradient-style1').innerHTML += newStops;

				var BS = stopS;

				var queryBS = new Query();

				var queryTaskBS = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/network/cf_sa/MapServer/21");

				queryBS.returnGeometry = true;

				queryBS.outFields = ["*"];

				queryBS.where = "uniqueSCODE = '" + BS + "' ";

				queryBS.outSpatialReference = {
					"wkid" : 102100
				};

				queryTaskBS.execute(queryBS, function(zoom2) {

					array.forEach(zoom2.features, function(feature) {

						var font = new Font("18px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);

						var textSym = new TextSymbol(String(routeParams.stops.features.length - 1), font, new Color("#CCFB5D"));

						textSym.yoffset = -5;

						var features2 = feature;

						var geometry = features2.geometry;

						var toSymbol = new PictureMarkerSymbol('img/spherestop.png', 25, 25);

						var graphic1 = new Graphic(geometry, toSymbol);
						graphic1.attributes = new Object();
						graphic1.attributes.Name = feature.attributes.LOCATION;

						map.graphics.add(graphic1);

						map.graphics.add(new Graphic(geometry, textSym));
						var infoTemplateF = new InfoTemplate();
						infoTemplateF.setTitle("Location");
						infoTemplateF.setContent("<b> Location Name :" + feature.attributes.LOCATION + "<br/>" + "<b> District Name :" + feature.attributes.D_NAME + "<br/>" + "<b> Tehsil Name :" + feature.attributes.T_NAME + "<br/>");

						graphic1.setInfoTemplate(infoTemplateF);

						routeParams.stops.features.splice(-1, 0, graphic1);

						//hideLoading();

						var radius = 10;

						var circle = new Circle({
							center : geometry,

							radius : radius
						});
						//map.setExtent(circle.getExtent(18).expand(2));

						var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.stops.features);

						//alert(myFeatureExtent);

						map.setExtent(myFeatureExtent.getExtent(), true);

					});
				});

			}
		},
		isdatabasseExist : function(value) {
			var exists = true;

			for (var x = 0; x < newlist.length; x++) {

				if (newlist[x] == dom.byId("stopC").value) {

					exists = false;
					break;
				}
			}

			return exists;

		},
		isOptionAlreadyExist : function(value) {
			var exists = false;

			for (var x = 0; x < stopList.length; x++) {

				if (stopList[x] == stopS) {

					exists = true;
					break;
				}
			}

			return exists;
		},
		genroute : function() {
			this.loadmrsac();
			if (this.agri.value !== false) {

				this.genrouteDistance();

			} else if (this.agri1.value !== false) {

				this.genrouteTime();

			}
		},
		genrouteDistance : function() {

			if (this.FNationalHighway.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.value == false && this.BestSeq.value == false) {

				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.value == false && this.BestSeq.value == false) {

				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FNationalHighway.checked && this.Return.checked && this.BestSeq.value == false) {

				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FNationalHighway.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FNationalHighway.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Length";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else {
				routeParams.impedanceAttribute = "Length";
				routeTask.solve(routeParams);

			}
			this.unloadmrsac();
		},
		genrouteTime : function() {
			if (this.FNationalHighway.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.value == false && this.BestSeq.value == false) {

				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.value == false && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FNationalHighway.checked && this.Return.checked && this.BestSeq.value == false) {

				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.checked && this.BestSeq.value == false) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = false;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FNationalHighway.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.value == false && this.BestSeq.checked) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FNationalHighway.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferNationalHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FStateHighway.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferStateHighways"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FDistrictroad.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferDistrictRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.FVillageroad.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = ["PreferVillageRoads"];

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else if (this.All.checked && this.Return.checked && this.BestSeq.checked) {
				routeParams.restrictionAttributes = false;

				routeParams.findBestSequence = true;
				routeParams.impedanceAttribute = "Minutes";
				this.Return2Begining();
				routeTask.solve(routeParams);

			} else {
				routeParams.impedanceAttribute = "Minutes";
				routeTask.solve(routeParams);

			}
			this.unloadmrsac();
		},
		gendirections : function() {
			style.set("DirectionsDiv", "display", "block");
		},
		fullview : function() {

			map.setExtent(directions.extent, true);

		},
		addstp : function() {
			alert("inn")

			map.graphics.clear();
			routeGraphicLayer.clear();

			routes = [];
			routeParams.stops.features = [];

			routeParams.barriers.features = [];

			//this.removeEventHandlers();

			mapOnClick_addStops_connect = connect.connect(map, "onClick", this, "addStopclickstrt");

			document.getElementsByTagName("body")[0].style.cursor = "url('./img/Arrow.yellow1.cur'), auto";
			document.getElementById("map_container").style.cursor = "url('./img/Arrow.yellow1.cur'), auto";
		},
		removeEventHandlers : function() {

			//mapOnClick_addStops_connect.remove();
			//mapOnClick_addBarriers_connect.remove();
			//mapOnClick_addStops_connect_btw.remove();

			connect.disconnect(mapOnClick_addStops_connect);

			connect.disconnect(mapOnClick_addBarriers_connect);
			connect.disconnect(mapOnClick_addStops_connect_btw);

		},
		removecursorstyle : function() {
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			document.getElementById("map_container").style.cursor = "auto";
		},

		addStopclickstrt : function(evt) {
			alert(evt)
			console.log(evt)
			alert(routeParams.stops.features.length)

			var font = new Font("18px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);

			var textSym = new TextSymbol(String(routeParams.stops.features.length + 1), font, new Color("#CCFB5D"));

			textSym.yoffset = -5;

			var pictureStopSymbol = new PictureMarkerSymbol('./img/esriDMTStopOrigin.png', 25, 25);

			var stopgraphic = map.graphics.add(new Graphic(evt.mapPoint, pictureStopSymbol));

			routeParams.stops.features.push(stopgraphic);

			map.graphics.add(new Graphic(evt.mapPoint, textSym));

			var radius = 10;

			var circle = new Circle({
				center : evt.mapPoint,

				radius : radius
			});

			var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.stops.features);

			//mapOnClick_addStops_connect_btw = connect.connect(map, "onClick", this, "activatestops");

		},

		activatestops : function(evt) {
			mapOnClick_addStops_connect_end = connect.connect(map, "onDblClick", this, "stopsfinish");

			var font = new Font("18px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);

			var textSym = new TextSymbol(String(routeParams.stops.features.length + 1), font, new Color("#CCFB5D"));

			textSym.yoffset = -5;

			var pictureStopSymbol = new PictureMarkerSymbol('./img/esriDMTStop.png', 25, 25);
			var stopgraphic = map.graphics.add(new Graphic(evt.mapPoint, pictureStopSymbol));
			routeParams.stops.features.push(stopgraphic);

			map.graphics.add(new Graphic(evt.mapPoint, textSym));
			//mapOnClick_addStops_connect_end = dojo.connect(map, "onDblClick", stopsfinish);

			var radius = 10;

			var circle = new esri.geometry.Circle({
				center : evt.mapPoint,

				radius : radius
			});

			var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.stops.features);

			map.setExtent(myFeatureExtent.getExtent(), true);
		},
		stopsfinish : function(evt) {
			this.removeEventHandlers();

			var font = new Font("18px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);

			var textSym = new TextSymbol(String(routeParams.stops.features.length + 1), font, new Color("#CCFB5D"));

			textSym.yoffset = -5;

			var pictureStopSymbol = new PictureMarkerSymbol('./img/esriDMTStopDestination.png', 25, 25);
			var stopgraphic = map.graphics.add(new Graphic(evt.mapPoint, pictureStopSymbol));
			routeParams.stops.features.push(stopgraphic);

			map.graphics.add(new Graphic(evt.mapPoint, textSym));

			var radius = 10;

			var circle = new Circle({
				center : evt.mapPoint,

				radius : radius
			});

			//map.setExtent(circle.getExtent(15), true);
			//map.setExtent(circle.getExtent(15).expand(9));

			var myFeatureExtent = graphicsUtils.graphicsExtent(routeParams.stops.features);

			map.setExtent(myFeatureExtent.getExtent(), true);
			removeEventHandlers();
			document.getElementsByTagName("body")[0].style.cursor = "url('../img/Arrow.yellow1.cur'), auto";
			document.getElementById("map_container").style.cursor = "url('./img/Arrow.yellow1.cur'), auto";

			mapOnClick_addStops_connect_end.remove();

		},
		selectscodel : function(results) {

			var zone;
			var zoneT;
			var zoneD;
			var values = [];
			var testVals = {};

			var features = results.features;

			array.forEach(features, function(feature) {

				zoneD = feature.attributes.D_NAME;
				zoneT = feature.attributes.T_NAME;
				zone = zoneD + " " + "/" + " " + zoneT;

				var r = "";

				dom.byId('routetext').innerHTML = zone;

			});
		},
		selectscodel1 : function(results) {
			var zone;
			var zoneT;
			var zoneD;
			var values = [];
			var testVals = {};

			var features = results.features;

			array.forEach(features, function(feature) {

				zoneD = feature.attributes.D_NAME;
				zoneT = feature.attributes.T_NAME;
				zone = zoneD + " " + "/" + " " + zoneT;

				dom.byId('routetextc').innerHTML = zone;

			});
		},
		showRoute : function(solveResult) {

			//esri.hide(loading1);

			routeGraphicLayer.clear();

			globalroutegraphic = routeGraphicLayer.add(solveResult.routeResults[0].route.setSymbol(routeSymbol));
			for (var i = 0; i < solveResult.routeResults[0].stops.length; i++) {

				//alert("length" + solveResult.routeResults[0].stops.length)

				//alert("Stop " + solveResult.routeResults[0].stops[i].attributes.Name + " visited " + solveResult.routeResults[0].stops[i].attributes.Sequence);
			}

			directions = solveResult.routeResults[0].directions;

			directionFeatures = directions.features;

			//var routeSymbol = new SimpleLineSymbol().setColor(new Color("#893BFF")).setWidth(4);

			var routeGraphic = new Graphic(directions.mergedGeometry, routeSymbolS);

			routeGraphicLayer.add(routeGraphic);

			routeGraphic.getDojoShape().moveToBack();
			map.setExtent(directions.extent, true);

			dom.byId("summary").innerHTML = "<table style='text-align:left;'><tr><td style='color:#660198;text-decoration:underline;'> " + directions.routeName + "</td></tr><tr><td >Total distance:  " + this.formatDistance(directions.totalLength, "Kms") + "</td></tr><tr><td >Total time:  " + this.formatTime(directions.totalTime);
			+"</td></tr></table>";

			directionsInfo = solveResult.routeResults[0].directions.features;
			var totalDistance = number.format(directions.totalLength);
			var totalLength = number.format(directions.totalTime);

			data = array.map(directionsInfo, lang.hitch(this, function(features, index, strings) {

				return {
					"maneuver" : this.getManeuverImage(features.attributes.maneuverType, index),

					"detail" : features.attributes.text,
					"distance" : number.format(features.attributes.length, {
						places : 2
					}),
					"time" : number.format(features.attributes.time, {
						places : 2
					}),

					"index1" : index,
					"index" : index + 1 + "."
				}
			}));

			this.grid = new dgrid.Grid({
				renderRow : renderList,
				showHeader : false
			}, "Rgrid");

			this.grid.renderArray(data);

			function renderList(obj, options) {
				template = "<table id='one-column-emphasis'><tr  onclick='zoomToSegment(${index1});'  ><td ><img id='maneuverimg' src=${maneuver}></img></td><td ><strong>${index}</strong> <strong>${detail}</strong> <strong>${string}</strong><div>${distance} km. &nbsp; ${time} minutes</div></td></tr></table>";

				return domConstruct.create("div", {
					innerHTML : esriLang.substitute(obj, template)
				});
			}


			window.zoomToSegment = function(index) {

				var segment = directionFeatures[index];
				var segmentSymbol = new SimpleLineSymbol().setColor(new Color("#00FF00")).setWidth(3.5);

				map.setExtent(segment.geometry.getExtent(15), true);
				if (!segmentGraphic) {
					segmentGraphic = routeGraphicLayer.add(new Graphic(segment.geometry, segmentSymbol));
				} else {
					segmentGraphic.setGeometry(segment.geometry);
				}
			}
		},

		errorHandler : function() {
			alert("An error occured\n" + err.message + "\n" + err.details.join("\n"));

			routeParams.stops.features.splice(0, 0, lastStop);
			map.graphics.remove(routeParams.stops.features.splice(1, 1)[0]);
		},
		getManeuverImage : function(maneuverType, index) {

			var bitmap;
			var L = directionsInfo.length;
			var G = index;

			for (var e = 0; e < L; e++) {

				if (maneuverType == "esriDMTUnknown") {

					bitmap = "img/esriDMTUnknown.png";

				} else if (maneuverType == "esriDMTDepart") {

					bitmap = "img/tagfirststop.png";

				} else if (maneuverType == "esriDMTStop" && index !== directionsInfo.length - 1) {
					bitmap = "img/spherestop.png";

				} else if (maneuverType == "esriDMTStop" && index == directionsInfo.length - 1) {
					bitmap = "img/taglaststop.png";

				} else if (maneuverType == "esriDMTStraight") {
					bitmap = "img/rdStraight.png";

				} else if (maneuverType == "esriDMTBearLeft") {
					bitmap = "img/rdBearLeft.png";

				} else if (maneuverType == "esriDMTBearRight") {
					bitmap = "img/rdBearRight.png";

				} else if (maneuverType == "esriDMTTurnLeft") {
					bitmap = "img/rdLeft.png";

				} else if (maneuverType == "esriDMTTurnRight") {
					bitmap = "img/rdRight.png";

				} else if (maneuverType == "esriDMTSharpLeft") {
					bitmap = "img/rdSharpLeft.png";

				} else if (maneuverType == "esriDMTSharpRight") {
					bitmap = "img/rdSharpRight.png";

				} else if (maneuverType == "esriDMTUTurn") {
					bitmap = "img/rdUturn.png";

				} else if (maneuverType == "esriDMTFerry") {
					bitmap = "img/rdFerry.png";

				} else if (maneuverType == "esriDMTRoundabout") {
					bitmap = "img/rdRoundAbout.png";

				} else if (maneuverType == "esriDMTHighwayMerge") {
					bitmap = "img/rdMergeHwy.png";

				} else if (maneuverType == "esriDMTHighwayExit") {
					bitmap = "img/rdExitHwy.png";

				} else if (maneuverType == "esriDMTForkCenter") {
					bitmap = "img/rdStayStraight.png";

				} else if (maneuverType == "esriDMTForkLeft") {
					bitmap = "img/rdForkKeepLeft.png";

				} else if (maneuverType == "esriDMTForkRight") {
					bitmap = "img/rdForkKeepRight.png";

				} else if (maneuverType == "esriDMTEndOfFerry") {
					bitmap = "img/rdFerryEnd.png";

				} else if (maneuverType == "esriDMTTurnLeftRight") {
					bitmap = "img/esriDMTTurnLeftRight.png";

				} else if (maneuverType == "esriDMTTurnRightLeft") {
					bitmap = "img/esriDMTTurnRightLeft.png";

				} else if (maneuverType == "esriDMTTurnLeftLeft") {
					bitmap = "img/esriDMTTurnLeftLeft.png";

				} else if (maneuverType == "esriDMTTurnRightRight") {
					bitmap = "img/esriDMTTurnRightRight.png";

				} else {
					bitmap = "img/esriDMTUnknown.png";

				}
				return bitmap;
			}

		},
		Return2Begining : function() {
			if (routeParams.stops.features.length > 1) {
				if (this.Return.checked && this.BestSeq.checked) {
					routeParams.findBestSequence = true;

					if (routeParams.stops.features[routeParams.stops.features.length - 1] !== routeParams.stops.features[0]) {

						routeParams.stops.features.push(routeParams.stops.features[0]);

					}
				} else if (this.Return.checked && this.BestSeq.value == false) {
					routeParams.findBestSequence = false;

					if (routeParams.stops.features[routeParams.stops.features.length - 1] !== routeParams.stops.features[0]) {

						routeParams.stops.features.push(routeParams.stops.features[0]);

					}

				} else {

					if (routeParams.stops.features[routeParams.stops.features.length - 1] === routeParams.stops.features[0]) {

						routeParams.stops.features.splice(routeParams.stops.features.length - 1, 1);

					}
				}

				routeTask.solve(routeParams);
			}
		},

		formatTime : function(time) {
			var hr = Math.floor(time / 60), //Important to use math.floor with hours
			min = Math.round(time % 60);

			if (hr < 1 && min < 1) {
				return "";
			} else if (hr < 1) {
				return min + " minute(s)";
			}

			return hr + " hour(s) " + min + " minute(s)";
		},
		formatDistance : function(dist, units) {
			var d = Math.round(dist * 100) / 100;
			if (d === 0) {
				return ""
			}

			return d + " " + units;
		},
		printDirections : function() {
			this.loadmrsac();
			var a = screen.width / 2, b = screen.height / 1.5, a = "toolbar\x3dno, location\x3dno, directories\x3dno, status\x3dyes, menubar\x3dno, scrollbars\x3dyes, resizable\x3dyes, width\x3d" + a + ", height\x3d" + b + ", top\x3d" + (screen.height / 2 - b / 2) + ", left\x3d" + (screen.width / 2 - a / 2);
			this.printPage ? (window.directions = this.directions, window.open(this.printPage, "directions_widget_print", a, !0)) : (this._printWindow = window.open("", "directions_widget_print", a, !0), lang.hitch(this, this._loadPrintDirections()));
		},
		_loadPrintDirections : function() {

			var b = "<div style='width: 100%;position: fixed;left: 0;top: 0;z-index: 6;height: 50px;background: #fafafa;border-bottom: 1px solid #000;'><div style='color: #444;font-family: Verdana, Helvetica, sans-serif;-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid #8b8b8b;background: #F2F2F2;width:50px;cursor:pointer;float:right' title='Close' onclick='window.close();'>Close</div><div id='printButton' style='color: #444;	font-family: Verdana, Helvetica, sans-serif;-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid #8b8b8b;background: #F2F2F2;width:50px;cursor:pointer;float:right' title='Print' onclick='window.print();' >Print</div></div>";
			var c = "</br>" + "</br>" + "</br>" + "<img class='esriPrintLogo' src='img/mrsac.png'> " + "</br>" + " <strong> Maharashtra Road Network route </strong>" + "<br /> &nbsp; Total distance:  " + this.formatDistance(directions.totalLength, "Kms") + "<br /> &nbsp; Total time:  " + this.formatTime(directions.totalTime) + "<br />";

			c += "<textarea  onkeyup='document.getElementById('print_helper').innerHTML=this.value;' id='print_area' class='esriPrintNotes' placeholder='Enter notes here'></textarea>" + "</br>" + "</br>";

			data = array.map(directionsInfo, lang.hitch(this, function(features, index) {

				detaildir = features.attributes.text;

				maneuverdir = this.getManeuverImage(features.attributes.maneuverType, index);
				distancedir = number.format(features.attributes.length, {
					places : 2
				});
				timedir = number.format(features.attributes.time, {
					places : 2
				});
				indexdir = index + 1 + ".";

				c += "<table style='border: 1px solid grey;'><tr style='width:200%'><td ><img  src='" + maneuverdir + "'></img></td><td style='width:80%'> " + detaildir + " </td> <td style='width:10%'> " + distancedir + " kms</td><td style='width:40%'> " + timedir + " min</td></tr></table>";

			}));

			c += "<div><p>Directions are provided for planning purposes only and are subject to <a href='www.mrsac.gov.in'> MRSAC's</a> terms of use . Dynamic road conditions can exist that cause accuracy to differ from your directions and must be taken into account along with signs and legal restrictions. You assume all risk of use.</p></div></div>"

			this._printWindow.document.write(b);

			this._printWindow.document.write(c);
			this.unloadmrsac();
		},
		saveTextAsFile : function() {

			var textToWrite = "Total distance:" + this.formatDistance(directions.totalLength, "Kms") + "\r\n" + "Total time:" + this.formatTime(directions.totalTime) + "\r\n" + "\r\n";

			var c;

			data = array.map(directionsInfo, lang.hitch(this, function(features, index) {

				detaildir = features.attributes.text;

				maneuverdir = this.getManeuverImage(features.attributes.maneuverType);
				distancedir = number.format(features.attributes.length, {
					places : 2
				});
				timedir = number.format(features.attributes.time, {
					places : 2
				});
				indexdir = index + 1 + ".";

				c += indexdir + detaildir;

				//textToWrite += indexdir + detaildir + "\r\n" + timedir + "min" + distancedir + "kms" + "\r\n" + "\r\n";
				textToWrite += indexdir + detaildir + "\r\n" + "(" + timedir + "min" + distancedir + "kms" + ")" + "\r\n" + "\r\n";

			}));

			//alert("b");
			var textFileAsBlob = new Blob([textToWrite], {
				type : 'text/plain'
			});
			//var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
			var fileNameToSaveAs = "routeText";
			//alert("c");
			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			downloadLink.innerHTML = "Download File";
			if (window.webkitURL != null) {
				// Chrome allows the link to be clicked
				// without actually adding it to the DOM.
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
			} else {
				// Firefox requires the link to be added to the DOM
				// before it can be clicked.
				downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
				downloadLink.onclick = destroyClickedElement;
				downloadLink.style.display = "none";
				document.body.appendChild(downloadLink);
			}

			downloadLink.click();
		},
		shutdown : function() {

			map.graphics.clear();

			routes = [];
			stopList = [];

			routeParams.stops.features = [];

			routeParams.barriers.features = [];

			this.directionDiv.style.display = "none";

			this.themewidgets.firststopC.set({
				"value" : ""
			});
			this.themewidgets.stopC.set({
				"value" : ""
			});

			this.themewidgets.laststopC.set({
				"value" : ""
			});
			this.stoplistNode.innerHTML = "";
			this.routetext.innerHTML = "";
			this.routetextc.innerHTML = "";

			map.removeLayer(routeGraphicLayer);

			this.inherited(arguments);

		},
	});
});

