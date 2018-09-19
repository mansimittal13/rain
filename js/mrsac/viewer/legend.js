/*
 @ Deepa Saxena on May 7th, 2016
 */

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!./templates/legend.html", "dojo/request/xhr", "dojo/_base/lang", "dojo/_base/array", "dijit/registry", "dojo/dom-construct", "dojo/dom-class", "dojo/_base/window", "dojo/dom-style", "dojo/on", "dojo/dom", "dojo/_base/fx", "dojo/_base/fx", "dojo/fx", "dojo/fx/easing", "dojo/dnd/Moveable", "viewer/TOC"], function(declare, _WidgetBase, _TemplatedMixin, template, xhr, lang, array, registry, domConstruct, domClass, win, domStyle, on, dom, baseFx, fx, coreFx, easing, Moveable, TOC) {

	return declare("mrsac.viewer.legend", [_WidgetBase, _TemplatedMixin], {

		templateString : template,
		_initialized : false,
		element : null,
		myElem : null,
		divHeader : null,
		featureLayer : null,
		/***********************************************************************************************************************************************/
		constructor : function() {

		},
		/***********************************************************************************************************************************************/
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
		/***********************************************************************************************************************************************/
		postCreate : function() {
			try {
				this.inherited(arguments);
			} catch (err) {
				console.error(err);
			}
		},
		/***********************************************************************************************************************************************/
		startup : function() {
			this.inherited(arguments);
			if (this._initialized) {
				return;
			}

			try {
				//---------------------variables----------------------
				this.element = document.getElementsByClassName('legendFrame')[0];
				this.myElem = document.getElementById('legendContentPane');
				this.divHeader = document.getElementById('legendHeader');
				//---------------------------------------------------
				var dnd = new Moveable(this.myElem);
				this.showLegendFunc();

			} catch (err) {
				console.error("SearchWidget::startup", err);
			}
		},
		//======================load/unload============================================================================
		loadmrsac : function() {

			var element = document.getElementById('divLoadingIndicator1');
			domStyle.set(element, "display", "block");

		},
		unloadmrsac : function() {

			var element = document.getElementById('divLoadingIndicator1');
			domStyle.set(element, "display", "none");

		},
		loadmrsacgp : function() {
			alert("loadmrsacgp")
			var element = dom.byId('divLoadingIndicatornew');

			domStyle.set(element, "display", "block");

		},
		unloadmrsacgp : function() {
			var element = dom.byId('divLoadingIndicatornew');

			domStyle.set(element, "display", "none");

		},
		//============================Show/Hide Legends===============================================================
		showLegendFunc : function() {

			//-----------------------------------------------
			this.myElem.style.display = 'block';
			//------------close div----------------------------------------------
			on(document.getElementById('closeIcon'), "click", lang.hitch(this, function(evt) {

				this.myElem.style.display = 'none';

			}));
			layerInfos = [];

			array.forEach(this.map.layerIds, lang.hitch(this, function(id) {

				var layer = this.map.getLayer(id);

				if (layer.id === "layer0") {
					console.log (layer);
				}
				else {
					var e_info = {
						layer : layer,
						title : layer.id,
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true
					};

					layerInfos.push (e_info);
				}

			}));
		/*	array.forEach(this.map.graphicsLayerIds, lang.hitch(this, function(id) {

				var layer = this.map.getLayer(id);
				if (layer.url != null) {
					var e_info = {
						layer : layer,
						title : layer.id,
						collapsed : true, // whether this root layer should be collapsed initially, default false.
						slider : true
					};

					layerInfos.push(e_info);
				}

			}));*/

			var tocDivContainer = dom.byId('tocDivContainer');
			toc1 = new mrsac.viewer.TOC({
				map : this.map,
				layerInfos : layerInfos
			}, tocDivContainer);

			toc1.startup();
		},
		//============================MAximize Container===============================================================
		resetFunc : function() {

			//var top=this.myElem.style.top;

			fx.animateProperty({
				node : this.myElem,
				duration : 500,
				/*
				 properties : {
				 height : {
				 start : 0,
				 end : 310,
				 units : "px"
				 },
				 width : {
				 start : 0,
				 end : 250,
				 units : "px"
				 },
				 top : {
				 start : 70,
				 end : 30,
				 units : "%"
				 },
				 left : {
				 start : 2,
				 end : 5,
				 units : "%"
				 }
				 },*/

				onEnd : lang.hitch(this, function() {
					this.myElem.style = "left:" + leftPos + ";top:" + topPos + ";"
					document.getElementById('headTitle').style.display = 'block';
					document.getElementById('minIcon').style.display = 'block';
					document.getElementById('closeIcon').style.display = 'block';
					document.getElementById('tocDivContainer').style.display = 'block';

				}),
				easing : easing.quadInOut
			}).play();

		},
		//==========================Minimize Container=================================================================
		minDivFunc : function() {
			//----------------------------------------
			topPos = this.myElem.style.top;
			leftPos = this.myElem.style.left;

			fx.animateProperty({
				node : this.myElem,
				duration : 500,
				properties : {
					height : {
						start : 310,
						end : 0,
						units : "px"
					},
					width : {
						start : 250,
						end : 0,
						units : "px"
					},
					top : {
						start : topPos,
						end : 70,
						units : "%"
					},
					left : {
						start : leftPos,
						end : 2,
						units : "%"
					}
				},
				onBegin : lang.hitch(this, function() {

					document.getElementById('headTitle').style.display = 'none';
					document.getElementById('minIcon').style.display = 'none';
					document.getElementById('closeIcon').style.display = 'none';
					document.getElementById('tocDivContainer').style.display = 'none';

				}),
				easing : easing.quadInOut
			}).play();
		},
		//========================define ends here====================================================
	});
	//==========================declare ends here=======================================================
});
