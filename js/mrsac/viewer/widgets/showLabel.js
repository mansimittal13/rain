define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/text!./templates/showLabel.html", "dojo/store/Memory", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/renderers/SimpleRenderer", "esri/layers/LabelLayer", "esri/layers/LabelClass", "esri/Color", "dijit/form/FilteringSelect", "dijit/form/DropDownButton", "dijit/ColorPalette"], function(_BaseWidget, declare, lang, array, template, Memory, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, SimpleRenderer, LabelLayer, LabelClass, Color) {

	return declare("mrsac.viewer.widgets.showLabel", [mrsac.viewer._BaseWidget], {

		constructor : function() {

			//	layerInfos = [];
		},
		layerInfos : null,
		layer1 : null,

		templateString : template,

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

				this.getMaplayers();
				//this.getAllLayers();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}

		},
		getMaplayers : function(a) {
			console.log(this.map.graphicsLayerIds);
			
			var layerInfos = [];

			array.forEach(this.map.graphicsLayerIds, lang.hitch(this, function(id) {
				var values = [];
				var layer = this.map.getLayer(id);
				if (layer.url != null) {
					var e_info = {
						layer : layer,
						name : layer.id
					};
					layerInfos.push(e_info);
				}

			}));
			console.log("layerInfos");
           console.log(layerInfos);
			var dataItems = {
				identifier : 'name',
				label : 'name',
				items : layerInfos
			};
			var store = new Memory({
				data : dataItems
			});

			this.agri.set('store', store);

		},
		getTaluka : function(a) {
			var values = [];
			var layer = this.map.getLayer(a);

			array.forEach(layer.fields, lang.hitch(this, function(feature2) {
				if ((feature2.type !== "esriFieldTypeOID") && (feature2.type !== "esriFieldTypeGeometry") && (feature2.name !== "Shape_Area") && (feature2.name !== "Shape_Length") && (feature2.name !== "Shape_Leng") && (feature2.name !== "OBJECTID")) {
					values.push({
						field : feature2.name + "_" + layer.id,
						name : feature2.alias
					});
				}

			}));
			var dataItems = {
				identifier : 'field',
				label : 'name',
				items : values
			};
			var store = new Memory({
				data : dataItems
			});

			this.agri1.set('store', store);
		},
		getVillage : function(val) {

			this.value = val
			var value1 = this.value
			var g = value1.lastIndexOf("_");

			var labelField = value1.substring(0, g)

			var valueLayer = value1.substring(g + 1)

			this.layer1 = this.map.getLayer(valueLayer);

			//alert(this.registry1.value)
			if (this.registry1.value != null) {
				//symbol.setColor(new Color(this.registry1.value));
				var statesColor = new Color(this.registry1.value);
			} else {
				var statesColor = new Color("#29B6F6");

			}

			var statesLine = new SimpleLineSymbol("solid", statesColor, 1.5);
			var statesSymbol = new SimpleFillSymbol("solid", statesLine, null);
			var statesRenderer = new SimpleRenderer(statesSymbol);

			var statesLabel = new TextSymbol().setColor(statesColor);
			statesLabel.font.setSize("12pt");
			statesLabel.font.setFamily("arial");
			var statesLabelRenderer = new SimpleRenderer(statesLabel);

			var json = {
				"labelExpressionInfo" : {

					"value" : "{" + labelField + "}"
				}
			};

			var labelClass = new LabelClass(json);
			labelClass.symbol = statesLabel;
			// symbol also can be set in LabelClass' json
			this.layer1.setLabelingInfo([labelClass]);

		},
		showLabel : function() {
			array.forEach(this.map.graphicsLayerIds, lang.hitch(this, function(id) {

				var getLayer = this.map.getLayer(id);
				getLayer.setVisibility(false)

			}));
			var legendValue = document.getElementById("labelToggle").innerHTML
			var value1 = this.value
			var g = value1.lastIndexOf("_");

			var labelField = value1.substring(0, g)

			var valueLayer = value1.substring(g + 1)

			this.layer1 = this.map.getLayer(valueLayer);

			//alert(this.registry1.value)
			if (this.registry1.value != null) {
				//symbol.setColor(new Color(this.registry1.value));
				var statesColor = new Color(this.registry1.value);
			} else {
				var statesColor = new Color("#29B6F6");

			}

			var statesLine = new SimpleLineSymbol("solid", statesColor, 1.5);
			var statesSymbol = new SimpleFillSymbol("solid", statesLine, null);
			var statesRenderer = new SimpleRenderer(statesSymbol);

			var statesLabel = new TextSymbol().setColor(statesColor);
			statesLabel.font.setSize("14pt");
			statesLabel.font.setFamily("arial");
			var statesLabelRenderer = new SimpleRenderer(statesLabel);

			var json = {
				"labelExpressionInfo" : {

					"value" : "{" + labelField + "}"
				}
			};

			var labelClass = new LabelClass(json);
			labelClass.symbol = statesLabel;
			// symbol also can be set in LabelClass' json
			this.layer1.setLabelingInfo([labelClass]);

			if (legendValue == "Show Label") {
				this.layer1.setVisibility(true)
				document.getElementById("labelToggle").innerHTML = "Hide Label"

			} else if (legendValue == "Hide Label") {
				this.layer1.setVisibility(false)
				document.getElementById("labelToggle").innerHTML = "Show Label"
			}
		},
	});
});

