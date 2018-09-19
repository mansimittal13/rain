define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/NavigationMenu.html", "esri/dijit/Scalebar", "esri/dijit/HomeButton", "esri/dijit/LocateButton", "dojo/dom", "dojo/on", "dojo/dom-style", "dojo/topic", "dojo/_base/lang", "esri/toolbars/navigation", "dojo/query", "dojo/dom-attr", "dojo/dom-construct"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, Scalebar, HomeButton, LocateButton, dom, on, domStyle, topic, lang, Navigation, query, domAttr, domConstruct) {

	return declare("mrsac.viewer.NavigationMenu", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		element : null,
		element1 : null,
		constructor : function(/*Object*/params) {

			this.toolNames = {};

		},
		templateString : template,

		postMixInProperties : function() {

		},
		postCreate : function() {
			topic.subscribe("mapLoadedEvent", lang.hitch(this, "onMapLoad"));

		},

		startup : function() {

			//console.log("ControllerMenuItem startup");
		},
		onMapLoad : function(map) {
			this.map = map;
			this.navToolbar = new Navigation(this.map);

			var scalebar = new Scalebar({
				map : this.map,
				scalebarUnit : "metric"
			});
			var domResult = query(".esriScalebarSecondNumber")[0]
			var domResult1 = domResult.textContent;
			var domResult2 = domResult1.lastIndexOf("km");
			domResult1 = domResult1.substring(0, domResult2)
			domResult.innerHTML = domResult1;

			var domResultKm = query(".scaleLabelDiv")[0];

			var domResultKm1 = query(".esriScalebarRuler")[0];

			var row = domConstruct.toDom("<div class='unitKm'style='position: absolute;top: 10px;left:101%;font-size: 11px;font-weight: bolder;color: blue;'>km</div>");
			domConstruct.place(row, domResultKm);

			/*
			 var row0 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS.png'style='top: 7px;left: 20.5%;height: 18px;'/>");
			 domConstruct.place(row0, domResultKm);

			 var row1 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS.png'style='top: 7px;right: 94.8%;height: 18px;'/>");
			 domConstruct.place(row1, domResultKm);

			 var row2 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS.png'style='top: 7px;left: 45%;height:18px;'/>");
			 domConstruct.place(row2, domResultKm);

			 var row3 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS.png'style='top: 7px;left: 70.5%;height: 18px;'/>");
			 domConstruct.place(row3, domResultKm);

			 var row4 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS.png'style='top: 7px;left: 95.5%;height: 18px;'/>");
			 domConstruct.place(row4, domResultKm);*/

			var row0 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS1.png'style='top: 12px;left: 25%;height: 8px;width: 1px;'/>");
			domConstruct.place(row0, domResultKm);

			var row1 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS1.png'style='top: 12px;left: 0%;height: 8px;width: 1px;'/>");
			domConstruct.place(row1, domResultKm);

			var row2 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS1.png'style='top: 12px;left: 50%;height:8px;width: 1px;'/>");
			domConstruct.place(row2, domResultKm);

			var row3 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS1.png'style='top: 12px;left: 75%;height: 8px;width: 1px;'/>");
			domConstruct.place(row3, domResultKm);

			var row4 = domConstruct.toDom("<img class='esriScalebarLabel'src='img/lineS1.png'style='top: 12px;left: 100.5%;height: 8px;width: 1px;'/>");
			domConstruct.place(row4, domResultKm);

			this.map.on("extent-change", function(evt) {

				var domResultVal = query(".esriScalebarSecondNumber")[0]
				var domResult1 = domResultVal.textContent;
				var domResult2 = domResult1.lastIndexOf("km");

				if (domResult2 == -1) {

					var domResult2 = domResult1.lastIndexOf("m");

					domResult1 = domResult1.substring(0, domResult2)
					domResultVal.innerHTML = domResult1;
					var domResultVal1 = query(".unitKm")[0]
					domResultVal1.innerHTML = "m"

				} else {
					var domResult2 = domResult1.lastIndexOf("km");
					domResult1 = domResult1.substring(0, domResult2)
					domResultVal.innerHTML = domResult1;
					var domResultVal1 = query(".unitKm")[0]
					domResultVal1.innerHTML = "km"

				}
				var firstN = query(".esriScalebarLabel")[0];
				domStyle.set(firstN, "left", "-5%");
			});

			var home = new HomeButton({
				map : this.map
			}, "HomeButton");
			home.startup();

			on(dom.byId("HomeButton"), "click", lang.hitch(this, function() {
				topic.publish("mapToolChangedEvent", "FULL_EXTENT");
			}));

			var geoLocate = new LocateButton({
				map : this.map
			}, "LocateButton");
			geoLocate.startup();

			on(dom.byId("LocateButton"), "click", lang.hitch(this, function() {
				topic.publish("mapToolChangedEvent", "CURRENT_LOCATION");
				setTimeout(lang.hitch(this, function() {
					var element = dom.byId('divLoadingIndicator');
					domStyle.set(element, "display", "none");
				}), 1500);
			}));

			this.element = query(".esriSimpleSliderIncrementButton");

			this.element.on("mouseenter", lang.hitch(this, function() {
				domAttr.set(this.element[0], "title", "Zoom In");
			}));

			this.element.on("click", lang.hitch(this, function() {
				topic.publish("mapToolChangedEvent", "ZOOM_IN");
			}));

			this.element1 = query(".esriSimpleSliderDecrementButton");

			this.element1.on("mouseenter", lang.hitch(this, function() {
				domAttr.set(this.element1[0], "title", "Zoom Out");
			}));

			this.element1.on("click", lang.hitch(this, function() {
				topic.publish("mapToolChangedEvent", "ZOOM_OUT");
			}));

			this.homeElement = query(".home");

			this.homeElement.on("mouseenter", lang.hitch(this, function() {
				domAttr.set(this.homeElement[0], "title", "Default Extent");
			}));

		},
		onNavMenuclick : function(evt) {
			var cursorType;
			switch (evt.target.id) {
			case "pan":
				this.onNavRequest(Navigation.PAN, "PAN");
				cursorType = "url('./img/cursor_hand.png'),auto";
				break;
			case "Zoomin":
				this.onNavRequest(Navigation.ZOOM_IN, "ZOOM_IN");
				cursorType = "url('./img/zoom_in.png'),auto";

				break;
			case "Zoomout":
				this.onNavRequest(Navigation.ZOOM_OUT, "ZOOM_OUT");
				cursorType = "url('./img/zoom_out.png'),auto";
				break;
			case "Previous":

				this.navToolbar.zoomToPrevExtent();
				topic.publish("mapToolChangedEvent", "PREVIOUS_EXTENT");
				break;
			case "Next":

				this.navToolbar.zoomToNextExtent();
				topic.publish("mapToolChangedEvent", "NEXT_EXTENT");
			break;
			case "pointerMouse":
			cursorType = "default";
 			
			//	this.navToolbar.zoomToNextExtent();
			 this.navToolbar.deactivate();
				
			}
			//document.getElementsByTagName("body")[0].style.cursor = cursorType;
			document.getElementById("map_container").style.cursor = cursorType;
			document.getElementById("map_layers").style.cursor = cursorType;

			//document.getElementById("map_root").style.cursor = cursorType;
		},

		onNavRequest : function(/*esri.toolbars.Navigation.navType*/navType, /*String*/label) {

			try {
				// Activate the navigation toolbar
				if (navType) {
					this.map.graphics.clear();

					this.navToolbar.activate(navType);
					topic.publish("mapToolChangedEvent", label);
				} else {

					this.navToolbar.deactivate();
					topic.publish("mapToolChangedEvent", "");
				}
			} catch (err) {
				console.error("MapManager::onNavRequest", err);
			}
		}
	});
});
