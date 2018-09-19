define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/WidgetContainer.html", "dojo/query", "dojo/dom-style", "dojo/topic", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dojo/dom-class", "dojo/dom-geometry", "dojo/_base/fx", "dojo/fx", "viewer/WidgetFrame", "viewer/_Widget"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, query, domStyle, topic, lang, array, connect, domClass, domGeom, fx, coreFx, WidgetFrame, _Widget) {

	return declare("mrsac.viewer.WidgetContainer", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		templateString : template,
		showHideButton : null,
		contentWidth : 0,
		contentHeight : 0,

		_containerPadding : 0,
		WidgetContainerhandleA : null,
		WidgetContainerhandleB : null,

		postMixInProperties : function() {

		},
		postCreate : function() {
			// Get references to nodes
			//console.log("WidgetContainer postCreate");
			this.showHideButton = query(".wbHide", this.domNode)[0];
			this._scrollDiv = query(".widgetContainerControls", this.domNode)[0];
			this._containerPadding = domStyle.get(this.domNode, "paddingBottom");

			// showWidget event: create if necessary, maximize

			WidgetContainerhandleA = topic.subscribe("showWidget", lang.hitch(this, "onShowWidget"));

			// Map resized, adjust widget placement
			WidgetContainerhandleB = topic.subscribe("mapResizedEvent", lang.hitch(this, "onMapResize"));

			//console.log("WidgetContainer postCreate end");

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

			for (var i = 0; i < children.length; i++) {
				connect.connect(children[i], "onResizeStart", this, "frameResizing");
				connect.connect(children[i], "onClose", this, "closeWidget");
				connect.connect(children[i], "onResizeEnd", this, "ensureFrameIsVisible");
			}

			// change layout from width 400, right 0
			// to width 0, right 400
			try {
				var h = parseInt(domStyle.get(this.domNode, "height"));

				var r = parseInt(domStyle.get(this.domNode, "right"));
				var l = parseInt(domStyle.get(this.domNode, "left"));

				// Store width so that frames can get it
				this.contentWidth = 350;
				this.contentHeight = h;

				domStyle.set(this.domNode, "height", "0px");
				/*domStyle.set(this.domNode, "bottom", "300px");*/
				domStyle.set(this._scrollDiv, "left", "0px");

			} catch (err) {
				console.error(err);
			}
			//console.log("WC::startup finished");
			this.inherited(arguments);

		},
		onMapResize : function(/*Object*/mapBox) {

			// Just simple, scroll the top widget into view
			var children = this.getChildren();
			if (children[0]) {
				this.ensureFrameIsVisible(children[0]);
			}
		},

		onShowWidget : function(widget) {

			//console.log("WidgetContainer::onShowWidget");
			if (widget) {
				
				domStyle.set(this._scrollDiv,"display","block");

				// Look for the widget
				var bFound = false;
				var frames = this.getChildren();
				

				for (var i = 0; i < frames.length; i++) {
					var frame = frames[i];

					if (frame.widget === widget) {

						if (frame.state === "minimized") {

							// onResizeEnd will call ensureFrameIsVisible
							frame.maximize();
						} else {
							this.ensureFrameIsVisible(frame);
						}
						bFound = true;
						break;
					}
				}

				if (!bFound) {

					// Did not find widget. Create a new frame & add
					var frame = new mrsac.viewer.WidgetFrame();

					// Did not find widget. Create a new frame & add

					frame.setWidget(widget);

					this.addChild(frame);

					connect.connect(frame, "onResizeStart", this, "frameResizing");
					connect.connect(frame, "onClose", this, "closeWidget");
					connect.connect(frame, "onResizeEnd", this, "ensureFrameIsVisible");

					if (frames.length > 0) {
						// Position it relative to the last frame
						this.positionFrameAfterFrame(frame, frames[frames.length - 1]);
					}
					this.ensureFrameIsVisible(frame);

				}

				if (domClass.contains(this.showHideButton, "wbShow")) {
					this.onClickShow();
				}
			}

		},
		onClickShow : function(evt) {
			var frames = this.getChildren();
			var t = frames.length;

			if (t > 0) {

				if (domClass.contains(this.showHideButton, "wbHide")) {
					domClass.add(this.showHideButton, "wbShow");
					domClass.remove(this.showHideButton, "wbHide");

					this.minimize();
				} else {
					domClass.add(this.showHideButton, "wbHide");
					domClass.remove(this.showHideButton, "wbShow");
					this.maximize();
				}
			}
		},

		onClickUp : function(evt) {

			try {
				var children = this.getChildren();
				var containerBox = domGeom.getContentBox(this.domNode);

				// Are there any frames off the top of the screen?
				// Get the last frame which is at least partly off the screen
				if (children.length === 0) {
					return;
				}

				var target = null;
				for (var i = children.length - 1; i >= 0; i--) {
					var frameBox = children[i].getBoundingBox();

					if (frameBox.l < 0) {
						target = children[i];
						break;
					}
				}

				if (target) {

					this.ensureFrameIsVisible(target);

				}
			} catch (err) {
				console.error(err);
			}
		},

		onClickDown : function(evt) {
			try {
				var children = this.getChildren();
				var containerBox = domGeom.getContentBox(this.domNode);

				// Are there any frames off the right of the screen?
				// Get the first frame which is at least partly off the screen
				if (children.length === 0) {
					return;
				}
				var target = null;
				for (var i = 0; i < children.length; i++) {
					var frameBox = children[i].getBoundingBox();

					if (frameBox.l + frameBox.w > containerBox.w) {

						target = children[i];
						break;
					}
				}

				if (target) {
					this.ensureFrameIsVisible(target);
				}
			} catch (err) {
				console.error(err);
			}
		},
		ensureFrameIsVisible : function(/*WidgetFrame*/target) {

			var containerBox = domGeom.getContentBox(this.domNode);
			var frameBox = target.getBoundingBox();

			// Off the left?

			if (frameBox.l < this._containerPadding) {
				var downShiftDistance = this._containerPadding - frameBox.l;

				//pixels

				// Move all of the frames downShiftDistance
				var nodes = query(".widgetFrame", this.domNode);

				this.moveFrames(nodes, downShiftDistance);

			}
			// Off the right?
			else if (frameBox.l + frameBox.w > containerBox.w - this._containerPadding) {

				var upShiftDistance = frameBox.l - (containerBox.w - frameBox.w - this._containerPadding);
				//pixels

				// Move all of the frames upShiftDistance
				var nodes = query(".widgetFrame", this.domNode);

				this.moveFrames(nodes, upShiftDistance * -1);
			}
		},

		positionFrameAfterFrame : function(/*WidgetFrame*/frameToPlace, /*WidgetFrame*/afterFrame) {

			var bBox = afterFrame.getBoundingBox();

			y = bBox.l + bBox.w + 20;

			domStyle.set(frameToPlace.domNode, "left", y + "px");

			//domStyle.set(frameToPlace.domNode, "bottom", "300px");

		},

		moveFrames : function(/*NodeList*/frameDomNodes, /*Number*/distance) {

			if (frameDomNodes && frameDomNodes.length > 0 && distance !== 0) {
				var animations = [];
				frameDomNodes.forEach(function(n) {
					var l = domStyle.get(n, "left");

					var a = fx.animateProperty({
						node : n,
						properties : {
							left : l + distance
						}
					});
					animations.push(a);
				});

				coreFx.combine(animations).play();
			}
		},
		minimize : function() {

			//var slideDistance = parseInt(domStyle.get(this.domNode, "bottom"));
			//query(".widgetFrame", this.domNode).style("bottom", "-200px");
			var allFrames = query(".widgetFrame", this.domNode);

			var animations = [];
			allFrames.forEach(function(n) {

				var slideDistance = parseInt(domStyle.get(n, "bottom"));

				var a = fx.animateProperty({
					node : n,
					properties : {
						bottom : slideDistance * -1
					}
				});
				animations.push(a);

			});

			coreFx.combine(animations).play();

		},

		maximize : function() {

			var allFrames = query(".widgetFrame", this.domNode);

			var animations = [];
			allFrames.forEach(function(n) {
				var slideDistance = parseInt(domStyle.get(n, "bottom"));

				var a = fx.animateProperty({
					node : n,
					properties : {
						bottom : slideDistance * -1
					}
				});
				animations.push(a);

			});

			coreFx.combine(animations).play();

		},

		frameResizing : function(/*String*/frameId, /*Object*/deltas) {
			// One of the frames is resizing. Make room, or snug up
			try {
				var children = this.getChildren();

				var target = null;
				var nodesAfter = new query.NodeList();
				var shiftDistance = 0;

				for (var i = 0; i < children.length; i++) {
					var frame = children[i];

					var frameBox = frame.getBoundingBox();
					if (frame.id === frameId) {
						target = frame;
						targetTop = frameBox.t;
						// Growth will cause a shift down, shrink a shift up
						shiftDistance = deltas.dh;
					} else {
						if (target) {
							// target already found, this is after
							nodesAfter.push(frame.domNode);
						}
					}
				}

				if (target) {
					// Nodes after the target slide up or down
					this.moveFrames(nodesAfter, shiftDistance);
				}
			} catch (err) {
				console.error(err);
			}
		},
		closeWidget : function(/*String*/frameId) {

			try {
				var containerBox = domGeom.getContentBox(this.domNode);
				var children = this.getChildren();

				var target = null;
				var targetTop = 0;
				var firstFrameOffTop = null;
				var ffOffTopTop = 0;
				var nodesBefore = new query.NodeList();
				var nodesAfter = new query.NodeList();
				var upShiftDistance = 0;
				var downShiftDistance = 0;

				for (var i = 0; i < children.length; i++) {
					var frame = children[i];

					var frameBox = frame.getBoundingBox();
					if (frame.id === frameId) {
						target = frame;
						targetTop = frameBox.l;

						// Odd case where a widget is closed when partly off the top
						if (targetTop < this._containerPadding) {
							targetTop = this._containerPadding;
						}
					} else {
						if (frameBox.l < this._containerPadding) {
							firstFrameOffTop = frame;
							ffOffTopTop = frameBox.l;
						}

						if (target) {
							// target already found, this is after
							nodesAfter.push(frame.domNode);

							if (upShiftDistance === 0) {
								upShiftDistance = domStyle.get(frame.domNode, "left") - targetTop;
							}
						} else {
							// target not found yet, this is before
							nodesBefore.push(frame.domNode);
						}
					}
				}

				if (target) {

					// Calculate shifts. Nodes after the target slide up,
					// but if there is one or more frames off the top of the
					// container, the nodes before slide down and they meet in the middle
					if (firstFrameOffTop) {
						// calculate downShiftDistance
						downShiftDistance = this._containerPadding - ffOffTopTop;
						//pixels

						// adjust upShiftDistance
						upShiftDistance -= downShiftDistance;
					}

					// Fade out and remove target
					fx.fadeOut({
						node : target.domNode,
						onEnd : lang.hitch(this, function() {
							this.removeChild(target);

							// remove, don't destroy Widget
							if (target.widget && target.widget.shutdown) {
								target.widget.shutdown();

							}
						})
					}).play();

					// Slide all nodes before down
					// (If nothing is off the top, downShiftDistance is zero, no shift)
					this.moveFrames(nodesBefore, downShiftDistance);

					// Slide all nodes after up
					this.moveFrames(nodesAfter, upShiftDistance * -1);
				}
			} catch (err) {
				console.error(err);
			}
		}
	});
});
