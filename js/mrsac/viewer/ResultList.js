define(["viewer/ResultItem", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/on", "dojo/_base/array", "dojo/_base/connect"], function(ResultItem, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, on, array, connect) {

	return declare("mrsac.viewer.ResultList", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		constructor : function(/*Object*/params) {
			this.connects = [];
		},

		templateString : "<div class='resultsPane' dojoAttachPoint='containerNode'></div>",

		count : 0,
		name : "",
		suppressImages : true,
		add : function(/*Object|ResultItem*/obj) {
			try {
				if (obj) {

					var item = null;
					if (obj.declaredClass === "mrsac.viewer.ResultItem") {

						item = obj;

					} else {
						if (this.suppressImages) {

							obj.suppressImages = true;

						}

						item = new mrsac.viewer.ResultItem(obj);

					}

					//item.applyAlternateBackground(this.count % 2 !== 0);

					this.addChild(item);

					this.count++;
					

					this.connects.push(connect.connect(item, "onClick", this, "onResultClick"));

					this.connects.push(connect.connect(item, "onHover", this, "onResultHover"));
					this.connects.push(connect.connect(item, "onAction", this, "onResultAction"));

				}
			} catch (err) {
				console.error("Error adding ResultItem", err);
			}
		},
		themeclear : function() {
			array.forEach(this.themeconnects, function(x) {

				x.remove();

			});

			this.themeconnects = [];

			var children = this.getChildren();

			array.forEach(children, function(x) {

				x.destroyRecursive();

			});

			this.count = 0;

			//this.onResultClick({});

			// empty event object
		},
		clear : function() {

			array.forEach(this.connects, function(x) {

				x.remove();

			});

			this.connects = [];

			var children = this.getChildren();

			array.forEach(children, function(x) {

				x.destroyRecursive();

			});

			this.count = 0;

			//this.onResultClick({});

			// empty event object
		},
		selectFirstItem : function() {
			var children = this.getChildren();
			this.onResultClick({
				resultItem : children[0]
			});

		},

		onResultClick : function(evt) {
			// stub for events
			//console.debug("onResultClick");
			//console.dir(evt);
		},

		onResultHover : function(evt) {
			// stub for events
			//console.debug("onResultHover");
			//console.dir(evt);
		},

		onResultAction : function(evt) {
			// stub for events
			//console.debug("onResultAction");
			//console.dir(evt);
		},
	});
});

