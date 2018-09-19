define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/builder.html", "dojo/_base/lang", "dojo/_base/array", "dojo/query", "dojo/dom-style", "dojo/store/Memory", "dojo/on", "dijit/registry", "dojo/dom", "esri/request", "dijit/Menu", "dijit/MenuItem", "esri/tasks/QueryTask", "esri/tasks/query", "esri/tasks/FindTask", "esri/tasks/FindParameters", "esri/geometry/Extent", "esri/geometry/Point", "esri/geometry/Circle", "esri/geometry/webMercatorUtils", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/layers/GraphicsLayer", "esri/InfoTemplate", "dojo/_base/Color", "esri/graphicsUtils", "esri/graphic", "dojo/dom-construct", "esri/toolbars/navigation", "dijit/form/Form", "dijit/form/FilteringSelect", "dijit/form/Textarea"], function(_BaseWidget, declare, template, lang, array, query, domStyle, Memory, on, registry, dom, esriRequest, Menu, MenuItem, QueryTask, Query, FindTask, FindParameters, Extent, Point, Circle, webMercatorUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, GraphicsLayer, InfoTemplate, Color, graphicsUtils, Graphic, domConstruct, Navigation) {
	return declare("mrsac.viewer.widgets.builder", [mrsac.viewer._BaseWidget], {

		constructor : function() {

		},

		templateString : template,
		layerInfos : null,

		postMixInProperties : function() {

			try {

				this.inherited(arguments);

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
			var element = query(".dijitReset.dijitInline.dijitButtonNode");
			for ( i = 0; i <= 12; i++) {
				domStyle.set(element[i], "width", "25px");

			}

			this.inherited(arguments);

			if (this._initialized) {
				return;
			}

			try {

				this.getAllNamedChildDijits();

				layerInfos = [];

				array.forEach(this.map.graphicsLayerIds, lang.hitch(this, function(id) {

					var layer = this.map.getLayer(id);

					var e_info = {
						layer : layer,
						title : layer.id
					};

					layerInfos.push(e_info);

				}));

				array.forEach(this.map.layerIds, lang.hitch(this, function(id) {

					var layer = this.map.getLayer(id);

					var e_info = {
						layer : layer,
						title : layer.id
					};

					layerInfos.push(e_info);

				}));

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}

			this.inherited(arguments), this.layers = [], array.forEach(layerInfos, lang.hitch(this, function(a) {
				var b = a.layer.id;
				var c = this.map.getLayer(b);

				if (c) {
					var d = c.url;

					if ("esri.layers.FeatureLayer" === c.declaredClass) {

						var g = d.lastIndexOf("/" + c.layerId);

						g > 0 && ( d = d.substring(0, g));
					}

					this.layers.push({
						ref : c,
						layerInfo : a,
					}), this && c.on("visibility-change", lang.hitch(this, function(a) {
						a.visible === !1 && this.createIdentifyLayerList();
					}));
				}
			})), this && (this.createIdentifyLayerList(), this.map.on("update-end", lang.hitch(this, function() {
				this.createIdentifyLayerList();
			})));
			pointL = new GraphicsLayer({
				className : "geomG"

			});

			this.map.addLayer(pointL);
		},

		createIdentifyLayerList : function() {

			var a = null,
			    b = [],
			    c = this.registry.get("value"),
			    d = "/";

			array.forEach(this.layers, lang.hitch(this, function(e) {

				var h = e.ref,
				    i = e.layerInfo.layerIds;

				if (h.visible) {

					var j = this.getLayerName(e);

					"esri.layers.FeatureLayer" !== h.declaredClass || isNaN(h.layerId) ? array.forEach(h.layerInfos, lang.hitch(this, function(e) {

						this.includeSubLayer(e, h, i) && (b.push({
							name : e.name,

							id : h.url + d + e.id

						}), h.url + d + e.id === c && ( a = c));
					})) : (b.push({
						name : j,
						id : h.url
					}), h.url === c && ( a = c));
				}

			})), b.sort(function(a, b) {
				return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
			}), this.registry.set("disabled", b.length < 1), a || ( a = b[0].id);
			var e = new Memory({
				data : b
			});

			this.registry.set("store", e), this.registry.set("value", a);

		},

		getLayerName : function(a) {

			var b = null;

			return a.layerInfo && ( b = a.layerInfo.title), b || array.forEach(this.layers, function(c) {

				return c.ref.id === a.id ?
				void ( b = c.layerInfo.title) :
				void 0;
			}), b || ( b = a.name, !b && a.ref && ( b = a.ref)), b;
		},
		includeSubLayer : function(a, b, c) {

			if (null !== a.subLayerIds)
				return !1;

			if (array.indexOf(b.visibleLayers, a.id) < 0)
				return !1;
			if (!this.layerVisibleAtCurrentScale(a))
				return !1;
			if (c && array.indexOf(c, a.id) < 0)
				return !1;

			return !0;
		},
		layerVisibleAtCurrentScale : function(a) {

			var b = this.map.getScale();
			return !(0 !== a.maxScale && b < a.maxScale || 0 !== a.minScale && b > a.minScale);
		},

		execute : function(a) {
			layerL = a;

			var selectL = dom.byId("test4");
			domConstruct.empty(selectL);

			queryTask = new QueryTask(a);

			var requestHandle = esriRequest({

				"url" : a,
				"content" : {
					"f" : "json"
				},
				"callbackParamName" : "callback"
			});

			requestHandle.then(lang.hitch(this, this.requestSucceeded));

			array.forEach(this.content.getChildren(), lang.hitch(this, function(child) {

				this.content.removeChild(child);

			}));

		},
		splitValue : function(value, index) {

			return value.substring(0, index);
		},
		requestSucceeded : function(response, io) {

			valueL = response.name;
			var selectL = dom.byId("test4");

			var row1 = domConstruct.toDom("<tr><td>SELECT * FROM " + valueL + " WHERE</td></tr>");
			domConstruct.place(row1, selectL);

			var fieldInfo = array.map(response.fields, lang.hitch(this, function(f) {

				this.content.addChild(new MenuItem({
					start : f.name,
					label : f.alias,
					onClick : lang.hitch(this, this.onItemSelect)
				}));

			}));

		},
		onItemSelect : function(evt) {

			var item = registry.getEnclosingWidget(evt.target);

			showLabel = item.get("start");

			dom.byId("content1").value += showLabel;

		},

		executeQuery : function() {
			this.loadmrsac();
			var query = new Query();
			query.outFields = ["*"];

			query.where = "1=1";

			query.outSpatialReference = {
				"wkid" : 102100
			};
			queryTask.execute(query, lang.hitch(this, this.populateList));

		},
		populateList : function(results) {

			var features = results.features;

			len = features.length;

			newList = [];
			var zonen;

			array.forEach(this.display.getChildren(), lang.hitch(this, function(child) {

				this.display.removeChild(child);

			}));
			newarr = [];
			var unique = {};

			array.forEach(features, function(item) {
				if (!unique[item.attributes[showLabel]]) {
					newarr.push(item.attributes[showLabel]);
					unique[item.attributes[showLabel]] = item.attributes[showLabel];
				}
			});

			array.forEach(newarr, lang.hitch(this, function(zoneVal) {

				switch (typeof(zoneVal)) {

				case "number":
					newList.push(zoneVal);
					newList.sort(function(a, b) {
						return a - b;
					});
					break;

				case "string":
					newList.push(zoneVal);
					newList.sort();
					break;
				}

			}));

			array.forEach(newList, lang.hitch(this, function(a) {

				switch (typeof(a)) {

				case "number":
					zonen = a.toString();
					break;

				case "string":
					zonen = "'" + a + "'";
					break;
				}

				var menuItem1 = new MenuItem({
					start1 : zonen,
					label : zonen,
					onClick : lang.hitch(this, this.displayItem)
				});

				this.display.addChild(menuItem1);

			}));
			this.unloadmrsac();
		},
		displayItem : function(evt) {

			var item1 = registry.getEnclosingWidget(evt.target);

			showLabel1 = item1.get("label");

			dom.byId("content1").value += showLabel1;
		},

		itemselect2 : function(evt) {
			var item4 = registry.getEnclosingWidget(evt.target);

			showLabel4 = item4.get("label");
			dom.byId("content1").value += showLabel4;

		},
		executeQuery1 : function() {
			this.loadmrsac();
			pointL.clear();
			this.map.graphics.clear();
			queryU = new Query();
			queryU.returnGeometry = true;

			queryU.outFields = ["*"];
			queryU.outSpatialReference = {
				"wkid" : 102100
			};

			k = dom.byId("content1").value;

			queryU.where = k;

			queryTask.execute(queryU, lang.hitch(this, this.showResults), lang.hitch(this, this.error1));

		},
		verifyQuery : function() {

			queryV = new Query();

			queryV.outFields = ["*"];

			k = dom.byId("content1").value;

			queryV.where = k;

			queryTask.execute(queryV, lang.hitch(this, this.correct), lang.hitch(this, this.error));

		},
		functionType : function(evt) {
			alert("_______")
			console.log(evt)

		},

		correct : function(b) {

			if (k == showLabel + showLabel4 + showLabel1 + showLabel1) {
				swal("There was an error in the expression." + '\n' + " An invalid SQL statement was used." + '\n' + "An invalid SQL statement was used. [SELECT " + showLabel + " from " + valueL + " where " + k + "]");

			} else if (b.features[0] == null) {

				swal("The expression was successfully verified but no records were returned");

			} else {

				swal("The expression was successfully verified");

			}

		},

		error : function(a) {

			if (a == "Error: Failed to execute query.") {
				swal("Enter correct input values");
			} else {
				swal("There was an error in the expression." + '\n' + " An invalid SQL statement was used." + '\n' + "An invalid SQL statement was used. [SELECT " + showLabel + " from " + valueL + " where " + k + "]");
			}
		},

		showResults : function(featureSet) {
			var refNodedirr = dom.byId("record");
			domConstruct.empty(refNodedirr);
			routegeometry = [];

			this.map.graphics.clear();

			var resultFeatures = featureSet.features;
			var refNodedirr = dom.byId("record");

			var roww = domConstruct.toDom("<tr><td>" + resultFeatures.length + " out of " + len + " selected</td></tr>");
			domConstruct.place(roww, refNodedirr);

			array.forEach(resultFeatures, lang.hitch(this, function(feature3) {

				stroke = "blue"
				fill = "green";

				var geom = feature3.geometry;

				if (geom.type == "point") {
					if (geom.x != "NaN" && (geom.y != "NaN")) {
						var blinkGraph = this.finalGraphic(feature3, stroke, fill);
						routegeometry.push(feature3);

					}
				} else {
					var blinkGraph = this.finalGraphic(feature3, stroke, fill);
					routegeometry.push(feature3);
				}

				var GrphcNA = new Graphic(geom, blinkGraph);

				pointL.add(GrphcNA);

			}));
			var myFeatureExtent = graphicsUtils.graphicsExtent(routegeometry);
			this.extentVal = myFeatureExtent.getExtent()
			this.map.setExtent(myFeatureExtent.getExtent().expand(1), true);
			this.unloadmrsac();

		},

		error1 : function(a) {

			pointL.clear();
			if (a == "Error: Failed to execute query.") {
				swal("Enter correct input values");
			} else {
				swal("There was an error in the expression." + '\n' + " An invalid SQL statement was used." + '\n' + "An invalid SQL statement was used. [SELECT " + showLabel + " from " + valueL + " where " + k + "]");
			}
			this.unloadmrsac();
		},

		executeSearch : function() {

		},
		executeSearch1 : function() {

			this.loadmrsac();

			var num = typeof (newList[0]);
			var val = dom.byId("sr").value;

			queryU = new Query();
			queryU.returnGeometry = true;

			queryU.outFields = ["*"];
			queryU.outSpatialReference = {
				"wkid" : 102100
			};

			if (num == "number") {

				queryU.where = showLabel + " >= " + val;

			} else {
				queryU.where = showLabel + " LIKE " + "'" + val + "%'";
			}

			try {

				queryTask.execute(queryU, lang.hitch(this, this.highlight), lang.hitch(this, this.error2));

			} catch(e) {
				alert("errorrrrr" + e);
			}

		},
		error2 : function() {
			this.unloadmrsac();
		},
		highlight : function(a) {

			array.forEach(this.display.getChildren(), lang.hitch(this, function(child) {

				this.display.removeChild(child);

			}));
			var features = a.features;
			var newarr = [];
			var unique = {};

			array.forEach(features, function(item) {
				if (!unique[item.attributes[showLabel]]) {
					newarr.push(item.attributes[showLabel]);
					unique[item.attributes[showLabel]] = item.attributes[showLabel];
				}
			});

			array.forEach(newarr, lang.hitch(this, function(valueS) {

				var zonen;

				switch (typeof(valueS)) {

				case "number":
					zonen = valueS.toString();
					break;

				case "string":
					zonen = "'" + valueS + "'";
					break;
				}

				var menuItem1 = new MenuItem({
					start1 : zonen,
					label : zonen,
					onClick : lang.hitch(this, this.displayItem)
				});

				this.display.addChild(menuItem1);

			}));
			this.unloadmrsac();

		},
		zoomToQuery : function() {
			console.log(this.extentVal)
			this.map.setExtent(this.extentVal.expand(1), true);
			//navToolbar = new Navigation(this.map);
			//navToolbar.activate(Navigation.ZOOM_IN, "ZOOM_IN");
		},

		clear : function() {
			dom.byId("content1").value = "";
			dom.byId("sr").value = "";
			this.map.graphics.clear();
			pointL.clear();

			array.forEach(this.display.getChildren(), lang.hitch(this, function(child) {

				this.display.removeChild(child);

			}));
			var refNodedirr = dom.byId("record");
			domConstruct.empty(refNodedirr);
			//navToolbar.deactivate();

		},
		shutdown : function() {
			this.map.graphics.clear();
			pointL.clear();
		}
	});
});
