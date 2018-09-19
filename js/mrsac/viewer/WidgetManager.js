/**
 * @author Richa
 */

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/topic", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-style", "dojo/dom", "dijit/registry", "dojo/query"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, topic, lang, array, domConstruct, domStyle, dom, registry, query) {

	return declare("mrsac.viewer.WidgetManager", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		constructor : function() {

			this.widgetDefinitions = {};

			this.widgets = {};
			r = {};
			t = {};

			this.themewidgets = {};
		},

		templateString : "<div style='display: none;'></div>",

		map : null,
		configData : null,
		WidgetManagerhandleA : null,
		WidgetManagerhandleB : null,
		WidgetManagerhandleC : null,
		w : null,

		postMixInProperties : function() {
			//console.log("WidgetManager postMixInProperties");
		},
		postCreate : function() {

			//console.log("WidgetManager postCreate");

			WidgetManagerhandleA = topic.subscribe("configLoadedEvent", lang.hitch(this, "onConfig"));

			WidgetManagerhandleB = topic.subscribe("mapLoadedEvent", lang.hitch(this, "onMapLoad"));

			WidgetManagerhandleC = topic.subscribe("menuItemClickedEvent", lang.hitch(this, "onMenuClick"));

		},
		startup : function() {

			//console.log("WidgetManager startup");
		},
		onConfig : function(configData) {

			//console.log("WidgetManager::onConfig");
			this.configData = configData;

			// Unsubscribe from the event
			WidgetManagerhandleA.remove();

			// Make note of the defined widgets
			// and dojo.require them
			array.forEach(configData.widgets, lang.hitch(this, function(defn) {
				this.widgetDefinitions[defn.label] = defn;
				this.requireWidget(defn.label);
			}));
		},
		onMapLoad : function(map) {

			//console.log("WidgetManager::onMapLoad");
			this.map = map;

		},
		onMenuClick : function(data) {
			
			if (data && data.value && data.menuCode && data.menuCode === "widgets.widget" && (data.status === "false")) {

				//console.log("onMenuClick for widget '" + data.value + "'");
				try {
					if (this.widgetDefinitions[data.value]) {

						var w = this.getWidget(data.value);
						topic.publish("showWidget", w);

					}
				} catch (err) {
					console.error(err);
				}
			} else {

				try {
					if (this.widgetDefinitions[data.value]) {
						var w = this.getthemeWidget(data.value);

						topic.publish("showThemeWidget", w);

					}
				} catch (err) {
					console.error(err);
				}

			};

		},
		getthemeWidget : function(label) {

			if (!t[label]) {

				this.loadthemeWidget(label);

			}
			return t[label];
		},
		loadthemeWidget : function(label) {
			/*var g = query(".claro .dijitSplitterV");

			var node = dom.byId("leftCol");
			var mapnode = dom.byId("map");
			var computedStyle = domStyle.getComputedStyle(node);
			domStyle.set(node, "display", "block");
			domStyle.set(node, "left", "1597px");
			domStyle.set(node, "width", "300px");
			domStyle.set(mapnode, "width", "1540px");
			domStyle.set(g, "left", "1540px");*/
			/*******************************************/

			var defnmap = this.map;

			var defn = this.widgetDefinitions[label];
			var paramStr = "";
			if (defn.config) {
				paramStr = "{ config: '" + defn.config + "'}";
			}

			var newstr = defn.widgetType.replace("mrsac.viewer.widgets.", "viewer/widgets/");

			var loadconstrc = defn.widgetType.replace("mrsac.viewer.widgets.", "");
			//var reqStr = "require(['" + newstr + "'],function(" + loadconstrc + "){ this.themewidgets = {};var w = new " + defn.widgetType + "(" + paramStr + ");" + "w.setTitle(defn.label);w.setIcon(defn.icon);w.setConfig(defn.config);w.setMap(defnmap);this.themewidgets[label] = w;topic.publish( '" + "showThemeWidget" + "' ,w)" + "})";
			var reqStr = "require(['" + newstr + "'],function(" + loadconstrc + "){  var w = new " + defn.widgetType + "(" + paramStr + ");" + "w.setTitle(defn.label);w.setIcon(defn.icon);w.setConfig(defn.config);w.setMap(defnmap);t[label] = w;topic.publish( '" + "showThemeWidget" + "' ,w); return t[label];" + "})";

			eval(reqStr);

		},
		getWidget : function(label) {

			if (!r[label]) {

				this.loadWidget(label);

			}

			return r[label];
		},
		requireWidget : function(label) {
			var defn = this.widgetDefinitions[label];

			// breaking up dojo. and require necessary to fool the dojo parser!

		},

		loadWidget : function(label) {

			var defnmap = this.map;

			var defn = this.widgetDefinitions[label];
			var paramStr = "";

			if (defn.config) {
				paramStr = "{ config: '" + defn.config + "'}";
			}

			var newstr = defn.widgetType.replace("mrsac.viewer.widgets.", "viewer/widgets/");

			var loadconstrc = defn.widgetType.replace("mrsac.viewer.widgets.", "");
			var reqStr = "require(['" + newstr + "'],function(" + loadconstrc + "){  var w = new " + defn.widgetType + "(" + paramStr + ");" + "w.setTitle(defn.label);w.setIcon(defn.icon);w.setConfig(defn.config);w.setMap(defnmap);r[label] = w;topic.publish( '" + "showWidget" + "' ,w); return r[label];" + "})";
			eval(reqStr);

			//var reqStr = "require(['" + newstr + "'],function(" + loadconstrc + "){ this.widgets = {}; w = new " + defn.widgetType + "(" + paramStr + ");" + "w.setTitle(defn.label);w.setIcon(defn.icon);w.setConfig(defn.config);w.setMap(defnmap);this.widgets[label] = w;topic.publish( '" + "showWidget" + "' ,w)" + "})";
			//eval(reqStr);

		},
	});
});
