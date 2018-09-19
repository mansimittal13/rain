define("dojo/store/JsonpMySQL", ["../number", "../string", "../request/script", "../when", "../_base/xhr", "../_base/lang", "../json", "../_base/declare", "./util/QueryResults" /*=====, "./api/Store" =====*/
], function(number, string, script, when, xhr, lang, JSON, declare, QueryResults /*=====, Store =====*/) {

	// No base class, but for purposes of documentation, the base class is dojo/store/api/Store
	var base = null;
	/*===== base = Store; =====*/

	/*=====
	 var __HeaderOptions = {
	 // headers: Object?
	 //		Additional headers to send along with the request.
	 },
	 __PutDirectives = declare(Store.PutDirectives, __HeaderOptions),
	 __QueryOptions = declare(Store.QueryOptions, __HeaderOptions);
	 =====*/

	return declare("dojo.store.JsonpMySQL", base, {
		// summary:
		//		This is a basic store for RESTful communicating with a server through JSON
		//		formatted data. It implements dojo/store/api/Store.

		constructor : function(options) {
			// summary:
			//		This is a basic store for RESTful communicating with a server through JSON
			//		formatted data.
			// options: dojo/store/JsonRest
			//		This provides any configuration information that will be mixed into the store
			declare.safeMixin(this, options);
		},

		method : "http",
		host : "127.0.0.1",
		port : 8080,
		interface : "sql",
		basicAuthUser : "Richa",
		basicAuthPassword : "lica",
		mysqlTable : "pmgsy",
		mysqlBlob : "vgen",
		mysqlId : "dojo_id",

		// target: String
		//		The target base URL to use for all requests to the server. This string will be
		//		prepended to the id to generate the URL (relative or absolute) for requests
		//		sent to the server
		target : "",

		// idProperty: String
		//		Indicates the property to use as the identity property. The values of this
		//		property should be unique.
		idProperty : "id",

		// sortParam: String
		//		The query parameter to used for holding sort information. If this is omitted, than
		//		the sort information is included in a functional query token to avoid colliding
		//		with the set of name/value pairs.

		get : function(oid) {
			// summary:
			//		Retrieves an object by its identity. This will trigger a GET request to the server using
			//		the url `this.target + id`.
			// id: Number
			//		The identity to use to lookup the object
			// returns: Promise
			//		The object in the store that matches the given id.
			var sql = "SELECT " + this.mysqlId + ", " + this.mysqlBlob + "FROM";
			sql += this.mysqlTable + " WHERE " + this.mysqlId + "=" + number.parse(oid);

			return when(script.get(this._getAddress(sql), {
				jsonp : "jsonp"
			}).then(lang.hitch(this, this._extractFirstObject)));
		},

		getIdentity : function(object) {
			// summary:
			//		Returns an object's identity
			// object: Object
			//		The object to get the identity from
			// returns: Number
			return object[this.idProperty];
		},

		put : function(object, options) {
			// summary:
			//		Stores an object. This will trigger a PUT request to the server
			//		if the object has an id, otherwise it will trigger a POST request.
			// object: Object
			//		The object to store.
			// options: __PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id"
			//		property if a specific id is to be used.
			// returns: dojo/_base/Deferred
			/*
			 Store.PutDirectives = declare(null, {
			 // summary:
			 //		Directives passed to put() and add() handlers for guiding the update and
			 //		creation of stored objects.
			 // id: String|Number?
			 //		Indicates the identity of the object if a new object is created
			 // before: Object?
			 //		If the collection of objects in the store has a natural ordering,
			 //		this indicates that the created or updated object should be placed before the
			 //		object specified by the value of this property. A value of null indicates that the
			 //		object should be last.
			 // parent: Object?,
			 //		If the store is hierarchical (with single parenting) this property indicates the
			 //		new parent of the created or updated object.
			 // overwrite: Boolean?
			 //		If this is provided as a boolean it indicates that the object should or should not
			 //		overwrite an existing object. A value of true indicates that a new object
			 //		should not be created, the operation should update an existing object. A
			 //		value of false indicates that an existing object should not be updated, a new
			 //		object should be created (which is the same as an add() operation). When
			 //		this property is not provided, either an update or creation is acceptable.
			 });
			 */
			options = options || {};
			var sql = "";
			var id = ("id" in options) ? options.id : this.getIdentity(object);
			var hasId = typeof id != "undefined";

			if (("overwrite" in options) && options["overwrite"]) {
				if (!hasId) {
					throw "You must provide the id of the object to update";
				}

				sql = "UPDATE " + this.mysqlTable + " SET " + this.mysqlBlob + "= '";
				sql += this._escapeString(JSON.stringify(object)) + "'";
				sql += " WHERE " + this.mysqlId + "=" + number.parse(id);

			} else {
				sql = "INSERT INTO " + this.mysqlTable + "(" + this.mysqlBlob;
				if (hasId) {
					sql += ", " + this.mysqlId;
				}
				sql += ") VALUES ('" + this._escapeString(JSON.stringify(object)) + "'";
				if (hasId) {
					sql += ", " + number.parse(id);
				}
				sql += ")";
			}

			return when(script.get(this._getAddress(sql), {
				jsonp : "jsonp"
			}).then(function(reply) {
				if (reply && "last_insert_id" in reply)
					return reply.last_insert_id;
				return reply;
			}));
		},

		add : function(object, options) {
			// summary:
			//		Adds an object. This will trigger a PUT request to the server
			//		if the object has an id, otherwise it will trigger a POST request.
			// object: Object
			//		The object to store.
			// options: __PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id"
			//		property if a specific id is to be used.
			options = options || {};
			options.overwrite = false;
			return this.put(object, options);
		},

		remove : function(id, options) {
			// summary:
			//		Deletes an object by its identity. This will trigger a DELETE request to the server.
			// id: Number
			//		The identity to use to delete the object
			// options: __HeaderOptions?
			//		HTTP headers.
			options = options || {};
			var sql = "DELETE FROM " + this.mysqlTable + " WHERE " + this.mysqlId + "=" + number.parse(id);
			return when(script.get(this._getAddress(sql), {
				jsonp : "jsonp"
			}).then(function(reply) {
				if (reply && "errno" in reply) {
					return reply;
				}
				return;
			}));
		},

		query : function(query, options) {
			// summary:
			//		Queries the store for objects. This will trigger a GET request to the server, with the
			//		query added as a query string.
			// query: Object
			//		The query to use for retrieving objects from the store.
			// options: __QueryOptions?
			//		The optional arguments to apply to the resultset.
			// returns: dojo/store/api/Store.QueryResults
			//		The results of the query, extended with iterative methods.
			var sql = "SELECT " + this.mysqlId + ", " + this.mysqlBlob;
			sql += " FROM " + this.mysqlTable;

			var results = when(script.get(this._getAddress(sql), {
				jsonp : "jsonp"
			}).then(lang.hitch(this, this._extractAllObjects)));
			return QueryResults(results);
		},

		_getAddress : function(query) {
			return this.method + "://" + this.basicAuthUser + ":" + this.basicAuthPassword + "@" + this.host + ":" + this.port + "/" + this.interface + encodeURIComponent(query);
		},

		_extractObjects : function(result, limit) {
			var data_only = new Array();
			var result_idx, row_idx;

			for ( result_idx = 0; result_idx < result.length; result_idx++) {
				for ( row_idx = 0; row_idx < result[result_idx].data.length; row_idx++) {
					if ((limit > 0) && (row_idx >= limit)) {
						return data_only;
					}
					data_only.push(JSON.parse(result[result_idx].data[row_idx][1]));
				}
			}
			return data_only;
		},
		_extractAllObjects : function(result) {
			return this._extractObjects(result, -1);
		},
		_extractFirstObject : function(result) {
			return this._extractObjects(result, 1);
		},

		_escapeString : function(sql_value) {
			sql_value = sql_value.toString();
			return sql_value.replace('/"/g', '\\"');
		}
	});

}); 