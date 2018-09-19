/**
 * @author Richa
 */

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/ThemeWidgetFrame.html", "dojo/query", "dojo/_base/array", "dojo/dom-style", "dojo/_base/fx", "dojo/fx/easing", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-attr", "dojo/on", "dojo/_base/connect", "dojo/fx", "dojo/dom-geometry", "dojo/fx/easing", "dojo/_base/fx", "dojo/dom-construct"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, query, array, domStyle, fx, easing, lang, domClass, domAttr, on, connect, coreFx, domGeom, easing, baseFx, domConstruct) {

	return declare("mrsac.viewer.ThemeWidgetFrame", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		constructor : function() {
			this.boxMaximized = {
				h : 100,
				w : [], // one for each panel
				paddingTop : 10,
				paddingBottom : 10,
				paddingLeft : 10,
				paddingRight : 10,
				marginLeft : 10
			};
		},
		// The widget
		widget : null,

		// configured by attributes
		icon : "",
		title : "",
		state : "maximized", // other options "minimized", "minimizing", "maximizing"

		// Frame DOM nodes
		boxNode : null,
		badgeNode : null,
		contentNode : null,
		titleNode : null,

		// Dynamic measurements taken after the frame is laid out in postCreate
		widgetWidth : 100,
		boxMaximized : null, // initialized in constructor

		templateString : template,

		postMixInProperties : function() {
			//console.log("WidgetFrame::postMixInProperties");
			if (this.icon === "") {
				this.icon = "assets/images/icons/i_pushpin.png";
			}
			if (this.title === "") {
				this.title = "No Title Given";
			}

		},

		postCreate : function() {
			//console.log("WidgetFrame postCreate");

			try {
				// Find Frame DOM nodes
				this.boxNode = query(".ThemewidgetBadgedPane", this.domNode)[0];
				this.badgeNode = query(".ThemewidgetBadge", this.domNode)[0];
				this.contentNode = query(".ThemewidgetHolder", this.domNode)[0];
				this.titleNode = query("#.ThemewidgetTitle", this.domNode)[0];
			} catch (err) {

				console.error(err);
			}

			//console.log("WidgetFrame postCreate finished");

		},
		startup : function() {
			if (this._started) {
				return;
			}

			//console.log("WF::startup");
			// Pass to children

			var children = this.getChildren();

			array.forEach(children, function(child) {
				child.startup();
			});

			// Look for a child dijit of type _Widget
			for (var i = 0; i < children.length; i++) {
				// Check by duck typing for mrsac.viewer._Widget
				var c = children[i];
				//this.setWidget(c, true);

				if (c.setMap && c.setId && c.setAlarm && c.setTitle && c.setIcon && c.setState && c.setConfig) {

					this.setWidget(c, true);
					break;
				}

			}

			//domStyle.set(this.domNode, "width", "97%");
			domStyle.set(this.domNode, "bottom", "0");

			// Measure the box as laid out in the default (maximized) position
			/*this.widgetWidth = domStyle.get(this.domNode, "width");

			this.boxMaximized.paddingTop = domStyle.get(this.boxNode, "paddingTop");
			this.boxMaximized.paddingBottom = domStyle.get(this.boxNode, "paddingBottom");
			this.boxMaximized.paddingLeft = domStyle.get(this.boxNode, "paddingLeft");
			this.boxMaximized.paddingRight = domStyle.get(this.boxNode, "paddingRight");
			this.boxMaximized.marginLeft = domStyle.get(this.boxNode, "marginLeft");
			this.boxMaximized.h = this.widgetWidth - (this.boxMaximized.marginLeft + this.boxMaximized.paddingLeft + this.boxMaximized.paddingRight);*/

			// One height for each panel
			for (var i = 0; i < this.widget.panels.length; i++) {

				this.widget.showThemePanel(i);
				//var w = domStyle.get(this.boxNode, "width");

				//this.boxMaximized.w.push(w);

			}

			this.widget.showThemePanel(0);

			if (this.state === "minimized") {

				// Minimize the widget, in zero elapsed time
				this.minimize(0);
			} else {

				// Maximize the widget, in zero elapsed time
				this.maximize(0);
			}

			// Fade in
			fx.fadeIn({
				node : this.domNode
			}).play();

			//console.log("WF::startup finished");

		},
		setIcon : function(/* String */icon) {
			try {
				this.icon = icon;
				var badgeicon = require.toUrl("js/mrsac/viewer/" + this.icon);

				var resbadgeicon = badgeicon.replace("http://js.arcgis.com/3.17/", "");

				//domStyle.set(this.badgeNode, "backgroundImage", "url(" + resbadgeicon + ")");
				domAttr.set(this.badgeNode, "src", resbadgeicon);

			} catch (err) {
				console.error(err);
			}
		},

		setWidget : function(/*com.esri.solutions.jsviewer._Widget*/widget, /*boolean*/childAlreadyAdded) {
			// Only can set once

			if (this.widget) {
				return;
			}

			if (!childAlreadyAdded) {

				this.addChild(widget);

			}

			//console.log("WF::setWidget");

			this.widget = widget;

			try {
				// Set the frame title
				this.title = widget.title;
				this.titleNode.innerHTML = this.title;

				// Set the frame icon
				this.setIcon(widget.icon);
				var minBtn = query(".wbClose", this.domNode)[0];
				minBtnTd = minBtn.parentNode;

				if (widget.panels.length > 1) {

					array.forEach(widget.panels, lang.hitch(this, function(item, idx, arr) {

						var td = document.createElement("TD");
						var btn = document.createElement("DIV");
						domClass.add(btn, "ThemewidgetButton");

						var frameicon = require.toUrl("js/mrsac/viewer/" + item.buttonIcon);

						var resframeicon = frameicon.replace("http://js.arcgis.com/3.17/", "");

						domStyle.set(btn, "backgroundImage", "url(" + resframeicon + ")");

						domAttr.set(btn, "title", item.buttonText);
						if (this.state === "minimized") {
							domStyle.set(btn, "display", "none");
						}

						td.appendChild(btn);

						minBtnTd.parentNode.insertBefore(td, minBtnTd);
						connect.connect(btn, "onclick", lang.hitch(this, function() {

							//on(btn, "onclick", lang.hitch(this, function() {
							this.selectPanel(idx);
						}));

					}));

				}

			} catch (err) {
				alert("err......" + err);

				console.error(err);
			}
		},

		onMinClick : function(evt) {
			this.minimize();
		},

		onCloseClick : function(evt) {

			this.onClose(this.id);

		},
		selectPanel : function(index) {

			if (index !== this.widget.panelIndex) {
				try {
					// Start transition, change panel, finish transition
					var firstHalf = fx.fadeOut({
						node : this.contentNode,
						duration : 150,
						onEnd : lang.hitch(this, function() {
							this.widget.showThemePanel(index);
						})
					});

					var secondHalf = fx.fadeIn({
						node : this.contentNode,
						duration : 150
					});

					this.onResizeStart(this.id, {
						dh : this.boxMaximized.h[index] - this.boxMaximized.h[this.widget.panelIndex]
					});

					var resize = fx.animateProperty({
						node : this.boxNode,
						duration : 150,
						properties : {
							height : this.boxMaximized.h[index]
						},
						onEnd : lang.hitch(this, function() {
							this.onResizeEnd(this);
						})
					});

					coreFx.chain([firstHalf, resize, secondHalf]).play();
				} catch (err) {
					console.error(err);
				}
			}
		},
		minimize : function(duration) {

		},
		maximize : function(duration) {

			//console.log("maximizing!");

		},
		getBoundingBox : function() {
			var domBox = domGeom.getMarginBox(this.domNode);
			var boxBox = domGeom.getMarginBox(this.boxNode);
			var bb = {
				w : boxBox.w,
				h : domBox.h,
				t : domBox.t,
				l : domBox.l
			};

			//console.dir(bb);
			return bb;
		},

		onResizeStart : function(/*String*/frameId, /*Object*/endBounds) {

		},

		onResizeEnd : function(/*WidgetFrame*/frame) {

		},

		onClose : function(/*String*/frameId) {
			// stub for event handling in WidgetContainer
		}
	});
});

