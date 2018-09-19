define(["dojo/_base/declare", "viewer/_MapGraphicsMaintainer", "viewer/widgets/locatebylat", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/ResultItem1.html", "dojo/dom-attr", "dojo/dom", "dojo/on", "dojo/dom-style", "dojo/sniff", "dojo/dom-class", "dojo/query", "dojo/_base/lang", "dojo/_base/event", "dojo/topic", "esri/geometry/Point", "esri/SpatialReference", "dojo/_base/connect", "viewer/MapManager", "dojo/NodeList-traverse"], function(declare, _MapGraphicsMaintainer, locatebylat, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, domAttr, dom, on, domStyle, has, domClass, query, lang, event, topic, Point, SpatialReference, connect, MapManager) {

	return declare("mrsac.viewer.ResultItem1", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, mrsac.viewer._MapGraphicsMaintainer, mrsac.viewer.MapManager], {
		constructor : function(/*Object*/params) {
			
		},

		title : "",
		content : "",
		link : "",
		iconUrl : "",
		actionIconUrl : "",
		//closeU : "",
		graphic : null,
		location : null,
		suppressImages : false,
		zoomScale : null,
		element1 : null,

		templateString : template,

		postCreate : function() {

			this.setTitle(this.title);
			this.setContent(this.content);
			this.setIconUrl(this.iconUrl);
			//this.setCloseUrl(this.closeU);
			this.setLink(this.link);
			this.setActionIconUrl(this.actionIconUrl);
			this.setZoomScale(this.zoomScale);

		},
		setTitle : function(/*String*/title) {
			this.title = title;
			this.titleNode.innerHTML = this.title;
			domAttr.set(this.domNode, "title", this.title);
		},
		setContent : function(/*HTML*/content) {
			if (this.suppressImages) {
				content = content.replace(/<img [^>]*>/ig, "<!--img removed-->");
			}
			this.content = content;
			this.contentNode.innerHTML = content;
			dom.setSelectable(this.domNode, false);
		},
		setLink : function(/*URL*/url) {
			this.link = url;
			if (this.link) {
				domStyle.set(this.linkNode, "display", "block");
				domAttr.set(this.linkNode, "title", this.link);
			} else {
				domStyle.set(this.linkNode, "display", "none");
			}
		},
		setIconUrl : function(/*URL*/url) {
			this.iconUrl = url;
			this.iconNode.src = this.iconUrl;

		},
		setCloseUrl : function(/*URL*/url1) {

			this.closeUrl = url1;
			//this.iconNode1.src = this.closeUrl;

		},
		clearResult : function(evt) {

			this.map.graphics.remove(this.graphic);
			var element = query(".resultsPane > div").length;

			this.element1 = query(".resultsMsg")[0];
			//this.messageNode = query(".resultsMsg", this.domNode)[0];
			this.element1.innerHTML = element - 1 + " location(s) found"
			//var fir = element1.firstChild

			var kk = evt.target.parentNode.parentNode.parentNode.parentNode.parentNode

			kk.remove()
			this.clearGraphics();

			topic.publish("widgetHighlightEvent", null);

		},
		setActionIconUrl : function(/*URL*/url) {
			this.actionIconUrl = url;

			if (this.actionIconUrl) {
				domStyle.set(this.actionNode, "backgroundImage", "url(" + this.actionIconUrl + ")");
				domStyle.set(this.actionNode, "display", "block");

			} else {

				domStyle.set(this.actionNode, "display", "none");
			}
		},
		setZoomScale : function(/*Number*/scale) {
			if (scale) {
				try {
					var scaleInt = parseInt(scale);
					this.zoomScale = scaleInt;
					return;
				} catch (err) {
					console.error("ResultItem::setZoomScale could not parse scale '" + scale + "'");
				}
			}
			this.zoomScale = null;
		},
		applyAlternateBackground : function(/*boolean*/isAlt) {

			if (isAlt && has("ie") <= 6(this.domNode, "alt") === false) {

				domClass.add(this.domNode, "alt");

			} else if (!isAlt && domClass.contains(this.domNode, "alt")) {

				domClass.remove(this.domNode, "alt");

			}
		},
		removeContentImages : function() {
			query("img", this.contentNode).forEach(function(img) {
				img.parentNode.removeChild(img);
			});
		},
		// Trap "hover" events
		_hoverTimeout : null,
		_clearHoverTimeout : function() {
			if (this._hoverTimeout) {
				clearTimeout(this._hoverTimeout);
				this._hoverTimeout = null;
			}
		},
		onMouseMove : function(evt) {
			this._clearHoverTimeout();
			this._hoverTimeout = setTimeout(lang.hitch(this, function(evt) {
				this.onHover({});
			}), 300);
		},
		onMouseOut : function(evt) {
			this._clearHoverTimeout();
		},
		onClick : function(evt) {
			// stub for events
			evt.resultItem = this;

		},
		onHover : function(evt) {
			// stub for events
			evt.resultItem = this;
		},
		onFollowLink : function(evt) {
			window.open(this.link);
			event.stop(evt);
		},
		onAction : function(evt) {
			evt.resultItem = this;
			event.stop(evt);
		},
		onResultClear : function(evt) {
			alert("first")
			alert(evt);
			alert(this.graphic);

		},
	});
});
