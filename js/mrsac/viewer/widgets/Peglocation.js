define(["dojo/_base/declare", "dojo/has", "dojo/aspect", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr", 'dijit/_Widget', 'dijit/_Templated', 'dojo/Evented', 'dojox/gfx', 'dojo/fx', 'dojo/fx/Toggler',"esri/geometry/webMercatorUtils","esri/graphic", "esri/layers/GraphicsLayer","esri/symbols/PictureMarkerSymbol","esri/symbols/jsonUtils","esri/geometry/scaleUtils", "esri/config", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ArcGISTiledMapServiceLayer", "dojo/_base/sniff","dojo/on","dojo/dom","esri/geometry/webMercatorUtils","esri/SpatialReference", "esri/InfoTemplate","esri/geometry/Point"], function(declare, has, aspect, lang, array, domConstruct, domClass, domStyle, domAttr, _Widget, _Templated, Evented, gfx, coreFx, Toggler,webMercatorUtils,Graphic, GraphicsLayer,PictureMarkerSymbol,jsonUtils,scaleUtils, esriConfig, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer,on,dom,SpatialReference,InfoTemplate,Point) {

	/**
	 * _TOCNode is a node, with 3 possible types: root layer|serviceLayer|legend
	 * @private
	 */
	var TOC = declare("mrsac.viewer.widgets.Peglocation", [_Widget, Evented], {
		indentSize : 18,
		swatchSize : [30, 30],
		refreshDelay : 500,
		layerInfos : null,
		map:null,
		constructor : function(params, srcNodeRef) {
        // console.log("params");
        // console.log(params);
            this.map=params.map;
			params = params || {};
			if (!params.map) {
				throw new Error('no map defined in params for TOC');
			}
			this.layerInfos = params.layerInfos;
			lang.mixin(this, params);
		},
		// extension point
		postCreate : function() {
         //    alert("calling"); 
			this._createTOC();
		},
		/** @event the widget DOM is loaded
		 *
		 */
		onLoad : function(map) {
		this.map = map;
	//	console.log("this.map");
	//	console.log(this.map );
		},
		_createTOC : function() {
		//	domConstruct.empty(this.domNode);
			document.getElementById("map_gc").style.cursor = "pointer";
			 this.map.on("click", lang.hitch(this, function(evt) {
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);		
   		     console.log(mp);
		  //   alert("lat : "+mp.x+" Long :"+mp.y);
		  	// var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,12,new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL,new Color([247, 34, 101, 0.9]),1), new Color([207, 34, 171, 0.5]));
		// this.deg_to_dms(mp);
		  	 	var symbol = new PictureMarkerSymbol({
				"url" : "img/tagfirststop.png",
				"height" : 20,
				"width" : 20,
				"type" : "esriPMS",
				"angle" : 0
			}); 
	//-----------------------------------------degree to dms------------
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

				var firstresult = "" + d + "°" + m + "'" + s;
				var strlat="Lat: "+firstresult+"E"; 
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

				var secondresult = "" + dsecond + "°" + msecond + "'" + ssecond;
				var strlong="Long: "+secondresult+"N"; 
           //  alert("Lat: "+firstresult+"E Long:"+ secondresult+"N");
          //   var strlatlong="Lat: "+firstresult+"E Long:"+ secondresult+"N";
			
	//-----------------------------------------End degree to dms------------		
			
		  this.map.graphics.clear();
		  	var pt = new Point(mp.y, mp.x);
			console.log(pt);

         this.map.graphics.add(new Graphic(evt.mapPoint, symbol));
          //this.map.infoWindow.setContent("X: " + evt.mapPoint.x.toString() + ", <br>Y: " + evt.mapPoint.y.toString());
         //------------------infotemplate design---
         // this.map.infoWindow.setContent("<table><tr><td>Your Peg Location</td><td></td></tr><tr><td> lat : </td><td>"+mp.x+"</td></tr><tr><td> Long :</td><td>"+mp.y+"</td></tr></table>");
          this.map.infoWindow.setTitle("Your Peg Location");
          this.map.infoWindow.setContent("<table><tr><td></td><td></td></tr><tr><td>Meter Coord. System (m)</td><td></td></tr><tr><td> lat : </td><td>"+ evt.mapPoint.x.toString() +"</td></tr><tr><td> Long :</td><td>"+evt.mapPoint.y.toString()+"</td></tr> <tr><td>Geographic (DD)</td><td></td></tr><tr><td> lat : </td><td>"+mp.x+"</td></tr><tr><td> Long :</td><td>"+mp.y+"</td></tr><tr><td>Deg. Min Sec.(DMS)</td><td></td></tr><tr><td>Lat:</td><td> "+ strlat  +"</td></tr><tr><td>Long:</td><td> "+ strlong  +"</td></tr></table>");
          this.map.infoWindow.show(evt.mapPoint);
          $("#hide").on("click", function(){
   				 alert("call close");
   				 //layer1.hide();
           });
	  //var infoTemplate = new InfoTemplate();
							//infoTemplate.setTitle("Your Peg Location");
						//	infoTemplate.setContent("<table><tr><td> lat : </td><td>"+mp.x+"</td></tr><tr><td> Long :</td><td>"+mp.y+"</td></tr></table>");
		  // var GrphcNA = new Graphic(mp, symbol);
		  // GrphcNA.setInfoTemplate(infoTemplate);
         
 
 	
			}));
          },
          deg_to_dms : function(mp) {

		//	this.map.on("mouse-move", function(evt) {

			//	var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
				//display mouse coordinates
				//latlongnode.innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);

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

				var firstresult = "" + d + "°" + m + "'" + s;
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

				var secondresult = "" + dsecond + "°" + msecond + "'" + ssecond;
           //  alert("Lat: "+firstresult+"E Long:"+ secondresult+"N");
             var strlatlong="Lat: "+firstresult+"E Long:"+ secondresult+"N";
				return strlatlong;
				//display mouse coordinates
				//latlongnode.innerHTML = firstresult + ", " + secondresult;

				//latlongnode.innerHTML = "LatLong:" + " &nbsp;&nbsp;&nbsp;&nbsp;" + "<img src='img/latitude_color.png' style='width:20px;height:20px'/>" + firstresult + "<img src='img/logitude_color.png' style='width:20px;height:20px'/>" + secondresult;
				//latlongnode.innerHTML = "LatLong:" + " &nbsp;&nbsp;&nbsp;&nbsp;" + "<img src='img/logitude_color.png' style='width:20px;height:20px'/>" + firstresult + "<img src='img/latitude_color.png' style='width:20px;height:20px'/>" + secondresult;

		//	});

		},
	
	
	});
	return TOC;

});
