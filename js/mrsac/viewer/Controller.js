define (["dojo/_base/declare", "dijit/_WidgetBase", "viewer/legend", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/Controller.html", "js/mrsac/viewer/nls/ControllerStrings.js", "esri/dijit/Geocoder", "dojo/_base/lang", "dojo/topic", "dojo/_base/array", "dojo/dom-style", "dojo/dom-class", "dojo/query", "dojo/string", "dojo/_base/connect", "dojo/on", "dojo/dom", "dojo/dom-attr", "viewer/ControllerMenu", "viewer/TOC", "viewer/widgets/Peglocation", "esri/layers/FeatureLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ArcGISTiledMapServiceLayer", "esri/renderers/SimpleRenderer", "esri/graphic", "esri/lang", "dijit/TooltipDialog", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "dijit/popup", "esri/InfoTemplate", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/dijit/PopupTemplate", "dojo/dom-construct"], function (declare, _WidgetBase, legend, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, ControllerStrings, Geocoder, lang, topic, array, domStyle, domClass, query, string, connect, on, dom, domAttr, ControllerMenu, TOC, Peglocation, FeatureLayer, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer, SimpleRenderer, Graphic, esriLang, TooltipDialog, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, Color, popup, InfoTemplate, IdentifyTask, IdentifyParameters, PopupTemplate, domConstruct) {

	return declare ("mrsac.viewer.", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		constructor : function (/*Object*/params) {
			this.connects = [];
			this.layerItem = {
				layer : [],
				title : []
			};
			this.f_layerItem = {
				layer : [],
				title : []

			};
			this.layerItem1 = {
				layer : [],
				title : []
			};
			this.f_layerItem1 = {
				layer : [],
				title : []

			};

		},
		templateString : template,
		i18nStrings : null,
		map : null,
		configData : null,
		menuItemData : null,

		handleA : null,
		handleB : null,
		handleC : null,
		handleD : null,
		handleE : null,
		nodestate : null,
		layerIsVisible : null,

		menuIsVisible : false,

		_menuIsVisible : false,
		_mouseIsOverIcon : false,
		_mouseIsOverDropDown : false,

		menuIsVisibleL : false,

		_menuIsVisibleL : false,
		_mouseIsOverIconL : false,
		_mouseIsOverDropDownL : false,
		_mouseIsOverDropDownL1 : false,

		postMixInProperties : function () {

			this.i18nStrings = ControllerStrings;
			//console.log(" postMixInProperties");

		},
		postCreate : function () {

			//console.log(" postCreate");

			handleA = topic.subscribe ("configLoadedEvent", lang.hitch (this, "onConfig"));
			handleB = topic.subscribe ("mapLoadedEvent", lang.hitch (this, "onMapLoad"));
			handleD = topic.subscribe ("statusChangedEvent", lang.hitch (this, "onStatusChange"));

		},

		startup : function () {

			if (this._started) {
				return;
			}

			var children = this.getChildren ();
			array.forEach (children, function (child) {
				child.startup ();
			});

		},
		callInfoWindow : function (a) {

			this.infotemp = new InfoTemplate ();
			var layer = this.map.getLayer ("School Location")
			//var layer1 = this.map.getLayer("Health Centres")

			layer.on ("click", lang.hitch (this, function (evt) {
				var attributes = evt.graphic.attributes

				this.infotemp.setTitle ("Attribute Information");
				this.infotemp.setContent ("<table>\n\<tr><td style='font-weight:bold'>Name </td><td style='font-weight:bold'>" + attributes.name + "</td></tr>\n\<tr><td style='font-weight:bold'>School Name </td><td style='font-weight:normal;'>" + attributes.schname + "</td></tr>\n\<tr><td style='font-weight:bold'>School Code </td><td style='font-weight:normal;'>" + attributes.schcd + "</td></tr>\n\<tr><td style='font-weight:bold'>School Category </td><td style='font-weight:normal;'>" + attributes.state_cate + "</td></tr>\n\<tr><td style='font-weight:bold'>District </td><td style='font-weight:normal;'>" + attributes.distname + "</td></tr>\n\<tr><td style='font-weight:bold'>Block</td><td style='font-weight:normal;'>" + attributes.blkname + "</td></tr>\n\<tr><td style='font-weight:bold'>Village </td><td style='font-weight:normal;'>" + attributes.village_na + "</td></tr>\n\<tr><td style='font-weight:bold'>Sender Number</td><td style='font-weight:normal;'>" + attributes.sender + "</td></tr>\n\</table>")
				evt.graphic.setInfoTemplate (this.infotemp)

			}))
			/*
			 layer1.on("click", lang.hitch(this, function(evt) {
			 var attributes = evt.graphic.attributes
			 this.infotemp = new InfoTemplate();
			 this.infotemp.setTitle("Attribute Information");
			 this.infotemp.setContent("<table>\n\<tr><td style='font-weight:bold'>Name </td><td
			 style='font-weight:bold'>" + attributes.name + "</td></tr>\n\<tr><td
			 style='font-weight:bold'>School Name </td><td style='font-weight:normal;'>" +
			 attributes.schname + "</td></tr>\n\<tr><td style='font-weight:bold'>School Code </td><td
			 style='font-weight:normal;'>" + attributes.schcd + "</td></tr>\n\<tr><td
			 style='font-weight:bold'>School Category </td><td style='font-weight:normal;'>" +
			 attributes.state_category + "</td></tr>\n\<tr><td style='font-weight:bold'>Village
			 </td><td
			 style='font-weight:normal;'>" + attributes.village_name + "</td></tr>\n\<tr><td
			 style='font-weight:bold'>Block</td><td style='font-weight:normal;'>" + attributes.blkname
			 +
			 "</td></tr>\n\<tr><td style='font-weight:bold'>District </td><td
			 style='font-weight:normal;'>" + attributes.distname + "</td></tr>\n\<tr><td
			 style='font-weight:bold'>Sender Number</td><td style='font-weight:normal;'>" +
			 attributes.sender + "</td></tr>\n\<tr><td style='font-weight:bold'>Common Code </td><td
			 style='font-weight:normal;'>" + attributes.commoncode + "</td></tr>\n\</table>")
			 evt.graphic.setInfoTemplate(this.infotemp)

			 }))*/

		},

		onConfig : function (configData) {

			this.configData = configData;

			// Unsubscribe from the event
			handleA.remove ();

			this._organizeMenuItems ();
			//console.dir(configData);

			if (configData.ui.showBanner === false) {
				domStyle.set (this.BoxNode, "display", "none");
				domClass.add (this.containerNode, "MenuBoxNoBanner");
			}

			this.setTitle (configData.ui.title);

			this.setSubtitle (configData.ui.subtitle);

			var logoUrl = require.toUrl ("js/mrsac/viewer/" + configData.ui.logo);
			var logoUrlR = require.toUrl ("js/mrsac/viewer/" + configData.ui.logoR);
			//var logoUrlL = require.toUrl("js/mrsac/viewer/" + configData.ui.logoL);

			this.setLogo (logoUrl);
			this.setRLogo (logoUrlR);
			//this.setLLogo(logoUrlL);

			this.setStatus ("");

			this.createMenus ();

		},
		onMapLoad : function (map) {

			this.map = map;

			var geocoder = new Geocoder ({
				autoComplete : true,
				map : this.map
			}, dom.byId ("search"));

			on (dom.byId ("btnStreets"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}
				map.setBasemap ("streets");
			});
			on (dom.byId ("btnSatellite"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}
				map.setBasemap ("satellite");
			});
			on (dom.byId ("btnHybrid"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}
				map.setBasemap ("hybrid");
			});
			on (dom.byId ("btnTopo"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}
				map.setBasemap ("topo");
			});
			on (dom.byId ("btnGray"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}
				map.setBasemap ("gray");
			});
			on (dom.byId ("btnNatGeo"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}

				map.setBasemap ("national-geographic");
			});

			on (dom.byId ("btnNonemrsac"), "click", function () {

				//map.setBasemap ("national-geographic");
				//this.customBasemap = new ArcGISTiledMapServiceLayer
				// ("http://mrsac.org.in/gisserver2/rest/services/baselayers/mrsac_vector_basemap/MapServer");
				this.customBasemap = new ArcGISDynamicMapServiceLayer ("http://117.240.213.123/webadpgis8/rest/services/baselayers/mrsac_vector_basemap/MapServer", {
					id : "custombasemap"
				});
				map.addLayer (this.customBasemap);
				var baseId = map.basemapLayerIds[0]
				var elementBase = dom.byId ("map_" + baseId)
				domStyle.set (elementBase, "display", "none");
				//map.setBasemap ("this.customBasemap");
			});
			/*			on(dom.byId("mrsac_viewer_ControllerMenuItem_9"), "click", function() {
			 alert("click");
			 }); */
			on (dom.byId ("btnNatGeo"), "click", function () {
				var layer4 = map.getLayer ("custombasemap");
				if (layer4) {
					map.removeLayer (layer4);
					layer4.setVisibility (false);
				}

				map.setBasemap ("national-geographic");
			});
			on (dom.byId ("btnNone"), "click", function () {
				var baseId = map.basemapLayerIds[0]
				var elementBase = dom.byId ("map_" + baseId)
				domStyle.set (elementBase, "display", "none");

			});
			this.getLiveLayers (map);
			setTimeout (lang.hitch (this, function () {

				var tocdiv = dom.byId ("tocDiv");

				toc = new mrsac.viewer.TOC ({
					map : map,
					layerInfos : [{
						layer : this.layerItem.layer[0],
						title : this.layerItem.title[0],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[1],
						title : this.layerItem.title[1],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[2],
						title : this.layerItem.title[2],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[3],
						title : this.layerItem.title[3],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[4],
						title : this.layerItem.title[4],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[5],
						title : this.layerItem.title[5],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[6],
						title : this.layerItem.title[6],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[7],
						title : this.layerItem.title[7],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[8],
						title : this.layerItem.title[8],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[9],
						title : this.layerItem.title[9],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem.layer[10],
						title : this.layerItem.title[10],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}]
				}, tocdiv);
				toc.startup ();
				var tocdiv1 = dom.byId ("tocDiv1");
				toc1 = new mrsac.viewer.TOC ({
					map : map,
					layerInfos : [{
						layer : this.layerItem1.layer[0],
						title : this.layerItem1.title[0],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem1.layer[1],
						title : this.layerItem1.title[1],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}, {
						layer : this.layerItem1.layer[2],
						title : this.layerItem1.title[2],
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true // whether to display a transparency slider.
					}
					/*	{
					 layer : this.f_layerItem1.layer[0],
					 title : this.f_layerItem1.title[0],
					 collapsed : true, // whether this root layer should be collapsed initially, default false.
					 slider : true // whether to display a transparency slider.
					 }*/]
				}, tocdiv1);

				toc1.startup ();
			}), 1000);
			mrsac.viewer.util.showpopup ();

			this.callInfoWindow ();

			/******************************admin division layer*************************************/

			/*
			var layer = new FeatureLayer("http://mrsac.maharashtra.gov.in/arcgis/rest/services/admin_2011/admin_state_2011/MapServer/1", {
			mode : FeatureLayer.MODE_SNAPSHOT,
			outFields : ["DVNCODE", "DVENAME", "DVMNAME"]
			});
			layer.setDefinitionExpression("OBJECTID  >= 1");
			var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255, 0.1]), 1), new Color([125, 125, 125, 0.1]));
			layer.setRenderer(new SimpleRenderer(symbol));
			this.map.addLayer(layer);
			this.map.infoWindow.resize(50, 50);
			dialog = new TooltipDialog({
			id : "tooltipDialog",
			style : "position: absolute; width: 200px; font: normal normal normal 10pt Helvetica;z-index:100"
			});
			dialog.startup();
			layer.on("mouse-out", lang.hitch(this, this.closeDialog));
			var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([125, 125, 125, 0.35]));
			layer.on("mouse-over", lang.hitch(this, function(evt) {
			//this.map.graphics.clear();
			var t = "<b> Division: </b>${DVENAME}<br>" + "<b> Division Code: </b>${DVNCODE}<br>";
			//var t = "Division  : ${DVENAME }";
			var content = esriLang.substitute(evt.graphic.attributes, t);
			var highlightGraphic = new Graphic(evt.graphic.geometry, highlightSymbol);
			this.map.graphics.add(highlightGraphic);
			//alert(JSON.stringify(content));
			dialog.setContent(content);
			//                alert("content set");
			domStyle.set(dialog.domNode, "opacity", 0.85);
			popup.open({
			popup : dialog,
			x : evt.pageX,
			y : evt.pageY
			});
			}));*/

			/************************************admin district
			 * boundary**********************************/
			/*
			var layer1 = new FeatureLayer("http://mrsac.maharashtra.gov.in/arcgis/rest/services/admin_2011/admin_state_2011/MapServer/2", {
			mode : FeatureLayer.MODE_SNAPSHOT,
			outFields : ["DTNCODE", "DTENAME"]
			});
			layer1.setDefinitionExpression("OBJECTID  >= 1");
			var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255, 0.2]), 1), new Color([125, 125, 125, 0.2]));
			layer1.setRenderer(new SimpleRenderer(symbol1));
			this.map.addLayer(layer1);
			this.map.infoWindow.resize(50, 50);
			dialog1 = new TooltipDialog({
			id : "tooltipDialog",
			style : "position: absolute; width: 200px; font: normal normal normal 10pt Helvetica;z-index:100"
			});
			dialog1.startup();
			layer1.on("mouse-out", lang.hitch(this, this.closeDialog1));
			var highlightSymbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3), new Color([125, 125, 125, 0.35]));
			layer1.on("mouse-over", lang.hitch(this, function(evt) {
			//this.map.graphics.clear();
			var t1 = "District  : ${DTENAME}";
			var content1 = esriLang.substitute(evt.graphic.attributes, t1);
			var highlightGraphic1 = new Graphic(evt.graphic.geometry, highlightSymbol1);
			this.map.graphics.add(highlightGraphic1);
			//alert(JSON.stringify(content));
			dialog1.setContent(content1);
			//                alert("content set");
			domStyle.set(dialog1.domNode, "opacity", 0.85);
			popup.open({
			popup : dialog1,
			x : evt.pageX,
			y : evt.pageY
			});
			}));*/

			//var layer = this.map.getLayer("Administrative Boundaries")
			//console.log(layer)
		},
		closeDialog : function () {

			this.map.graphics.clear ();

			popup.close (dialog);

		},
		closeDialog1 : function () {

			this.map.graphics.clear ();

			popup.close (dialog1);

		},

		getLiveLayers : function (map) {

			for (var i = 0; i < this.configData.map.liveMaps.length; i++) {
				var layerId1 = this.configData.map.liveMaps[i].label;
				var layer1 = map.getLayer (layerId1);
				if (this.configData.map.liveMaps[i].type1 == "BaseLayer" && this.configData.map.liveMaps[i].type == "dynamic") {

					this.layerItem.layer.push (layer1);
					this.layerItem.title.push (layerId1);

				}
				else if (this.configData.map.liveMaps[i].type1 == "DepartmentLayer" && this.configData.map.liveMaps[i].type == "dynamic") {

					this.layerItem1.layer.push (layer1);
					this.layerItem1.title.push (layerId1);
				}
				else if (this.configData.map.liveMaps[i].type1 == "BaseLayer" && this.configData.map.liveMaps[i].type == "feature") {

					this.f_layerItem.layer.push (layer1);
					this.f_layerItem.title.push (layer1.id);
				}
				else if (this.configData.map.liveMaps[i].type1 == "DepartmentLayer" && this.configData.map.liveMaps[i].type == "feature") {

					this.f_layerItem1.layer.push (layer1);
					this.f_layerItem1.title.push (layer1.id);
				}

			}

		},

		setTitle : function (/*String*/title) {

			var element = query(".controllerTitle", this.domNode)[0];

			element.innerHTML = title;

		},

		setSubtitle : function (/*String*/subtitle) {
			var element = query(".controllerSubtitle", this.domNode)[0];
			element.innerHTML = subtitle;
		},
		setStatus : function (/*String*/status) {

			var element = query(".controllerStatus", this.domNode)[0];
			element.innerHTML = status;
		},

		setToolText : function (/*String*/toolText) {
			var msg = "";
			if (toolText) {
				msg = string.substitute (this.i18nStrings.msgCurrentTool, [toolText]);
			}
			this.setStatus (msg);
		},

		setRLogo : function (/*URL*/logoUrl) {

			var str = logoUrl;

			var res = str.replace ("http://js.arcgis.com/3.17/", "");
			var result = res;

			var element = query(".controllerIconRimg", this.domNode)[0];
			//domStyle.set(element, "backgroundImage", "url(" + result + ")");
			domAttr.set (element, "src", result);
		},

		setLogo : function (/*URL*/logoUrl) {

			var str = logoUrl;
			var res = str.replace ("http://js.arcgis.com/3.17/", "");
			var result = res;

			var element = query(".controllerIconimg", this.domNode)[0];
			//domStyle.set(element, "backgroundImage", "url(" + result + ")");
			domAttr.set (element, "src", result);
		},

		/*
		 setLLogo : function(logoUrl) {

		 var str = logoUrl;
		 var res = str.replace("http://js.arcgis.com/3.17/", "");
		 var result = res;

		 var element = query(".controllerIconLimg", this.domNode)[0];
		 //domStyle.set(element, "backgroundImage", "url(" + result + ")");
		 domAttr.set(element, "src", result);
		 },*/

		createMenus : function () {

			if (this.configData) {

				var nMenus = this.configData.ui.menus.length;

				var stepPct = 100 / (nMenus + 1);

				for (var i = 0; i < nMenus; i++) {

					var menuConfig = this.configData.ui.menus[i];
					menuConfig.positionAsPct = (i + 1) * stepPct;

					var menu = new mrsac.viewer.ControllerMenu (menuConfig);

					//on(menu, "onMenuItemClick", this, "onMenuItemClick");
					//menu.on("onMenuItemClick", this, "onMenuItemClick");
					connect.connect (menu, "onMenuItemClick", this, "onMenuItemClick");
					// Add menu items
					array.forEach (this.menuItemData[menuConfig.id], lang.hitch (this, function (item) {

						menu.addMenuItem (item);

					}));

					this.addChild (menu);

				}
			}
		},
		_organizeMenuItems : function () {

			this.menuItemData = {};

			// Note the ids of the menus
			for (var i = 0; i < this.configData.ui.menus.length; i++) {

				var menuConfig = this.configData.ui.menus[i];
				this.menuItemData[menuConfig.id] = [];
			}

			// Find items which have a "menu" attribute
			var itemSources = [this.configData.map.baseMaps, this.configData.map.liveMaps, this.configData.map.extents, this.configData.navTools, this.configData.widgets, this.configData.links, this.configData.navmenu];

			array.forEach (itemSources, lang.hitch (this, function (source) {

				array.forEach (source, lang.hitch (this, function (item) {
					if (item.menu && this.menuItemData[item.menu]) {

						this.menuItemData[item.menu].push (item);
					}
				}));
			}));
		},
		onMenuItemClick : function (data) {

			//console.log("User clicked on menu item", data);
			if (data && data.menuCode && data.menuCode === "links.link") {
				//  handles link events
				for (var idx in this.configData.links) {
					if (this.configData.links[idx].label === data.value) {
						var linkInfo = this.configData.links[idx];
						var wId = linkInfo.label.replace (/\W/g, "");
						window.open (linkInfo.url, wId);
						break;
					}
				}
			}
			else if (data && data.menuCode && data.menuCode === "navmenu.nav") {

				if (data.label == "TOC") {

					var element = this.legendContainer;
					var element1 = dom.byId ("map");

					domConstruct.place (element, element1);
					domStyle.set (element, "display", "block");

					legendWidget = new mrsac.viewer.legend ({
						map : this.map
					}, element);

					legendWidget.startup ();
				}
				if (data.label == "Peg Your Location") {
					// alert( "Peg Your Location");
					var element = this.legendContainer;
					var element1 = dom.byId ("map");

					domConstruct.place (element, element1);
					domStyle.set (element, "display", "block");

					legendWidget1 = new mrsac.viewer.widgets.Peglocation ({
						map : this.map
					}, element);

					legendWidget1.startup ();
				}

			}
			else {

				topic.publish ("menuItemClickedEvent", data);

			}
		},
		onMapToolChange : function (/*String*/toolName) {

			this.setToolText (toolName);
		},

		onStatusChange : function (/* String */status) {

			this.setStatus (status);
		},
		onActionBasemap : function (evt) {
			this._mouseIsOverIcon = true;
			this.delayedCheckMenuState (200);
		},
		outActionBasemap : function (evt) {
			this._mouseIsOverIcon = false;
			this.delayedCheckMenuState (50);
		},
		onMouseoverPanel : function (evt) {
			this._mouseIsOverDropDown = true;
			this.delayedCheckMenuState (200);
		},
		outMouseoverPanel : function (evt) {
			this._mouseIsOverDropDown = false;
			this.delayedCheckMenuState (50);
		},

		delayedCheckMenuState : function (/*Number*/delay) {

			if (this.timeout) {
				clearTimeout (this.timeout);
				this.timeout = null;
			}
			this.timeout = setTimeout (lang.hitch (this, function () {
				this.checkMenuState ();
			}), delay);
		},
		checkMenuState : function () {
			if (this._menuIsVisible === false) {
				// Menu isn't showing. Should it be?
				if (this._mouseIsOverIcon === true || this._mouseIsOverDropDown === true) {
					this.showMenu ();

				}
			}
			else {
				// Menu is showing. Should we hide it?
				if (this._mouseIsOverIcon === false && this._mouseIsOverDropDown === false) {

					this.hideMenu ();
				}
			}
		},
		showMenu : function () {

			var element = query(".panel", this.domNode)[0];
			domStyle.set (element, "display", "block");
			this._menuIsVisible = true;
		},
		hideMenu : function () {

			var element = query(".panel", this.domNode)[0];
			domStyle.set (element, "display", "none");
			this._menuIsVisible = false;
		},

		onActionLayer : function (evt) {
			this._mouseIsOverIconL = true;
			this.delayedCheckMenuStateL (200);
		},
		outActionLayer : function (evt) {
			this._mouseIsOverIconL = false;
			this.delayedCheckMenuStateL (50);
		},
		onMouseoverTOC : function (evt) {
			this._mouseIsOverDropDownL = true;
			this.delayedCheckMenuStateL (200);
		},
		outMouseoverTOC : function (evt) {
			this._mouseIsOverDropDownL = false;
			this.delayedCheckMenuStateL (50);
		},

		/**********department Layer*****************/
		delayedCheckMenuStateL : function (/*Number*/delay) {

			if (this.timeout) {
				clearTimeout (this.timeout);
				this.timeout = null;
			}
			this.timeout = setTimeout (lang.hitch (this, function () {
				this.checkMenuStateL ();
			}), delay);
		},
		checkMenuStateL : function () {
			if (this._menuIsVisible === false) {
				// Menu isn't showing. Should it be?
				if (this._mouseIsOverIconL === true || this._mouseIsOverDropDownL === true) {
					this.showMenuL ();

				}
			}
			else {
				// Menu is showing. Should we hide it?
				if (this._mouseIsOverIconL === false && this._mouseIsOverDropDownL === false) {

					this.hideMenuL ();
				}
			}
		},
		showMenuL : function () {

			var element = query(".panelToc", this.domNode)[0];
			domStyle.set (element, "display", "block");
			this._menuIsVisible = true;
		},
		hideMenuL : function () {

			var element = query(".panelToc", this.domNode)[0];
			domStyle.set (element, "display", "none");
			this._menuIsVisible = false;
		},

		/*************************************Projet layer*************************/
		onActionProjectlayer : function (evt) {
			this._mouseIsOverIconL1 = true;
			this.delayedCheckMenuStateL1 (200);
		},
		outActionProjectlayer : function (evt) {
			this._mouseIsOverIconL1 = false;
			this.delayedCheckMenuStateL1 (50);
		},
		onMouseoverTOC1 : function (evt) {
			this._mouseIsOverDropDownL1 = true;
			this.delayedCheckMenuStateL1 (200);
		},
		outMouseoverTOC1 : function (evt) {
			this._mouseIsOverDropDownL1 = false;
			this.delayedCheckMenuStateL1 (50);
		},
		delayedCheckMenuStateL1 : function (delay) {

			if (this.timeout) {
				clearTimeout (this.timeout);
				this.timeout = null;
			}
			this.timeout = setTimeout (lang.hitch (this, function () {
				this.checkMenuStateL1 ();
			}), delay);
		},
		checkMenuStateL1 : function () {
			if (this._menuIsVisible === false) {
				// Menu isn't showing. Should it be?
				if (this._mouseIsOverIconL1 === true || this._mouseIsOverDropDownL1 === true) {
					this.showMenuL1 ();

				}
			}
			else {
				// Menu is showing. Should we hide it?
				if (this._mouseIsOverIconL1 === false && this._mouseIsOverDropDownL1 === false) {

					this.hideMenuL1 ();
				}
			}
		},
		showMenuL1 : function () {

			var element = query(".panelToc1", this.domNode)[0];
			domStyle.set (element, "display", "block");
			this._menuIsVisible = true;
		},
		hideMenuL1 : function () {

			var element = query(".panelToc1", this.domNode)[0];
			domStyle.set (element, "display", "none");
			this._menuIsVisible = false;
		},

		/********************************application layer************************/
		onIconHover : function (evt) {
			this._mouseIsOverapp = true;
			this.delayedCheckMenuStateApp (200);
		},
		outIconHover : function (evt) {
			this._mouseIsOverapp = false;
			this.delayedCheckMenuStateApp (50);
		},
		onMouseoverapp : function (evt) {
			this._mouseIsOverDropDownApp = true;
			this.delayedCheckMenuStateApp (200);
		},
		outMouseoverapp : function (evt) {
			this._mouseIsOverDropDownApp = false;
			this.delayedCheckMenuStateApp (50);
		},
		delayedCheckMenuStateApp : function (delay) {

			if (this.timeout) {
				clearTimeout (this.timeout);
				this.timeout = null;
			}
			this.timeout = setTimeout (lang.hitch (this, function () {

				this.checkMenuStateApp ();
			}), delay);
		},
		checkMenuStateApp : function () {

			if (this._menuIsVisible === false) {
				// Menu isn't showing. Should it be?

				if (this._mouseIsOverapp === true || this._mouseIsOverDropDownApp === true) {

					this.showMenuApp ();

				}
			}
			else {
				// Menu is showing. Should we hide it?
				if (this._mouseIsOverapp === false && this._mouseIsOverDropDownApp === false) {

					this.hideMenuApp ();
				}
			}
		},
		showMenuApp : function () {

			var element = query(".appMenuClass", this.domNode)[0];

			domStyle.set (element, "display", "block");
			this._menuIsVisible = true;
		},
		hideMenuApp : function () {
			var element = query(".appMenuClass", this.domNode)[0];
			domStyle.set (element, "display", "none");
			this._menuIsVisible = false;
		},
		openRoute : function () {

			var jsonRoute = {
				"value" : "Routing",
				"label" : "Routing",
				"menuCode" : "widgets.widget",
				"status" : "true"
			};

			topic.publish ("menuItemClickedEvent", jsonRoute);
		},
		openRainfall : function () {
			var jsonRoute = {
				"value" : "Rainfall",
				"label" : "Rainfall",
				"menuCode" : "widgets.widget",
				"status" : "true"

			};

			topic.publish ("menuItemClickedEvent", jsonRoute);
		},
		openDrought : function () {
			var jsonRoute = {
				"value" : "Drought",
				"label" : "Drought",
				"menuCode" : "widgets.widget",
				"status" : "true"

			};

			topic.publish ("menuItemClickedEvent", jsonRoute);
		},
		/*****************************************************/
		responsiveMenu : function () {

			if (document.getElementById ('search').style.display == 'block') {

				document.getElementById ('controllerMenuBoxOuter').style.height = '30px';
				if (window.innerWidth <= 1200 && window.innerWidth >= 200) {
					document.getElementById ('search').style.display = 'none';
					document.getElementById ('controllerMenuBox').style.display = 'none';
				}
				if (window.innerWidth <= 1000 && window.innerWidth >= 691) {
					document.getElementById ('search').style.display = 'none';
					document.getElementById ('controllerMenuBox').style.display = 'none';
					document.getElementById ('aa').style.display = 'none';
				}
				if (window.innerWidth <= 499 && window.innerWidth >= 416) {
					document.getElementById ('search').style.display = 'none';
					document.getElementById ('controllerMenuBox').style.display = 'none';
					document.getElementById ('aa').style.display = 'none';
					document.getElementById ('projectDiv').style.display = 'none';
					document.getElementById ('basemapControlDiv_T').style.display = 'none';

				}
				if (window.innerWidth <= 415) {
					document.getElementById ('search').style.display = 'none';
					document.getElementById ('controllerMenuBox').style.display = 'none';
					document.getElementById ('aa').style.display = 'none';
					document.getElementById ('projectDiv').style.display = 'none';
					document.getElementById ('basemapControlDiv_T').style.display = 'none';
					document.getElementById ('basemapControlDiv').style.display = 'none';
				}

			}
			else {

				document.getElementById ('search').style.display = 'block';
				document.getElementById ('controllerMenuBox').style.display = 'block';
				document.getElementById ('aa').style.display = 'block';
				document.getElementById ('projectDiv').style.display = 'block';
				document.getElementById ('basemapControlDiv_T').style.display = 'block';
				document.getElementById ('basemapControlDiv').style.display = 'block';

				if (window.innerWidth <= 1200 && window.innerWidth >= 200) {
					document.getElementById ('controllerMenuBoxOuter').style.height = '67px';
				}
				if (window.innerWidth <= 1000 && window.innerWidth >= 691) {
					document.getElementById ('controllerMenuBoxOuter').style.height = '91px ';
				}
				if (window.innerWidth <= 499 && window.innerWidth >= 416) {
					document.getElementById ('controllerMenuBoxOuter').style.height = '120px';
				}
				if (window.innerWidth <= 415) {
					document.getElementById ('controllerMenuBoxOuter').style.height = '192px';
				}
			}
		}
	});
});
