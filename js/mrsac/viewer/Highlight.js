define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/sniff", "dojo/dom-style", "dojo/_base/lang", "dojo/_base/connect", "esri/geometry/Point"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, has, domStyle, lang, connect, Point) {

	return declare("mrsac.viewer.Highlight", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		constructor : function(/*Object*/params) {
			var folderUrl = require.toUrl("js/mrsac/viewer/assets/images/highlight/");
			var g = folderUrl.lastIndexOf("?");
			folderUrl = folderUrl.substring(0, g)

			var resultfolderUrl = folderUrl.replace("http://js.arcgis.com/3.17/", "");
			//this.animationFrameUrls = ["url(" + resultfolderUrl + "glow000.png)", "url(" + resultfolderUrl + "glow010.png)", "url(" + resultfolderUrl + "glow020.png)", "url(" + resultfolderUrl + "glow030.png)", "url(" + resultfolderUrl + "glow040.png)", "url(" + resultfolderUrl + "glow050.png)", "url(" + resultfolderUrl + "glow060.png)", "url(" + resultfolderUrl + "glow070.png)", "url(" + resultfolderUrl + "glow080.png)", "url(" + resultfolderUrl + "glow090.png)", "url(" + resultfolderUrl + "glow100.png)"];
			// for IE
			
			var reslurl ="js/mrsac/viewer/assets/images/highlight/";
			this.animationFrameUrls = ["url(" + reslurl + "glow000.png)", "url(" + reslurl + "glow010.png)", "url(" + reslurl + "glow020.png)", "url(" + reslurl + "glow030.png)", "url(" + reslurl + "glow040.png)", "url(" + reslurl + "glow050.png)", "url(" + reslurl + "glow060.png)", "url(" + reslurl + "glow070.png)", "url(" + reslurl + "glow080.png)", "url(" + reslurl + "glow090.png)", "url(" + reslurl + "glow100.png)"];
			
			this.ringImageUrl = "url(" + resultfolderUrl + "ring.png)";
		},
		map : null,
		mode : "off",
		coords : null,
		screenCoords : null,

		_frameIndex : 0,
		_framesAdvancing : true,
		_interval : null,

		templateString : "<div class='highlight'></div>",
		postCreate : function() {

			if (this.map) {

				//this.map.on("onExtentChange", this, "extentChangeHandler");

				//this.map.on("onPan", this, "panHandler");
				connect.connect(this.map, "onExtentChange", this, "extentChangeHandler");
				connect.connect(this.map, "onPan", this, "panHandler");

			}

			// Preload animation images
			if (!has("ie") <= 6) {

				domStyle.set(this.domNode, "visibility", "hidden");

				this.setMode("flashing");

				setTimeout(lang.hitch(this, function() {
					this.setMode("off");
					domStyle.set(this.domNode, "visibility", "visible");
				}), 1000);

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
			if (loc) {
				domStyle.set(this.domNode, {
					top : loc.y + "px",
					left : loc.x + "px"
				});
			}
		},
		setMode : function(/*String*/mode) {
			mode = mode.toLowerCase();
			if (mode && mode !== this.mode) {
				if (this.interval) {
					clearInterval(this.interval);
					this.interval = null;
				}

				if (mode === "flashing") {
					if (has("ie") <= 6) {
						domStyle.set(this.domNode, "backgroundImage", this.ringImageUrl);
					} else {

						this._frameIndex = 0;
						this.interval = setInterval(lang.hitch(this, "advanceFrame"), 100);

						this.updateAnimation();
					}
					this.mode = mode;
				} else {
					domStyle.set(this.domNode, "backgroundImage", "");
					this.mode = "off"
				}
			}
		},
		advanceFrame : function() {
			try {
				if (this._framesAdvancing) {
					if (this._frameIndex < this.animationFrameUrls.length - 1) {
						this._frameIndex++;
					} else {
						this._framesAdvancing = false;
					}
				} else {
					if (this._frameIndex > 0) {
						this._frameIndex--;
					} else {
						this._framesAdvancing = true;
					}
				}
				this.updateAnimation();
			} catch (err) {
				console.error("Error advancing highlight animation", err);
			}
		},

		updateAnimation : function() {

			domStyle.set(this.domNode, "backgroundImage", this.animationFrameUrls[this._frameIndex]);

		}
	});
});
