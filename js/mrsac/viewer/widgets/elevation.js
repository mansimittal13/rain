define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/elevation.html", "dojo/dom", "dojo/on", "dojo/_base/array", "dojo/_base/lang", "viewer/ResultList", "esri/toolbars/draw", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/Color", "dojo/dom-style", "esri/tasks/QueryTask", "esri/tasks/query", "dojo/store/Memory", "esri/units", "esri/dijit/ElevationProfile", "dojo/query", "dojo/dom-style", "dojo/dom-construct", "dijit/form/Textarea", "dijit/form/Form", "dijit/form/Button", "dijit/form/FilteringSelect", "dijit/form/DropDownButton"], function(_BaseWidget, declare, template, dom, on, array, lang, ResultList, Draw, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, domStyle, QueryTask, Query, Memory, Units, ElevationsProfileWidget, query, domStyle, domConstruct) {

	return declare("mrsac.viewer.widgets.elevation", [mrsac.viewer._BaseWidget], {

		templateString : template,
		tb : null,
		tb1 : null,
		epWidget : null,

		postMixInProperties : function() {

			try {

				this.inherited(arguments);

				if (this.configData) {

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
				var chartOptions = {
					title : "Elevation Profile Chart",
					chartTitleFontSize : 7,
					axisTitleFontSize : 7,
					axisLabelFontSize : 7,
					indicatorFontColor : '#eee',
					indicatorFillColor : '#666',
					titleFontColor : '#000000',
					axisFontColor : '#040404',
					axisMajorTickColor : '#000000',
					skyTopColor : "#B0E0E6",
					skyBottomColor : "#4682B4",
					waterLineColor : "#000000",
					waterTopColor : "#ADD8E6",
					waterBottomColor : "#0000FF",
					elevationLineColor : "#D2B48C",
					elevationTopColor : "#8B4513",
					elevationBottomColor : "#CD853F"
				};

				this.epWidget = new ElevationsProfileWidget({
					map : this.map,
					profileTaskUrl : "http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer",
					scalebarUnits : Units.MILES,
					chartOptions : chartOptions
					//measureUnits : this.registry.value

				}, this.profileChartNode);
				var element = query(".esriElevationProfileLabel", this.domNode)[0];
				domStyle.set(element, "color", "black");

				this.epWidget.startup();

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
			this.epWidget.clearProfile();
			this.map.graphics.clear();
			if (evt && evt.target) {

				switch (evt.target.id) {
					case ("SearchPOLYLINE1"):
						this.tb.activate(Draw.POLYLINE);

						break;
					case ("SearchFREEHAND_POLYLINE1"):
						this.tb.activate(Draw.FREEHAND_POLYLINE);
						break;

					default:
						console.error("Unknown toolbutton pressed: " + evt.target.id);
						return;

				}

			}

		},
		doBuffer : function(evtObj) {
			this.loadmrsac();

			this.tb.deactivate();
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

			var graphic = new Graphic(geometry, symbol);

			this.map.graphics.add(graphic);

			this.epWidget.set("profileGeometry", geometry);

			var sel = this.registry.value;

			this.epWidget.set("measureUnits", sel);
			on(this.epWidget, 'update-profile', lang.hitch(this, function(e) {

				this.unloadmrsac();

			}));

		},

		clear : function(evt) {
			console.log(evt)
			console.log(evt.target.id)
			this.epWidget.clearProfile();

			this.map.graphics.clear();
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

			domStyle.set(evt.target.id, "background-color", "rgb(222, 184, 135)");

		},

		shutdown : function() {
			this.tb.deactivate();
			this.map.graphics.clear();
			this.epWidget.clearProfile();
			var refNodedirr = dom.byId("record");

			domConstruct.empty(refNodedirr);

			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

		},
	});
});
