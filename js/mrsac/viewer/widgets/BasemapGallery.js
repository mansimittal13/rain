define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/BasemapGallery.html", "esri/dijit/BasemapGallery", "dojo/query", "dojo/NodeList-traverse"], function(_BaseWidget, declare, template, BasemapGallery, query) {

	return declare("mrsac.viewer.widgets.BasemapGallery", [mrsac.viewer._BaseWidget], {

		//templateString : "<div id ='basemapGallery'></div>",

		templateString : template,
		_initialized : false,

		contentNode : null,
		p : null,
		q : null,

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
				this.creategallery();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}
		},
		creategallery : function() {

			var basemapGallery = new BasemapGallery({
				showArcGISBasemaps : true,
				map : this.map
			}, "basemapgallerydiv");
			basemapGallery.startup();

			basemapGallery.on("error", function(msg) {

		
				console.log("basemap gallery error:  ", msg);
			});

		}
	});
});

