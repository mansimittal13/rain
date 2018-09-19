define(["dojo/_base/declare", "viewer/_MapGraphicsMaintainer", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/ResultItem2.html", "dojo/dom-attr", "dojo/dom", "dojo/dom-style", "dojo/sniff", "dojo/dom-class", "dojo/query", "dojo/_base/lang", "dojo/_base/event", "dojo/topic"], function(declare, _MapGraphicsMaintainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, domAttr, dom, domStyle, has, domClass, query, lang, event, topic) {

	return declare("mrsac.viewer.ResultItem2", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, mrsac.viewer._MapGraphicsMaintainer], {
		constructor : function(/*Object*/params) {

		},

		title : "",
		content : "",
		link : "",
		iconUrl : "",
		actionIconUrl : "",
		closeU : "",
		graphic : null,
		location : null,
		suppressImages : false,
		zoomScale : null,
		element1 : null,
		templateString : template,
		count1 : null,

		postCreate : function() {

			//this.setTitle(this.title);
			this.setContent(this.content);
			this.setIconUrl(this.iconUrl);
			this.setCloseUrl(this.closeU);
			this.setLink(this.link);
			this.setActionIconUrl(this.actionIconUrl);
			this.setZoomScale(this.zoomScale);
			this.countVal(this.count);

		},

		countVal : function(count) {
			this.count1 = count + 1;

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
		setCloseUrl : function(/*URL*/url1, count) {

			this.closeUrl = url1;
			this.iconNode1.src = this.closeUrl;

		},
		clearResult : function(evt) {

			this.map.graphics.remove(this.graphic);
			var newItem = document.getElementsByClassName("resultsMsg1")[0].innerHTML
			var domResult = newItem.lastIndexOf(":");
			var domResult1 = newItem.substring(domResult + 1)
			var val1 = parseInt(domResult1) - 1

			var domResult2 = newItem.substring(0, domResult)

			newItem = domResult2 + ": " + val1;

			document.getElementsByClassName("resultsMsg1")[0].innerHTML = newItem

			var kk = evt.target.parentNode.parentNode.parentNode.parentNode.parentNode

			kk.remove()
			this.clearGraphics();

			topic.publish("wgetHighlightEvent", null);

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
			alert("isAlt");
			alert(isAlt);
			if (isAlt && has("ie") <= 6(this.domNode, "alt") === false) {

				alert("is")
				domClass.add(this.domNode, "alt");
				alert("is c")
			} else if (!isAlt && domClass.contains(this.domNode, "alt")) {

				alert("not is")
				domClass.remove(this.domNode, "alt");
				alert("not c")
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
		}
	});
});
