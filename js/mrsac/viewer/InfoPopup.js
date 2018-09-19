

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/InfoPopup.html", "dojo/_base/connect", "dojo/dom", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/array", "dojo/sniff", "dojo/query", "dojo/dom-attr", "esri/geometry/Point","dojo/_base/fx",], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, connect, dom, domGeom, domStyle, array, has, query, domAttr, Point,fx) {

	return declare("mrsac.viewer.InfoPopup", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		constructor : function(/*Object*/params) {
			this.connects = [];
		},

		templateString : template,
		map : null,
		visible : false,
		coords : null,
		screenCoords : null,
		link : "",
		alignment : "",
		postCreate : function() {
			if (this.map) {
				this.connects.push(connect.connect(this.map, "onExtentChange", this, "extentChangeHandler"));
				this.connects.push(connect.connect(this.map, "onPan", this, "panHandler"));
			}
			dom.setSelectable(this.domNode, false);

			var boxContainerMargin = domGeom.getMarginBox(this.containerNode);
			var boxPopupContent = domGeom.getMarginBox(this.domNode);
			boxContainerMargin.w = boxPopupContent.w;
			domGeom.getMarginBox(this.containerNode, boxContainerMargin);
			domStyle.set(this.containerNode, "height", "");
		},
		uninitialize : function() {
			array.forEach(this.connects, function(x) {
				x.remove();

			})
		},
		setInfo : function(/*Object*/params) {
			if (params) {
				if (params.title) {
					this.titleNode.innerHTML = params.title;
				}
				if (params.content) {
					this.contentNode.innerHTML = params.content;
					if (has("ie") <= 6) {
						query("img", this.contentNode).forEach(function(img) {
							img.parentNode.removeChild(img);
						});
					}
				}
				this.link = params.link;
				if (params.link) {
					domStyle.set(this.linkNode, "display", "block");
					domAttr.set(this.linkNode, "title", this.link);
				} else {
					domStyle.set(this.linkNode, "display", "none");
				}

				if (has("ie") <= 6) {
					domStyle.set(this.closeButton, {
						left : "",
						right : "2px"
					});
					
					// If the content box < 40px high on IE, it's ugly
					var contentBox = domGeom.getContentBox(this.containerNode);
					if (contentBox.h < 40) {
						domStyle.set(this.containerNode, "height", "40px");
					} else {
						domStyle.set(this.containerNode, "height", "");
					}
				}

				// Center the infoPopup and leader vertically
				var b = domGeom.position(this.containerNode);
				var mTop = (b.h / 2) + "px";
				domStyle.set(this.domNode, "marginTop", "-" + mTop);
				domStyle.set(this.leaderNode, "marginTop", mTop);
			}
		},
		setCoords : function(/*esri.geometry.Point*/mapPoint) {
			if (mapPoint) {
				this.coords = mapPoint;
				this.screenCoords = this.map.toScreen(mapPoint);
				this._locate(this.screenCoords);
			}
		},

		extentChangeHandler : function(extent, delta, levelChange, lod) {
			if (this.coords) {
				this.screenCoords = this.map.toScreen(this.coords);
			}
			this._locate(this.screenCoords);
		},

		panHandler : function(extent, delta) {
			if (this.screenCoords) {
				var sp = new Point();
				sp.x = this.screenCoords.x + delta.x;
				sp.y = this.screenCoords.y + delta.y;
			}
			this._locate(sp);
		},
		_locate : function(/*esri.geometry.Point*/loc) {
			try {
				if (loc) {
					// Determine if loc is in the left or right half of the map
					var isLeft = (loc.x < this.map.width / 2);
					// Allow for 10px in the middle as "neutral", to minimize flipping
					var isNeutral = Math.abs(loc.x - this.map.width / 2) < 5;

					if (isNeutral) {
						if (this.alignment === "") {
							this.alignment = isLeft ? "left" : "right";
						}
					} else {
						this.alignment = isLeft ? "left" : "right";
					}

					if (this.alignment === "left") {
						// left half. Position popup to the right of loc
						domStyle.set(this.domNode, {
							top : loc.y + "px",
							left : loc.x + "px",
							right : ""
						});

						// leader
						domStyle.set(this.leaderNode, {
							left : "1px",
							right : ""
						});

						// buttons
						if (!has("ie") <= 6) {
							domStyle.set(this.closeButton, {
								left : "",
								right : "-22px"
							});
							
						}
					} else {
						// right half. Position popup to the left of loc
						var x = this.map.width - loc.x;
						domStyle.set(this.domNode, {
							top : loc.y + "px",
							right : x + "px",
							left : ""
						});

						// leader
						domStyle.set(this.leaderNode, {
							left : "",
							right : "1px"
						});

						// buttons
						if (!has("ie") <= 6) {
							domStyle.set(this.closeButton, {
								left : "-24px",
								right : ""
							});
							
						}
					}
				}
			} catch (err) {
				console.error("Error locating infopopup:", err);
			}
		},
		show : function() {
			fx.fadeIn({
				node : this.domNode
			}).play();
			this.visible = true;
		},

		hide : function() {
			fx.fadeOut({
				node : this.domNode
			}).play();
			this.visible = false;
		},

		onFollowLink : function(evt) {
			window.open(this.link);
		},

		onClose : function(evt) {
			// Stub for event propagation
		},

		onPin : function(evt) {
			// Stub for event propagation
			fx.fadeOut({
				node : this.pinButton
			}).play();
		}
	});
});
