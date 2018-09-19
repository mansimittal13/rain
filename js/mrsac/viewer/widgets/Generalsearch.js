define(["viewer/_BaseWidget", "viewer/_MapGraphicsMaintainer", "dojo/_base/declare", "dojo/text!./templates/Generalsearch.html", "esri/dijit/BasemapGallery", "dijit/form/TextBox", "dojox/grid/DataGrid", "viewer/ResultList2", "dojo/data/ItemFileReadStore", "dojo/on", "esri/tasks/FindTask", "esri/tasks/FindParameters", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/PictureMarkerSymbol", "esri/Color", "esri/geometry/Polygon", "dojo/dom", "dojo/query", "dojo/_base/lang", "esri/tasks/QueryTask", "esri/tasks/query", "dojo/store/Memory", "dojo/_base/array", "esri/graphicsUtils", "dojo/_base/connect", "esri/graphic", "dojo/string", "dojo/topic", "dijit/form/FilteringSelect", "dijit/form/TextBox"], function(_BaseWidget, _MapGraphicsMaintainer, declare, template, BasemapGallery, TextBox, DataGrid, ResultList2, ItemFileReadStore, on, FindTask, FindParameters, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol, Color, Polygon, dom, query, lang, QueryTask, Query, Memory, array, graphicsUtils, connect, Graphic, string, topic, FilteringSelect) {

	return declare("mrsac.viewer.widgets.Generalsearch", [mrsac.viewer._BaseWidget, mrsac.viewer._MapGraphicsMaintainer], {
		constructor : function(/*Object*/params) {
			this.layers = [];
			newlist = [];
		},
		templateString : template,
		_initialized : false,
		findParams : null,
		findTask : null,
		smallIconUrl : "",
		content : "",
		closeUrl : "",
		length : null,
		length1 : null,
		length2 : null,

		postMixInProperties : function() {

			try {
				this.inherited(arguments);

				if (this.configData) {

					// Layers are read from config in startup
				}

			} catch (err) {
				console.error(err);
			}
		},
		postCreate : function() {

			try {
				this.inherited(arguments);

				on(this.arviT, "keydown", lang.hitch(this, function(event) {
					if (event.keyCode == 13) {

						this.doFind()
					}
				}))
			} catch (err) {
				console.error(err);
			}
		},
		startup : function() {

			this.inherited(arguments);

			if (this._initialized) {
				return;
			}

			try {

				this.getAllNamedChildDijits();

				this.smallIconUrl = "js/mrsac/viewer/assets/images/small_icons/searchgeneral.png";
				this.messageNode = query(".resultsMsg1", this.domNode)[0];
				this.closeUrl = "js/mrsac/viewer/assets/images/small_icons/close.png";

				this.connects.push(connect.connect(this.widgets.results, "onResultClick", this, "onResultClick"));

				this.symbols = {
					point : new PictureMarkerSymbol(this.iconUrl, 40, 40),
					line : new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 3),
					polygon : new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2), new Color([0, 255, 255, 0.5]))
				};
				this.createsearch();
				//queryTask2 = new QueryTask("http://mrsac.maharashtra.gov.in/arcgis/rest/services/integrated_services/admin/MapServer/5");
				this.dropdown();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}
		},

		createsearch : function() {

			map = this.map;

			findTask = new FindTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer");

			//Create the find parameters
			findParams = new FindParameters();
			findParams.returnGeometry = true;
			findParams.layerIds = [2, 3, 4];
			findParams.searchFields = ["DTENAME", "THENAME", "THNCODE", "DTNCODE"];
			findParams.outSpatialReference = map.spatialReference;

			findTask1 = new FindTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_village_16/MapServer/");
			findParams1 = new FindParameters();
			findParams1.returnGeometry = true;
			findParams1.layerIds = [0];
			findParams1.searchFields = ["VIL_NAME", "VINCODE"];
			findParams1.outSpatialReference = map.spatialReference;

		},

		doFind : function() {

			this.messageNode.innerHTML = "";
			map.graphics.clear();
			this.widgets.results.clear();
			this.onShowPanel(1);

			this.setStyle("progress", "progress visible");

			//Set the search text to the value in the box
			var v = document.getElementById("searchwid").value

			findParams.searchText = v;
			findParams1.searchText = v;

			try {

				findTask1.execute(findParams1, lang.hitch(this, "showSearchResults", "Village"));

			} catch(e) {
				alert("e" + e)
			}

		},
		showSearchResults : function(layerId, featureSet) {

			var abc = [];
			var abc1 = []
			try {
				var resultCountBeforeAddingThese = this.widgets.results.count;

				var link = null;

				if (layerId == "Village") {

					this.length = featureSet.length

					array.forEach(featureSet, lang.hitch(this, function(f) {

						var district = f.feature;
						var districtCode = district.attributes["District Numeric Code(3)"];

						var talukaCode = district.attributes["Taluk Numeric Code(5)"];

						var queryTaskCodeDistrict = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer/2");

						var queryDistrict = new Query();
						queryDistrict.outFields = ["DTENAME", "DTNCODE"];

						queryDistrict.outSpatialReference = {
							"wkid" : 102100
						};

						var queryTaskCodeTaluka = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer/3");

						var queryTaluka = new Query();
						queryTaluka.outFields = ["THENAME", "DTNCODE"];

						queryTaluka.outSpatialReference = {
							"wkid" : 102100
						};

						queryDistrict.where = "DTNCODE  = '" + districtCode + "'";

						queryTaskCodeDistrict.execute(queryDistrict, lang.hitch(this, function(results2) {

							//this.DistVal = results2.features[0].attributes.DTENAME;
							abc1.push({
								"code" : results2.features[0].attributes.DTNCODE,
								"name" : results2.features[0].attributes.DTENAME
							})
							//console.log(this.DistVal)

							queryTaluka.where = "THNCODE = '" + talukaCode + "'";

							queryTaskCodeTaluka.execute(queryTaluka, lang.hitch(this, function(results2) {
								this.talVal = results2.features[0].attributes.THENAME;

								array.forEach(abc1, lang.hitch(this, function(a) {
									if (a.code == results2.features[0].attributes.DTNCODE) {
										this.DistVal = a.name
									}
								}))
								var V = district.attributes["Village Name"]

								this.content = "<table style='width:250px'><tr><td>District: </td><td style='width:120px'>" + this.DistVal + "</td><td>Taluka: </td><td style='width:120px'>" + this.talVal + "</td></tr><tr><td>Village: </td><td>" + district.attributes["Village Name"] + "</td><td>Census: </td><td>" + district.attributes["Village Numeric Code(6)"] + "</td></tr></table>";

								var attrs = {
									//"title" : district.attributes["Village Name"],
									"content" : this.content,
									"link" : link
								};

								var sym = null;
								var loc = null;

								switch (district.geometry.type) {
									case "point":
										sym = this.symbols.point;
										loc = district.geometry;
										break;
									case "multipoint":
										sym = this.symbols.point;
										loc = district.geometry.getExtent().getCenter();
										break;
									case "polyline":
										sym = this.symbols.line;
										var nPts = district.geometry.paths[0].length;
										var idx = Math.round(nPts / 2);
										loc = district.geometry.getPoint(0, idx);
										break;
									default:
										sym = this.symbols.polygon;

										if (district.geometry.rings && district.geometry.rings.length > 1) {

											var p = new Polygon(district.geometry.spatialReference);
											p.addRing(district.geometry.rings[0]);
											var ext = p.getExtent();
											loc = ext.getCenter();
										} else {

											var ext = district.geometry.getExtent();

											loc = ext.getCenter();

										}
										break;
								}

								var g = new Graphic(district.geometry, sym, attrs);

								this.widgets.results.add({
									title : attrs.title,
									content : attrs.content,
									iconUrl : this.smallIconUrl,
									graphic : g,
									location : loc,
									closeU : this.closeUrl,
									link : attrs.link,
									map : this.map,
									count : this.widgets.results.count
								});
								this.addGraphic(g);

							}))
						}));
						var msg = "Total features found : " + this.length;
						this.setMessage(msg);

					}));

					findTask.execute(findParams, lang.hitch(this, function(featureSet) {

						array.forEach(featureSet, lang.hitch(this, function(f) {

							district = f.feature;

							var D = district.attributes.DTENAME;
							var T = district.attributes.THENAME;
							if ((f.foundFieldName == "DTENAME") || ((f.foundFieldName == "DTNCODE") && (f.layerName == "District Boundary"))) {

								this.content1 = "<table style='width:250px'><tr><td>District: </td><td>" + D + "</td></tr></table>";

								var attrs = {
									//"title" : D,
									"content" : this.content1,
									"link" : link
								};

								var sym = null;
								var loc = null;

								switch (district.geometry.type) {
									case "point":
										sym = this.symbols.point;
										loc = district.geometry;
										break;
									case "multipoint":
										sym = this.symbols.point;
										loc = district.geometry.getExtent().getCenter();
										break;
									case "polyline":
										sym = this.symbols.line;
										var nPts = district.geometry.paths[0].length;
										var idx = Math.round(nPts / 2);
										loc = district.geometry.getPoint(0, idx);
										break;
									default:
										sym = this.symbols.polygon;

										if (district.geometry.rings && district.geometry.rings.length > 1) {

											var p = new Polygon(district.geometry.spatialReference);
											p.addRing(district.geometry.rings[0]);
											var ext = p.getExtent();
											loc = ext.getCenter();
										} else {

											var ext = district.geometry.getExtent();

											loc = ext.getCenter();

										}
										break;
								}

								var g1 = new Graphic(district.geometry, sym, attrs);

								this.widgets.results.add({
									title : attrs.title,
									content : attrs.content,
									iconUrl : this.smallIconUrl,
									graphic : g1,
									location : loc,
									closeU : this.closeUrl,
									link : attrs.link,
									map : this.map,
									count : this.widgets.results.count

								});
								this.addGraphic(g1);
								var codeD = district.attributes.DTNCODE

								var queryTaskCode = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer/3");

								var query1 = new Query();
								query1.outFields = ["THENAME"];
								query1.returnGeometry = true;
								query1.outSpatialReference = {
									"wkid" : 102100
								};

								query1.where = "DTNCODE  = '" + codeD + "'";

								queryTaskCode.execute(query1, lang.hitch(this, function(results2) {

									var values = [];
									var testVals = {};

									var features = results2.features;

									this.length1 = features.length

									array.forEach(features, lang.hitch(this, function(feature2) {

										zone = feature2.attributes.THENAME;

										this.content = "<table><tr><td>District: </td><td style='width:120px'>" + D + "</td></tr><tr><td>Taluka: </td><td style='width:120px'>" + zone + "</td></tr></table>";

										var attrs = {
											//"title" : D,
											"content" : this.content,
											"link" : link
										};

										var sym = null;
										var loc = null;

										switch (feature2.geometry.type) {
											case "point":
												sym = this.symbols.point;
												loc = feature2.geometry;
												break;
											case "multipoint":
												sym = this.symbols.point;
												loc = feature2.geometry.getExtent().getCenter();
												break;
											case "polyline":
												sym = this.symbols.line;
												var nPts = feature2.geometry.paths[0].length;
												var idx = Math.round(nPts / 2);
												loc = feature2.geometry.getPoint(0, idx);
												break;
											default:
												sym = this.symbols.polygon;

												if (feature2.geometry.rings && feature2.geometry.rings.length > 1) {

													var p = new Polygon(feature2.geometry.spatialReference);
													p.addRing(feature2.geometry.rings[0]);
													var ext = p.getExtent();
													loc = ext.getCenter();
												} else {

													var ext = feature2.geometry.getExtent();

													loc = ext.getCenter();

												}
												break;
										}

										var g = new Graphic(feature2.geometry, sym, attrs);

										this.widgets.results.add({
											title : attrs.title,
											content : attrs.content,
											iconUrl : this.smallIconUrl,
											graphic : g,
											location : loc,
											closeU : this.closeUrl,
											link : attrs.link,
											map : this.map,
											count : this.widgets.results.count

										});
										this.addGraphic(g);
									}));
									var msg = "Total features found : " + this.widgets.results.count;
									this.setMessage(msg);

								}));
							} else if ((f.foundFieldName == "THENAME") || (f.foundFieldName == "THNCODE") || ((f.foundFieldName == "DTNCODE") && (f.layerName == "Taluka Boundary"))) {

								var queryTaskCodeDistrict1 = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer/2");

								var queryDistrict1 = new Query();
								queryDistrict1.outFields = ["DTENAME"];

								queryDistrict1.outSpatialReference = {
									"wkid" : 102100
								};

								queryDistrict1.where = "DTNCODE  = '" + f.feature.attributes.DTNCODE + "'";

								queryTaskCodeDistrict1.execute(queryDistrict1, lang.hitch(this, function(results2) {
									this.DistVal1 = results2.features[0].attributes.DTENAME;

									this.content = "<table style='width:250px'><tr><td>District: </td><td style='width:120px'>" + this.DistVal1 + "</td><td>Taluka: </td><td style='width:120px'>" + T + "</td></tr></table>";
									//this.content = "<table><tr><td>District: </td><td>" + D + "</td><td>Taluka: </td><td>" + zone + "</td></tr></table>";

									var attrs = {
										//"title" : district.attributes.THENAME,
										"content" : this.content,
										"link" : link
									};

									var sym = null;
									var loc = null;

									switch (district.geometry.type) {
										case "point":
											sym = this.symbols.point;
											loc = district.geometry;
											break;
										case "multipoint":
											sym = this.symbols.point;
											loc = district.geometry.getExtent().getCenter();
											break;
										case "polyline":
											sym = this.symbols.line;
											var nPts = district.geometry.paths[0].length;
											var idx = Math.round(nPts / 2);
											loc = district.geometry.getPoint(0, idx);
											break;
										default:
											sym = this.symbols.polygon;

											if (district.geometry.rings && district.geometry.rings.length > 1) {

												var p = new Polygon(district.geometry.spatialReference);
												p.addRing(district.geometry.rings[0]);
												var ext = p.getExtent();
												loc = ext.getCenter();
											} else {

												var ext = district.geometry.getExtent();

												loc = ext.getCenter();

											}
											break;
									}

									var g = new Graphic(district.geometry, sym, attrs);

									this.widgets.results.add({
										title : attrs.title,
										content : attrs.content,
										iconUrl : this.smallIconUrl,
										graphic : g,
										location : loc,
										closeU : this.closeUrl,
										link : attrs.link,
										map : this.map,
										count : this.widgets.results.count
									});
									this.addGraphic(g);

									var msg = "Total features found : " + this.widgets.results.count;
									this.setMessage(msg);

								}));

							} else {
								// do nothing
							}

						}));
						console.log(this.widgets.results.count)
						console.log(this.length)
						if ((this.length == 0) && (this.widgets.results.count == 0)) {
							this.onShowPanel(0);
							swal("No Record found")

						}
					}));

				}

				this.setStyle("progress", "progress hidden");

				if (resultCountBeforeAddingThese === 0) {

					//this.widgets.results.selectFirstItem();
				}

				this.unloadmrsac();
			} catch(err) {
				console.error("SearchWidget::searchCallback", err);
			}

		},
		dropdown : function() {

			this.map.graphics.clear();
			var queryTask = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer/2");

			var query = new Query();
			query.outFields = ["DTENAME", "DTNCODE"];
			query.returnGeometry = true;
			query.outSpatialReference = {
				"wkid" : 102100
			};

			query.where = "1=1";

			queryTask.execute(query, lang.hitch(this, function(results2) {

				var values = [];
				var testVals = {};

				var features = results2.features;

				array.forEach(features, lang.hitch(this, function(feature2) {

					zone = feature2.attributes.DTENAME;
					newlist.push(zone);
					if (zone) {
						if (!testVals[zone]) {
							testVals[zone] = true;
							values.push({
								name : zone,
								field : feature2.attributes.DTNCODE
							});
						}
					}

				}));

				var dataItems = {
					identifier : 'field',
					label : 'name',
					items : values
				};
				var store = new Memory({
					data : dataItems
				});

				this.agri.set('store', store);

			}));

		},
		getTaluka : function() {
			this.loadmrsac();
			this.map.graphics.clear();
			this.agri1.value = "";
			this.agri2.value = "";

			var talE = [];

			var val = this.agri.value;
			var queryTask1 = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_state_2011/MapServer/3");

			var query1 = new Query();
			query1.outFields = ["THENAME", "THNCODE"];
			query1.returnGeometry = true;
			query1.outSpatialReference = {
				"wkid" : 102100
			};

			query1.where = "DTNCODE  = '" + val + "'";

			queryTask1.execute(query1, lang.hitch(this, function(results2) {

				var values = [];
				var testVals = {};

				var features = results2.features;

				array.forEach(features, lang.hitch(this, function(feature2) {
					var stroke = "red"
					var fill = {
						"a" : 0.6,
						"b" : 210,
						"g" : 205,
						"r" : 255
					}

					var finalGraph = this.finalGraphic(feature2, stroke, fill);

					feature2.setSymbol(finalGraph);
					this.map.graphics.add(feature2);

					talE.push(feature2);

					zone = feature2.attributes.THENAME;
					newlist.push(zone);
					if (zone) {
						if (!testVals[zone]) {
							testVals[zone] = true;
							values.push({
								name : zone,
								field : feature2.attributes.THNCODE
							});
						}
					}

				}));

				var myFeatureExtent = graphicsUtils.graphicsExtent(talE);
				this.map.setExtent(myFeatureExtent, true);

				var dataItems = {
					identifier : 'field',
					label : 'name',
					items : values
				};
				var store = new Memory({
					data : dataItems
				});

				this.agri1.set('store', store);
				this.unloadmrsac();

			}));

		},
		getVillage : function() {

			this.loadmrsac();
			var queryTaskVil = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_village_16/MapServer/0");

			this.map.graphics.clear();

			this.agri2.value = "";

			var vilE = [];

			var val = this.agri1.value;
			var query2 = new Query();
			query2.outFields = ["VIL_NAME", "VINCODE"];
			query2.returnGeometry = true;
			query2.outSpatialReference = {
				"wkid" : 102100
			};

			query2.where = "THNCODE  = '" + val + "'";

			queryTaskVil.execute(query2, lang.hitch(this, function(results2) {

				var values = [];
				var testVals = {};

				var features = results2.features;

				array.forEach(features, lang.hitch(this, function(feature2) {
					var stroke = "red"
					var fill = {
						"a" : 0.6,
						"b" : 210,
						"g" : 205,
						"r" : 255
					}

					var finalGraph = this.finalGraphic(feature2, stroke, fill);

					feature2.setSymbol(finalGraph);
					this.map.graphics.add(feature2);

					vilE.push(feature2);

					zone = feature2.attributes.VIL_NAME;
					newlist.push(zone);
					if (zone) {
						if (!testVals[zone]) {
							testVals[zone] = true;
							values.push({
								name : zone,
								field : feature2.attributes.VINCODE
							});
						}
					}

				}));

				var myFeatureExtent = graphicsUtils.graphicsExtent(vilE);
				this.map.setExtent(myFeatureExtent, true);

				var dataItems = {
					identifier : 'field',
					label : 'name',
					items : values
				};
				var store = new Memory({
					data : dataItems
				});

				this.agri2.set('store', store);
				this.unloadmrsac();

			}));

		},

		getCode : function() {
			this.loadmrsac();
			this.map.graphics.clear();
			var codeE = [];
			var queryTaskVil = new QueryTask("http://117.240.213.123/webadpgis8/rest/services/admin2011/admin_village_16/MapServer/0");

			var val = this.agri1.value;
			var val2 = this.agri2.value;
			var query3 = new Query();
			query3.outFields = ["*"];
			query3.returnGeometry = true;
			query3.outSpatialReference = {
				"wkid" : 102100
			};
			query3.where = "THNCODE  = '" + val + "' AND VINCODE  = '" + val2 + "'";

			queryTaskVil.execute(query3, lang.hitch(this, function(results3) {

				var features = results3.features;

				array.forEach(features, lang.hitch(this, function(feature3) {
					var stroke = "red"
					var fill = {
						"a" : 0.6,
						"b" : 210,
						"g" : 205,
						"r" : 255
					}
					var finalGraph = this.finalGraphic(feature3, stroke, fill);

					feature3.setSymbol(finalGraph);
					this.map.graphics.add(feature3);
					codeE.push(feature3);

				}));
				var myFeatureExtent = graphicsUtils.graphicsExtent(codeE);
				this.map.setExtent(myFeatureExtent.getExtent().expand(1), true);

			}));
			this.unloadmrsac();
		},

		shutdown : function() {

			this.clearGraphics();
			this.onShowPanel(0);

			this.messageNode.innerHTML = "";

			this.widgets.results.clear();

			this.inherited(arguments);
			this.map.graphics.clear();

			this.agri.value = "";
			this.agri1.value = "";
			this.agri2.value = "";

		},

		setMessage : function(/*String*/message) {

			this.messageNode.innerHTML = message;

		},

		clearResults : function() {
			this.messageNode.innerHTML = "";
			map.graphics.clear();
			this.widgets.results.clear();

			this.agri.value = "";
			this.agri1.value = "";
			this.agri2.value = "";

			this.clearGraphics();

		},
		setStyle : function(elementName, className) {
			var element = document.getElementById(elementName);
			if (element)
				element.className = className;
		},
		onResultClick : function(evt) {

			var selectedvillagesymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([214, 61, 97]), 2), new Color([199, 54, 100, 0.65]));

			var zoomToExt = map.extent;
			evt.resultItem.graphic.setSymbol(selectedvillagesymbol);

			var taxLotExtent = evt.resultItem.graphic.geometry.getExtent();
			map.setExtent(taxLotExtent.expand(1), true);

		},
	});
});

