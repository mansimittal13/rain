define(["viewer/util", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/ControllerMenuItem.html", "dojo/dom", "dojo/dom-style", "dojo/query", "dojo/dom-attr"], function(util, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, dom, domStyle, query, domAttr) {

	return declare("mrsac.viewer.ControllerMenuItem", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		constructor : function(/*Object*/params) {

		},
		templateString : template,
		label : "",
		icon : "",
		value : "",
		menuCode : "",
		title : "", // tooltip text
		url : "",

		postMixInProperties : function() {

			//console.log("ControllerMenuItem postMixInProperties");
			if (this.icon === "") {
				this.icon = "assets/images/icons/i_icp.png";
			}
			if (this.label === "") {
				this.label = "No Label";
			}
			if (!this.value) {
				this.value = this.label;
			}
			if (!this.title) {
				if (this.url) {
					this.title = this.url;
				} else {
					this.title = this.label;
				}
			}
		},
		postCreate : function() {

			//console.log("ControllerMenuItem postCreate");

			var iconUrl = require.toUrl("js/mrsac/viewer/" + this.icon);

			this.setIcon(iconUrl);

			dom.setSelectable(this.domNode, true);

		},

		startup : function() {

			//console.log("ControllerMenuItem startup");
		},

		onClick : function(evt) {

			this.onMenuItemClick({
				value : this.value,
				label : this.label,
				menuCode : this.menuCode,
				status : this.status
			});

		},

		onMenuItemClick : function(data) {

			// stub for event propagation
		},

		setIcon : function(/*URL*/iconUrl) {
			var str = iconUrl;

			//var elementimg = query(".menuItemimg");
			var elementimg = query(".menuItemimg", this.domNode)[0];

			var result = str.replace("http://js.arcgis.com/3.17/", "");

			//var resulticon = result.replace("mrsac/viewer/assets/images/icons", "mrsac/viewer/assets/images/small_icons");

			//domStyle.set(this.domNode, "backgroundImage", "url(" + resulticon + ")");
			domAttr.set(elementimg, "src", result);

		}
	});
});
