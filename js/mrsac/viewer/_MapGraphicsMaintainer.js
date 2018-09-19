define(["dojo/_base/declare", "dojo/on", "dojo/_base/array", "dojo/_base/lang", "esri/geometry/Geometry", "dojo/topic", "dojo/_base/connect"], function(declare, on, array, lang, Geometry, topic, connect) {
	return declare("mrsac.viewer._MapGraphicsMaintainer", null, {
		connectMapClick : function() {
			// Listen to map clicks for clicking on graphics
			if (this.map) {

				this.connects.push(connect.connect(this.map, "onClick", this, "onMapClick"));
			}
		},
		addGraphic : function(g) {

			try {
				if (this.map && g) {
					// add a property to the graphic
					g.owner = this.title;
					this.map.graphics.add(g);

				}
			} catch (err) {
				console.error("Error adding graphic: " + err);
			}
		},
		clearGraphics : function() {

			// Find graphics marked as being owned by this widget
			if (this.map) {

				try {
					for (var i = this.map.graphics.graphics.length - 1; i >= 0; i--) {

						var g = this.map.graphics.graphics[i];
						if (this.isMyGraphic(g)) {
							this.map.graphics.remove(g);
						}
					}
				} catch (err) {
					console.error("Error clearing graphics: " + err);
				}
			}
		},
		isMyGraphic : function(/*esri.Graphic*/g) {
			return (g && g.owner && g.owner === this.title);
		},
		onMapClick : function(evt) {

			// See if we clicked on a graphic
			if (this.map) {
				if (!evt.graphic) {

					array.forEach(this.map.graphics.graphics, lang.hitch(this, function(g, idx) {
						if (this.isMyGraphic(g)) {
							var p = this.map.toScreen(g.geometry);
							var dist = Geometry.getLength(evt.screenPoint, p);

							if (dist < 20) {//pixels
								evt.graphic = g;

							}
						}
					}));
				}
				if (evt.graphic) {

					if (this.isMyGraphic(evt.graphic)) {

						topic.publish("widgetHighlightEvent", evt.graphic, evt.graphic.geometry);

					}
				}
			}
		}
	});
});
