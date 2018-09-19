define(["viewer/_BaseWidget", "viewer/_MapGraphicsMaintainer", "viewer/ResultList", "dojo/_base/declare", "dojo/text!./templates/locatebyname.html", "js/mrsac/viewer/widgets/nls/LocateWidgetStrings.js", "esri/geometry/webMercatorUtils", "dijit/form/Button", "dijit/form/NumberTextBox", "esri/tasks/locator", "esri/tasks/ProjectParameters", "dojo/_base/connect", "dojo/_base/lang", "esri/tasks/GeometryService", "dojo/_base/array", "dojo/store/Memory", "esri/symbols/PictureMarkerSymbol", "dojo/query", "dojo/dom", "dojo/dom-style", "dojo/string", "esri/graphic", "dojo/topic", "esri/geometry/Point", "esri/SpatialReference", "dijit/form/FilteringSelect"], function(_BaseWidget, _MapGraphicsMaintainer, ResultList, declare, template, LocateWidgetStrings, webMercatorUtils, Button, NumberTextBox, Locator, ProjectParameters, connect, lang, GeometryService, array, Memory, PictureMarkerSymbol, query, dom, domStyle, string, Graphic, topic, Point, SpatialReference) {

	return declare("mrsac.viewer.widgets.locatebyname", [mrsac.viewer._BaseWidget, mrsac.viewer._MapGraphicsMaintainer], {

		constructor : function(/*Object*/params) {
			this.locatorFields = [];
		},

		templateString : template,

		_initialized : false,

		locatorUrl : "",
		locator : null,

		geometryUrl : "",
		geometry : null,

		iconUrl : "",
		ReiconUrl : "",
		smallIconUrl : "",
		symbol : null,
		closeUrl : "",

		loaderNode : null,
		messageNode : null,

		i18nStrings : null,

		postMixInProperties : function() {

			try {

				this.inherited(arguments);

				if (this.configData) {

					this.geometryUrl = this.configData.locate.geometry;
					this.locatorUrl = this.configData.locate.locator;
					this.minGeocodeScore = parseInt(this.configData.locate.minGeocodeScore, 10);

					// Init the locator
					this.locator = new Locator(this.locatorUrl);
					this.locator.on("address-to-locations-complete", lang.hitch(this, "showResults"));
					// Init the geometry service
					this.geometry = new GeometryService(this.geometryUrl);
					connect.connect(this.geometry, "project-complete", lang.hitch(this, "projectCallback"));
				}
				this.i18nStrings = LocateWidgetStrings;

			} catch (err) {

				console.error(err);
			}

		},
		postCreate : function() {

			try {
				this.inherited(arguments);
				// Init the loader animation
				this.loaderNode = query(".loader", this.domNode)[0];
				this.loaderNode.src = require.toUrl("/portal/js/mrsac/viewer/assets/images/loader.gif");

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
				this.closeUrl = "js/mrsac/viewer/assets/images/small_icons/close.png";
				// Projections dropdown
				var projData = {
					identifier : "wkid",
					label : "name",
					items : []
				};
				array.forEach(this.configData.locate.projections, lang.hitch(this, function(info) {
					if (info.wkid === -1) {
						info.name = this.i18nStrings.defaultProjectionName;
					}
					projData.items.push(info);
				}));

				var dataStore = new Memory({
					data : projData
				});

				this.iconUrl = require.toUrl("js/mrsac/viewer/" + this.icon);

				var str = this.iconUrl;
				this.ReiconUrl = str.replace("http://js.arcgis.com/3.17/", "");
				this.smallIconUrl = mrsac.viewer.util.getSmallIcon(this.ReiconUrl);

				this.symbol = new PictureMarkerSymbol(this.ReiconUrl, 40, 40);

				// Attach button click events

				this.connects.push(connect.connect(this.widgets.btnLocateAddress, "onClick", this, "onAddressLocate"));
				this.connects.push(connect.connect(this.widgets.btnClearAddress, "onClick", this, "onAddressClear"));

				// Grab the message node for future use
				this.messageNode = query(".resultsMsg", this.domNode)[0];

				this.setMessage(this.i18nStrings.msgReady);

				// Listen to result selection messages
				this.connects.push(connect.connect(this.widgets.results, "onResultClick", this, "onResultClick"));
				this.connects.push(connect.connect(this.widgets.results, "onResultHover", this, "onResultHover"));

				this._initialized = true;

			} catch (err) {
				console.error(err);
			}
		},
		onAddressLocate : function() {

			this.clearGraphics();
			this.messageNode.innerHTML = "";
			this.widgets.results.clear();
			this.loadmrsac();
			this.map.graphics.clear();
			var address = {
				"SingleLine" : dom.byId("address").value
			};
			this.locator.outSpatialReference = this.map.spatialReference;
			var options = {
				address : address,
				outFields : ["Loc_name"]
			};
			this.locator.addressToLocations(options);

		},
		showResults : function(evt) {

			var locations = [];

			array.forEach(evt.addresses, lang.hitch(this, function(c) {

				if ((!this.minGeocodeScore) || (this.minGeocodeScore && c.score >= this.minGeocodeScore)) {
					var attrs = {
						"title" : c.address,
						"content" : this.i18nStrings["resultScore"] + ": " + c.score
					};

					if (!c.location.spatialReference) {
						c.location.spatialReference = this.map.spatialReference;
					}

					var g = new Graphic(c.location, this.symbol, attrs);

					var params = {
						title : attrs.title,
						content : attrs.content,
						iconUrl : this.smallIconUrl,
						graphic : g,
						location : c.location,
						closeU : this.closeUrl,
						map : this.map,
					};
					this.widgets.results.add(params);
					this.addGraphic(g);
					locations.push(params);

				}
			}));

			var msg = this.i18nStrings["msgFound"];

			msg = string.substitute(msg, [this.widgets.results.count]);

			this.setMessage(msg);

			this.widgets.results.selectFirstItem();

			topic.publish("widgetLocationsChangedEvent", {
				source : this.title,
				locations : locations
			});
			this.onShowPanel(1);
			this.unloadmrsac();
		},
		setMessage : function(/*String*/message, /*boolean*/showLoading) {

			this.messageNode.innerHTML = message;

			if (showLoading) {
				domStyle.set(this.loaderNode, "visibility", "visible");
			} else {
				domStyle.set(this.loaderNode, "visibility", "hidden");
			}
		},
		onAddressClear : function(evt) {
			dom.byId("address").value = "";

			this.messageNode.innerHTML = "";

			this.widgets.results.clear();
			topic.publish("widgetLocationsChangedEvent", [{
				source : this.title,
				locations : []
			}]);

			this.clearGraphics();

			topic.publish("widgetHighlightEvent", [null]);

		},

		onClear : function(evt) {

			dom.byId("address").value = "";
			this.messageNode.innerHTML = "";

			this.widgets.results.clear();

			topic.publish("widgetLocationsChangedEvent", [{
				source : this.title,
				locations : []
			}]);

			this.clearGraphics();

			topic.publish("widgetHighlightEvent", [null]);

		},

		projectCallback : function(/*esri.Graphic[]*/graphics) {

			var attrs = {
				"title" : this.i18nStrings["resultTitle"],
				"content" : "X: " + x + ", Y: " + y
			};
			var x = this.widgets.longitude.getValue();
			var y = this.widgets.latitude.getValue();
			var pt = new Point(x, y, this.map.spatialReference);
			var g = graphics[0];

			if (g) {

				this.widgets.results.add({
					title : attrs.title,
					content : attrs.content,
					iconUrl : this.smallIconUrl,
					graphic : g,
					location : pt,
					closeU : this.closeUrl,
					map : this.map
				});

				var msg = this.i18nStrings["msgFound"];
				msg = string.substitute(msg, [1]);
				this.setMessage(msg);

				this.addGraphic(g, this.symbol);
				this.widgets.results.selectFirstItem();

			}
			this.unloadmrsac()
		},

		onResultClick : function(evt) {

			if (evt.resultItem) {
				topic.publish("widgetHighlightEvent", evt.resultItem.graphic, evt.resultItem.location, true);
			} else {
				topic.publish("widgetHighlightEvent", null);
			}
		},

		onResultHover : function(evt) {

			if (evt.resultItem) {
				topic.publish("widgetHighlightEvent", evt.resultItem.graphic, evt.resultItem.location, false);
			} else {
				topic.publish("widgetHighlightEvent", null);
			}
		},

		shutdown : function() {

			this.onShowPanel(0);
			this.clearGraphics();

			this.messageNode.innerHTML = "";

			this.widgets.results.clear();
			topic.publish("widgetLocationsChangedEvent", [{
				source : this.title,
				locations : []
			}]);

			topic.publish("widgetHighlightEvent", null);

			this.inherited(arguments);
		},
	});
});

