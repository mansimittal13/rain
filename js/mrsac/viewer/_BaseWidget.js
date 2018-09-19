define(["viewer/_Widget", "dojo/_base/declare", "dojo/text!./templates/_BaseWidget.html", "dijit/registry", "dojo/topic", "dojo/dom", "dojo/query", "dojo/dom-attr", "dojo/_base/array", "dojo/dom-style", "dojo/_base/connect", "dojo/_base/xhr", "dojo/_base/lang", "dijit/registry", "esri/geometry/Extent", "esri/geometry/Point", "esri/geometry/Circle", "esri/geometry/webMercatorUtils", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "dojo/_base/Color"], function(_Widget, declare, template, registry, topic, dom, query, domAttr, array, domStyle, connect, xhr, lang, registry, Extent, Point, Circle, webMercatorUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color) {

	return declare("mrsac.viewer._BaseWidget", mrsac.viewer._Widget, {
		constructor : function(/*Object*/params) {

			this.connects = [];
			this.widgets = {};

		},
		_module : "js/mrsac/viewer",
		templateString : template,
		panels : null,
		panelIndex : -1,
		configUrl : "",
		configData : null,
		configDataType : "",

		postMixInProperties : function() {

			//console.log("_BaseWidget postMixInProperties " + this.title);
			if (this.icon === "") {
				this.icon = "assets/images/icons/i_pushpin.png";
			}
			if (this.config !== "") {
				// Triggers XHR call for the config file
				this.setConfig(this.config);

			}
		},

		postCreate : function() {

			//console.log("_BaseWidget postCreate " + this.title);
			// Wire up the map
			try {

				this.setMap(registry.byId("map"));

			} catch (err) {
				console.error(err);
			}

			// If there are multiple panels, show the first only
			this.panels = query(".widgetPanel", this.domNode);

			this.panels.forEach(function(item, idx, arr) {
				item.buttonIcon = domAttr.get(item, "buttonIcon");
				item.buttonText = domAttr.get(item, "buttonText");
			});

			this.showPanel(0);

			//console.log("_BaseWidget postCreate finished");
		},

		onShowPanel : function(index) {

			// Listened to by WidgetFrame. Allows widget to request that the
			// Frame resize and show the indicated panel
		},
		showPanel : function(/*Number*/index) {

			this.panelIndex = index;
			//console.log(this.panels)
			array.forEach(this.panels, function(item, idx, arr) {

				if (idx === index) {

					domStyle.set(item, "display", "block");

					//domStyle.set(item, "border", "2px solid burlywood");

				} else {

					domStyle.set(item, "display", "none");

				}
			});

		},

		startup : function() {

			if (this._started) {
				return;
			}

			//console.log("_BaseWidget startup " + this.title);

			// Pass to children
			var children = this.getChildren();

			array.forEach(children, function(child) {

				child.startup();

			});

			// Interact with the WidgetFrame
			var frame = this.getParent();

			if (frame && frame.declaredClass === "mrsac.viewer.WidgetFrame") {

				this.connects.push(connect.connect(this, "onShowPanel", frame, "selectPanel"));

				//this.connects.push(on(this, "onShowPanel", frame, "selectPanel"));

			}

			// If the class mixes in _MapGraphicsMaintainer, init it
			if (this.connectMapClick) {
				this.connectMapClick();
			}

			this.inherited(arguments);

		},

		shutdown : function() {
			// subclasses override to cleanup on closing
		},

		uninitialize : function() {
			console.log("_BaseWidget uninitialize");
			array.forEach(this.connects, function(handle) {
				handle.remove();
			});
			this.connects = [];
		},
		setConfig : function(/* String */config) {

			this.inherited(arguments);

			var originalurl = require.toUrl(this._module + "/" + config);
			//var originalurl = require.toUrl(config);

			var str = originalurl;
			var res = str.replace("http://js.arcgis.com/3.17/", "");

			this.configUrl = res;

			if (this.config) {

				if (this.config.match("\.json$")) {
					// Ends with .json -> parse JSON
					this.configDataType = "json";
				} else if (this.config.match("\.xml$")) {
					// Ends with .xml -> parse XML
					this.configDataType = "xml";
				} else {
					// Load plain text
					this.configDataType = "text";
				}

				var params = {
					url : this.configUrl,

					sync : true,
					handleAs : this.configDataType
				};

				params.load = lang.hitch(this, function(response, ioArgs) {

					//console.log("_BaseWidget::setConfig::load success");
					this.configData = response;
					return response;
					// Always return response
				});

				params.error = function(response, ioArgs) {
					console.error("failed to retrieve config for Widget", response, ioArgs);
					return response;
					// Always return response
				};

				xhr.get(params);

			}
		},
		getAllNamedChildDijits : function() {

			// Gather all child widgets
			var w = query("[widgetId]", this.containerNode || this.domNode);

			//console.dir(w);
			var children = w.map(registry.byNode);

			this.widgets = {};

			children.forEach(lang.hitch(this, function(item, idx) {

				if (item.name) {

					this.widgets[item.name] = item;

				}
			}));
		},
		loadmrsac : function() {
			var element = dom.byId('divLoadingIndicator');

			domStyle.set(element, "display", "block");

		},
		unloadmrsac : function() {
			var element = dom.byId('divLoadingIndicator');

			domStyle.set(element, "display", "none");

		},
		loadmrsacgp : function() {
			alert("loadmrsacgp")
			var element = dom.byId('divLoadingIndicatornew');

			domStyle.set(element, "display", "block");

		},
		unloadmrsacgp : function() {
			var element = dom.byId('divLoadingIndicatornew');

			domStyle.set(element, "display", "none");

		},
		finalGraphic : function(drawG, stroke, fill) {

			var symbol;

			switch (drawG.geometry.type) {

				case "point":
					symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(fill), 2), new Color(stroke));
					break;

				case "polyline":
					symbol = new SimpleLineSymbol();
					symbol.setStyle(SimpleLineSymbol.STYLE_SOLID);
					symbol.setWidth(5);
					symbol.setColor(new Color(stroke));
					break;

				case "polygon":
					symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(stroke), 1), new Color(fill));
					break;
			}
			return symbol;

		},
	});
});
