define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/ThemeWidgetContainer.html", "dojo/query", "dojo/_base/connect", "dojo/dom", "dojo/dom-style", "dojo/topic", "dojo/_base/lang", "dojo/_base/array", "dojo/on", "dojo/dom-class", "dojo/dom-construct", "dijit/registry", "dojo/_base/fx", "dojo/fx", "dojo/dom-geometry", "viewer/ThemeWidgetFrame", "viewer/_Widget"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, query, connect, dom, domStyle, topic, lang, array, on, domClass, domConstruct, registry, fx, coreFx, domGeom, ThemeWidgetFrame, _Widget) {

	return declare("mrsac.viewer.ThemeWidgetContainer", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		templateString : template,
		showHideButton : null,
		contentWidth : 0,
		contentHeight : 0,
		themeframenode : null,

		_containerPadding : 0,
		ThemeWidgetContainerhandleA : null,
		themeelement : null,
		thememap : null,
		state : "",
		status : false,
		rightDiv : null,
		state : "minimized",

		postMixInProperties : function() {

		},
		postCreate : function() {
			// Get references to nodes
			//console.log("WidgetContainer postCreate");

			this.rightDiv = query(".ThemewidgetContainer", this.domNode)[0];
			this.showHideButton = query(".ThemewbHide", this.domNode)[0];
			this._scrollDiv = query(".ThemewidgetContainerControls", this.domNode)[0];
			this._containerPadding = domStyle.get(this.domNode, "paddingBottom");

			ThemeWidgetContainerhandleA = topic.subscribe("showThemeWidget", lang.hitch(this, "onShowThemeWidget"));

		},
		startup : function() {

			if (this._started) {
				return;
			}
			//console.log("WidgetContainer startup");

			var children = this.getChildren();

			// Pass to children
			array.forEach(children, function(child) {
				child.startup();
			});

			//console.log("WC::startup finished");
			this.inherited(arguments);

		},
		onShowThemeWidget : function(widget) {

			//console.log("WidgetContainer::onShowWidget");
			if (widget) {

				// Look for the widget
				var bFound = false;

				var frames = this.getChildren();

				for (var i = 0; i < frames.length; i++) {

					var frame = frames[i];

					if (frame.widget === widget) {

						if (this.state === "minimized") {
							// onResizeEnd will call ensureFrameIsVisible
							this.maximize();
						} else {

							//this.ensureFrameIsVisible(frame);
						}
						bFound = true;
						break;
					}
				}

				if (!bFound) {

					// Did not find widget. Create a new frame & add
					var frame = new mrsac.viewer.ThemeWidgetFrame();

					frame.setWidget(widget);

					this.addChild(frame);

					if (this.state === "minimized") {
						// onResizeEnd will call ensureFrameIsVisible
						this.maximize();
						this.state === "maximized";
					}

					connect.connect(frame, "onClose", this, "closeWidget");

					//connect.connect(frame, "onMinimize", this, "minimizeWidget");

					if (frames.length > 0) {
						// Position it relative to the last frame
						this.positionFrameAfterFrame(frame, frames[frames.length - 1]);
					}

				}

				if (domClass.contains(this.showHideButton, "ThemewbShow")) {
					this.onClickShowTheme();
				}
			}

		},
		onClickShowTheme : function(evt) {

			if (domClass.contains(this.showHideButton, "ThemewbHide")) {
				domClass.add(this.showHideButton, "ThemewbShow");
				domClass.remove(this.showHideButton, "ThemewbHide");
				this.minimize();

			} else {
				domClass.add(this.showHideButton, "ThemewbHide");
				domClass.remove(this.showHideButton, "ThemewbShow");

				this.maximize();
			}
		},
		positionFrameAfterFrame : function(/*WidgetFrame*/frameToPlace, /*WidgetFrame*/afterFrame) {

			if (frameToPlace) {

				target = afterFrame;
				fx.fadeOut({
					node : target,
					onEnd : lang.hitch(this, function() {

						this.removeChild(target);

						// remove, don't destroy Widget
						if (target.widget && target.widget.shutdown) {

							target.widget.shutdown();

						}
					})
				}).play();
				this.addChild(frameToPlace);

			};

		},
		minimize : function() {
			var drawbttnDiv = domStyle.getComputedStyle(this.showHideButton).width;

			var frameDiv = domStyle.getComputedStyle(this.rightDiv).width;

			var allFrames = query(".RightPanel")[0];

			var slideDistance = parseInt(drawbttnDiv) + parseInt(frameDiv) - 20;

			var animations = [];

			var a = fx.animateProperty({
				node : allFrames,
				properties : {
					right : slideDistance * -1
				}
			});
			animations.push(a);

			coreFx.combine(animations).play();
			this.state = "minimized";

		},
		maximize : function() {
			var drawbttnDiv = domStyle.getComputedStyle(this.showHideButton).width;

			var frameDiv = domStyle.getComputedStyle(this.rightDiv).width;

			var allFrames = query(".RightPanel")[0];

			var slideDistance = parseInt(drawbttnDiv) + parseInt(frameDiv);

			var animations = [];

			var a = fx.animateProperty({
				node : allFrames,
				properties : {
					right : slideDistance * 0
				}
			});
			animations.push(a);

			coreFx.combine(animations).play();
			this.state = "maximixed";

		},
		closeWidget : function(/*String*/frameId) {

			var target = null;

			var containerBox = domGeom.getContentBox(this.domNode);

			var children = this.getChildren();

			for (var i = 0; i < children.length; i++) {

				var frame = children[i];

				if (frame.id === frameId) {

					target = frame;
					fx.fadeOut({
						node : target,
						onEnd : lang.hitch(this, function() {

							this.removeChild(target);

							// remove, don't destroy Widget
							if (target.widget && target.widget.shutdown) {

								target.widget.shutdown();

								this.minimize();

							}
						})
					}).play();
				}
			}

		}
	});
});
