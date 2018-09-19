/**
 * @author Richa
 */

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container) {

	return declare("mrsac.viewer._Widget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		constructor : function(/*Object*/params) {

			//console.log("_Widget::constructor");
			//console.dir(params);

		},

		mapId : "",
		map : null,
		title : "",
		icon : "",
		alarm : "",
		config : "",
		state : "maximized",

		setId : function(/*Number*/id) {

			this.id = id;
		},
		setTitle : function(/*String*/title) {

			this.title = title;
		},
		setIcon : function(/*String*/icon) {

			this.icon = icon;
		},
		setConfig : function(/*String*/config) {

			this.config = config;
		},
		setState : function(/*String*/state) {

			this.state = state;
		},
		setMap : function(/*esri.Map*/map) {

			this.map = map;

		}
	});
});
