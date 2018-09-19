define(["viewer/_BaseWidget", "viewer/_MapGraphicsMaintainer", "dojo/_base/declare", "dojo/text!./templates/Generalsearch.html", "esri/dijit/BasemapGallery", "dijit/form/TextBox", "dojox/grid/DataGrid", "viewer/ResultList2", "dojo/data/ItemFileReadStore", "dojo/on", "esri/tasks/FindTask", "esri/tasks/FindParameters", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/PictureMarkerSymbol", "esri/Color", "esri/geometry/Polygon", "dojo/dom", "dojo/query", "dojo/_base/lang", "esri/tasks/QueryTask", "esri/tasks/query", "dojo/store/Memory", "dojo/_base/array", "esri/graphicsUtils", "dojo/_base/connect", "esri/graphic", "dojo/string", "dojo/topic", "dijit/form/FilteringSelect", "dijit/form/TextBox"], function(_BaseWidget, _MapGraphicsMaintainer, declare, template, BasemapGallery, TextBox, DataGrid, ResultList2, ItemFileReadStore, on, FindTask, FindParameters, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol, Color, Polygon, dom, query, lang, QueryTask, Query, Memory, array, graphicsUtils, connect, Graphic, string, topic, FilteringSelect) {

	return declare("mrsac.viewer.widgets.Generalsearch", [mrsac.viewer._BaseWidget, mrsac.viewer._MapGraphicsMaintainer], {
		constructor : function(/*Object*/params) {
			this.layers = [];
			newlist = [];
		},
		templateString : template,
		_initialized : false,
		findParams : null,
		findTask : null,
		smallIconUrl : "",
		content : "",
		closeUrl : "",

		postMixInProperties : function() {

			try {
				this.inherited(arguments);

				if (this.configData) {

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

				this.getAllNamedChildDijits();

				this.smallIconUrl = "js/mrsac/viewer/assets/images/small_icons/searchgeneral.png";
				this.messageNode = query(".resultsMsg1", this.domNode)[0];
				this.closeUrl = "js/mrsac/viewer/assets/images/small_icons/close.png";

				this.connects.push(connect.connect(this.widgets.results, "onResultClick", this, "onResultClick"));

				this.symbols = {
					point : new PictureMarkerSymbol(this.iconUrl, 40, 40),
					line : new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 3),
					polygon : new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2), new Color([0, 255, 255, 0.5]))
				};
				this.createsearch();
				queryTask2 = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/integrated_services/admin/MapServer/5");
				this.dropdown();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}
		},

		createsearch : function() {

			map = this.map;

			findTask = new FindTask("http://mrsac.maharashtra.gov.in/ArcGIS/rest/services/geoportal2013/admin/MapServer/");

			//Create the find parameters
			findParams = new FindParameters();
			findParams.returnGeometry = true;
			findParams.layerIds = [1, 2, 3, 4, 5];
			findParams.searchFields = ["D_NAME", "T_NAME", "NAME_E", "CEN_CD"];
			findParams.outSpatialReference = map.spatialReference;
			on(this.arviT, "keydown", lang.hitch(this, function(event) {
				if (event.keyCode == 13) {
					this.doFind()
				}
			}))
		},

		doFind : function() {

			this.messageNode.innerHTML = "";
			map.graphics.clear();
			this.widgets.results.clear();
			this.onShowPanel(1);

			this.setStyle("progress", "progress visible");
			//this.loadmrsac();
			//Set the search text to the value in the box

			var v = this.widgets.searchText.value;

			findParams.searchText = v;

			try {

				findTask.execute(findParams, lang.hitch(this, "showSearchResults", "Division"));

			} catch(e) {
				alert("e" + e)
			}

		},
		showSearchResults : function(layerId, featureSet) {

			var abc = [];
			try {
				var resultCountBeforeAddingThese = this.widgets.results.count;

				var link = null;

				array.forEach(featureSet, lang.hitch(this, function(f) {

					district = f.feature;
					abc.push(district);
					abc.sort(function(objA, objB) {
						if (objA.attributes.D_NAME === objB.attributes.D_NAME) {
							return 0;
						}
						if (objA.attributes.D_NAME < objB.attributes.D_NAME) {
							return -1
						}
						return 1;
					});

				}));

				array.forEach(abc, lang.hitch(this, function(f) {

					var D = f.attributes.D_NAME;
					var T = f.attributes.T_NAME;
					var E = f.attributes.NAME_E;

					this.content = "<table><tr><td>" + T + ":</td><td>" + E + "</td></tr></table>";

					var attrs = {
						"title" : f.attributes.D_NAME,
						"content" : this.content,
						"link" : link
					};

					var sym = null;
					var loc = null;

					switch (f.geometry.type) {
						case "point":
							sym = this.symbols.point;
							loc = f.geometry;
							break;
						case "multipoint":
							sym = this.symbols.point;
							loc = f.geometry.getExtent().getCenter();
							break;
						case "polyline":
							sym = this.symbols.line;
							var nPts = f.geometry.paths[0].length;
							var idx = Math.round(nPts / 2);
							loc = f.geometry.getPoint(0, idx);
							break;
						default:
							sym = this.symbols.polygon;

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

					var g = new Graphic(f.geometry, sym, attrs);

					this.widgets.results.add({
						title : attrs.title,
						content : attrs.content,
						iconUrl : this.smallIconUrl,
						graphic : g,
						location : loc,
						closeU : this.closeUrl,
						link : attrs.link,
						map : this.map,
						count : this.widgets.results.count
					});

					this.addGraphic(g);

				}));

				var msg = "Total features found : " + this.widgets.results.count;

				this.setMessage(msg);
				this.setStyle("progress", "progress hidden");

				if (resultCountBeforeAddingThese === 0) {
					this.widgets.results.selectFirstItem();
				}

				this.unloadmrsac();
			} catch(err) {
				console.error("SearchWidget::searchCallback", err);
			}

		},
		dropdown : function() {

			this.map.graphics.clear();
			var queryTask = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/integrated_services/admin/MapServer/3");

			var query = new Query();
			query.outFields = ["*"];
			query.returnGeometry = true;
			query.outSpatialReference = {
				"wkid" : 102100
			};

			query.where = "1=1";

			queryTask.execute(query, lang.hitch(this, function(results2) {

				var values = [];
				var testVals = {};

				var features = results2.features;

				array.forEach(features, lang.hitch(this, function(feature2) {

					zone = feature2.attributes.D_NAME;
					newlist.push(zone);
					if (zone) {
						if (!testVals[zone]) {
							testVals[zone] = true;
							values.push({
								name : zone
							});
						}
					}

				}));

				var dataItems = {
					identifier : 'name',
					label : 'name',
					items : values
				};
				var store = new Memory({
					data : dataItems
				});

				this.agri.set('store', store);

			}));

		},
		getTaluka : function() {
			this.loadmrsac();
			this.map.graphics.clear();
			this.agri1.value = "";
			this.agri2.value = "";

			var talE = [];

			var val = this.agri.value;
			var queryTask1 = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/integrated_services/admin/MapServer/4");

			var query1 = new Query();
			query1.outFields = ["*"];
			query1.returnGeometry = true;
			query1.outSpatialReference = {
				"wkid" : 102100
			};

			query1.where = "D_NAME   = '" + val + "'";

			queryTask1.execute(query1, lang.hitch(this, function(results2) {

				var values = [];
				var testVals = {};

				var features = results2.features;

				array.forEach(features, lang.hitch(this, function(feature2) {
					var stroke = "red"
					var fill = {
						"a" : 0.6,
						"b" : 210,
						"g" : 205,
						"r" : 255
					}

					var finalGraph = this.finalGraphic(feature2, stroke, fill);

					feature2.setSymbol(finalGraph);
					this.map.graphics.add(feature2);

					talE.push(feature2);

					zone = feature2.attributes.T_NAME;
					newlist.push(zone);
					if (zone) {
						if (!testVals[zone]) {
							testVals[zone] = true;
							values.push({
								name : zone
							});
						}
					}

				}));

				var myFeatureExtent = graphicsUtils.graphicsExtent(talE);
				this.map.setExtent(myFeatureExtent, true);

				var dataItems = {
					identifier : 'name',
					label : 'name',
					items : values
				};
				var store = new Memory({
					data : dataItems
				});

				this.agri1.set('store', store);
				this.unloadmrsac();

			}));

		},
		getVillage : function() {

			this.loadmrsac();
			this.map.graphics.clear();

			this.agri2.value = "";

			var vilE = [];

			var val = this.agri1.value;
			var query2 = new Query();
			query2.outFields = ["*"];
			query2.returnGeometry = true;
			query2.outSpatialReference = {
				"wkid" : 102100
			};

			query2.where = "T_NAME   = '" + val + "'";

			queryTask2.execute(query2, lang.hitch(this, function(results2) {

				var values = [];
				var testVals = {};

				var features = results2.features;

				array.forEach(features, lang.hitch(this, function(feature2) {
					var stroke = "red"
					var fill = {
						"a" : 0.6,
						"b" : 210,
						"g" : 205,
						"r" : 255
					}

					var finalGraph = this.finalGraphic(feature2, stroke, fill);

					feature2.setSymbol(finalGraph);
					this.map.graphics.add(feature2);

					vilE.push(feature2);

					zone = feature2.attributes.NAME;
					newlist.push(zone);
					if (zone) {
						if (!testVals[zone]) {
							testVals[zone] = true;
							values.push({
								name : zone
							});
						}
					}

				}));

				var myFeatureExtent = graphicsUtils.graphicsExtent(vilE);
				this.map.setExtent(myFeatureExtent, true);

				var dataItems = {
					identifier : 'name',
					label : 'name',
					items : values
				};
				var store = new Memory({
					data : dataItems
				});

				this.agri2.set('store', store);
				this.unloadmrsac();

			}));

		},

		getCode : function() {
			this.loadmrsac();
			this.map.graphics.clear();
			var codeE = [];
			var val = this.agri1.value;
			var val2 = this.agri2.value;
			var query3 = new Query();
			query3.outFields = ["*"];
			query3.returnGeometry = true;
			query3.outSpatialReference = {
				"wkid" : 102100
			};
			query3.where = "T_NAME = '" + val + "' AND NAME = '" + val2 + "'";

			queryTask2.execute(query3, lang.hitch(this, function(results3) {

				var features = results3.features;

				array.forEach(features, lang.hitch(this, function(feature3) {
					var stroke = "red"
					var fill = {
						"a" : 0.6,
						"b" : 210,
						"g" : 205,
						"r" : 255
					}
					var finalGraph = this.finalGraphic(feature3, stroke, fill);

					feature3.setSymbol(finalGraph);
					this.map.graphics.add(feature3);
					codeE.push(feature3);

				}));
				var myFeatureExtent = graphicsUtils.graphicsExtent(codeE);
				this.map.setExtent(myFeatureExtent.getExtent().expand(1), true);

			}));
			this.unloadmrsac();
		},

		shutdown : function() {
			this.clearGraphics();
			this.onShowPanel(0);

			this.messageNode.innerHTML = "";

			this.widgets.results.clear();

			this.inherited(arguments);
			this.map.graphics.clear();

			this.agri.value = "";
			this.agri1.value = "";
			this.agri2.value = "";

		},

		setMessage : function(/*String*/message) {

			this.messageNode.innerHTML = message;

		},

		clearResults : function() {
			this.messageNode.innerHTML = "";
			map.graphics.clear();
			this.widgets.results.clear();

			this.agri.value = "";
			this.agri1.value = "";
			this.agri2.value = "";

			this.clearGraphics();

		},
		setStyle : function(elementName, className) {
			var element = document.getElementById(elementName);
			if (element)
				element.className = className;
		},
		onResultClick : function(evt) {

			var selectedvillagesymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([214, 61, 97]), 2), new Color([199, 54, 100, 0.65]));

			var zoomToExt = map.extent;
			evt.resultItem.graphic.setSymbol(selectedvillagesymbol);

			var taxLotExtent = evt.resultItem.graphic.geometry.getExtent();
			map.setExtent(taxLotExtent);

		},
	});
});

