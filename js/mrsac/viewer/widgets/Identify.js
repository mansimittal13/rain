define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/_base/connect", "viewer/ResultList1", "dojo/text!./templates/Identify.html", "dojo/_base/lang", "dojo/_base/array", "dojo/promise/all", "dojo/store/Memory", "dijit/tree/ObjectStoreModel", "dijit/Tree", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/dijit/PopupTemplate", "dojo/query", "esri/graphic", "esri/toolbars/draw", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/symbols/Font", "esri/Color", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/layers/GraphicsLayer", "esri/graphicsUtils", "dojo/on", "dojo/dom", "dojo/dom-attr", "dojo/dom-style", "dijit/form/Form", "dijit/form/FilteringSelect"], function(_BaseWidget, declare, connect, ResultList1, template, lang, array, all, Memory, ObjectStoreModel, Tree, IdentifyTask, IdentifyParameters, PopupTemplate, query, Graphic, Draw, SimpleMarkerSymbol, PictureMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, Font, Color, Point, Polyline, Polygon, GraphicsLayer, graphicsUtils, on, dom, domAttr, domStyle) {

	return declare("mrsac.viewer.widgets.Identify", [mrsac.viewer._BaseWidget], {

		constructor : function() {

		},
		templateString : template,
		tb : null,
		mapClickMode : null,
		identifies : {
		},
		layerSeparator : "||",
		allLayersId : "***",
		identifyTolerance : 15,
		layerInfos : null,
		closeUrl : "",

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

			this.inherited(arguments);

			if (this._initialized) {
				return;
			}

			try {
          
				this.getAllNamedChildDijits();

				this.messageNode = query(".resultsMsgI", this.domNode)[0];
				//this.connects.push(connect.connect(this.widgets.results1, "onResultClick", this, "onResultClick"));
           
				layerInfos = [];

				this.tb = new Draw(this.map);
                 
				this.tb.on("draw-end", lang.hitch(this, "doBuffer"));
				this.closeUrl = "js/mrsac/viewer/assets/images/small_icons/close.png";

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

			this.inherited(arguments), this.identifies || (this.identifies = {}), this.layers = [], array.forEach(layerInfos, lang.hitch(this, function(a) {

				var b = a.layer.id,
				    c = this.map.getLayer(b);
				if (c) {

					var d = c.url;

					if (d != null) {
						if ("esri.layers.FeatureLayer" === c.declaredClass) {

							var g = d.lastIndexOf("/" + c.layerId);

							g > 0 && ( d = d.substring(0, g))

						}
						this.layers.push({
							ref : c,
							layerInfo : a,
							identifyTask : new IdentifyTask(d)
						}), this && c.on("visibility-change", lang.hitch(this, function(a) {
							a.visible === !1 && this.createIdentifyLayerList()
						}));
					}

				}

			}), this), this && (this.createIdentifyLayerList(), this.map.on("update-end", lang.hitch(this, function() {
				this.createIdentifyLayerList()
			})))
			pointL = new GraphicsLayer({
				className : "geomG"

			});

			this.map.addLayer(pointL);
		},
		createIdentifyLayerList : function() {

			var a = null,
			    b = [],
			    c = this.identifyLayerDijit.get("value"),
			    d = this.layerSeparator;

			array.forEach(this.layers, lang.hitch(this, function(e) {

				var h = e.ref,
				    i = e.layerInfo.layerIds;

				if (h.visible) {

					var j = this.getLayerName(e);

					"esri.layers.FeatureLayer" !== h.declaredClass || isNaN(h.layerId) ? array.forEach(h.layerInfos, lang.hitch(this, function(e) {

						this.includeSubLayer(e, h, i) && (b.push({

							name : j + " \\ " + e.name,
							id : h.id + d + e.id
						}), h.id + d + e.id === c && ( a = c))
					})) : (b.push({
						name : j,
						id : h.id + d + h.layerId
					}), h.id + d + h.layerId === c && ( a = c))

				}
			})), b.sort(function(a, b) {
				return a.name > b.name ? 1 : b.name > a.name ? -1 : 0
			}), this.identifyLayerDijit.set("disabled", b.length < 1), b.length > 0 && (b.unshift({
				name : "*** All Visible Layers ***",
				id : "***"
			}), a || ( a = b[0].id));
			var e = new Memory({
				data : b
			});

			this.identifyLayerDijit.set("store", e), this.identifyLayerDijit.set("value", a)
		},
		getLayerName : function(a) {

			var b = null;
			return a.layerInfo && ( b = a.layerInfo.title), b || array.forEach(this.layers, function(c) {
				return c.ref.id === a.id ?
				void ( b = c.layerInfo.title) :
				void 0
			}), b || ( b = a.name, !b && a.ref && ( b = a.ref)), b
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

			return !0
		},
		layerVisibleAtCurrentScale : function(a) {

			var b = this.map.getScale();
			return !(0 !== a.maxScale && b < a.maxScale || 0 !== a.minScale && b > a.minScale)
		},
		onBuffToolButtonClick : function(evt) {

			this.tb.deactivate();

			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

			domStyle.set(evt.target.id, "background-color", "rgb(222, 184, 135)");

			if (evt && evt.target) {

				switch (evt.target.id) {
				case ("esriGeometryPoint"):
					this.tb.activate(Draw.POINT);
					cursorType = "url('./img/cursorPoint.cur'),auto"
					type = "esriGeometryPoint"
					break;

				case ("esriGeometryLine"):
					this.tb.activate(Draw.LINE);

					cursorType = "url('./img/cursorLine.cur'),auto"
					type = "esriGeometryPolyline"
					break;

				case ("esriGeometryPolygon"):
					this.tb.activate(Draw.POLYGON);
					cursorType = "url('./img/cursorPoly.cur'),auto"
					type = "esriGeometryPolygon"
					break;

				case ("msgSearchClear"):
					cursorType = "auto";
					this.map.graphics.clear();

					pointL.clear();
					this.messageNode.innerHTML = "";

					this.widgets.results1.clear();
					this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
				}

				//document.getElementsByTagName("body")[0].style.cursor = cursorType;
				
				document.getElementById("map_container").style.cursor = cursorType;
				document.getElementById("map_layers").style.cursor = cursorType;
			}

		},
		doBuffer : function(evtObj) {
			this.map.graphics.clear();
			pointL.clear();
			this.messageNode.innerHTML = "";
			//this.widgets.results.clear();
			this.widgets.results1.clear();
			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
			var geometry = evtObj.geometry

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
			this.executeIdentifyTask(geometry);
			var graphic = new Graphic(geometry, symbol);
			this.map.graphics.add(graphic);

		},
		executeIdentifyTask : function(a) {

			this.loadmrsac();
			this.onShowPanel(1);

			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
			pointS = a,
			c = this.createIdentifyParams(pointS),
			d = [],
			e = [],
			i = this.getSelectedLayer();

			array.forEach(this.layers, lang.hitch(this, function(a) {

				var b = this.getLayerIds(a, i);

				if (b.length > 0) {

					var g = lang.clone(c);
					g.layerIds = b, d.push(a.identifyTask.execute(g)), e.push(a);

				}

			})), d.length > 0 && (all(d).then(lang.hitch(this, "identifyCallback", e), lang.hitch(this, "identifyError")))

		},
		createIdentifyParams : function(a) {

			var b = new IdentifyParameters;

			return b.tolerance = this.content.value, b.returnGeometry = !0, b.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE, b.geometry =
			a, b.mapExtent = this.map.extent, b.width = this.map.width, b.height = this.map.height, b.spatialReference = this.map.spatialReference, b
		},
		getSelectedLayer : function() {

			var a = this.allLayersId;

			var b = this.identifyFormDijit.get("value");

			b.identifyLayer && "" !== b.identifyLayer ? a = b.identifyLayer : this.identifyLayerDijit.set("value", a)

			return a
		},
		getLayerIds : function(a, b) {

			var c = b.split(this.layerSeparator),
			    d = this.allLayersId,
			    e = a.ref,
			    f = a.layerInfo.layerIds,
			    g = [];

			return e.visible && (c[0] === d || e.id === c[0]) && (c.length > 1 && c[1] ? g = [c[1]] : "esri.layers.FeatureLayer" !== e.declaredClass || isNaN(e.layerId) ? e.layerInfos && ( g = this.getLayerInfos(e, f)) : e.capabilities && e.capabilities.toLowerCase().indexOf("data") > 0 && ( g = [e.layerId])), g
		},
		getLayerInfos : function(a, b) {
			var c = [];

			return array.forEach(a.layerInfos, lang.hitch(this, function(d) {

				this.includeSubLayer(d, a, b) && c.push(d.id)

			})), c
		},
		identifyCallback : function(a, kk) {
			var c = [];
			var kd = [];
			var kd1 = [];
			var newData = [];
			var unique = {};
			var unique1 = {};

			array.forEach(kk, lang.hitch(this, function(b, d) {

				var e = a[d].ref;

				array.forEach(b, lang.hitch(this, function(a) {

					title = a.layerName;

					var loc = null;
					var smallIconUrl = null;

					switch (a.feature.geometry.type) {
					case "point":
						var x = a.feature.geometry.x
						var y = a.feature.geometry.y
						var point = new Point({
							x : x,
							y : y,
							"spatialReference" : {
								"wkid" : 102100
							}
						});
						loc = point
						geomG1 = point
						smallIconUrl = "js/mrsac/viewer/assets/images/small_icons/i_draw_point.png"
						break;

					case "polyline":
						var polylineJson = {
							"paths" : a.feature.geometry.paths,
							"spatialReference" : {
								"wkid" : 102100
							}
						}
						var line = new Polyline(polylineJson);
						var nPts = line.paths[0].length;
						var idx = Math.round(nPts / 2);
						loc = line.getPoint(0, idx);
						geomG1 = line
						smallIconUrl = "js/mrsac/viewer/assets/images/small_icons/i_draw_line.png"
						break;

					default:
						var polygonJson = {
							"rings" : a.feature.geometry.rings,
							"spatialReference" : {
								"wkid" : 102100
							}
						}
						var poly = new Polygon(polygonJson);
						geomG1 = poly
						var ext = poly.getExtent();
						loc = ext.getCenter();
						smallIconUrl = "js/mrsac/viewer/assets/images/small_icons/i_draw_poly.png"
						break;
					}
					graphicShow = new Graphic(geomG1, "", a.feature.attributes);
					if (!unique1[a.layerName]) {
						newData.push({
							id : a.layerName,
							label : a.layerName,
							iconUrl : smallIconUrl,
						});
						unique1[a.layerName] = a.layerName;
					}
					if (!unique[a.layerName]) {
						kd.push({
							id : a.layerName,
							label : a.layerName,
							iconUrl : smallIconUrl,
						});
						unique[a.layerName] = a.layerName;
					}

					title = a.layerName;

					kd.push({
						title : a.feature.attributes.OBJECTID || a.feature.attributes.FID,
						id : a.feature.attributes.OBJECTID || a.feature.attributes.FID,
						label : a.feature.attributes.OBJECTID || a.feature.attributes.FID,
						parent : title,
						iconUrl : smallIconUrl,
						location : loc,
						graphic : graphicShow,
						map : this.map,
					})
					kd1.push({
						title : a.feature.attributes.OBJECTID || a.feature.attributes.FID,
						id : a.feature.attributes.OBJECTID || a.feature.attributes.FID,
						label : a.feature.attributes.OBJECTID || a.feature.attributes.FID,
						parent : title,
						iconUrl : smallIconUrl,
						location : loc,
						graphic : graphicShow,
						map : this.map,
						//expandable : false
					})

					this.map.graphics.add(graphicShow);

				}))
				store1 = new Memory({
					data : kd,
					getChildren : function(object) {
						return this.query({
							parent : object.id
						});
					}
				});

			}));

			array.forEach(newData, lang.hitch(this, function(b, index) {

				model1 = new ObjectStoreModel({
					store : store1,
					query : {
						id : b.label
					},
					labelAttr : "label"
				});

				tree = new Tree({
					model : model1,
					onClick : lang.hitch(this, this.onResultClick),
					//autoExpand : true
				}).placeAt(res).startup();

				var element = query(".dijitFolderOpened", this.domNode)[index];

				domStyle.set(element, "backgroundImage", "url(" + b.iconUrl + ")");

			}));

			var msg = "<strong style='font-size:12px'>Result</strong></br>Total features found : " + query(".dijitTreeNodeContainer > div").length;
			this.setMessage(msg);

			array.forEach(kd1, lang.hitch(this, function(b, index) {

				var element = query(".dijitFolderClosed", this.domNode)[index];
				domStyle.set(element, "backgroundImage", "url(" + b.iconUrl + ")");

				var element1 = query(".dijitTreeExpandoClosed", this.domNode)[index];

				domStyle.set(element1, "backgroundImage", "none");

			}));

			//this.map.graphics.clear();
			this.unloadmrsac();
		},
		identifyError : function(a) {

			alert("error" + a);

		},
		setMessage : function(/*String*/message) {

			this.messageNode.innerHTML = message;

		},
		onResultClick : function(evt) {

			if (evt.graphic) {
				routegeometry = [];
				pointL.clear();
				this.loadmrsac();

				stroke = "blue"
				fill = "#C5E1A5";
				var blinkGraph = this.finalGraphic(evt.graphic, stroke, fill);

				var GrphcNA = new Graphic(evt.graphic.geometry, blinkGraph);

				pointL.add(GrphcNA);
				setTimeout(lang.hitch(this, function() {
					pointL.clear();
				}), 8000);
				var e = [];
				var a = evt.graphic

				var title1 = evt.title

				this.map.infoWindow.show(evt.location)

				if (evt.graphic.geometry.type == "point") {
					routegeometry.push(evt.graphic);
					var myFeatureExtent = graphicsUtils.graphicsExtent(routegeometry);
					this.map.setExtent(myFeatureExtent.getExtent().expand(1.5));

				} else {

					this.map.setExtent(evt.graphic.geometry.getExtent().expand(1.5))
				}

				var h = a.attributes;

				var kh = Object.keys(h);

				array.forEach(kh, function(attr) {
					if (attr != "FID" && attr != "Shape" && attr != "OBJECTID" && attr != "Shape_Leng" && attr != "Shape_Area" && attr != "AREA" && attr != "PERIMETER" && attr != "ROAD_LENGT" && attr != "RAILWAY_LE") {

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

				a.setInfoTemplate(d)

				this.map.infoWindow.setFeatures([a])
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
		clearResult : function() {
        
			this.map.graphics.clear();
			pointL.clear();
			this.messageNode.innerHTML = "";
			//this.widgets.results.clear();
			this.widgets.results1.clear();
			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();

		},

		shutdown : function() {

			this.onShowPanel(0);
			this.tb.deactivate();
			this.map.graphics.clear();
			pointL.clear();
			this.map.infoWindow.hide(), this.map.infoWindow.clearFeatures();
			this.messageNode.innerHTML = "";
			//this.widgets.results.clear();
			this.widgets.results1.clear();
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

			document.getElementsByTagName("body")[0].style.cursor = "auto";
			
			document.getElementById("map_container").style.cursor = "auto";
			

		}
	});
});
