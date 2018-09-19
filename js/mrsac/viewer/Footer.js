/**
 * @author Richa
 */

define (["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/Footer.html", "js/mrsac/viewer/nls/ControllerStrings.js", "dojo/topic", "dojo/_base/lang", "dojo/_base/array", "dojo/request/xhr", "dojo/dom-construct", "dojo/query", "esri/geometry/webMercatorUtils", "esri/geometry/Extent", "dojo/dom", "dojo/on", "dojo/_base/connect", "dojo/string", "dijit/form/ComboBox", "dijit/form/ComboButton", "esri/dijit/OverviewMap", "dojo/dom-style", "esri/geometry/scaleUtils"], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, ControllerStrings, topic, lang, array, xhr, domConstruct, query, webMercatorUtils, Extent, dom, on, connect, string, ComboBox, ComboButton, OverviewMap, domStyle, scaleUtils) {

	return declare ("mrsac.viewer.Footer", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		//templateString : "<div class='scalebarcustom' style='display: block;'></div>",
		templateString : template,
		i18nStrings : null,
		iconNode : null,
		latlongnode : null,
		latlongnode2 : null,
		latlongnodeid : null,
		latnode : null,
		longnode : null,
		typr : "",
		layoutJSON : null,
		postMixInProperties : function () {
			this.i18nStrings = ControllerStrings;

			//console.log("ConfigManager postMixInProperties");
		},

		postCreate : function () {
			topic.subscribe ("mapLoadedEvent", lang.hitch (this, "onMapLoad"));
			topic.subscribe ("mapToolChangedEvent", lang.hitch (this, "onMapToolChange"));

			//console.log("ConfigManager postCreate");
		},

		startup : function () {

			//console.log("ConfigManager startup");
			var policOptions = document.getElementById ("policyOption");
			domConstruct.place (policOptions, "map");
			var visitorCount = document.getElementById ("visitorCountBox");
			domConstruct.place (visitorCount, "map");
			var locCount = document.getElementById ("locBox");
			domConstruct.place (locCount, "map");
			this.footLoad ();
		},

		footLoad : function () {

			iconNode = query(this.domNode)[0];

		},
		onMapLoad : function (map) {

			this.map = map;
			var initialExtent = new Extent ({
				"xmin" : 244598,
				"ymin" : 6241389,
				"xmax" : 278995,
				"ymax" : 6264320,
				"spatialReference" : {
					"wkid" : 102100
				}
			});

			var overviewMapDijit = new OverviewMap ({
				map : this.map,
				visible : false,
				attachTo : "bottom-right",
				color : "#FF0000",
				opacity : .40,
				width : this.map.width / 6,

			});
			overviewMapDijit.startup ();

			this.map.on ("extent-change", function (evt) {

				/*
				console.log(evt)
				var scale = Math.round(esri.geometry.getScale(map));
				console.log(scale)
				if (scale > 999 && scale <= 999999) {
				scale = Math.round(scale / 1000) + " <b>K</b>";
				} else if (scale > 999999) {
				scale = Math.round(scale / 1000000) + " <b>M</b>";
				} else if (scale > 0 && scale <= 999) {
				scale = Math.round(scale) + " <b>Ft</b>";
				}
				console.log(scale)*/

				//dom.byId("scale").innerHTML = "LOD Level: <i>" + evt.lod.level + '&nbsp;&nbsp;&nbsp;' +
				// "</i> Resolution: <i>" + evt.lod.resolution.toFixed(3) + '&nbsp;&nbsp;&nbsp;' + "</i>
				// Scale: <i>" + evt.lod.scale.toFixed(3) + "</i>";

				//dom.byId("scale").innerHTML = "Scale  &nbsp;: " + evt.lod.scale.toFixed(3);
				dom.byId ("scale").innerHTML = "Scale 1 : " + evt.lod.scale.toFixed (2);
				dom.byId ("scale2").innerHTML = "Scale 1 : " + evt.lod.scale.toFixed (2);
				//surya :Changed from 3 to 2

			});

			connect.connect (this.map, "onExtentChange", this, "showExtent");

			this.getlatlong ();

		},
		showExtent : function (extent) {
			var s = "";
			s = "XMin: " + extent.xmin.toFixed (2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + "YMin: " + extent.ymin.toFixed (2) + "&nbsp;&nbsp;&nbsp;&nbsp; " + "XMax: " + extent.xmax.toFixed (2) + "&nbsp;&nbsp;&nbsp;&nbsp; " + "YMax: " + extent.ymax.toFixed (2);
			//dom.byId("info").innerHTML = s;

		},
		getlatlong : function () {

			latlongnode = dom.byId ("latlongbar");
			latlongnode2 = dom.byId ("latlongbar2");
			latnode = document.getElementById ("lat");
			longnode = document.getElementById ("long");

			//this.map.on("load", function(evt) {
			this.map.on ("mouse-move", function (evt) {

				var mp = webMercatorUtils.webMercatorToGeographic (evt.mapPoint);
				//	latlongnode.innerHTML = "LatLong:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + "<img
				// src='img/logitude_color.png' style='width:20px;height:20px'/>" + mp.x.toFixed(3) + "<img
				// src='img/latitude_color.png' style='width:20px;height:20px'/>" + mp.y.toFixed(3);

				//latlongnode.innerHTML = "LatLong:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + "<img
				// src='img/latitude_color.png' style='width:20px;height:20px'/>" + mp.x.toFixed(3) + "<img
				// src='img/logitude_color.png' style='width:20px;height:20px'/>" + mp.y.toFixed(3);

			});

		},

		clickcheck : function () {
			var checkstatus = document.getElementById ("footercheck").checked;

			if (checkstatus == false) {
				this.deg_to_dms ();
			}
			else {

				this.getlatlong ();

			};

		},
		deg_to_dms : function (deg) {

			this.map.on ("mouse-move", function (evt) {

				var mp = webMercatorUtils.webMercatorToGeographic (evt.mapPoint);
				//display mouse coordinates
				//latlongnode.innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);

				var first = mp.x.toFixed (3);

				var d = Math.floor (first);
				var minfloat = (first - d) * 60;
				var m = Math.floor (minfloat);
				var secfloat = (minfloat - m) * 60;
				var s = Math.round (secfloat);
				// After rounding, the seconds might become 60. These two
				// if-tests are not necessary if no rounding is done.
				if (s == 60) {
					m++;
					s = 0;
				}
				if (m == 60) {
					d++;
					m = 0;
				}

				var firstresult = "" + d + "°" + m + "'" + s;

				var second = mp.y.toFixed (3);

				var dsecond = Math.floor (second);
				var minfloatsecond = (second - dsecond) * 60;
				var msecond = Math.floor (minfloatsecond);
				var secfloatsecond = (minfloatsecond - msecond) * 60;
				var ssecond = Math.round (secfloatsecond);

				// After rounding, the seconds might become 60. These two
				// if-tests are not necessary if no rounding is done.
				if (ssecond == 60) {
					msecond++;
					ssecond = 0;
				}
				if (msecond == 60) {
					dsecond++;
					msecond = 0;
				}

				var secondresult = "" + dsecond + "°" + msecond + "'" + ssecond;

				//display mouse coordinates
				//latlongnode.innerHTML = firstresult + ", " + secondresult;

				//latlongnode.innerHTML = "LatLong:" + " &nbsp;&nbsp;&nbsp;&nbsp;" + "<img
				// src='img/latitude_color.png' style='width:20px;height:20px'/>" + firstresult + "<img
				// src='img/logitude_color.png' style='width:20px;height:20px'/>" + secondresult;
				//latlongnode.innerHTML = "LatLong:" + " &nbsp;&nbsp;&nbsp;&nbsp;" + "<img
				// src='img/logitude_color.png' style='width:20px;height:20px'/>" + firstresult + "<img
				// src='img/latitude_color.png' style='width:20px;height:20px'/>" + secondresult;

			});

		},
		onMapToolChange : function (/*String*/toolName) {

			this.setToolText (toolName);
		},
		setStatus : function (/*String*/status) {

			var element = query(".footerstatus", this.domNode)[0];
			element.innerHTML = status;
		},

		setToolText : function (/*String*/toolText) {

			var msg = "";
			if (toolText) {
				msg = string.substitute (this.i18nStrings.msgCurrentTool, [toolText]);
			}
			this.setStatus (msg);
		},
		privacy : function () {
			//alert("hi");
		},
		copyright : function () {

		},
		terms_use : function () {

		},
		about : function () {

		},
		openOption : function () {
			var div = document.getElementById ("policyOption");
			if (div.style.display !== "none") {
				div.style.display = "none";
			}
			else {
				div.style.display = "block";
			}
		},
		viewVisitorCount : function () {
			var div = document.getElementById ("visitorCountBox");
			if (div.style.display !== "none") {
				div.style.display = "none";
			}
			else {
				div.style.display = "block";
			}
		},
		viewLoc : function () {
			var div = document.getElementById ("locBox");
			if (div.style.display !== "none") {
				div.style.display = "none";
			}
			else {
				div.style.display = "block";
			}
		}
	});
});
