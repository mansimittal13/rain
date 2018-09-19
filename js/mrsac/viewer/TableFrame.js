/**
 * @author Richa
 */

//define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/TableFrame.html", "dojo/topic",'dojox/grid/DataGrid', 'dojox/grid/EnhancedGrid', 'dojo/data/ItemFileWriteStore', "dijit/Menu", "dijit/MenuItem", "dojo/query", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-class", "dojo/dom-style","esri/tasks/query","esri/tasks/QueryTask","dojo/dom-geometry","esri/graphicsUtils", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/TextSymbol", "esri/symbols/Font", "esri/Color", "esri/layers/GraphicsLayer", "esri/geometry/Point", "esri/SpatialReference", "esri/geometry/webMercatorUtils", "esri/geometry/Circle", "esri/geometry/Extent", "dojo/keys", "dojo/dom-attr", "dojox/grid/enhanced/plugins/Menu", "dojox/grid/enhanced/plugins/NestedSorting", "dijit/Dialog", "dijit/form/ComboBox", "dijit/form/TextBox", "dijit/form/Button", "esri/InfoTemplate","dojo/dom-construct", "dojo/dom-class", "dojo/dom-style"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, topic,DataGrid, EnhancedGrid, ItemFileWriteStore, Menu, MenuItem, query, lang, array, domClass, domStyle,Query,QueryTask, domGeom, graphicsUtils, Graphic, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, PictureMarkerSymbol, TextSymbol, Font, Color, GraphicsLayer, Point, SpatialReference, webMercatorUtils, Circle, Extent, keys, domAttr, InfoTemplate,domConstruct, domClass, domStyle){
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Container", "dojo/text!./templates/TableFrame.html", "dojo/topic","dojo/dom-construct","dojo/on","dojo/dom",'dojox/grid/DataGrid', 'dojox/grid/EnhancedGrid', 'dojo/data/ItemFileWriteStore', "dijit/Menu", "dijit/MenuItem", "dojo/query", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-class", "dojo/dom-style","esri/tasks/query","esri/tasks/QueryTask","dojo/dom-geometry","esri/graphicsUtils", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/TextSymbol", "esri/symbols/Font", "esri/Color", "esri/layers/GraphicsLayer", "esri/geometry/Point","esri/geometry/webMercatorUtils", "esri/SpatialReference","esri/geometry/Circle", "esri/geometry/webMercatorUtils", "esri/geometry/Circle", "esri/geometry/Extent", "dojo/keys", "dojo/dom-attr", "dojox/grid/enhanced/plugins/Menu", "dojox/grid/enhanced/plugins/NestedSorting", "dijit/Dialog", "dijit/form/ComboBox", "dijit/form/TextBox", "dijit/form/Button", "esri/InfoTemplate","esri/InfoWindowBase", "esri/domUtils"], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template, topic,domConstruct,on,dom,DataGrid, EnhancedGrid, ItemFileWriteStore, Menu, MenuItem, query, lang, array, domClass, domStyle,Query,QueryTask, domGeom, graphicsUtils, Graphic, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, PictureMarkerSymbol, TextSymbol, Font, Color, GraphicsLayer, Point,Circle,webMercatorUtils, SpatialReference, webMercatorUtils, Circle, Extent, keys, domAttr, InfoTemplate,InfoWindowBase, domUtils){	
	return declare("mrsac.viewer.TableFrame", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
		IconUrl : "",
		TileText : "",
		TableType : null,
		map : null,
		Store : null,
		WriteStore : null,
		structure : null,
		Tgrid : null,
		d : null,
		noSort : null,
		colidx : 0,
		StoreKeys : null,
		GraphicLayer : null,
		SelectedRows : null,
		SelectedRowsCount : 0,
		rowidx : 0,
		rowPointing : null,
		flashGraphicsLayer : null,
		queryLayer : null,
		circleNew : null,
		constructor : function(args) {

			declare.safeMixin(this, args);
			args = args || {};
			if (!args.store)
				console.warn("No store supplied");
			this.Store = args.store;
			this.structure = args.structure;
			this.IconUrl = args.TableIcon;
			this.TitleText = args.TableTitle;
			this.TableType = args.TableType;
			this.map = args.map;
			var StoreData = this.Store[0];
			this.StoreKeys = Object.keys(StoreData);
			AlreadyHiddenCol = [];
		},
		templateString : template,
		postMixInProperties : function() {

			try {
				this.inherited(arguments);
			} catch (err) {
				console.error(err);
			}
		},
		postCreate : function() {

			try {
				this.inherited(arguments);
				this.GraphicLayer = new GraphicsLayer({
					className : "generalGraphicLayer"
				});
				this.map.addLayer(this.GraphicLayer);
				this.flashGraphicsLayer = new GraphicsLayer({
					className : "flashGraphicsLayer",
					// className:"geomG",
					id : "graphicstable"

				});
				this.map.addLayer(this.flashGraphicsLayer);
				
				this.queryLayer = new GraphicsLayer({
					id : "queryLayer"
				});
				this.map.addLayer(this.queryLayer);
				
				
				this.mrsacTableParentlabel.innerHTML = this.TitleText;
				this.setTableTitle(this.TitleText);
				this.setLabel(this.TitleText);
				this.setActive();
				this.state = "Showing";
				topic.publish("showTable", this, this.TitleText);
				var store = new ItemFileWriteStore({
					data : {
						identifier : "idx",
						items : this.Store
					}
				});
				this.WriteStore = store;
				this.noSort = function(inSortInfo) {
					if (inSortInfo == 1) {
						//console.log(inSortInfo);
						return false;
					}
				};
				this.Tgrid = new EnhancedGrid({
					store : store,
					structure : this.structure,
					rowSelector : '20px',
					singleClickEdit : true,
					plugins : {
						menus : {
							headerMenu : this.headerMenu,
							rowMenu : this.rowMenu,
						},
						//nestedSorting : true
					},
					//canSort : this.noSort,
					//sortInfo : "5",
					RowContextMenu : "RowContextMenu"

				});
				this.Tgrid.placeAt(this.GridDiv);
				this.Tgrid.startup();
				this.Tgrid.on("RowClick", lang.hitch(this, function(evt) {
					//  alert("click on " +evt);
					//   console.log(evt);
					var idx = evt.rowIndex;
					var item = this.Tgrid.getItem(idx);
					var count = this.Tgrid.selection.getSelectedCount();
					this.SelectedRows = this.Tgrid.selection.getSelected();
					this.SelectedRowsCount = count;
					this.footerInfoNode.innerHTML = "Number of Record Selected is" + "&nbsp" + count + " out of total " + this.Store.length + " records";
					this.SelectOnClick();
				}));
				this.Tgrid.on("HeaderContextMenu", lang.hitch(this, function(e) {
					this.colidx = e.cellIndex;
				}))
				this.Tgrid.on("RowContextMenu", lang.hitch(this, function(e) {

					this.rowidx = e.rowIndex;
					var item = this.Tgrid.getItem(this.rowidx);
					this.rowPointing = item;
				}));
			} catch (e) {
			}

		},
		startup : function() {

			this.inherited(arguments);
			if (this._initialized) {
				return;
			}
			try {

			} catch (e) {
			}

		},
		TurnOffField : function(e) {

			this.Tgrid.layout.setColumnVisibility(this.colidx, false);
			var getStatus = this.eleContainsInArray(AlreadyHiddenCol, this.colidx);
			if (getStatus == true) {
				//do Nothing
			} else {
				AlreadyHiddenCol.push(this.colidx);
			}

		},
		LockingColumns : function(e) {

			var layout = [{
				cells : [],
				noscroll : true
			}, {
				cells : []
			}];
			/*
			 if (layout[0].noscroll) {
			 } else {
			 }*/

			array.forEach(this.structure, lang.hitch(this, function(obj) {

				if (this.structure.indexOf(obj) == this.colidx) {

					layout[0].cells.push(obj);
				} else {
					layout[1].cells.push(obj);
				}

			}));
			this.Tgrid.setStructure(layout);
		},
		eleContainsInArray : function(arr, element) {

			if (arr != null && arr.length > 0) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] == element)
						return true;
				}
			}
			return false;
		},
		TurnAllFieldsOn : function(e) {

			array.forEach(AlreadyHiddenCol, lang.hitch(this, function(val) {

				this.Tgrid.layout.setColumnVisibility(val, true);
			}));
			AlreadyHiddenCol = [];
		},
		FlashToPointing : function() {

			var TotalGeom = []

			this.GraphicLayer.clear();
			selectedItem = this.rowPointing;
			if (this.rowPointing) {

				var sfs = null;
				if (selectedItem.feature[0].geometry.type == "point") {
					// sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
					sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 7), new Color([0, 255, 0, 1], 2));
				} else if (selectedItem.feature[0].geometry.type == "polygon") {

					sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
				} else {

				}

				var graphicS = new Graphic(this.rowPointing.feature[0].geometry, sfs);
				TotalGeom.push(graphicS);
				var jsonAttr = [{
					"name" : this.rowPointing.idx
				}];
				graphicS.setAttributes(jsonAttr);
				this.GraphicLayer.add(graphicS);
				setTimeout(lang.hitch(this, function() {

					this.GraphicLayer.remove(graphicS);
				}), 4000);
			} else {
				alert("No records Selected");
			}

			var myFeatureExtent = graphicsUtils.graphicsExtent(TotalGeom);
		},
		PanToPointing : function() {
			var TotalGeom = [];
			this.GraphicLayer.clear();
			if (this.rowPointing) {
				var sfs = null;
				if (selectedItem.feature[0].geometry.type == "point") {
					//    sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
					sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 4), new Color([0, 255, 0, 0.25]));
				} else if (selectedItem.feature[0].geometry.type == "polygon") {

					sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
				} else {

				}

				var graphicS = new Graphic(this.rowPointing.feature[0].geometry, sfs);
				TotalGeom.push(graphicS);
				var jsonAttr = [{
					"name" : this.rowPointing.idx,
				}];
				graphicS.setAttributes(jsonAttr);
				this.GraphicLayer.add(graphicS);
				setTimeout(lang.hitch(this, function() {
					this.GraphicLayer.remove(graphicS);
				}), 4000);
			} else {
				alert("No records Selected");
			}

			var myFeatureExtent = graphicsUtils.graphicsExtent(TotalGeom);
			var mapPoint = new Point(myFeatureExtent.getExtent().xmax, myFeatureExtent.getExtent().ymin, new SpatialReference({
				wkid : 4326
			}));
			//mapPoint = webMercatorUtils.webMercatorToGeographic(mapPoint);

			this.map.centerAt(mapPoint);
		},
		ZoomToPointing : function() {
			var TotalGeom = [];
			this.GraphicLayer.clear();
			if (this.rowPointing) {

				var sfs = null;
				if (selectedItem.feature[0].geometry.type == "point") {
					sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
				} else if (selectedItem.feature[0].geometry.type == "polygon") {

					sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
				} else {

				}
				var graphicS = new Graphic(this.rowPointing.feature[0].geometry, sfs);
				TotalGeom.push(graphicS);
				var jsonAttr = [{
					"name" : this.rowPointing.idx
				}];
				graphicS.setAttributes(jsonAttr);
				this.GraphicLayer.add(graphicS);
				setTimeout(lang.hitch(this, function() {
					this.GraphicLayer.remove(graphicS);
				}), 3000);
			} else {
				alert("No records Selected")
			}

			var myFeatureExtent = graphicsUtils.graphicsExtent(TotalGeom);
			this.map.setExtent(myFeatureExtent.getExtent(), true);
		},
		SelectUnselect : function(evt) {

			var checkIfSelected = this.Tgrid.selection.isSelected(this.rowPointing.idx);
			if (checkIfSelected == true) {
				this.Tgrid.selection.setSelected(this.rowPointing.idx, false);
				this.Tgrid.selection.clear();
			} else {

				if (this.Tgrid.rowCount > 0) {

					if (this.Tgrid.selection.selectedIndex >= 0) {

						// If there is a currently selected row, deselect it now
						this.Tgrid.selection.setSelected(this.Tgrid.selection.selectedIndex, false);
					}

					this.Tgrid.selection.setSelected(this.Tgrid.selection.selectedIndex, true);
					this.Tgrid.render();
				}

				//this.Tgrid.selection.clear();
				//this.Tgrid.selection.addToSelection(this.rowPointing.idx);
				//this.Tgrid.selection.getFirstSelected();
				//this.Tgrid.selection.setSelected(this.rowPointing.idx, true);
				//this.Tgrid.render();

				//this.Tgrid.selection.setSelected(this.rowPointing.idx, true);

			}

			/*
			 array.forEach(this.SelectedRows, lang.hitch(this, function(selectedItem) {

			 var index = selectedItem.idx;

			 if (index == this.rowPointing.idx) {

			 this.Tgrid.selection.setSelected(this.rowPointing.idx, false);

			 this.Tgrid.selection.clear();

			 } else {

			 this.Tgrid.selection.setSelected(this.rowPointing.idx, true);

			 }
			 }));
			 */

		},
		Clearselected : function(evt) {

			var storeGraphic = [];
			array.forEach(this.flashGraphicsLayer.graphics, lang.hitch(this, function(graphic) {
				array.forEach(this.SelectedRows, lang.hitch(this, function(selectedItem) {

					if (graphic.attributes.name == (selectedItem.idx + this.TitleText)) {

						this.Tgrid.selection.setSelected(selectedItem.idx, false);
						storeGraphic.push(graphic);
					}
				}));
				this.Tgrid.selection.clear();
			}));
			for (g in storeGraphic) {

				this.flashGraphicsLayer.remove(storeGraphic[g]);
			}

			var count = this.Tgrid.selection.getSelectedCount();
			var template = "Number of Record Selected is" + "&nbsp" + count + " out of toatal " + this.Store.length + " records";
			if (count == 0) {
				template = "No records Selected"
			}
			this.footerInfoNode.innerHTML = template;
		},
		SwitchSelection : function(e) {

			var items = this.Tgrid.selection.getSelected();
			var Allidx = [];
			var TheUnselected = [];
			if (this.Tgrid.rowCount) {
				for (var i = 0; i < this.Tgrid.rowCount; i++) {
					Allidx.push(i);
				}
			}
			if (items.length) {
				array.forEach(items, lang.hitch(this, function(selectedItem) {
					if (selectedItem !== null) {
						TheUnselected.push(selectedItem.idx);
					}
				}));
			}
			var getDiff = this.arrayDiff(Allidx, TheUnselected);
			this.ClearSelection();
			array.forEach(getDiff, lang.hitch(this, function(toBeSelected) {

				this.Tgrid.selection.setSelected(toBeSelected, true);
			}));
			this.SelectedRows = this.Tgrid.selection.getSelected();
			array.forEach(this.SelectedRows, lang.hitch(this, function(selectedItem) {

				var obj = selectedItem.idx + this.TitleText;
				var sfs = null;
				if (selectedItem.feature[0].geometry.type == "point") {
					sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
				} else if (selectedItem.feature[0].geometry.type == "polygon") {

					sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
				} else {

				}

				var graphicS = new Graphic(selectedItem.feature[0].geometry, sfs);
				var jsonAttr = {
					"name" : selectedItem.idx + this.TitleText,
				};
				graphicS.setAttributes(jsonAttr);
				this.flashGraphicsLayer.add(graphicS);
			}));
		},
		ClearSelection : function(evt) {
			this.flashGraphicsLayer.clear();
			//if (kids.rowCount > 0 && kids.idx < kids.rowCount) {
			if (this.Tgrid.rowCount > 0) {

				if (this.Tgrid.selection.selectedIndex >= 0) {

					// If there is a currently selected row, deselect it now
					this.Tgrid.selection.setSelected(this.Tgrid.selection.selectedIndex, false);
				}
				//kids.Selection.setSelected(this.Tgrid.idx, true);
				this.Tgrid.selection.clear();
				//this.Tgrid.render();
			}

		},
		arrayDiff : function(a1, a2) {
			var o1 = {},
			    o2 = {},
			    diff = [],
			    i,
			    len,
			    k;
			for ( i = 0,
			len = a1.length; i < len; i++) {
				o1[a1[i]] = true;
			}
			for ( i = 0,
			len = a2.length; i < len; i++) {
				o2[a2[i]] = true;
			}
			for (k in o1) {
				if (!( k in o2)) {
					diff.push(k);
				}
			}
			for (k in o2) {
				if (!( k in o1)) {
					diff.push(k);
				}
			}
			return diff;
		},
		MoveToBeginingA : function(e) {
			this.Tgrid.scrollToRow(0, true);
		},
		MoveToEndA : function(e) {

			this.Tgrid.scrollToRow((this.Store.length + 1), true);
		},
		MoveToPreviousRecord : function(e) {

			this.Tgrid.scrollToRow((parseInt(this.RecordValue.value) - 1), true);
			//this.RecordValue.value = parseInt(this.RecordValue.value) - 1;

			//domAttr.set(this.RecordValue, "value", (parseInt(this.RecordValue.value) - 1).toString());

		},
		MoveToNextRecord : function(e) {

			this.Tgrid.scrollToRow((parseInt(this.RecordValue.value) + 1), true);
			//this.RecordValue.value = parseInt(this.RecordValue.value) + 1;

			//domAttr.set(this.RecordValue, "value", (parseInt(this.RecordValue.value) + 1).toString());

		},
		printAll : function(evt) {

			if (this.Tgrid.structure.length > 1) {
				var ConstStruct = [];
				array.forEach(this.Tgrid.structure, lang.hitch(this, function(val) {
					if (val.cells) {
						array.forEach(val.cells, lang.hitch(this, function(g) {
							ConstStruct.push(g);
						}));
					} else {
						ConstStruct.push(val);
					}
				}));
			}
			this.d = new Date;
			this.d = new Date(this.d).toLocaleString();
			this.d = this.d.split(' ').slice(0, 5).join(' ')

			this.printTable(ConstStruct, this.Tgrid.store, this.TitleText, this.d);
		},
		printTable : function(fields, store, title, date) {

			var y = "";
			var ObjectK = [];
			array.forEach(fields, lang.hitch(this, function(el) {
				var a = el.name;
				ObjectK.push(el.field)
				y += "<td style='border-bottom:2px solid grey;border-right:2px solid grey;font-weight: 900;'>" + a + "</td>";
			}));
			var myWindow = window.open("", "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400");
			//var b = "<div id='non-printable' style='width: 100%;position: fixed;left: 0;top: 0;z-index: 6;height: 50px;background: #fafafa;border-bottom: 1px solid #000;'><div ><div style='color: #444;font-family: Verdana, Helvetica, sans-serif;-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid #8b8b8b;background: #F2F2F2;width:50px;cursor:pointer;float:right' title='Close' onclick='window.close();'>Close</div><div id='printButton' style='color: #444;	font-family: Verdana, Helvetica, sans-serif;-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid #8b8b8b;background: #F2F2F2;width:50px;cursor:pointer;float:right' title='Print' onclick='window.print();' >Print</div></div></div>";
			//b += "</br>" + "</br>" + "</br>" + "<img class='esriPrintLogo' src='img/mrsac.png'>" + "</br>" + "<br>" + "<strong><label style='color:blue;font-style: italic;margin-left: 1%;'>" + title + "</label><label style='color:blue;font-style: italic;margin-left: 70%;'>" + date + "</label></strong>";

			var b = "<div id='non-printable' style='width: 100%;position: fixed;left: 0;top: 0;z-index: 6;height: 50px;background: #fafafa;border-bottom: 1px solid #000;'><div ><div style='color: #444;font-family: Verdana, Helvetica, sans-serif;-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid #8b8b8b;background: #F2F2F2;width:50px;cursor:pointer;float:right' title='Close' onclick='window.close();'>Close</div><div id='printButton' style='color: #444;	font-family: Verdana, Helvetica, sans-serif;-moz-border-radius: 3px;-webkit-border-radius: 3px;border-radius: 3px;border: 1px solid #8b8b8b;background: #F2F2F2;width:50px;cursor:pointer;float:right' title='Print' onclick='window.print();' >Print</div></div></div>";
			b += "</br>" + "</br>" + "</br>" + "<table style='width: 120%;'><tr> <td><img class='esriPrintLogo' src='img/mrsac.png'> </td>" + "<td><strong><label style='color:blue;font-style: italic;font-size: 35;vertical-align: inherit;margin-left: 30%;'> Integrated Forest Information System(IFIS) </label></strong> </td> <td style='float:right;'><img class='controllerIconLimg' src='js/mrsac/viewer/assets/images/icons/forest_logo.jpg' style='height:81px;width:80px;float:right;border-radius: 40px;'> </td> </tr> </table> " + "<strong><label style='color:blue;font-style: italic;font-size: 25;margin-left: 43%;'>" + title + "</label><label style='color:blue;font-style: italic;font-size: 20;margin-left: 5%;'>" + date + " </label></strong> <div style='height:10px;'> </div> ";

			/***********************************************************************************************************/
			store.fetch({
				onComplete : lang.hitch(this, function(items) {
					var s;
					array.forEach(items, lang.hitch(this, function(val) {
						var attrs = Object.keys(val);
						var t = "";
						array.forEach(attrs, lang.hitch(this, function(attr) {
							array.forEach(ObjectK, lang.hitch(this, function(getVal) {
								if (getVal == attr) {

									var value = val[attr];
									t += "<td style='border-bottom:1px solid silver;border-right:1px solid silver;'>" + value + "</td>";
								}

							}));
						}));
						if (items.indexOf(val) % 2 == 0) {

							y += "<tr>" + t + "</tr>";
						} else {
							y += "<tr style='background-color: #ebf2fa;'>" + t + "</tr>";
						}

					}));
				}),
				onError : lang.hitch(this, function(e) {
					alert("error in fetch");
				})
			});
			var rowel = "<table class='Tabletemplate' style='font-size: 10;font:menu;border:2px solid black;'><tr style='width: 100%;border:11px solid black;background-color: beige;'>" + y + "</tr></table>"
			b += rowel;
			myWindow.document.write(b);
			myWindow.document.write();
			myWindow.document.write("<br>" + "Copyright © 2016 MRSAC. All Rights Reserved" + "<br>" + "<label >Data Provider:<strong> Maharashtra Remote Sensing Application Center </strong></label>");
			/**************************************************************************************/
			var css = '@media print {#non-printable {display: none;}#printable {display: block;	} thead {display: table-header-group;}}',
			    head = myWindow.document.head || myWindow.document.getElementsByTagName('head')[0],
			    style = myWindow.document.createElement('style');
			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {

				style.appendChild(myWindow.document.createTextNode(css));

			}

			head.appendChild(style);

			/**************************************************************************************/

		},
		ExportToExcel : function(mytblId) {
			var htmltable = document.getElementById('my-table-id');
			var html = htmltable.outerHTML;
			window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
		},
		ExportToPDF : function(mytblId) {
			var htmltable = document.getElementById('my-table-id');
			var html = htmltable.outerHTML;
			window.open('data:application/vnd.pdf,' + encodeURIComponent(html));
		},
		getInput : function(str) {

			var start = str.indexOf('/');
			var end = str.lastIndexOf('/');
			if (start == 0 || end > 1) {
				var regstr = str.substring(start + 1, end);
				var modifiers = str.substring(end + 1, str.length);
				str = new RegExp(regstr, modifiers);
			}
			console.log("input:", str);
			return str;
		},
		onSearched : function(rowIdx) {

			console.log("search result:", rowIdx);
			if (rowIdx < 0) {
				this.footerInfoNode.innerHTML = "Not Found!";
			} else {
				this.footerInfoNode.innerHTML = "Search result is Row " + (rowIdx + 1);
				this.Tgrid.scrollToRow(rowIdx, true);
			}

		},
		onSearchAll : function(event) {

			if (event.keyCode == keys.ENTER) {

				//var y = this.onSearched(this.getInput(this.RecordValue.value));

				this.Tgrid.scrollToRow((parseInt(this.getInput(this.RecordValue.value)) - 1), true);
				//this.Tgrid.scrollToRow(parseInt(this.getInput(this.RecordValue.value)), true);

				this.footerInfoNode.innerHTML = "Search result is record " + this.getInput(this.RecordValue.value);
				//this.Tgrid.searchRow(this.getInput(this.RecordValue.value), lang.partial(y, this.footerInfoNode));

			}

		},
		DeleteSelected : function(evt) {
			var storeGraphic = [];
			var items = this.Tgrid.selection.getSelected();
			if (items.length) {
				array.forEach(this.flashGraphicsLayer.graphics, lang.hitch(this, function(graphic) {

					array.forEach(items, lang.hitch(this, function(selectedItem) {

						if (graphic.attributes.name == (selectedItem.idx + this.TitleText)) {

							storeGraphic.push(graphic);
						}

					}));
				}));
			}
			array.forEach(items, lang.hitch(this, function(selectedItem) {

				if (selectedItem !== null) {
					this.WriteStore.deleteItem(selectedItem);
				}
			}));
			for (g in storeGraphic) {
				this.flashGraphicsLayer.remove(storeGraphic[g]);
			}

			var count = this.Tgrid.selection.getSelectedCount();
			var template = "Number of Record Selected is" + "&nbsp" + count + " out of toatal " + this.Store.length + " records";
			if (count == 0) {
				template = "No records Selected"
			}
			this.footerInfoNode.innerHTML = template;
		},
		CopyUnselected : function(evt) {
		},
	  SelectOnClick1 : function(evt) {
  		
			var a1 = [];
			this.flashGraphicsLayer.clear();
			this.map.graphics.clear();
			
			if (this.SelectedRowsCount > 0) {
                 
				array.forEach(this.SelectedRows, lang.hitch(this, function(selectedItem) {

					var obj = selectedItem.idx + this.TitleText;
					var sfs = null;
					if (selectedItem.feature[0].geometry.type == "point") {
						sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3), new Color('yellow'));
					} else if (selectedItem.feature[0].geometry.type == "polygon") {
						sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
					} else {

					}
				
					//var graphicS = new Graphic(selectedItem.feature[0].geometry, sfs,selectedItem.feature[0].attributes,selectedItem.feature[0].attributes);
					var graphicS = new Graphic(selectedItem.feature[0].geometry, sfs);
          			var point = new Point(selectedItem.feature[0].geometry.x, selectedItem.feature[0].geometry.y,selectedItem.feature[0].geometry.spatialReference);
				  //   topic.publish("widgetHighlightEvent", selectedItem.feature[0], point, true);
					this.circleNew = new Circle({
						center : point,
						geodesic : false,
						radius : 2,
						radiusUnit : "esriKilometers"
					});
					this.map.setExtent(this.circleNew.getExtent().expand(1), true);

					var jsonAttr = {
						"name" : selectedItem.idx + this.TitleText,
					};
					var fdata4 = selectedItem.feature[0].attributes;
		         	//	graphicS.setAttributes(jsonAttr);
      				graphicS.setAttributes(fdata4);
      				//graphicS.setInfoTemplate(fdata4);
      			//	console.log(graphicS);
      				
					this.flashGraphicsLayer.add(graphicS);
					//******************
				//	this.flashGraphicsLayer.on("click", lang.hitch(this, function(evt1) {
					
	//*****************
      /*     d3.select("#infoDiv").remove();
			this.map.graphics.clear();
           	d3.select("body").append("div").attr("class", "infoDiv").attr("id", "infoDiv");
			//---------------set heading ---------------------------------
			document.getElementById('infoDiv').innerHTML = "<div><h1 id='infoTitle'>Plantation Information</h1></div>";
			//----------------create elements----------------------------
		     	this.contentDiv = domConstruct.create("div", {
				class : "contentDiv_class"
			}, document.getElementById("infoDiv"));
         	var photoContainer = document.createElement('div');
         	
         		//---------------set properties--------------------------------
			console.log(selectedItem.feature[0].geometry.x);
			console.log(selectedItem.feature[0].geometry.y);
			document.getElementById('infoDiv').style.left = 500 + "px";
			document.getElementById('infoDiv').style.top = 300 + "px";
      
			 var fdata =selectedItem.feature[0].attributes;
			 var photoName =selectedItem.feature[0].attributes.image_1.trim();
			 var photoName1=selectedItem.feature[0].attributes.image_2.trim();
			var contentTable = "<table>\n\<tr style='font-size: 10px'><td style='font-weight: bold'>District Name</td><td>" + fdata.dist_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Taluka Name</td><td>" + fdata.taluka_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Location Name</td><td>" + fdata.loca_na + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Code</td><td>" + fdata.plantcode + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Tree Name</td><td>" + fdata.treename + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Latitude</td><td>" + fdata.latt_dd + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Longitude</td><td>" + fdata.long_dd + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Survey Date Time</td><td>" + fdata.surv_datetime + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Area</td><td>" + fdata.area_ha + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Targeted Seedlings</td><td>" + fdata.target_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>No. of Pit Dug</td><td>" + fdata.pit_dug + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Planted Seedings</td><td>" + fdata.plant_seedl + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Servived Seeding</td  ><td>" + fdata.survv_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survival(%)</td><td>" + fdata.survv_percent + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Average Height (m)</td><td>" + fdata.sampl_height + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Average Girth (m)</td><td>" + fdata.avg_girth + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Accuracy</td><td>" + fdata.accuracy + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survey Remarks</td><td>" + fdata.surv_rem + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Site Cordinator</td><td>" + fdata.site_coo_na + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Site Cordinator Mobile No.</td><td>" + fdata.site_coo_no + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>OBJECTID</td><td>" + fdata.OBJECTID + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Photo1 </td><td><a target='_blank' href='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName + ".jpg'><img src='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Photo2 </td><td><a target='_blank' href='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName1 + ".jpg'><img src='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName1 + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr></table>"
			//var contentTable = "hi";
			this.contentDiv.innerHTML = contentTable ; //+ photoContainer.innerHTML;
			//--------------------Close Buttons--------------------------
			d3.select("#infoDiv").append("div").attr("class", "crossBtn").attr("id", "picture");
			d3.select("#picture").append("img").attr("src", "./img/widget/Close.png").attr("width", 20).attr("height", 20).on("click", lang.hitch(this, function() {
				this.map.graphics.clear();
				d3.select("#infoDiv").remove();
			this.flashGraphicsLayer.clear();
			this.map.graphics.clear();
			if (this.featureLayer) {
				this.map.removeLayer(this.featureLayer);
			}
			//  alert("hi");
			}));
			//--------------------Movable/Draggable div--------------------------
			on(dom.byId("infoTitle"), "click", lang.hitch(this, function() {
				domStyle.set(dom.byId("infoTitle"), "cursor", "move");
				var dnd = new Moveable(dom.byId("infoDiv"));
			})); */
    //*****************

				}));
			
			
				
				
			} else {
				alert("No records Selected");
			}
   /*  this.flashGraphicsLayer.on("click", lang.hitch(this, function(evt1) {	
//	this.flashGraphicsLayer.on("click", function(evt1) {
			  	 	  // alert("hi");
     
			  	 	      var fdata1=null;
				       fdata1 = evt1.graphic.attributes;
                      console.log(evt1);
                       var photoName = fdata1.image_1.trim();
						var photoName1 = fdata1.image_2.trim();
                  //   console.log(fdata1.OBJECTID);
                    //	alert("counting");
                    
                   this.map.infoWindow.setContent("<table>\n\<tr style='font-size: 10px'><td style='font-weight: bold'>District Name</td><td>" + fdata1.dist_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Taluka Name</td><td>" + fdata1.taluka_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Location Name</td><td>" + fdata1.loca_na + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Code</td><td>" + fdata1.plantcode + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Tree Name</td><td>" + fdata1.treename + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Latitude</td><td>" + fdata1.latt_dd + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Longitude</td><td>" + fdata1.long_dd + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Survey Date Time</td><td>" + fdata1.surv_datetime + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Area</td><td>" + fdata1.area_ha + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Targeted Seedlings</td><td>" + fdata1.target_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>No. of Pit Dug</td><td>" + fdata1.pit_dug + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Planted Seedings</td><td>" + fdata1.plant_seedl + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Servived Seeding</td  ><td>" + fdata1.survv_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survival(%)</td><td>" + fdata1.survv_percent + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Average Height (m)</td><td>" + fdata1.sampl_height + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Average Girth (m)</td><td>" + fdata1.avg_girth + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Accuracy</td><td>" + fdata1.accuracy + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survey Remarks</td><td>" + fdata1.surv_rem + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Site Cordinator</td><td>" + fdata1.site_coo_na + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Site Cordinator Mobile No.</td><td>" + fdata1.site_coo_no + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>OBJECTID</td><td>" + fdata1.OBJECTID + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Photo1 </td><td><a target='_blank' href='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName + ".jpg'><img src='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Photo2 </td><td><a target='_blank' href='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName1 + ".jpg'><img src='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName1 + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr></table>");
                   this.map.infoWindow.setTitle("<b>Plantation Information</b>");
               // console.log(evt1.mapPoint);
                     this.map.infoWindow.show(evt1.mapPoint);
					   
					}));  */
		},  
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
		SelectOnClick : function(evt) {
		
		
			var element = document.getElementById("divLoadingIndicator");
			element.style.display = "block";

			var a1 = [];
            
			this.flashGraphicsLayer.clear();
			this.queryLayer.clear();
          
			if (this.SelectedRowsCount > 0) {
          
				var element = document.getElementById("divLoadingIndicator");
				element.style.display = "block";

				array.forEach(this.SelectedRows, lang.hitch(this, function(selectedItem1) {
 
					var obj = selectedItem1.idx + this.TitleText;
				 
					var sfs1 = null;
                   console.log(selectedItem1);
                    if(!selectedItem1.feature){
                    //	alert("ok");
                    	if (selectedItem1.length === 0) {
						swal("No features available for selected point");
						var element = document.getElementById("divLoadingIndicator");
						element.style.display = "none";
					    }else{
					    	console.log(selectedItem1);
					    	//	var xa1 = selectedItem1['latitude'];
							//	var yb1 = selectedItem1['longitude'];
								var	lat = selectedItem1.latitude;
								var	lng = selectedItem1.longitude;
								console.log(lat);
								console.log(lng);
						//var	point = new Point (lng[1], lat[1], new SpatialReference ({wkid : 4326}));
							var point = new esri.geometry.Point(lng[0],lat[0],new esri.SpatialReference({ 'wkid': 4326 }));
						console.log(point);
						var mp = webMercatorUtils.geographicToWebMercator (point);

						circleNew = new Circle ({center : mp,geodesic : false,radius : 10,radiusUnit : "esriKilometers"});
						this.map.setExtent (circleNew.getExtent ().expand (0.5), true);
			//	this.map.centerAndZoom(esri.geometry.geographicToWebMercator(pt), 7);  
  //this.map.centerAndZoom(wmPoint,0.5);
											
							//	var point1 = new esri.geometry.Point(xa1,yb1,new esri.SpatialReference({ 'wkid': 4326 }));
								
							/*	this.circleNew = new Circle({
									center : wmPoint,
									geodesic : false,
									radius : 10,
									radiusUnit : "esriKilometers"
								});
								this.map.setExtent(this.circleNew.getExtent().expand(7), true);  */
					    }
					    
					    
					    
                    }else{ 
	//-----------------------------------	
					if (selectedItem1.feature.length === 0) {
						swal("No features available for selected point");
						var element = document.getElementById("divLoadingIndicator");
						element.style.display = "none";
					} else {
						if (selectedItem1.feature[0].geometry.type == "point") {
							//sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
                           	sfs1 = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 22, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3), new Color('yellow'));
						} else if (selectedItem1.feature[0].geometry.type == "polygon") {

							sfs1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
						} else {

						}
						//===================================================================================
						d3.select("#infoDiv").remove();
						this.map.graphics.clear();
						//------------------variables------------------------
						
						var features = selectedItem1.feature;
						var talE = [];
                        
						array.forEach(features, lang.hitch(this, function(i) {
                			talE.push(i);
							 var graphic1 = new Graphic();
						 graphic1 = i;
						var category = graphic1.attributes.OBJECTID;
						//graphic1.setSymbol(sfs1);
						this.queryLayer.add(graphic1);
						
						
						}));
                      this.map.addLayer(this.queryLayer,0);
						if (selectedItem1.feature.length == 1) {
						
							if (selectedItem1.feature[0].geometry.type == "point") {
								var x = selectedItem1.feature[0].geometry.x
								var y = selectedItem1.feature[0].geometry.y
                             
								var point = new Point(x, y);
                       
								this.circleNew = new Circle({
									center : point,
									geodesic : false,
									radius : 2,
									radiusUnit : "esriKilometers"
								});
							this.map.setExtent(this.circleNew.getExtent().expand(1), true);
						    topic.publish("widgetHighlightEvent", selectedItem1.feature[0], point, true);
							}
						} else {
							var myFeatureExtent = graphicsUtils.graphicsExtent(talE);
							this.map.setExtent(myFeatureExtent, true);
						}
								//	 this.cretediv(selectedItem1.feature[0]);  
						
						//--------zoom to features-----------------------------
						var element = document.getElementById("divLoadingIndicator");
						element.style.display = "none";
						//	this.cretediv(selectedItem1.feature[0]);
						//---------------------Info Window------------------------------------------
				 		// this.map.graphics.on("click", this.cretediv(selectedItem1.feature[0]));
				
						/*				this.queryLayer.on("click", lang.hitch(this, function(evt1) {
                       //console.log(evt);
                    		//---------------------------Query Task--------------------------------
                                alert("hi");		
						//	this.infoFunction(evt1);

						})); */  
						
						//===================================================================================
						}
		//-----------------------------------			
                        }
				}));
			} else {
				alert("No records Selected");
			}
			var element = document.getElementById("divLoadingIndicator");
			element.style.display = "none";
		  
		},
			//==================================================================================================
