define(["viewer/_BaseWidget", "dojo/_base/declare", "dojo/text!./templates/BookmarkWidget.html", "dojo/_base/lang", "esri/dijit/Bookmarks", "dojo/dom-construct", "dojo/dom", "dojo/_base/array", "dojo/_base/connect", "dojo/cookie"], function(_BaseWidget, declare, template, lang, Bookmarks, domConstruct, dom, array, connect, cookie) {

	return declare("mrsac.viewer.widgets.BookmarkWidget", [mrsac.viewer._BaseWidget], {

		templateString : template,

		bmJSON : null,

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

			} catch (err) {
				console.error(err);
			}

		},
		startup : function() {

			this.inherited(arguments);
			storageName = 'esrijsapi_mapmarks'
			useLocalStorage = lang.hitch(this, this.supports_local_storage());

			if (this._initialized) {
				return;
			}

			try {

				this.getAllNamedChildDijits();
		
				this.createbookmark();
          
			} catch (err) {
				console.error("SearchWidget::startup", err);
			}

		},
		createbookmark : function() {

			// Create the bookmark widget
			// specify "editable" as true to enable editing
			bookmark = new Bookmarks({
				map : this.map,
				bookmarks : [],
				editable : true
			}, dom.byId('bookmark'));
          
			dojo.connect(bookmark, 'onEdit', lang.hitch(this, this.refreshBookmarks));
			dojo.connect(bookmark, 'onRemove', lang.hitch(this, this.refreshBookmarks));

			if (this.useLocalStorage) {

				this.bmJSON = window.localStorage.getItem(storageName);
			} else {
				this.bmJSON = cookie(storageName);
			}

			if (this.bmJSON && this.bmJSON != 'null' && this.bmJSON.length > 4) {
				console.log('cookie: ', this.bmJSON, this.bmJSON.length);
				var bmarks = dojo.fromJson(this.bmJSON);

				array.forEach(bmarks, function(b) {

					bookmark.addBookmark(b);
				});
			} else {
				console.log('no stored bookmarks...');
			
				var bookmarkCA = {
					"extent" : {
						"spatialReference" : {
							"wkid" : 4326
						},
						"xmin" : 68.9995834543952, //68.9995834543952,          
						"ymin" : 14.9995834301808,//14.9995834301808,
						"xmax" : 85.0004167877285,//85.0004167877285,
						"ymax" : 23.0004167635141  //23.0004167635141           
					},
					"name" : "Maharashtra"
				};
           // alert("");
			//	bookmark.addBookmark(bookmarkCA)
			}

		},
		supports_local_storage : function() {

			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch( e ) {
				return false;
			}
		},
		refreshBookmarks : function() {
			if (this.useLocalStorage) {

				window.localStorage.setItem(storageName, dojo.toJson(bookmark.toJson()));
			} else {
				var exp = 7;
				// number of days to persist the cookie
				cookie(storageName, dojo.toJson(bookmark.toJson()), {
					expires : exp
				});
			}
		},
		shutdown : function() {
			domConstruct.empty(this.bookmark1)
		}
	});
});

