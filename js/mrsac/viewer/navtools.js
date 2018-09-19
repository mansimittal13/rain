/**
 * @author Richa
 */

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/navtools.html", "dojo/text!./templates/Footer.html", "dojo/topic", "dojo/_base/connect", "dojo/query", "dojo/dom-style", "dojo/_base/lang", "esri/geometry/webMercatorUtils"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, Footer,topic, connect, query, domStyle, lang, webMercatorUtils) {

	return declare("mrsac.viewer.navtools", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {

		templateString : template,
		_timeout : null,
		_menuIsVisible : false,
		_mouseIsOverIcon : false,
		_mouseIsOverDropDown : false,
		map : null,
		storePoint : null,
		//NavTypeStatus:null,

		postMixInProperties : function() {

		},

		postCreate : function() {
			topic.subscribe("mapLoadedEvent", lang.hitch(this, "onMapLoad"));

		},

		startup : function() {

		},
		onMapLoad : function(map) {

			this.map = map;
			this.map.on("mouse-move", function(evt) {
				//this.storePoint = evt.mapPoint;

				//console.log(evt.mapPoint)
				/*
				 latlongnode.innerHTML = "";
				 latlongnode.innerHTML += "<img src='img/longitude_color_icon.png' class='mlat' style='width:20px;height:20px;position: absolute;left: -5px;top: -7px;'/>"

				 var element = query(".mlat", this.domNode)[0];
				 var width = domStyle.get(element, "width") + 80;

				 latlongnode.innerHTML += "<div class='mXDiv'style='position:absolute;left:20px;top:-2px;width:" + width + "px;'>X:" + "&nbsp;&nbsp;" + evt.mapPoint.x.toFixed(5) + "</div>"
				 width1 = width + 20;
				 latlongnode.innerHTML += "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;top: -7px;left:" + width1 + "px;'/>"
				 latlongnode.innerHTML += "<div style='position:absolute;width:100px;left:150px;top:-2px'>Y:" + "&nbsp;&nbsp;" + evt.mapPoint.y.toFixed(5) + "</div>"*/
				latlongnode2.innerHTML = "<img src='img/longitude_color_icon.png' class='mlat'style='width:22px;height:22px;position: absolute;left:-5px;top:-7px;'/>" + "<div style='position:absolute;width:150px;left:2px;top:-2px'>Long(X) :" + "&nbsp;&nbsp;" + evt.mapPoint.x.toFixed(2) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:22px;height:22px;position: absolute;left: 139px;top: -7px;'/>" + "<div style='position:absolute;width:150px;left:142px;top:-2px'>Lat(Y) :" + "&nbsp;&nbsp;" + evt.mapPoint.y.toFixed(2) + "</div><div style='position:absolute;width:35px;left:274px;top:-2px'>meters</div>";

				latlongnode.innerHTML = "<img src='img/longitude_color_icon.png' class='mlat'style='width:22px;height:22px;position: absolute;left:-5px;top:-7px;'/>" + "<div style='position:absolute;width:150px;left:20px;top:-2px'>Long(X) :" + "&nbsp;&nbsp;" + evt.mapPoint.x.toFixed(2) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:22px;height:22px;position: absolute;left: 129px;top: -7px;'/>" + "<div style='position:absolute;width:150px;left:157px;top:-2px'>Lat(Y) :" + "&nbsp;&nbsp;" + evt.mapPoint.y.toFixed(2) + "</div><div style='position:absolute;width:35px;left:268px;top:-2px'>meters</div>";
			});

		},

		onmouseoverimg : function(evt) {
			this._mouseIsOverIcon = true; 
			this.delayedCheckMenuState(200);
		},
		outmouseoverimg : function(evt) {
			this._mouseIsOverIcon = false;
			this.delayedCheckMenuState(50);
		},
		onMouseOverlist : function(evt) {
			this._mouseIsOverDropDown = true;
			this.delayedCheckMenuState(200);
		},
		onMouseOutlist : function(evt) {
			this._mouseIsOverDropDown = false;
			this.delayedCheckMenuState(50);
		},
		delayedCheckMenuState : function(/*Number*/delay) {
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.timeout = setTimeout(lang.hitch(this, function() {
				this.checkMenuState();
			}), delay);
		},
		checkMenuState : function() {
			if (this._menuIsVisible === false) {
				// Menu isn't showing. Should it be?
				if (this._mouseIsOverIcon === true || this._mouseIsOverDropDown === true) {
					this.showMenu();
				}
			} else {
				// Menu is showing. Should we hide it?
				if (this._mouseIsOverIcon === false && this._mouseIsOverDropDown === false) {
					this.hideMenu();
				}
			}
		},
		showMenu : function() {
			var element = query(".footertool", this.domNode)[0];
			domStyle.set(element, "display", "block");

			this._menuIsVisible = true;
		},
		hideMenu : function() {
			var element = query(".footertool", this.domNode)[0];
			domStyle.set(element, "display", "none");

			this._menuIsVisible = false;
		},
		basemapButtonBar_changeHandler : function(event) {

			var element = query(".footertool", this.domNode)[0];
			domStyle.set(element, "display", "none");
			this._menuIsVisible = false;

			this.typr = event.target.id;
			this.NavTypeStatus = "null"

			var wkid = this.map.spatialReference.wkid;

			//alert(wkid);
			var latlongnode2 = query(".latlongbar2",this.domNode)[0];

			var latlongnode = query(".latlongbar",this.domNode)[0];

			if (this.typr === "mercator") {
				if (wkid === 102100 || wkid === 102113 || wkid === 3857) {

					this.map.on("mouse-move", function(evt) {

						latlongnode.innerHTML = "<img src='img/longitude_color_icon.png' class='mlat'style='width:22px;height:22px;position: absolute;left:-5px;top:-7px;'/>" + "<div style='position:absolute;width:150px;left:16px;top:-2px'>Long(X) :" + "&nbsp;&nbsp;" + evt.mapPoint.x.toFixed(2) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:22px;height:22px;position: absolute;left: 129px;top: -7px;'/>" + "<div style='position:absolute;width:150px;left:157px;top:-2px'>Lat(Y) :" + "&nbsp;&nbsp;" + evt.mapPoint.y.toFixed(2) + "</div><div style='position:absolute;width:35px;left:268px;top:-2px'>meters</div>";

					});

				} else if (wkid === 4326 || wkid === 4269 || wkid === 4267) {

					this.geographicToMercator(event);

				}
			} else if (this.typr === "geo") {
				if (wkid === 102100 || wkid === 102113 || wkid === 3857) {

					this.mercatorToGeographic(event);

				} else if (wkid === 4326 || wkid === 4269 || wkid === 4267) {

				}
			} else if (this.typr === "dms") {

				if (wkid === 102100 || wkid === 102113 || wkid === 3857) {

					this.mercatorToDMS(event, this.storePoint);

				} else if (wkid === 4326 || wkid === 4269 || wkid === 4267) {
					this.geographicToDMS(event);

				}
			}

		},
		geographicToMercator : function(evt) {

			this.map.on("mouse-move", function(evt) {

				var geo = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
				latlongnode.innerHTML = "<img src='img/longitude_color_icon.png' class='mlat'style='width:22px;height:22px;position: absolute;left:-5px;top:-7px;'/>" + "<div style='position:absolute;width:150px;left:16px;top:-2px'>Long(X) :" + "&nbsp;&nbsp;" + evt.mapPoint.x.toFixed(2) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:22px;height:22px;position: absolute;left: 129px;top: -7px;'/>" + "<div style='position:absolute;width:150px;left:157px;top:-2px'>Lat(Y) :" + "&nbsp;&nbsp;" + evt.mapPoint.y.toFixed(2) + "</div><div style='position:absolute;width:35px;left:268px;top:-2px'>meters</div>";
				latlongnode2.innerHTML = "<img src='img/longitude_color_icon.png' class='mlat'style='width:22px;height:22px;position: absolute;left:-5px;top:-7px;'/>" + "<div style='position:absolute;width:150px;left:16px;top:-2px'>Long(X) :" + "&nbsp;&nbsp;" + evt.mapPoint.x.toFixed(2) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:22px;height:22px;position: absolute;left: 129px;top: -7px;'/>" + "<div style='position:absolute;width:150px;left:157px;top:-2px'>Lat(Y) :" + "&nbsp;&nbsp;" + evt.mapPoint.y.toFixed(2) + "</div><div style='position:absolute;width:35px;left:268px;top:-2px'>meters</div>";

			});

		},
		mercatorToGeographic : function(evt) {

			this.map.on("mouse-move", function(evt) {

				var geo = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);

				latlongnode.innerHTML = "<img src='img/longitude_color_icon.png' style='width:20px;height:20px;;position: absolute;left: -5px;top: -7px;'/>" + "<div style='position:absolute;width:130px;top:-2px;left:16px'>Long(DD) :" + "&nbsp;&nbsp;" + geo.x.toFixed(5) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: 133px;top: -7px;'/>" + "<div style='position:absolute;top:-2px;left:155px;width:130px'>Lat(DD) :" + "&nbsp;&nbsp;" + geo.y.toFixed(5) + "</div>";
				latlongnode2.innerHTML = "<img src='img/longitude_color_icon.png' style='width:20px;height:20px;;position: absolute;left: -5px;top: -7px;'/>" + "<div style='position:absolute;width:130px;top:-2px;left:16px'>Long(DD) :" + "&nbsp;&nbsp;" + geo.x.toFixed(5) + "</div>" + "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: 143px;top: -7px;'/>" + "<div style='position:absolute;top:-2px;left:155px;width:130px'>Lat(DD) :" + "&nbsp;&nbsp;" + geo.y.toFixed(5) + "</div>";

			});

		},
		mercatorToDMS : function(evt, b) {

			this.map.on("mouse-move", function(evt) {

				var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
				//display mouse coordinates

				var first = mp.x.toFixed(3);

				var d = Math.floor(first);
				var minfloat = (first - d) * 60;
				var m = Math.floor(minfloat);
				var secfloat = (minfloat - m) * 60;
				//var s = Math.round(secfloat);
				var s = secfloat.toFixed(3);
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

				var firstresult = "" + d + "°" + m + "'" + s + '"';

				var second = mp.y.toFixed(3);

				var dsecond = Math.floor(second);
				var minfloatsecond = (second - dsecond) * 60;
				var msecond = Math.floor(minfloatsecond);
				var secfloatsecond = (minfloatsecond - msecond) * 60;
				//var ssecond = Math.round(secfloatsecond);
				var ssecond = secfloatsecond.toFixed(3);

				// After rounding, the seconds might become 60. These two
				// if-tests are not necessary if no rounding is done.
				if (ssecond == 60) {
					msecond++;
					ssecond = 0;
				}
				if (msecond == 60) {
					dsecond++;
				}

				var secondresult = "" + dsecond + "°" + msecond + "'" + ssecond + '"';

				latlongnode.innerHTML = "<img src='img/longitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: -5px;top: -7px;'/>" + "<div style='position:absolute;top:-2px;width:170px;left:16px'>Long(DMS) :" + " &nbsp;" + firstresult + " &nbsp;" + "E</div>" + "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: 165px;top: -7px;'/>" + "<div style='position:absolute;left:187px;top:-2px;width:160px'>Lat(DMS) :" + " &nbsp;" + secondresult + " &nbsp;" + "N</div>";
				latlongnode2.innerHTML = "<img src='img/longitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: -5px;top: -7px;'/>" + "<div style='position:absolute;top:-2px;width:150px;left:16px'>Long(DMS) :" + " &nbsp;" + firstresult + " &nbsp;" + "E</div>" + "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: 172px;top: -7px;'/>" + "<div style='position:absolute;left:185px;top:-2px;width:160px'>Lat(DMS) :" + " &nbsp;" + secondresult + " &nbsp;" + "N</div>";

			});

		},
		geographicToDMS : function(evt) {

			this.map.on("mouse-move", function(evt) {

				var mp = webMercatorUtils.geographicToWebMercator(evt.mapPoint);

				var first = mp.x.toFixed(3);

				var d = Math.floor(first);
				var minfloat = (first - d) * 60;
				var m = Math.floor(minfloat);
				var secfloat = (minfloat - m) * 60;
				var s = Math.round(secfloat);
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

				var firstresult = "" + d + "°" + m + "'" + s + '"';

				var second = mp.y.toFixed(3);

				var dsecond = Math.floor(second);
				var minfloatsecond = (second - dsecond) * 60;
				var msecond = Math.floor(minfloatsecond);
				var secfloatsecond = (minfloatsecond - msecond) * 60;
				var ssecond = Math.round(secfloatsecond);

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

				var secondresult = "" + dsecond + "°" + msecond + "'" + ssecond + '"';

				latlongnode.innerHTML = "<img src='img/longitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: -5px;top: -7px;'/>" + "<div style='position:absolute;top:-2px;width:170px;left:16px'>Long(DMS) :" + " &nbsp;&nbsp;" + firstresult + " &nbsp;" + "E</div>" + "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: 180px;top: -7px;'/>" + "<div style='position:absolute;left:205px;top:-2px;width:160px'>Lat(DMS) :" + " &nbsp;&nbsp;" + secondresult + " &nbsp;" + "N</div>";
				latlongnode2.innerHTML = "<img src='img/longitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: -5px;top: -7px;'/>" + "<div style='position:absolute;top:-2px;width:170px;left:16px'>Long(DMS) :" + " &nbsp;&nbsp;" + firstresult + " &nbsp;" + "E</div>" + "<img src='img/latitude_color_icon.png' style='width:20px;height:20px;position: absolute;left: 180px;top: -7px;'/>" + "<div style='position:absolute;left:205px;top:-2px;width:160px'>Lat(DMS) :" + " &nbsp;&nbsp;" + secondresult + " &nbsp;" + "N</div>";

			});

		},
	});
});
