define (["dojo/topic","viewer/_ThemeWidget", "dojo/_base/declare", "dojo/text!./templates/rainfall.html", "viewer/domain","dojo/aspect", "dijit/layout/ContentPane", "dojo/_base/array", "dojo/dom", "esri/lang", "dojo/_base/lang", "esri/map", "dojo/data/ItemFileReadStore", "viewer/TableFrame", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ImageParameters","esri/tasks/Geoprocessor", "esri/InfoTemplate", "dojo/request/xhr", "dijit/registry", "esri/layers/GraphicsLayer", "esri/dijit/InfoWindow", "dojo/dom-construct", "esri/graphic", "esri/graphicsUtils", "dojo/on", "esri/geometry/Extent", "esri/geometry/Point", "esri/geometry/Polygon", "esri/geometry/Polyline", "esri/geometry/webMercatorUtils", "esri/SpatialReference", "esri/geometry/Circle", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/symbols/SimpleMarkerSymbol", "esri/renderers/SimpleRenderer", "esri/tasks/QueryTask", "esri/tasks/query", "dojo/store/Memory", "dijit/TitlePane", "dijit/form/Button", "dgrid/Grid", "esri/domUtils", "dojo/dom-style", "dojo/dnd/Moveable", "dijit/form/DateTextBox", "dojo/date/locale", "esri/tasks/RelationshipQuery", "esri/layers/FeatureLayer", "esri/tasks/StatisticDefinition", "dijit/form/FilteringSelect", "dojox/widget/TitleGroup", "dijit/TitlePane"], function (topic,_ThemeWidget, declare,template, domain, aspect, ContentPane, array, dom, esriLang, lang, map, ItemFileReadStore, TableFrame, ArcGISDynamicMapServiceLayer, ImageParameters,Geoprocessor, InfoTemplate, xhr, registry, GraphicsLayer, InfoWindow, domConstruct, Graphic, graphicsUtils, on, Extent, Point, Polygon, Polyline, webMercatorUtils, SpatialReference, Circle, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, Color, SimpleMarkerSymbol, SimpleRenderer, QueryTask, Query, Memory, TitlePane, Button, Grid, domUtils, domStyle, Moveable, DateTextBox, locale, RelationshipQuery, FeatureLayer, StatisticDefinition) {
	return declare ("mrsac.viewer.widgets.rainfall", [mrsac.viewer._ThemeWidget,mrsac.viewer.domain], {
		templateString : template,
		_initialized : false,
		newmap : null,
		asssets : null,
		schedules : null,
		pointGraphicsLayer : null,
		lineGraphicsLayer : null,
		markersLayer : null,
		initExtent : null,
		wssdassets : null,
		pointassets : null,
		lineassets : null,
		wslabs : null,
		infotemp : null,
		dnd : null,
		dynamicMapServiceLayer : null,
		featureLayer : null,
		featureLayer1 : null,
		featureLayer2 : null,
		featureLayer3 : null,
		stroke : "#FF1744",
		fill : "#FFCDD2",
		pointClickHandler : null,
		lineClickHandler : null,
		constructor : function () {

			grid = null;
		},
		postMixInProperties : function () {
			try {
				this.inherited (arguments);
				if (this.configData) {
					// Layers are read from config in startup
				}
			}
			catch (err) {
				console.error (err);
			}
		},
		postCreate : function () {
			try {
				this.inherited (arguments);
			}
			catch (err) {
				console.error (err);
			}
		},
		startup : function () {

			this.inherited (arguments);
			if (this._initialized) {
				return;
			}

			try {

				locationObj = this;
			/*	this.initExtent = new Extent ({
					"xmin" : 70.6187680823695,
					"ymin" : 15.4475458269814,
					"xmax" : 82.9222397791935,
					"ymax" : 22.1881443737139,
					"spatialReference" : {
						"wkid" : 4326
					}
				});*/
				
				this.initExtent = new Extent ({
					"xmin" : 68.9995834543952,
					"ymin" :  14.9995834301808,
					"xmax" : 85.0004167877285,
					"ymax" : 23.0004167635141,
					"spatialReference" : {
						"wkid" : 4326
					}
				});

				if (!this.markersLayer || this.markersLayer === null)
					this.markersLayer = new GraphicsLayer ({
						id : 'mLayer',
						visible : true
					});
				if (!this.pointGraphicsLayer || this.pointGraphicsLayer === null)
					this.pointGraphicsLayer = new GraphicsLayer ({
						id : 'gLayer',
						visible : true
					});
				if (!this.lineGraphicsLayer || this.lineGraphicsLayer === null)
					this.lineGraphicsLayer = new GraphicsLayer ({
						id : 'lLayer',
						visible : true
					});
				if (!this.polygonGraphicsLayer || this.polygonGraphicsLayer === null)
					this.polygonGraphicsLayer = new GraphicsLayer ({
						id : 'pLayer',
						visible : true
					});

				this.countyLayer = new GraphicsLayer ({
					className : "geomG"
				});
				this.map.addLayer (this.countyLayer);
				this.markersLayer.setMaxScale (750000);
				this.lineGraphicsLayer.setMinScale (750000);
				this.map.addLayer (this.lineGraphicsLayer);
				this.map.addLayer (this.pointGraphicsLayer);
				this.map.addLayer (this.polygonGraphicsLayer);
				this.map.addLayer (this.markersLayer);
				this.loading = dom.byId ("divLoadingIndicator");
				glayer1 = new GraphicsLayer ({
					id : 'pLayer1',
					visible : true
				});
				this.map.addLayer (glayer1);
				glayer2 = new GraphicsLayer ({
					id : 'pLayer2',
					visible : true
				});
				this.graphicsLayer = new GraphicsLayer ({
					// id: 'gLayer',
					visible : true
				});
				this.map.addLayer (this.graphicsLayer);
         
		 this.currentdate();
		
			}

			catch (err) {
				console.error ("SearchWidget::startup", err);
			}
		},
currentdate :function(){
		var date = new Date();
			var newdate = new Date(date);
			newdate.setDate(newdate.getDate());
			var dd = newdate.getDate();
			if (dd > 0 && dd < 10) {
				dd = '0' + dd;
			}
			var mm = newdate.getMonth() + 1;
			if (mm > 0 && mm < 10) {
				mm = '0' + mm;
			}
			/*	var mmm;
			 if (mm == 1) {
			 mmm = "Jan";
			 }
			 if (mm == 2) {
			 mmm = "Feb";
			 }
			 if (mm == 3) {
			 mmm = "Mar";
			 }
			 if (mm == 4) {
			 mmm = "Apr";
			 }
			 if (mm == 5) {
			 mmm = "May";
			 }
			 if (mm == 6) {
			 mmm = "Jun";
			 }
			 if (mm == 7) {
			 mmm = "Jul";
			 }
			 if (mm == 8) {
			 mmm = "Aug";
			 }
			 if (mm == 9) {
			 mmm = "Sep";
			 }
			 if (mm == 10) {
			 mmm = "Oct";
			 }
			 if (mm == 11) {
			 mmm = "Nov";
			 }
			 if (mm == 12) {
			 mmm = "Dec";
			 } */

			var y = newdate.getFullYear();
			var todaydate2 = mm + '-' + dd + '-' + y;

			document.getElementById("date1live").value = todaydate2;
			
	
},
covertdatenormal:function(dt){
	//var text3pre = dt;
			//---------
			var p1dt = new Date(dt);
			var pdt = p1dt.getDate();
			var pmm = p1dt.getMonth() + 1;
			//January is 0!
			if (pdt < 10) {
			pdt = '0' + pdt;
			}
			if (pmm < 10) {
			pmm = '0' + pmm;
			}
			var pyyyy = p1dt.getFullYear();
			var df1pre = pyyyy + "-" + pmm + "-" + pdt;
			return df1pre;
			//----------
},
covertdatecombine:function(dt){
	//var text3pre = dt;
			//---------
			var p1dt = new Date(dt);
			var pdt = p1dt.getDate();
			var pmm = p1dt.getMonth() + 1;
			//January is 0!
			if (pdt < 10) {
			pdt = '0' + pdt;
			}
			if (pmm < 10) {
			pmm = '0' + pmm;
			}
			var pyyyy = p1dt.getFullYear().toString().substr(-2);
			var df1pre = "D"+pdt+ pmm + pyyyy;
			return df1pre;
			//----------
},
	
/**************** Download CSV *************************************************************************/
		getAssets1 : function (evt) {
			dom.byId("tdb1").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
		//	alert("Download CSV");	
				this.loadmrsac();
								var paramsGeo3 = {
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/downloadcsv_int/GPServer/downloadcsv");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------
					
		},
		/**************** Automatic update *************************************************************************/
		getAssets2 : function (evt) {
			dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
		//	alert("Automatic update");	
		var dateselected = document.getElementById('date1live').value;
		  console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
				
		},
		/**************** Daily Analysis *************************************************************************/
		getAssets3 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("Daily Analysis");		
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
		  	this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/dailyanalysis_int/GPServer/dailyanalysis");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------
		},
		/**************** Cumolative *************************************************************************/
		getAssets4 : function (evt) {
			dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("Cumolative");
			var dateselected = document.getElementById('date1live').value;
		  console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
		  
		  	this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected),
									"Endvalue":this.covertdatenormal(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/cumulative_int/GPServer/cumulative");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------
		  				
		},
		/**************** Table *************************************************************************/
		getAssets5 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
		//	alert("Table");		
		var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
		  	this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/table_int/GPServer/table");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------		
		},
		/**************** District Export *************************************************************************/
		getAssets6 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("District Export");		
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));	
		    	this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("http://117.240.213.119/gp/rest/services/weather/districtexport_int/GPServer/districtexport");
						console.log("assets6");
						console.log(paramsGeo3);
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------			
		},
		/**************** Taluka Export *************************************************************************/
		getAssets7 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("Taluka Export");
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
		  	this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/talukaexport_int/GPServer/talukaexport");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------		
		  				
		},
		/**************** Circle Export *************************************************************************/
		getAssets8 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("Circle Export");	
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
		  this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/circleexport_int/GPServer/circleexport");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------					
		},
		/**************** District Initial *************************************************************************/
		getAssets9 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("District Initial");	
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));	
		   this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/districtinitial_int/GPServer/districtinitial");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------			
		  		
		},
		/**************** Taluka Initial *************************************************************************/
		getAssets10 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByUnSelectedPrecinct_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			//alert("Taluka Initial");	
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));	
		    this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/talukainitial_int/GPServer/talukainitial");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------				
		},
		/**************** Circle Initial *************************************************************************/
		getAssets11 : function (evt) {
dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByUnSelectedPrecinct_cf";
			//alert("Circle Initial");		
			var dateselected = document.getElementById('date1live').value;
		  //console.log(this.covertdatenormal(dateselected));
		  console.log(this.covertdatecombine(dateselected));
		   this.loadmrsac();
								var paramsGeo3 = {
									"Zvalue" :this.covertdatecombine(dateselected)
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("https://117.240.213.119/gp/rest/services/weather/circleinitial_int/GPServer/circleinitial");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------		
		  	
		},
/*****************************************************************************************/
	 gpservicecalling:function(){
	 	document.getElementById("errormessage").innerHTML = " ";
	 	
	 		this.loadmrsac();
								var paramsGeo3 = {
							"District" : Distnameval,
							"Taluka" : Talukanameval,
							"Scheme_name" : schemeidval,
							"MRSAC_ID" : mrsacid
						};
								var paramsGeo2 = {
							"District" : Distnameval,
							"Taluka" : Talukanameval,
							"Scheme_name" : schemeidval,
							"MRSAC_ID" : mrsacid
						};
					

						var paramsGeo = {
							"District" : Distnameval,
							"Taluka" : Talukanameval,
							"MRSAC_ID" : mrsacid
						};
						
						//---------------------
						var gpPrint3 = new Geoprocessor("http://117.240.213.123/webadpgis8/rest/services/wssd/WSSDRR/GPServer/WSSDRR");
						gpPrint3.execute(paramsGeo3, lang.hitch(this, this.savegpComplete), lang.hitch(this, this.gpJobFailed));
							//--------------------------
									
	 },
	 	savegpComplete : function(results, messages) {
	 		alert("into save gp")
	 		console.log(results);
	 		console.log(messages);
			/*
			var resultImg = jobinfo[0].value.url;
						 console.log(resultImg);
					/*	var left = (screen.width / 2.5) - (400 / 2);
						var top = (screen.height / 2.5) - (400 / 2);
						var url = "./geninfo/printForm.htm?snapshot=" + resultImg;
						var url = resultImg; */
					//	window.open(url, target = '_blank', 'width=1100,height=600, top=5%, left=5%');
						//document.getElementById("errormessage").innerHTML = "Executed Sucessfuly";*/
			
			this.unloadmrsac();
		},
	
		gpJobFailed : function(err) {
		//	alert(err);
			console.log(err);
				document.getElementById("errormessage").innerHTML = err;
			this.unloadmrsac();

		},
		clearALLG2 : function () {
			//*******************************************remove table***************************//
			document.getElementById("errormessage").innerHTML = " ";
			dom.byId("tdb1").className = "tdSearchByAddress_cf";
			dom.byId("tdb2").className = "tdSearchByAddress_cf";
			dom.byId("tdb3").className = "tdSearchByAddress_cf";
			dom.byId("tdb4").className = "tdSearchByAddress_cf";
			dom.byId("tdb5").className = "tdSearchByAddress_cf";
			dom.byId("tdb6").className = "tdSearchByAddress_cf";
			dom.byId("tdb7").className = "tdSearchByAddress_cf";
			dom.byId("tdb8").className = "tdSearchByAddress_cf";
			dom.byId("tdb9").className = "tdSearchByAddress_cf";
			dom.byId("tdb10").className = "tdSearchByAddress_cf";
			dom.byId("tdb11").className = "tdSearchByAddress_cf";
			
			
		},
		
		
		shutdown : function () {
			this.map.graphics.clear ();
		},
	});
});
