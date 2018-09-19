define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/Measurement.html", "esri/dijit/Measurement", "dojo/dom", "dojo/on", "dojo/_base/lang", "esri/graphic", "esri/layers/GraphicsLayer", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/Font", "esri/symbols/TextSymbol", "esri/Color"], function(_BaseWidget, declare, template, Measurement, dom, on, lang, Graphic, GraphicsLayer, SimpleLineSymbol, SimpleFillSymbol, Font, TextSymbol, Color) {

	return declare("mrsac.viewer.widgets.Measurement", [mrsac.viewer._BaseWidget], {

		templateString : template,

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
				sym = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#616161"), 3), new Color([97, 97, 97, 0.5]));

				this.createmeasurement();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}

		},
		createmeasurement : function() {
			this.measureL = new GraphicsLayer();
			this.map.addLayer(this.measureL);

			measurement = new Measurement({
				map : this.map,
				//lineSymbol : symbol,
				fillSymbol : sym
			}, this.measurementDiv);
			measurement.startup();

			measurement.on("measure-end", lang.hitch(this, this.new_fun));

		},
		new_fun : function(evt) {
			this.measureL.clear();
			switch (evt.geometry.type) {

				case ("polygon"):
					var poly = evt.geometry
					console.log(evt)
					var ext = poly.getExtent();
					loc = ext.getCenter();
					var font = new Font("14pt", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
					var symbol = new TextSymbol();
					symbol.setText(evt.values.toFixed(3) + " " + evt.unitName);
					symbol.setFont(font);
					symbol.setColor(new Color("blue"));

					var graphic = new Graphic(loc, symbol);
					this.measureL.add(graphic);
					//this.map.graphics.add(graphic);
					break;
			}

		},

		clearResults : function() {
			this.map.graphics.clear();
			this.measureL.clear();
			measurement.setTool("location", false);
			measurement.setTool("distance", false);
			measurement.setTool("area", false);
			measurement.clearResult();
		},
		shutdown : function() {
			this.map.graphics.clear();
			this.measureL.clear();
			measurement.setTool("location", false);
			measurement.setTool("distance", false);
			measurement.setTool("area", false);
			measurement.clearResult();

		}
	});
});

