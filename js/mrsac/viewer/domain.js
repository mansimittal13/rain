define(["dojo/_base/declare", "dijit/_WidgetBase", "esri/request", "dojo/_base/lang", "dojo/_base/array", "dojo/topic", "esri/tasks/QueryTask", "esri/tasks/query", "viewer/TableFrame", ], function(declare, _WidgetBase, esriRequest, lang, array, topic, QueryTask, Query, TableFrame) {

    return declare("mrsac.viewer.domain", [_WidgetBase], {
        responseVal: null,
        url: null,
        newcodedValue: null,
        newFields: null,
        handleA: null,
        handleB: null,
        handleC: null,
        constructor: function() {

        },
        /*****************************************************************************************/
        postMixInProperties: function() {
            try {
                this.inherited(arguments);
                if (this.configData) {
                    // Layers are read from config in startup
                }
            } catch (err) {
                console.error(err);
            }
        },
        /*****************************************************************************************/
        postCreate: function() {
            try {
                this.inherited(arguments);

                handleA = topic.subscribe("urlData", lang.hitch(this, this.getDomaindata))
                handleB = topic.subscribe("queryData", lang.hitch(this, this.getqueryData))
                handleC = topic.subscribe("queryData1", lang.hitch(this, this.getqueryData1))
            } catch (err) {
                console.error(err);
            }
        },
        startup: function() {

            //this.getDomaindata();
        },
        getDomaindata: function(url) {
            //alert(url)

            this.url = url
            var requestHandle = esriRequest({
                "url": this.url,
                "content": {
                    "f": "json"
                },
                "callbackParamName": "callback"
            });
            requestHandle.then(lang.hitch(this, this.descriptionVal));

        },
        descriptionVal: function(response) {

            this.responseVal = response

            var fieldInfos = response.fields
            this.newFields = [];
            this.newFields1 = [];
            this.newFields2 = [];
            this.newcodedValue = [];
            this.arrayCodeValue = [];
            this.arrayCodeValue1 = [];
            var codedValue;

            array.forEach(fieldInfos, lang.hitch(this, function(item) {
            	//console.log(item);
                if ((item.type !== "esriFieldTypeOID") && (item.type !== "esriFieldTypeGlobalID") && (item.type != "esriFieldTypeGeometry") && (item.alias != "OBJECTID") && (item.name != "plantregid") && (item.name != "rec_date") && (item.name != "image_1")&&(item.name != "image_2")&&(item.name != "id")) {
                    this.newFields.push(item)
                    this.newFields1.push({
                        "alias": item.alias,
                        "name": item.name
                    })
                    this.newFields2.push(item.name)
                }

            }))

            array.forEach(this.newFields, lang.hitch(this, function(item) {

                if (item.domain != null) {

                    codedValue = item.domain.codedValues
                    this.arrayCodeValue.push(item.name)

                    array.forEach(codedValue, lang.hitch(this, function(val) {
                        this.newcodedValue.push(val)
                    }))
                } else {
                    this.arrayCodeValue1.push(item.name)
                }
                //topic.publish("domainValueResult", this.arrayCodeValue, this.newcodedValue)

            }))
        },
        getqueryData1: function(data, tableName) {
          //  alert("getqueryData1")
            console.log(data);
             console.log(tableName);
            var arrayNew = [];
             var attr = Object.keys(data[0].attributes);
               console.log(attr);
            var name = null;
            var attribute = null;
            var finalarray = [];

            array.forEach(data, lang.hitch(this, function(feature) {
                attribute = feature.attributes;
            //   console.log(attribute);
                update = {};
                array.forEach(this.newFields2, lang.hitch(this, function(val) {
             //     array.forEach(attribute, lang.hitch(this, function(val) {        
                    var name = val;
              // 		 console.log(name);
                    array.forEach(attr, lang.hitch(this, function(val1) {

                        if (name == val1) {
                            update[name] = attribute[name];
                            update['feat'] = feature;
                        }
                    }));

                }));
                arrayNew.push(update);

            }));

            var newarr = [];
            var abcArray = [];

            array.map(arrayNew, lang.hitch(this, function(feature3, index) {
                var unique = {};

                array.forEach(this.arrayCodeValue, lang.hitch(this, function(codeValue) {

                    array.map(this.newcodedValue, lang.hitch(this, function(f) {

                        zone = feature3[codeValue];

                        if (zone == f.code) {

                            unique[codeValue] = f.name;

                        }

                    }));

                }));
                array.forEach(this.arrayCodeValue1, lang.hitch(this, function(codeValue1) {

                    unique[codeValue1] = feature3[codeValue1];

                }));
                unique['feature'] = feature3.feat;
                unique['idx'] = index;

                finalarray.push(unique);
            }));

            var layout = [];
           
            array.forEach(this.newFields1, lang.hitch(this, function(value) {
                var unique1 = {};
                unique1['name'] = value.alias;
                unique1['field'] = value.name;
                unique1['width'] = '80px';
                layout.push(unique1);

            }));
            console.log(finalarray);
             console.log(layout);
                var grid = new TableFrame({
                TableIcon: "img/i_table.png",
                TableTitle: tableName,
                store: finalarray,
                structure: layout,
                TableType: "Spatial",
                map: this.map
            });


        },
        getqueryData: function(data) {
  			//	console.log(data);
              //  console.log(tableName);
            var arrayNew = [];
            var attr = Object.keys(data[0].attributes);
            var name = null;
            var attribute = null;
            var finalarray = [];
            array.forEach(data, lang.hitch(this, function(feature3) {
                attribute = feature3.attributes;
             console.log(attribute);
                array.forEach(this.newFields1, lang.hitch(this, function(val) {
                    name = val.name;
                    array.forEach(attr, lang.hitch(this, function(val1) {

                        if (name == val1) {
                            var newJson = {
                                "key": val.alias,
                                "value": attribute[val1],
                                "name": val.name
                            }
                            arrayNew.push(newJson)
                        }

                    }));

                }));

            }));
            var newarr = [];
            var abcArray = [];
            var unique = {};

            array.map(arrayNew, lang.hitch(this, function(feature3, index) {
                var zone = feature3.value;
                array.forEach(this.arrayCodeValue, lang.hitch(this, function(codeValue) {

                    if (codeValue == feature3.name) {

                        array.map(this.newcodedValue, lang.hitch(this, function(f) {
                            zone = feature3.value;

                            if (zone == f.code) {
                                var finaldata = {
                                    "name": feature3.key,
                                    "value": f.name
                                }
                                finalarray.push(finaldata)
                            }

                        }));
                    }

                }))
                array.forEach(this.arrayCodeValue1, lang.hitch(this, function(codeValue1) {

                    if (codeValue1 == feature3.name) {
                        var finaldata1 = {
                            "name": feature3.key,
                            "value": feature3.value
                        }

                        finalarray.push(finaldata1)

                    }

                }))
            }));
//console.log(finalarray);
            topic.publish("returnQueryResult", finalarray)
           
            //handleA.remove();
            //handleB.remove();
            //handleC.remove();

        },
    });
});
