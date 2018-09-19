define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/Draw.html", "dojo/dom", "dojo/on", "dojo/_base/array", "dojo/_base/lang", "viewer/ResultList", "esri/toolbars/draw", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/symbols/Font", "esri/Color", "dojo/dom-style", "esri/tasks/QueryTask", "esri/tasks/query", "dojo/store/Memory", "dojo/query", "dojo/topic", "dijit/form/Textarea", "dijit/form/Form", "dijit/form/Button", "dijit/form/FilteringSelect", "dijit/form/DropDownButton", "dijit/ColorPalette"], function(_BaseWidget, declare, template, dom, on, array, lang, ResultList, Draw, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, Font, Color, domStyle, QueryTask, Query, Memory, query, topic) {

	return declare("mrsac.viewer.widgets.Draw", [mrsac.viewer._BaseWidget], {

		templateString : template,
		tb : null,
		tb1 : null,

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
			if (evt && evt.target) {

				switch (evt.target.id) {
					case ("SearchPOINT"):
						this.tb.activate(Draw.POINT);

						break;
					case ("SearchLINE"):
						this.tb.activate(Draw.LINE);

						break;
					case ("SearchPOLYLINE"):
						this.tb.activate(Draw.POLYLINE);

						break;
					case ("SearchFREEHAND_POLYLINE"):
						this.tb.activate(Draw.FREEHAND_POLYLINE);

						break;
					case ("SearchPOLYGON"):
						this.tb.activate(Draw.POLYGON);

						break;

					default:
						console.error("Unknown toolbutton pressed: " + evt.target.id);
						return;

				}

			}
		},
		doBuffer : function(evtObj) {
			console.log(evtObj)
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
					/*
					 var queryTaskRo = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/education/school_mapping/MapServer/0");

					 var queryRo = new Query();

					 queryRo.outFields = ["*"];

					 queryRo.returnGeometry = true;

					 queryRo.outSpatialReference = {
					 "wkid" : 102100
					 };

					 queryRo.geometry = geometry.getExtent();
					 queryTaskRo.execute(queryRo, lang.hitch(this, this.showSchool));*/

					break;
			}

			var graphic = new Graphic(geometry, symbol);
			this.map.graphics.add(graphic);

		},
		showSchool : function(featureSet1) {
			var resultFeatures = featureSet1.features;
			//console.log(resultFeatures)

			var jsonRoute = {
				"value" : "Find School",
				"label" : "Find School",
				"menuCode" : "widgets.widget",
				"status" : "true"

			}

			topic.publish("menuItemClickedEvent", jsonRoute);

			topic.publish("schoolList", resultFeatures);

		},
		new_fun : function(evt) {

			this.tb1 = new Draw(this.map);
			this.tb1.activate(Draw.POINT);
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

			domStyle.set(evt.target.id, "background-color", "rgb(222, 184, 135)");
			this.tb1.on("draw-end", lang.hitch(this, function(a) {
				this.tb1.deactivate();
				var geom = a.geometry
				var font = new Font(this.registry2.value, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, this.registry.value);

				var symbol = new TextSymbol();
				symbol.setText(dom.byId("tsText").value);
				symbol.setColor(new Color(this.registry1.value));
				symbol.setFont(font);
				var graphic = new Graphic(geom, symbol);
				this.map.graphics.add(graphic);
			}));

		},

		clear : function(evt) {
			console.log(evt)
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}

			domStyle.set(evt.target.id, "background-color", "rgb(222, 184, 135)");
			dom.byId("tsText").value = "";
			dom.byId("fontT").value = "";
			dom.byId("fontS").value = "";
			this.map.graphics.clear();

		},

		shutdown : function() {
			this.tb.deactivate();
			this.map.graphics.clear();
			for ( i = 0; i < query(".toolbutton", this.domNode).length; i++) {

				domStyle.set(query(".toolbutton",this.domNode)[i], "background-color", "whitesmoke");
			}
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			document.getElementById("map_container").style.cursor = "auto";
		},
	});
});
