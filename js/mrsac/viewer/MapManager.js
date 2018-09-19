define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "esri/config", "esri/map", "esri/toolbars/navigation", "esri/toolbars/draw", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer", "dojo/topic", "dojo/_base/lang", "dojo/query", "esri/geometry/Extent", "dojo/dom", "dojo/_base/array", "dojo/_base/connect", "dojo/dom-style", "viewer/Highlight", "viewer/InfoPopup", "dojo/number", "esri/IdentityManager", "esri/ServerInfo", "esri/arcgis/OAuthInfo", "dojo/domReady!"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, esriConfig, Map, Navigation, Draw, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, FeatureLayer, topic, lang, query, Extent, dom, array, connect, domStyle, Highlight, InfoPopup, number, esriId, ServerInfo, OAuthInfo) {

	return declare("mrsac.viewer.MapManager", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		constructor : function(/*Object*/params) {
			this.pinnedInfoPopups = [];
			this.toolNames = {};
			currentBasemap = [];

			labels = [];
			layerInfos = [];
		},
		templateString : "<div style='display: none;'></div>",

		i18nStrings : null,
		toolNames : null,

		configData : null,
		mapId : "",
		map : null,

		navToolbar : null,
		drawToolbar : null,

		_drawEventHandle : null,

		infoPopup : null,
		highlight : null,
		handleMapManagerA : null,
		handleMapManagerB : null,
		handleMapManagerC : null,
		handleMapManagerD : null,
		handleMapManagerE : null,
		handleMapManagerF : null,

		postMixInProperties : function() {

			// div to create the esri.Map with is "map"
			if (this.mapId === "") {
				this.mapId = "map";
			}

		},
		postCreate : function() {

			handleMapManagerA = topic.subscribe("configLoadedEvent", lang.hitch(this, "onConfig"));
			handleMapManagerB = topic.subscribe("menuItemClickedEvent", lang.hitch(this, "onMenuClick"));
			handleMapManagerC = topic.subscribe("widgetHighlightEvent", lang.hitch(this, "onWidgetHighlight"));
			handleMapManagerD = topic.subscribe("widgetNavRequestEvent", lang.hitch(this, "onNavRequest"));
			handleMapManagerE = topic.subscribe("widgetDrawRequestEvent", lang.hitch(this, "onDrawRequest"));
			handleMapManagerF = topic.subscribe("mapResizeRequestEvent", lang.hitch(this, "onResizeRequest"));

		},
		startup : function() {

			if (this.highlight === null) {
				var theDiv = document.createElement("div");

				var mapDiv = dom.byId(this.map.id);

				mapDiv.appendChild(theDiv);

				this.highlight = new mrsac.viewer.Highlight({
					map : this.map
				}, theDiv);

			}

		},
		onConfig : function(configData) {
			esriConfig.defaults.io.corsEnabledServers.push("http://portal/webadpgis8/tokens/");
			esriConfig.defaults.io.corsEnabledServers.push("http://117.240.213.119/gp/tokens/");
			//esriConfig.defaults.io.proxyUrl = "/proxy/";

			this.configData = configData;

			this.sec_data();
			this.sec_datagis1();
			/*

			 securelength = this.configData.map.liveMaps
			 for ( i = 0; i < securelength.length; i++) {
			 this.sec_data(securelength[i].url);
			 }
			 */

			handleMapManagerA.remove();

			var lods = [{
				"level" : 0,
				"resolution" : 0.3515625,
				"scale" : 147748799.285417,
				"endTileCol" : 1,
				"endTileRow" : 0,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 1,
				"resolution" : 0.17578125,
				"scale" : 73874399.6427087,
				"endTileCol" : 3,
				"endTileRow" : 1,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 2,
				"resolution" : 0.087890625,
				"scale" : 36937199.8213544,
				"endTileCol" : 7,
				"endTileRow" : 3,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 3,
				"resolution" : 0.0439453125,
				"scale" : 18468599.9106772,
				"endTileCol" : 15,
				"endTileRow" : 7,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 4,
				"resolution" : 0.02197265625,
				"scale" : 9234299.95533859,
				"endTileCol" : 31,
				"endTileRow" : 15,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 5,
				"resolution" : 0.010986328125,
				"scale" : 4617149.97766929,
				"endTileCol" : 63,
				"endTileRow" : 31,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 6,
				"resolution" : 0.0054931640625,
				"scale" : 2308574.98883465,
				"endTileCol" : 127,
				"endTileRow" : 63,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 7,
				"resolution" : 0.00274658203125,
				"scale" : 1154287.49441732,
				"endTileCol" : 255,
				"endTileRow" : 127,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 8,
				"resolution" : 0.001373291015625,
				"scale" : 577143.747208662,
				"endTileCol" : 511,
				"endTileRow" : 255,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 9,
				"resolution" : 0.0006866455078125,
				"scale" : 288571.873604331,
				"endTileCol" : 1023,
				"endTileRow" : 511,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 10,
				"resolution" : 0.00034332275390625,
				"scale" : 144285.936802165,
				"endTileCol" : 2047,
				"endTileRow" : 1023,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 11,
				"resolution" : 0.000171661376953125,
				"scale" : 72142.9684010827,
				"endTileCol" : 4095,
				"endTileRow" : 2047,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 12,
				"resolution" : 0.0000858306884765629,
				"scale" : 36071.4842005414,
				"endTileCol" : 8191,
				"endTileRow" : 4095,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 13,
				"resolution" : 0.0000429153442382814,
				"scale" : 18035.7421002707,
				"endTileCol" : 16383,
				"endTileRow" : 8191,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 14,
				"resolution" : 0.0000214576721191407,
				"scale" : 9017.87105013534,
				"endTileCol" : 32767,
				"endTileRow" : 16383,
				"startTileCol" : 0,
				"startTileRow" : 0
			}, {
				"level" : 15,
				"resolution" : 0.0000107288360595703,
				"scale" : 4508.93552506767,
				"endTileCol" : 65535,
				"endTileRow" : 32767,
				"startTileCol" : 0,
				"startTileRow" : 0
			}];

			var layer = new ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer");
			// once the layer loads, use its tile levels to label the map's slider
			layer.on("load", function() {

				// use layer's scales to display as slider labels
				//var labels = [];
				var lods = layer.tileInfo.lods;
				for (var i = 0, il = lods.length; i < il; i++) {
					if (i % 2) {
						labels.push(number.format(lods[i].scale.toFixed()));
					}
				}
			});
			var params = {
				basemap : "topo",
				logo : false,
				showAttribution : false,
				isZoomSlider : true,
				isPanArrows : false,
				showLabels : true
				//lods : lods,
				//sliderStyle : "large",
				//sliderLabels : labels

			};

			// Initial extent defined?
			if (configData.map.initialExtent) {

				var ext = configData.map.initialExtent;
				params.extent = new Extent(ext[0], ext[1], ext[2], ext[3], null);
			}

			this.map = new Map(this.mapId, params);

			var mapLoadHandle = this.map.on("load", lang.hitch(this, function(map) {

				//var mapLoadHandle = this.map.on("load", lang.hitch(this, function(map) {

				// Ensure that the extent is what we asked for
				setTimeout(lang.hitch(this, function() {
					if (this.map.extent !== params.extent) {
						this.map.setExtent(params.extent);
					}
				}), 1000);

				// Init toolbars
				this.navToolbar = new Navigation(this.map);
				this.drawToolbar = new Draw(this.map);

				// Connect layer change events
				this.map.on("layer-add", function(layer) {

					topic.publish("layerAddedEvent", layer);

				});

				this.map.on("layer-reorder", function(layer, index) {

					topic.publish("layerReorderedEvent", layer, index);

				});

				this.map.on("key-down", lang.hitch(this, function(evt) {

					if (evt.keyCode === 27 && evt.shiftKey === true) {
						this.onNavRequest(null);
					}
				}));

				topic.publish("mapLoadedEvent", this.map);

				// Disconnect event handler after it fires once
				mapLoadHandle.remove();
				this.map.on("update-start", lang.hitch(this, function(evt) {

					var element = dom.byId('divLoadingIndicator');

					domStyle.set(element, "display", "block");

					var element1 = query(".divSplashScreenContent")[0];
					domStyle.set(element1, "display", "none");
				}));
				this.map.on("update-end", lang.hitch(this, function(evt) {

					var element = dom.byId('divLoadingIndicator');
					domStyle.set(element, "display", "none");

					var element1 = query(".divSplashScreenContent")[0];
					domStyle.set(element1, "display", "block");

				}));
				// this.map.on("update-start", lang.hitch(this, function(evt) {
// 
					// var element = dom.byId('divLoadingIndicator');
// 
					// domStyle.set(element, "display", "block");
// 
					// var element1 = query(".divSplashScreenContent")[0];
					// domStyle.set(element1, "display", "none");
				// }));
				// this.map.on("update-end", lang.hitch(this, function(evt) {
// 
					// var element = dom.byId('divLoadingIndicator');
					// domStyle.set(element, "display", "none");
// 
					// var element1 = query(".divSplashScreenContent")[0];
					// domStyle.set(element1, "display", "block");
// 
				// }));

			}));

			// Base Map Layers (when first base map is loaded, live maps follow
			for (var i = 0; i < this.configData.map.liveMaps.length; i++) {

				this.loadMapService(this.configData.map.liveMaps[i], true);
			}

		},
		loadMapService : function(mapServiceInfo, /*boolean*/isBaseMap) {

			try {
				
				
				    if(mapServiceInfo.label=="Transport"){
				 	  this.securitycommang8();
				 }
				   if(mapServiceInfo.label=="Health Centres"){
				 	  this.securitycommang7();
				 }
				  if(mapServiceInfo.label=="Transport Route"){
				 	  this.securitycommang1();
				 }
				
				var layer = null;
				if (mapServiceInfo.type === "tiled") {
					layer = new ArcGISTiledMapServiceLayer(mapServiceInfo.url, {
						id : mapServiceInfo.label,
						opacity : parseFloat(mapServiceInfo.alpha),
						visible : mapServiceInfo.visible
					});
					//layerInfos.push(layer);

				} else if (mapServiceInfo.type === "dynamic") {

					layer = new ArcGISDynamicMapServiceLayer(mapServiceInfo.url, {
						id : mapServiceInfo.label,
						opacity : parseFloat(mapServiceInfo.alpha),
						visible : mapServiceInfo.visible
					});
					//layerInfos.push(layer)
				} else if (mapServiceInfo.type === "feature") {

					layer = new FeatureLayer(mapServiceInfo.url, {
						id : mapServiceInfo.label,
						opacity : parseFloat(mapServiceInfo.alpha),
						visible : mapServiceInfo.visible,
						outFields : ["*"]
					});
					//layerInfos.push(layer);
				}

				if (layer) {
					//console.log(layer)
					// Assign a "BASE" or "LIVE" tag to each layer
					// This allows the LiveMapsWidget to manage the LIVE maps
					layer.layerCategory = (!isBaseMap) ? "BASE" : "LIVE";

					if (layer.loaded) {

						// IE caching behavior, loaded is true right away.
						this._layerLoadHander(layer);
					} else {

						this.map.addLayer(layer);

						if (layer.layerCategory === "BASE" && this.map.layerIds.length === 1) {
							// this is the first Base map to load, start adding Live maps

							for (var i = 0; i < this.configData.map.liveMaps.length; i++) {
								this.loadMapService(this.configData.map.liveMaps[i], false);
							}
						}
					}
				}

			} catch (err) {
				console.error("Loading map service at url: " + mapServiceInfo.url);
			}
		},

		_layerLoadHandler : function(layer) {

			this.map.addLayer(layer);

			/*if ("esri.layers.FeatureLayer" === layer.declaredClass) {

			 } else if ("esri.layers.ArcGISDynamicMapServiceLayer" === layer.declaredClass) {

			 } else {

			 }*/

			if (layer.layerCategory === "BASE" && this.map.layerIds.length === 1) {
				// this is the first Base map to load, start adding Live maps

				for (var i = 0; i < this.configData.map.liveMaps.length; i++) {
					this.loadMapService(this.configData.map.liveMaps[i], false);
				}
			}
		},
securitycommang7 : function() {
			// this.securitycommang("http://mrsacgis1/gp/tokens/","http://mrsacgis1","/gp/tokens/generateToken","/gp/tokens/","baselayers","base$layers#2018","gp"); "/arcgis/admin/generateToken"
			/*******************************************************tocnode*************************************************/ //corses,prourl,admtokn,toknser,usna,pasw,webadp
			esriConfig.defaults.io.corsEnabledServers.push("http://117.240.213.123/webadpgis7/tokens/");
			esriConfig.defaults.io.proxyUrl = "/proxy/";
			var portalURL = "http://117.240.213.123";
			serverI = new ServerInfo();
			serverI = {
				adminTokenServiceUrl : portalURL + "/webadpgis7/tokens/generateToken",
				currentVersion : 10.3,
				hasServer : true,
				server : portalURL,
				shortLivedTokenValidity : 60,
				tokenServiceUrl : portalURL + "/webadpgis7/tokens/"
			};
			esriId.registerServers([serverI]);
			var def = esriId.generateToken(serverI, {
				"username" : "mrsac_viewer",
				"password" : "@gsvieWer#2018",
			});
			def.addCallback(function(tokenInfo) {

				var creationTime = (new Date).getTime();
				var expirationTime = creationTime + (serverI.shortLivedTokenValidity * 60000);
				var idObject = {};
				idObject.serverInfos = [serverI];
				var credentials = {};
				credentials.userId = "mrsac_viewer";
				credentials.server = portalURL + "/webadpgis7";
				credentials.token = tokenInfo.token;
				credentials.expires = expirationTime;
				credentials.ssl = false;
				credentials.scope = "server";
				credentials.validity = 720;
				credentials.creationTime = creationTime;
				idObject.credentials = [credentials];
				esriId.initialize(idObject);
			});

		},
securitycommang8 : function() {
			// this.securitycommang("http://mrsacgis1/gp/tokens/","http://mrsacgis1","/gp/tokens/generateToken","/gp/tokens/","baselayers","base$layers#2018","gp"); "/arcgis/admin/generateToken"
			/*******************************************************tocnode*************************************************/ //corses,prourl,admtokn,toknser,usna,pasw,webadp
			esriConfig.defaults.io.corsEnabledServers.push("http://117.240.213.123/webadpgis8/tokens/");
			esriConfig.defaults.io.proxyUrl = "/proxy/";
			var portalURL = "http://117.240.213.123";
			serverI = new ServerInfo();
			serverI = {
				adminTokenServiceUrl : portalURL + "/webadpgis8/tokens/generateToken",
				currentVersion : 10.3,
				hasServer : true,
				server : portalURL,
				shortLivedTokenValidity : 60,
				tokenServiceUrl : portalURL + "/webadpgis8/tokens/"
			};
			esriId.registerServers([serverI]);
			var def = esriId.generateToken(serverI, {
				"username" : "mrsac_viewer",
				"password" : "@gsvieWer#2018",
			});
			def.addCallback(function(tokenInfo) {

				var creationTime = (new Date).getTime();
				var expirationTime = creationTime + (serverI.shortLivedTokenValidity * 60000);
				var idObject = {};
				idObject.serverInfos = [serverI];
				var credentials = {};
				credentials.userId = "mrsac_viewer";
				credentials.server = portalURL + "/webadpgis8";
				credentials.token = tokenInfo.token;
				credentials.expires = expirationTime;
				credentials.ssl = false;
				credentials.scope = "server";
				credentials.validity = 720;
				credentials.creationTime = creationTime;
				idObject.credentials = [credentials];
				esriId.initialize(idObject);
			});

		},
		securitycommang1 : function() {
			// this.securitycommang("http://mrsacgis1/gp/tokens/","http://mrsacgis1","/gp/tokens/generateToken","/gp/tokens/","baselayers","base$layers#2018","gp"); "/arcgis/admin/generateToken"
			/*******************************************************tocnode*************************************************/ //corses,prourl,admtokn,toknser,usna,pasw,webadp
			esriConfig.defaults.io.corsEnabledServers.push("http://117.240.213.119/gp/tokens/");
			esriConfig.defaults.io.proxyUrl = "/proxy/";
			var portalURL = "http://117.240.213.119";
			serverI = new ServerInfo();
			serverI = {
				adminTokenServiceUrl : portalURL + "/gp/tokens/generateToken",
				currentVersion : 10.3,
				hasServer : true,
				server : portalURL,
				shortLivedTokenValidity : 60,
				tokenServiceUrl : portalURL + "/gp/tokens/"
			};
			esriId.registerServers([serverI]);
			var def = esriId.generateToken(serverI, {
				"username" : "mrsac_viewer",
				"password" : "@gsvieWer#2018",
			});
			def.addCallback(function(tokenInfo) {

				var creationTime = (new Date).getTime();
				var expirationTime = creationTime + (serverI.shortLivedTokenValidity * 60000);
				var idObject = {};
				idObject.serverInfos = [serverI];
				var credentials = {};
				credentials.userId = "mrsac_viewer";
				credentials.server = portalURL + "/gp";
				credentials.token = tokenInfo.token;
				credentials.expires = expirationTime;
				credentials.ssl = false;
				credentials.scope = "server";
				credentials.validity = 720;
				credentials.creationTime = creationTime;
				idObject.credentials = [credentials];
				esriId.initialize(idObject);
			});

		},
		sec_data : function(a) {

				/*
			 var g = a.lastIndexOf("/arcgis");
			 newVar = a.substring(0, g);
			 var portalURL = newVar*/

			var portalURL = "http://portal"
			serverI = new ServerInfo();
			serverI = {
				adminTokenServiceUrl : portalURL + "/webadpgis8/tokens/generateToken",
				currentVersion : 10.3,
				hasServer : true,
				server : portalURL,
				shortLivedTokenValidity : 60,
				tokenServiceUrl : portalURL + "/webadpgis8/tokens/"
			};
			esriId.registerServers([serverI]);

			var def = esriId.generateToken(serverI, {
				"username" : "mrsac_viewer",
				"password" : "@gsvieWer#2018",
			});

			def.addCallback(function(tokenInfo) {
				var creationTime = (new Date).getTime();
				var expirationTime = creationTime + (serverI.shortLivedTokenValidity * 60000);
				var idObject = {};
				idObject.serverInfos = [serverI];

				var credentials = {};
				credentials.userId = "mrsac_viewer";
				credentials.server = portalURL + "/webadpgis8";
				credentials.token = tokenInfo.token;
				credentials.expires = expirationTime;
				credentials.ssl = false;
				credentials.scope = "server";
				credentials.validity = 720;
				credentials.creationTime = creationTime;
				idObject.credentials = [credentials];
				esriId.initialize(idObject);
				/*
				 esriId.registerToken({
				 expires : expirationTime,
				 server : "http://mrsac.maharashtra.gov.in/arcgis/rest/services",
				 ssl : true,
				 token : tokenInfo.token,
				 userId : "mrsacadmin"
				 });*/

			});

		},
		sec_datagis1:function(a){
			var portalURL = "http://mrsacgis1"
			serverI = new ServerInfo();
			serverI = {
				adminTokenServiceUrl : portalURL + "/gp/tokens/generateToken",
				currentVersion : 10.3,
				hasServer : true,
				server : portalURL,
				shortLivedTokenValidity : 60,
				tokenServiceUrl : portalURL + "/gp/tokens/"
			};
			esriId.registerServers([serverI]);

			var def = esriId.generateToken(serverI, {
				"username" : "mrsac_viewer",
				"password" : "@gsvieWer#2018",
			});

			def.addCallback(function(tokenInfo) {
				var creationTime = (new Date).getTime();
				var expirationTime = creationTime + (serverI.shortLivedTokenValidity * 60000);
				var idObject = {};
				idObject.serverInfos = [serverI];

				var credentials = {};
				credentials.userId = "mrsac_viewer";
				credentials.server = portalURL + "/gp";
				credentials.token = tokenInfo.token;
				credentials.expires = expirationTime;
				credentials.ssl = false;
				credentials.scope = "server";
				credentials.validity = 720;
				credentials.creationTime = creationTime;
				idObject.credentials = [credentials];
				esriId.initialize(idObject);
				/*
				 esriId.registerToken({
				 expires : expirationTime,
				 server : "http://mrsac.maharashtra.gov.in/arcgis/rest/services",
				 ssl : true,
				 token : tokenInfo.token,
				 userId : "mrsacadmin"
				 });*/

			});

			
		},
		onMenuClick : function(data) {

			if (data && data.value && data.menuCode) {
				if (data.menuCode === "basemaps.mapservice") {
					// User has chosen a basemap

					// Make it visible
					// Make other basemaps hidden
					array.forEach(this.map.layerIds, lang.hitch(this, function(id) {
						var layer = this.map.getLayer(id);

						// Only change vis of base maps
						if (layer.layerCategory && layer.layerCategory === "BASE") {

							if (id === data.value) {

								layer.show();
							} else {

								layer.hide();
							}
						}
					}));
				}

				if (data.menuCode === "navtools.navtool") {
					switch (data.value) {
						case "pan":
							this.onNavRequest(Navigation.PAN, this.toolNames[Navigation.PAN]);
							break;
						case "zoomin":
							this.onNavRequest(Navigation.ZOOM_IN, this.toolNames[Navigation.ZOOM_IN]);
							break;
						case "zoomout":
							this.onNavRequest(Navigation.ZOOM_OUT, this.toolNames[Navigation.ZOOM_OUT]);
							break;
						case "zoomfull":
							this.zoomToFullExtent();
							break;
					}
				}
			}
		},
		onWidgetHighlight : function(/*esri.Graphic*/g, /*esri.geometry.Point*/location, /*boolean*/forceNav, /*Number*/zoomScale) {

			// g is the graphic in the map that the widget wants highlighted and infoboxed
			if (g && location) {
				try {
					// Pan & zoom map if the location isn't in the center of the map
					if (forceNav) {
						var zoomToExt = null;
						if (zoomScale) {
							if ( typeof zoomScale == "string") {
								zoomScale = parseInt(zoomScale);
							}
							if (zoomScale > 1) {
								var currentScale = mrsac.viewer.util.scale.calculateScale(this.map);
								// expand/shrink the scale to match zoomScale
								if (zoomScale / currentScale > 2 || zoomScale / currentScale < 0.5) {
									zoomToExt = this.map.extent.expand(zoomScale / currentScale);
									zoomToExt = zoomToExt.centerAt(location);
								}
							}
						}
						if (!zoomToExt) {
							var ext = this.map.extent.expand(0.5);
							if (!ext.contains(location)) {
								zoomToExt = this.map.extent;
								zoomToExt = zoomToExt.centerAt(location);
							}
						}

						if (zoomToExt) {
							this.map.setExtent(zoomToExt);
						}
					} else {
						if (!this.map.extent.contains(location)) {
							return;
						}
					}

					// Highlight Result
					this.highlight.setCoords(location);
					this.highlight.setMode("flashing");

					// Show InfoPopup
					if (this.infoPopup === null) {
						var theDiv = document.createElement("div");
						var mapDiv = dom.byId(this.map.id);
						mapDiv.appendChild(theDiv);
						var popup = new mrsac.viewer.InfoPopup({
							map : this.map
						}, theDiv);
						this.infoPopup = popup

						// Connect Close and Pin events
						// Use of closures to ensure handles are disconnected
						// and to maintain a link to the correct infoPopup
						var closeHandle = connect.connect(popup, "onClose", lang.hitch(this, function() {

							closeHandle.remove();

							if (this.infoPopup === popup) {
								this.infoPopup = null;
								if (this.highlight) {
									this.highlight.setMode("off");
								}
							} else {
								for (var i = 0; i < this.pinnedInfoPopups.length; i++) {
									if (this.pinnedInfoPopups[i] === popup) {
										this.pinnedInfoPopups.splice(i, 1);
										break;
									}
								}
							}
							popup.destroyRecursive();
						}));

						var pinHandle = popup.on("onPin", lang.hitch(this, function() {
							pinHandle.remove();

							if (this.infoPopup === popup) {
								this.infoPopup = null;
								this.pinnedInfoPopups.push(popup);
								if (this.highlight) {
									this.highlight.setMode("off");
								}
							}
						}));
					}

					this.infoPopup.setInfo(g.attributes);
					this.infoPopup.setCoords(location);
					if (this.infoPopup.visible === false) {
						this.infoPopup.show();
					}
				} catch (err) {
					console.error("Error highlighting widget result", err);
				}
			} else {
				if (this.highlight) {
					this.highlight.setMode("off");
				}
				if (this.infoPopup) {
					this.infoPopup.hide();
				}
			}
		},
		onNavRequest : function(/*esri.toolbars.Navigation.navType*/navType, /*String*/label) {
			// Deactivate drawing toolbar for starters
			try {
				if (this._drawEventHandle) {
					this._drawEventHandle.remove();
					this._drawEventHandle = null;
				}
				this.drawToolbar.deactivate();

				// Activate the navigation toolbar
				if (navType) {
					this.navToolbar.activate(navType);
					topic.publish("mapToolChangedEvent", label);
				} else {
					this.navToolbar.deactivate();
					topic.publish("mapToolChangedEvent", "");
				}
			} catch (err) {
				console.error("MapManager::onNavRequest", err);
			}
		},
		onDrawRequest : function(/*Object*/params) {

			// params should contain the geometryType (see esri.toolbars.Draw constants)
			// and a callback function for onDrawEnd,
			// and the label to display in the status area

			try {

				// Deactivate navigation toolbars for starters
				this.navToolbar.deactivate();

				this.drawToolbar.deactivate();

				// Disconnect any previous drawing listener
				if (this._drawEventHandle) {

					this._drawEventHandle.remove();
					this._drawEventHandle = null;

				}

				// Activate the draw toolbar
				if (params) {

					this._drawEventHandle = this.drawToolbar.on("draw-end", params.onDrawEnd);
					this.drawToolbar.activate(params.geometryType);

					topic.publish("mapToolChangedEvent", params.label);
				} else {
					this.drawToolbar.deactivate();
					topic.publish("mapToolChangedEvent", "");
				}

			} catch (err) {
				console.error("MapManager::onDrawRequest", err);
			}
		},
		zoomToFullExtent : function() {

			if (this.configData.map.fullExtent) {
				var coords = this.configData.map.fullExtent;
				var extent = new Extent(coords[0], coords[1], coords[2], coords[3], null);
				this.map.setExtent(extent);
			} else {
				this.navToolbar.zoomToFullExtent();
			}
		},
		onResizeRequest : function(/*Object*/box) {

			var mapDiv = dom.byId(this.map.id);
			domStyle.set(mapDiv, {
				position : "absolute",
				left : box.l + "px",
				top : box.t + "px",
				width : box.w + "px",
				height : box.h + "px"
			});
			this.map.resize();
			topic.publish("mapResizedEvent", box);
		},
	});
});