cretediv :function(evt1){
	console.log(evt1);
	console.log("cretediv");
		d3.select("#infoDiv").remove();
			this.map.graphics.clear();
			//--------------------highlight selected graphics-----------
			var highlightSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 255, 255]), 3), new Color([204, 255, 255, 0]));
			var highlightGraphic = new Graphic(evt1.geometry, highlightSymbol);
			this.map.graphics.add(highlightGraphic);
			//-----------------variables-------------------------------	
				var attributes = evt1.attributes;
			var geometry = evt1.geometry;
			var photo = evt1.attributes.image_1.trim();
		//	console.log(evt1.attributes.plantcode);
			//--------------------------------------------
			//--------------------------------------------
			d3.select("body").append("div").attr("class", "infoDiv").attr("id", "infoDiv");
			//---------------set heading ---------------------------------
			document.getElementById('infoDiv').innerHTML = "<div><h1 id='infoTitle'>Plantation Information</h1></div>";
			//----------------create elements----------------------------
		
			this.contentDiv = domConstruct.create("div", {
				class : "contentDiv_class"
			}, document.getElementById("infoDiv"));
         	var photoContainer = document.createElement('div');

			var photoDiv = document.createElement('div');
			var img = document.createElement('img');
			var aPhoto = document.createElement('a');

			var toolTable = document.createElement('table');
			var tr1 = document.createElement('tr');
			var td1 = document.createElement('td');
	//********************************	
			//---------------set properties--------------------------------
			document.getElementById('infoDiv').style.left = 600 + "px";
			document.getElementById('infoDiv').style.top = 300 + "px";
    
			 var fdata =evt1.attributes;
			 var photoName =evt1.attributes.image_1.trim();
			 var photoName1=evt1.attributes.image_2.trim();
			var contentTable = "<table>\n\<tr style='font-size: 10px'><td style='font-weight: bold'>District Name</td><td>" + fdata.dist_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Taluka Name</td><td>" + fdata.taluka_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Location Name</td><td>" + fdata.loca_na + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Code</td><td>" + fdata.plantcode + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Tree Name</td><td>" + fdata.treename + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Latitude</td><td>" + fdata.latt_dd + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Longitude</td><td>" + fdata.long_dd + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Survey Date Time</td><td>" + fdata.surv_datetime + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Area</td><td>" + fdata.area_ha + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Targeted Seedlings</td><td>" + fdata.target_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>No. of Pit Dug</td><td>" + fdata.pit_dug + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Planted Seedings</td><td>" + fdata.plant_seedl + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Servived Seeding</td  ><td>" + fdata.survv_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survival(%)</td><td>" + fdata.survv_percent + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Average Height (m)</td><td>" + fdata.sampl_height + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Average Girth (m)</td><td>" + fdata.avg_girth + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Accuracy</td><td>" + fdata.accuracy + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survey Remarks</td><td>" + fdata.surv_rem + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Site Cordinator</td><td>" + fdata.site_coo_na + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Site Cordinator Mobile No.</td><td>" + fdata.site_coo_no + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>OBJECTID</td><td>" + fdata.OBJECTID + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Photo1 </td><td><a target='_blank' href='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName + ".jpg'><img src='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Photo2 </td><td><a target='_blank' href='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName1 + ".jpg'><img src='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName1 + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr></table>"
			//var contentTable = "hi";
			this.contentDiv.innerHTML = contentTable ; //+ photoContainer.innerHTML;
			//--------------------Close Buttons--------------------------
			d3.select("#infoDiv").append("div").attr("class", "crossBtn").attr("id", "picture");
			d3.select("#picture").append("img").attr("src", "./img/widget/Close.png").attr("width", 20).attr("height", 20).on("click", lang.hitch(this, function() {
				this.map.graphics.clear();
				d3.select("#infoDiv").remove();
				this.queryLayer.clear();
			}));
			
},
infoFunction : function(evt1) {
   console.log("infoFunction"); 
console.log(evt1);

			d3.select("#infoDiv").remove();
			this.map.graphics.clear();
			//--------------------highlight selected graphics-----------
			var highlightSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 255, 255]), 3), new Color([204, 255, 255, 0]));
			var highlightGraphic = new Graphic(evt1.graphic.geometry, highlightSymbol);
			this.map.graphics.add(highlightGraphic);
			//-----------------variables-------------------------------
			var attributes = evt1.graphic.attributes;
			var geometry = evt1.graphic.geometry;
			var photo = evt1.graphic.attributes.image_1.trim();
			console.log(evt1.graphic.attributes.plantcode);
			//--------------------------------------------
			d3.select("body").append("div").attr("class", "infoDiv").attr("id", "infoDiv");
			//---------------set heading ---------------------------------
			document.getElementById('infoDiv').innerHTML = "<div><h1 id='infoTitle'>Plantation Information</h1></div>";
			//----------------create elements----------------------------
		
			this.contentDiv = domConstruct.create("div", {
				class : "contentDiv_class"
			}, document.getElementById("infoDiv"));
         	var photoContainer = document.createElement('div');

			var photoDiv = document.createElement('div');
			var img = document.createElement('img');
			var aPhoto = document.createElement('a');

			var toolTable = document.createElement('table');
			var tr1 = document.createElement('tr');
			var td1 = document.createElement('td');
	//********************************	
			//---------------set properties--------------------------------
			document.getElementById('infoDiv').style.left = evt1.x + "px";
			document.getElementById('infoDiv').style.top = evt1.y + "px";
      
			 var fdata =evt1.graphic.attributes;
			 var photoName =evt1.graphic.attributes.image_1.trim();
			 var photoName1=evt1.graphic.attributes.image_2.trim();
			var contentTable = "<table>\n\<tr style='font-size: 10px'><td style='font-weight: bold'>District Name</td><td>" + fdata.dist_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Taluka Name</td><td>" + fdata.taluka_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Location Name</td><td>" + fdata.loca_na + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Code</td><td>" + fdata.plantcode + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Tree Name</td><td>" + fdata.treename + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Latitude</td><td>" + fdata.latt_dd + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Longitude</td><td>" + fdata.long_dd + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Survey Date Time</td><td>" + fdata.surv_datetime + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Area</td><td>" + fdata.area_ha + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Targeted Seedlings</td><td>" + fdata.target_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>No. of Pit Dug</td><td>" + fdata.pit_dug + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Planted Seedings</td><td>" + fdata.plant_seedl + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Servived Seeding</td  ><td>" + fdata.survv_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survival(%)</td><td>" + fdata.survv_percent + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Average Height (m)</td><td>" + fdata.sampl_height + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Average Girth (m)</td><td>" + fdata.avg_girth + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Accuracy</td><td>" + fdata.accuracy + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survey Remarks</td><td>" + fdata.surv_rem + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Site Cordinator</td><td>" + fdata.site_coo_na + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Site Cordinator Mobile No.</td><td>" + fdata.site_coo_no + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>OBJECTID</td><td>" + fdata.OBJECTID + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Photo1 </td><td><a target='_blank' href='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName + ".jpg'><img src='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Photo2 </td><td><a target='_blank' href='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName1 + ".jpg'><img src='http://117.240.213.117/mrsacdata/uploads/forest/2/" + photoName1 + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr></table>"
			//var contentTable = "hi";
			this.contentDiv.innerHTML = contentTable ; //+ photoContainer.innerHTML;
			//--------------------Close Buttons--------------------------
			d3.select("#infoDiv").append("div").attr("class", "crossBtn").attr("id", "picture");
			d3.select("#picture").append("img").attr("src", "./img/widget/Close.png").attr("width", 20).attr("height", 20).on("click", lang.hitch(this, function() {
				this.map.graphics.clear();
				d3.select("#infoDiv").remove();
				this.queryLayer.clear();
			}));
			//--------------------Movable/Draggable div--------------------------
			on(dom.byId("infoTitle"), "click", lang.hitch(this, function() {
				domStyle.set(dom.byId("infoTitle"), "cursor", "move");
				var dnd = new Moveable(dom.byId("infoDiv"));
			}));
						
			//} else {
		//	}  
		},   
		//==================================================================================================
		infoFunction1 : function(evt, results) {
          
          	var layer2 = this.map.getLayer("queryLayer");
			if (layer2) {
		//		this.map.removeLayer(layer2);
		   console.log("infoFunction1"); 
		          alert(evt);
			d3.select("#infoDiv").remove();
			this.map.graphics.clear();
			//--------------------highlight selected graphics-----------
			var highlightSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 255, 255]), 3), new Color([204, 255, 255, 0]));
			var highlightGraphic = new Graphic(evt.graphic.geometry, highlightSymbol);
			this.map.graphics.add(highlightGraphic);
			//-----------------variables-------------------------------
			var attributes = evt.graphic.attributes;
			var geometry = evt.graphic.geometry;
			var photo = results[0].attributes.image_1.trim();
			console.log(results[0].attributes.plantcode);
			//--------------------------------------------
			d3.select("body").append("div").attr("class", "infoDiv").attr("id", "infoDiv");
			//---------------set heading ---------------------------------
			document.getElementById('infoDiv').innerHTML = "<div><h1 id='infoTitle'>Plantation Information</h1></div>";
			//----------------create elements----------------------------
		
			this.contentDiv = domConstruct.create("div", {
				class : "contentDiv_class"
			}, document.getElementById("infoDiv"));
         	var photoContainer = document.createElement('div');

			var photoDiv = document.createElement('div');
			var img = document.createElement('img');
			var aPhoto = document.createElement('a');

			var toolTable = document.createElement('table');
			var tr1 = document.createElement('tr');
			var td1 = document.createElement('td');
	//********************************	
			//---------------set properties--------------------------------
			document.getElementById('infoDiv').style.left = evt.x + "px";
			document.getElementById('infoDiv').style.top = evt.y + "px";
      
			 var fdata =results[0].attributes;
			 var photoName =results[0].attributes.image_1.trim();
			 var photoName1=results[0].attributes.image_2.trim();
			var contentTable = "<table>\n\<tr style='font-size: 10px'><td style='font-weight: bold'>District Name</td><td>" + fdata.dist_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Taluka Name</td><td>" + fdata.taluka_na + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Location Name</td><td>" + fdata.loca_na + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Code</td><td>" + fdata.plantcode + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Tree Name</td><td>" + fdata.treename + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Latitude</td><td>" + fdata.latt_dd + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Longitude</td><td>" + fdata.long_dd + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Survey Date Time</td><td>" + fdata.surv_datetime + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Plantation Area</td><td>" + fdata.area_ha + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Targeted Seedlings</td><td>" + fdata.target_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>No. of Pit Dug</td><td>" + fdata.pit_dug + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Planted Seedings</td><td>" + fdata.plant_seedl + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Servived Seeding</td  ><td>" + fdata.survv_seedl + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survival(%)</td><td>" + fdata.survv_percent + "</td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Average Height (m)</td><td>" + fdata.sampl_height + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Average Girth (m)</td><td>" + fdata.avg_girth + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Accuracy</td><td>" + fdata.accuracy + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Survey Remarks</td><td>" + fdata.surv_rem + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>Site Cordinator</td><td>" + fdata.site_coo_na + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Site Cordinator Mobile No.</td><td>" + fdata.site_coo_no + "</td></tr>\n\<tr style='font-size: 10px'><td style=' font-weight: bold'>OBJECTID</td><td>" + fdata.OBJECTID + "</td></tr>\n\<tr style='background-color: #e5f1fa; font-size: 10px'><td style=' font-weight: bold'>Photo1 </td><td><a target='_blank' href='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName + ".jpg'><img src='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr>\n\<tr style='background-color: #e5f1fa;  font-size: 10px'><td style=' font-weight: bold'>Photo2 </td><td><a target='_blank' href='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName1 + ".jpg'><img src='http://mrsac.maharashtra.gov.in/mobile_data/mobiledata/uploads/forest/" + photoName1 + ".jpg' alt='Project Location' height='100px' width='133px'/></a></td></tr></table>"
			//var contentTable = "hi";
			this.contentDiv.innerHTML = contentTable ; //+ photoContainer.innerHTML;
			//--------------------Close Buttons--------------------------
			d3.select("#infoDiv").append("div").attr("class", "crossBtn").attr("id", "picture");
			d3.select("#picture").append("img").attr("src", "./img/widget/Close.png").attr("width", 20).attr("height", 20).on("click", lang.hitch(this, function() {
				this.map.graphics.clear();
				d3.select("#infoDiv").remove();
				this.queryLayer.clear();
			}));
			//--------------------Movable/Draggable div--------------------------
			on(dom.byId("infoTitle"), "click", lang.hitch(this, function() {
				domStyle.set(dom.byId("infoTitle"), "cursor", "move");
				var dnd = new Moveable(dom.byId("infoDiv"));
			}));
						
			} else {
			}
		},   
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		
		arrayDiff : function(a1, a2) {
			var o1 = {},
			    o2 = {},
			    diff = [],
			    i,
			    len,
			    k;
			for ( i = 0,
			len = a1.length; i < len; i++) {
				o1[a1[i]] = true;
			}
			for ( i = 0,
			len = a2.length; i < len; i++) {
				o2[a2[i]] = true;
			}
			for (k in o1) {
				if (!( k in o2)) {
					diff.push(k);
				}
			}
			for (k in o2) {
				if (!( k in o1)) {
					diff.push(k);
				}
			}
			return diff;
		},
		onSortAscend : function(evt) {

			var col = this.colidx;
			//this.Tgrid.canSort = this.canSort(col);
			this.Tgrid.sortInfo = col;
			//this.Tgrid.canSort = this.overrdAscSort(col);

		},
		overrdAscSort : function(col) {

			//this.Tgrid.sortInfo = "3"

			if (col < 0) {
				return false;
			} else {
				return true;
			}

		},
		onSortDescend : function(evt) {

			var col = this.colidx;
			//this.Tgrid.canSort = this.overrdDescSort(col);
		},
		overrdDescSort : function(col) {

			if ((col) > 0) {
				return false;
			} else {
				return true;
			}
		},
		canSort : function(sortInfo) {
			if (sortInfo == -1) {
				return true;
			} else {
				return this.inherited("canSort", arguments);
			}
		},
		oncloseTable : function(evt) {
			var removeGrph = [];
			array.forEach(this.flashGraphicsLayer.graphics, lang.hitch(this, function(gphs) {

				var d = gphs.attributes.name;
				var withNoDigits = d.replace(/[0-9]/g, '');
				if (withNoDigits == this.TitleText) {

					removeGrph.push(gphs);
				}

			}));
			array.forEach(removeGrph, lang.hitch(this, function(gphs) {
				this.flashGraphicsLayer.remove(gphs);
			}));
			this.closeTable(this, this.TitleText);
		},
		closeTable : function(/*String*/frameId, Title) {

			// stub for event handling in TableContainer
		},
		setActive : function() {

			var PreviousTableWidgets = query(".mrsacTableNameDiv");
			array.forEach(PreviousTableWidgets, lang.hitch(this, function(widgets) {

				if (domClass.contains(widgets, "MrsacTableActive")) {
					domClass.replace(widgets, "MrsacTableInActive", "MrsacTableActive");
				}

			}));
			var element = query(".mrsacTableNameDiv", this.domNode)[0];
			domClass.add(element, "MrsacTableActive");
		},
		setTableTitle : function(/*String*/title) {
			this.title = title;
		},
		setLabel : function(/*String*/label) {
			var element = query(".mrsacTableNameDiv", this.domNode)[0];
			element.innerHTML = label;
		},
		onSelectChild : function(evt) {

			var TableframesParent = this.getParent();
			var TableframesChildren = TableframesParent.getChildren();
			var getTextDiv = query(".mrsacTableNameDiv");
			for (var i = 0; i < getTextDiv.length; i++) {

				if (domClass.contains(getTextDiv[i], "MrsacTableActive")) {

					domClass.replace(getTextDiv[i], "MrsacTableInActive", "MrsacTableActive");
				}

			}
			if (domClass.contains(evt.target, "MrsacTableInActive")) {

				domClass.replace(evt.target, "MrsacTableActive", "MrsacTableInActive");
			}

			for (var i = 0; i < TableframesChildren.length; i++) {

				var frame = TableframesChildren[i];
				if (frame.title == this.TitleText) {
					domStyle.set(frame.domNode, {
						"position" : "absolute",
						"left" : "0px",
						"width" : "100%",
						"z-index" : "99999999"
					});
					frame.state = "Showing";
				} else {
					domStyle.set(frame.domNode, {
						"position" : "absolute",
						"left" : "0px",
						"width" : "100%",
						"z-index" : "0"
					});
					frame.state = "hidden";
				}

			}
		},
		AddRecord : function(e) {

			var count = 0,
			    abort = false;
			var ObjectK = [];
			this.Tgrid.store.fetch({
				onComplete : lang.hitch(this, function(items) {

					array.forEach(items, lang.hitch(this, function(val) {
						count = parseInt(val.idx);
						var attrs = Object.keys(val);
						array.forEach(attrs, lang.hitch(this, function(attr) {
							array.forEach(this.StoreKeys, lang.hitch(this, function(getVal) {
								if (getVal == attr && !abort) {
									var value = val[attr];
									if ((value == null) || (value == "")) {
										abort = true
										alert("new record can not be added without filling the blank rows")
										if (abort) {
											return;
										}

									}

								}

							}));
						}));
					}));
				}),
				onError : lang.hitch(this, function(e) {
					alert("error in fetch");
				})
			});
			count += 1;
			var bind = {
				"idx" : count
			};
			/******************need to improvise differently for gis and mis*************/
			//alert(this.StoreKeys)
			/**************************************************************************/
			array.forEach(this.StoreKeys, lang.hitch(this, function(valitem) {
				if (valitem == "OBJECTID") {
					bind[valitem] = count + 1;
				} else if (valitem == "idx") {
					bind[valitem] = count;
				} else {
					bind[valitem] = '';
				}

			}));
			try {

				if (!abort) {
					this.Tgrid.store.newItem(bind);
				}

			} catch (e) {

				alert(e);
			}

		},
		ZoomToSelection : function(e) {

			var TotalGeom = []

			this.GraphicLayer.clear();
			if (this.SelectedRowsCount > 0) {

				array.forEach(this.SelectedRows, lang.hitch(this, function(selectedItem) {

					var sfs = null;
					if (selectedItem.feature[0].geometry.type == "point") {
						sfs = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
					} else if (selectedItem.feature[0].geometry.type == "polygon") {

						sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#18FFFF"), 3), new Color([255, 255, 255, 0]), 1);
					} else {

					}
					var graphicS = new Graphic(selectedItem.feature[0].geometry, sfs);
					TotalGeom.push(graphicS);
					var jsonAttr = [{
						"name" : selectedItem.id
					}];
					graphicS.setAttributes(jsonAttr);
					this.map.addLayer(this.GraphicLayer);
					this.GraphicLayer.add(graphicS);
					setTimeout(lang.hitch(this, function() {
						this.GraphicLayer.remove(graphicS);
					}), 3000);
				}));
			} else {
				alert("No records Selected")
			}

			var myFeatureExtent = graphicsUtils.graphicsExtent(TotalGeom);
			this.map.setExtent(myFeatureExtent.getExtent(), true);
		},
		AddColumn : function(e) {

			this.dialog.show();
		},
		onAddColOk : function(e) {
			var TextBox = this.TextBox.value;
			var TypeOptions = this.TypeOptions.value;
			var Alias = this.Alias.innerHTML;
			var NullValBoolean = this.NullValBoolean.innerHTML;
			var DefaultVal = this.DefaultVal.innerHTML;
			if (TypeOptions == "Numeric") {
				align = "right"
			} else if (TypeOptions == "text") {
				align = "left"
			} else {
				align = "centre"

			}

			this.Tgrid.structure.push({
				name : Alias,
				field : TextBox,
				editable : true,
				value : DefaultVal,
				align : align

			});
			this.Tgrid.set("structure", this.Tgrid.structure);
			this.Tgrid.render();
			this.dialog.hide();
		},
		onAddColCancel : function(e) {
			this.dialog.hide();
		},
	});
});
