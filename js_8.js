

//=========================function for the alert box. Handle delete (hide the alert box rather than delete it)
$(function () {
    $('.alert .close').click(function(){
        $(this).parent().hide()
    })
});

//===============================Countries==============================================
$(function () {
    var states = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
    $("#country").autocomplete({
        source: states,
        select: function () {
          //$('#location').focus();
        },
    }).on('autocompletechange', function () {
        //alert($(this).val());
        $('#ordnance-data').toggle(($(this).val() == "United Kingdom"));
    });
});

//............................end Countries...............

//=============================== Location==========================================
$(function () {
    $("#location").autocomplete({
            minLength: 3, // resctriction in edina's implementation
            source: function (request, response) {
                var sources = "os,geonames,naturalearth";
                if ($('#ordnance:visible').prop('checked') ) {
                  sources = "os";
                }
                $('.loader0').show();
                $.get("http://unlock.edina.ac.uk/ws/search?name=" + request.term + "*&country=" + $("#country").val() + "&gazetteer=" + sources + "&format=json&maxRows=100")
                    .success(function (data) {
                        // create variable names to save all the requested resutls
                        var names = [];
                        var alldata = JSON.parse(data);
                        for (var i = 0; i < alldata.features.length; i++) {
                            names[i] = {
                                label: alldata.features[i].properties.name,
                                feature: alldata.features[i],
                                featuretype: alldata.features[i].properties.featuretype, // na valw ena akoma gia na to xrhseimopihsw gia thn image apo katw
                                coordinate: alldata.features[i].bbox,
                                centroid: alldata.features[i].properties.centroid,
                                geoJSONUrl: "http://unlock.edina.ac.uk/ws/search?format=json&name=" + alldata.features[i].id
                            }
                        };
                        response(names);
                    })
                    .done(function () {
                      $('.loader0').hide();
                    });
            },
            select: function (event, ui) {
                var featureGroup = L.featureGroup().addTo(map),
                    cityName = ui.item.feature.properties.name, // to xrhsimopoiw sto marker (pop-up)
                    featureTypeName = ui.item.feature.properties.featuretype, // to xrhsimopoiw sto marker (pop-up)
                    gaz = ui.item.feature.properties.custodian,
                    bbox = ui.item.feature.bbox,
                    area = ui.item.feature.properties.area,
                    perimeter = ui.item.feature.properties.perimeter,
                    image = "polygon1.png",
                    centre;

                //to if , else einai gia ta eikonidia sto marker
                if (ui.item.coordinate[0] == ui.item.coordinate[2] && ui.item.coordinate[1] == ui.item.coordinate[3]) {
                    centre = [ui.item.coordinate[0], ui.item.coordinate[1]];
                    image = "point2.png";

                    var marker = L.marker([centre[1], centre[0]]);
                    featureGroup.addLayer(marker);
                    marker.bindPopup("<img src='" + image + "' height='24' width='24'> <b>" + cityName + "</b> <br><small><i>Feature type: " + featureTypeName + "</b> <br> Latitude: " + L.Util.formatNum(centre[1],4) + "<br> Longitude: " + L.Util.formatNum(centre[0],4) + "<br> Gazetteer: "+gaz +"</i></small>").openPopup();
                    addResultLayer(featureGroup, ui.item.geoJSONUrl);


                } else { // draw vector line if the location is polygon
                    featureGroup.addLayer(
                        L.rectangle([
                            [ui.item.coordinate[1], ui.item.coordinate[0]],
                            [ui.item.coordinate[3], ui.item.coordinate[2]]
                        ], {
                            color: "red",
                            weight: 1,
                            fillOpacity: 0.15
                        })
                    )
                    image = "polygon1.png"; // put polygon icon in the marker's pop-up
                    centre = ui.item.centroid.split(',');

                    var marker = L.marker([centre[1], centre[0]]);
                    featureGroup.addLayer(marker);
                    marker.bindPopup("<img src='" + image + " ' height='14' width='14'> <b>" + cityName + "</b><br> <small><i>Feature type: " + featureTypeName + "</b> <br> Latitude: " + L.Util.formatNum(centre[1], 4) + "<br> Longitude: " + L.Util.formatNum(centre[0],4) + "<br>Area: "+ L.Util.formatNum(area,4) +" km<sup>2</sup><br> Perimeter: "+ L.Util.formatNum(perimeter,4)  + " km <br> Gazetteer: "+gaz +" <br> Bounding box [NW, SE]: ["+ L.Util.formatNum(bbox[1],4)+ "," + L.Util.formatNum(bbox[0],4)+", <br>" + L.Util.formatNum(bbox[3],4)+ "," + L.Util.formatNum(bbox[2],4)+"]</i></small>").openPopup();
                    addResultLayer(featureGroup, ui.item.geoJSONUrl);


                }; //to centroid tou polygon



            }
        })
        // put next to the city the feature type
        //auto to kommati allazei pws tha emfavizetai to kathe stoixeio ths listas
        .data("uiAutocomplete")._renderItem = function (ul, item) { //prwto orisma einai h lista, kai to deutero orisma einai to kathe item pou thelw na valw sthn lista
            image = "polygon1.png";
            if (item.coordinate[0] == item.coordinate[2] && item.coordinate[1] == item.coordinate[3]) {
                image = "point2.png";
            }

            return $("<li />") //fftiaxnei ena kainourio li
                .data("item.autocomplete", item) // apothhkeuei panw sto li mia plhroforia pou xreiazetai autos
                .append("<a>" + "<img src='" + image + "' height='18' width='18'> <b>" + item.label + "</b>," + "<i> " + item.featuretype + "</i>" + "</a>") //gia na valw eikona tha valw if (na valw img tag aristera), thn eikona meta to <a>
                .appendTo(ul);
        };




  $("#ordnance").change(function () {
    if ($('#location').val() != "") {
      $('#location').autocomplete("search", $('#location').val()).focus();
    }
  })

});


//........................... end Location..........................

//===============================Postcode======================================================
$(function () {
    $("#postcode").keypress(function (e) {
            if (e.which == 13) {
                var postcode = this.value
       
                $.get("http://unlock.edina.ac.uk/ws/search?name=" +postcode + "&format=json")
                    .success(function (data) {
                        // create variable names to save all the requested resutls
                       
                        var alldata = JSON.parse(data);
                        for (var i = 0; i < alldata.features.length; i++) {

                            var marker = L.marker([alldata.features[i].bbox[1],alldata.features[i].bbox[0]]).addTo(map);
                            map.setView(marker.getLatLng(), 13);
                            marker.bindPopup("Postcode: <small><i>" + postcode.toUpperCase() + "</i></small>").openPopup();
                            addResultLayer(marker, this.url);
                        };
                    
                }); 
           }
      });
});
//........................... end Postcode ..................

//====================================Coordinates==================================================
$(function () {
        $('#coordinates').keypress(function (e) {
            if (e.which == 13) {
                var coordinates = this.value.split(',');
                var marker = L.marker([coordinates[0], coordinates[1]]).addTo(map);
                map.setView(marker.getLatLng(), 6);
                marker.bindPopup("Coordinates: <br><small><i>Latitude: " + L.Util.formatNum(coordinates[0],4) + "<br> Longitude: " + L.Util.formatNum(coordinates[1],4) + "</i></small>").openPopup();
                addResultLayer(marker, 'data:application/json;charset=UTF-8,' + encodeURIComponent(marker.toGeoJSON().toSource()));
            }
        })
    })
    //............end Coordinates....................


//========================================= Location2 ==================================================
$(function () {
    $("#location2").autocomplete({
        minLength: 3, // resctriction in edina's implementation
        source: function (request, response) {
            $.get("http://unlock.edina.ac.uk/ws/search?name=" + request.term + "*&format=json&maxRows=999")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var names = [];
                    var alldata = JSON.parse(data);


                    for (var i = 0; i < alldata.features.length; i++) {
                        if (alldata.features[i].bbox[0] != alldata.features[i].bbox[2] || alldata.features[i].bbox[1] != alldata.features[i].bbox[3]) {
                            names.push({
                                label: alldata.features[i].properties.name,
                                id: alldata.features[i].id,
                                featuretype: alldata.features[i].properties.featuretype,
                                scale: alldata.features[i].properties.scale

                            })
                        }
                    };
                    // console.log(names);
                    response(names); // stelnei to array sto autocomplete gia na ta emfanisei
                });
        },
        select: function (event, ui) {
            $(this).data("selected_id", ui.item.id);
            $(".loader1").show();

            $.get("http://unlock.edina.ac.uk/ws/search?featureType=" + $("#featuretype").val() + "&spatialMask=" + ui.item.id + "&format=json&maxRows=999")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var alldata1 = JSON.parse(data);

                    findAndDrawFeaturesOnMap(alldata1.features, this.url);


                })
                .fail(function () {
                    $(".loader1").hide();
                });
        }
    })

    .data("uiAutocomplete")._renderItem = function (ul, item) { //prwto orisma einai h lista, kai to deutero orisma einai to kathe item pou thelw na valw sthn listas

        return $("<li />") //fftiaxnei ena kainourio li
            .data("item.autocomplete", item) // apothhkeuei panw sto li mia plhroforia pou xreiazetai autos
            .append("<a>" + "<img src='polygon1.png' height='18' width='18'>  " + item.label + "," + "<small><i> " + item.featuretype + "</small></i>" + "</a>") //gia na valw eikona tha valw if (na valw img tag aristera), thn eikona meta to <a>
            .appendTo(ul);
    };

});
//.............................. end Location2 ...................

//=================================================Feature type===============================================================
$(function () {
    $("#featuretype, #featuretype3").autocomplete({
            minLength: 3, // resctriction in edina's implementation
            source: function (request, response) {

                //http: //unlock.edina.ac.uk/ws/search?featureType="+ request.term +"*&gazetteer=os
                    $.get("http://unlock.edina.ac.uk/ws/search?featureType=" + request.term + "&format=json&maxRows=1")
                    .success(function (data) {
                        // create variable names to save all the requested resutls
                        var names = [];
                        var alldata = JSON.parse(data);
                        for (var i = 0; i < alldata.features.length; i++) {
                            names[i] = {
                                label: alldata.features[i].properties.featuretype,
                                feature: alldata.features[i],
                                custodian: alldata.features[i].properties.custodian

                            }
                        };
                        response(names);
                    });
            }
        })
        // put next to the city the feature type
        .data("uiAutocomplete")._renderItem = function (ul, item) {
            return $("<li />")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "," + "<small> " + item.custodian + "</small>" + "</a>")
                .appendTo(ul);
        };

});
//......................... end Feature type..................

// =====================================.Map Functions ===============================================

// ..............otan anoige to parathyro exei ton xarth..............
$(function () {


//................base maps
     var osm =  L.tileLayer(
     'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
     cycle  = L.tileLayer(
     'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png'),
     landscape  = L.tileLayer(
     'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'),
     
      esri  = L.tileLayer(
     'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/ti\
      le/{z}/{y}/{x}');



    var baseMaps = {
    "OpenStreetMap" : osm,
    "Landscape": landscape,
    "Esri World Imagery": esri,
    "Cycle Map": cycle 
    };


// .............create a map in the "map" div, set the view to a given place and zoom
    map = L.map('map', {
        zoomControl: false,
        layers: osm
    }).setView([55.805, -1.59], 5);
// ...............change zoom icon position
    map.addControl(L.control.zoom({
        position: "bottomright"
    }));
//.................scale to map
    L.control.scale().addTo(map);
//.............. add  OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.addControl(L.control.attribution({
        position: "topright"
    }));

//.................add base maps
    L.control.layers(baseMaps).setPosition("bottomright").addTo(map) ;
    

//.......... add a feature group as a layer on the map to capture all drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

//............. add every created drawn item on the existing feature group layer
    map.on('draw:created', function (e) {
        drawnItems.addLayer(e.layer);
    });
// current coordinates when the cursor is moving 
    map.on('mousemove', function (e) {
        $('#currentCoordinates').text(L.Util.formatNum(e.latlng.lat, 4) + ', ' + L.Util.formatNum(e.latlng.lng, 4));
    })


    drawEditControl = new L.Control.Draw({
        draw: false,
        edit: {
            featureGroup: drawnItems
        }
    })

})
// ....................................... End map function......................

//====================================== Draw rectangle button 2 ===========================================
$(function () {
     drawnRectangle1 = drawnRectangle = new L.Draw.Rectangle(map, {
                repeatMode: false,
                shapeOptions: {color: 'orange',
                                weight: 0.5,
                                fillOpacity: 0.15}
    });
    drawnRectangle1.type = "rectangle1";

    $('#draw_rectangle').click(function (e) {
        if (!drawnRectangle1.enabled()) {
            drawnRectangle1.enable();
        } else {
            drawnRectangle1.disable();
        }
    })

    map.on("draw:created", function (e) {
        if (e.layerType == "rectangle1") {
            var bounds = e.layer.getBounds();
            $(".loader1").show();

            $.get("http://unlock.edina.ac.uk/ws/search?featureType=" + $("#featuretype").val() +
                    "&minx=" + bounds.getWest() + "&miny=" + bounds.getSouth() + "&maxx=" + bounds.getEast() + "&maxy=" + bounds.getNorth() + "&format=json&maxRows=999")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var alldata1 = JSON.parse(data);

                    findAndDrawFeaturesOnMap(alldata1.features, this.url, e.layer);
                })
                .fail(function () {
                    map.removeLayer(e.layer);
                    $(".loader1").hide();
                })
                .complete(function () {
                    $("#draw_rectangle").button('toggle');
                });

        }
    })

})

//------------------------end Draw rectangle button ------------------------------------------------------

//=========================== Handle result layers ======================================================
var layerIndex = 1;
function addResultLayer(featureGroup, geoJSONUrl) {
        // add a new layer in the results
       $("<tr class='result_layer'><td><input type='checkbox' value=1 checked='true'/> &nbsp; Layer "+layerIndex++ +" &emsp;&emsp;&emsp;&emsp;&emsp;<span class='delete glyphicon glyphicon-trash' style='cursor: pointer'></span>\
        <a href='"+ geoJSONUrl+"' target='_blank'>&nbsp;<small>GeoJSON</small></a></td></tr>").
            appendTo($("#search_results")).
            data("layer", featureGroup)
        $(".metadataBox").show();
        // adjust zoom level to query results
        if (featureGroup.getBounds) {
            map.fitBounds(featureGroup.getBounds()); //zoomarei sta results tou layer
        }
}

$(function () {
    $('.metadataBox').
        on('change', 'input', function () {
            var layer = $(this).parents('tr').data("layer");
            if (!$(this).is(':checked')) {
                map.removeLayer(layer);
            } else {
                map.addLayer(layer);
            }
        }).
        on('click', '.delete', function () {
            map.removeLayer($(this).parents('tr').data("layer"));
            $(this).parents('tr').remove();

        });

    $('#showAllLayers').click(function () {
        var layers = $('.metadataBox tr').map(function () {
            $(this).find('input').prop('checked',true).trigger('change');
            return $(this).data('layer')
        });
        map.fitBounds(L.featureGroup(layers).getBounds());
    })
})


//======================================= Draw a rectangular and return the features within this rectangular=======================================================
var marker1;
function findAndDrawFeaturesOnMap(features, geoJSONUrl, drawnLayer) {
    var feature_ids = [],
        ajax_calls = [];
        featureGroup = L.featureGroup().addTo(map);

    for (var i = 0; i < features.length; i++) {
        feature_ids.push(features[i].id);
        if ((i % 10 == 0 || i == features.length - 1) && i != 0) {

            ajax_calls.push(
                $.get("http://unlock.edina.ac.uk/ws/footprintLookup?identifier=" + feature_ids.slice(i - 10, i).join(',') + "&format=json")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    //var feature_coord = [];
                    var alldata = JSON.parse(data);
                    var drawingMethod

                    for (var i = 0; i < alldata.footprints.length; i++) {
                        //feature_coord[i] =  alldata.footprints[i].coordinates;
                        for (var j = 0; j < alldata.footprints[i].geometry.coordinates.length; j++) {
                            for (var k = 0; k < features.length; k++) {
                                if (features[k].id == alldata.footprints[i].properties.id) break;
                            }
                            // if the feature type is a point, print a marker
                            if (alldata.footprints[i].geometry.type == "Point") {

                                //gia na valw sto pop-up to name ktl twn objects


                                marker1 = L.marker([alldata.footprints[i].geometry.coordinates[1], alldata.footprints[i].geometry.coordinates[0]]).addTo(map);
                                marker1.bindPopup("<b>" + features[k].properties.name + "</b><br><small><i>Feature type: " + features[k].properties.featuretype + " <br> Lat: " + L.Util.formatNum(features[k].bbox[0],4) + ", Long: " + L.Util.formatNum(features[k].bbox[1],4) + " <br>Gazetteer: " + features[k].properties.custodian + "</i></small>")
                                featureGroup.addLayer(marker1);
                            }

                            //else if the feature type is polyline, polygon etc, print the vector in the map
                            else {

                                var drawingMethod = alldata.footprints[i].geometry.type;

                                var coords = alldata.footprints[i].geometry.coordinates[j].map(function (c) {
                                    if (drawingMethod.indexOf("Multi") == 0) {
                                        return c.map(function (co) {
                                            return co.reverse()
                                        });
                                    } else {
                                        return c.reverse();
                                    }

                                })

                                var drawItem = L[drawingMethod.charAt(0).toLowerCase() + drawingMethod.slice(1)](coords, {
                                    color:"blue",
                                    weight: 1,
                                    fillOpacity: 0.5
                                }).addTo(map);
                                //var centre=features[k].properties.centroid.split(',');
                                drawItem.bindPopup("<b>" + features[k].properties.name + "</b><br><small><i>Feature type: " + features[k].properties.featuretype + "<br> Area: " + L.Util.formatNum(features[k].properties.area,4) + " km<sup>2</sup> <br> Perimeter: " + L.Util.formatNum(features[k].properties.perimeter,4) + " km <br>Gazetteer: " + features[k].properties.custodian + " <br> Centroid (Lat, Long): " + features[k].properties.centroid.split(',') + "<br> Scale: " + features[k].properties.scale + "</i></small>");
                                featureGroup.addLayer(drawItem);
                            }

                        }
                    }
                })
            );
        }
    }

    $.when.apply(null, ajax_calls).
    done(function () {
        if (featureGroup.getLayers().length) {
            if (drawnLayer) featureGroup.addLayer(drawnLayer);
            addResultLayer(featureGroup, geoJSONUrl) //auto vazei ta layers sto search results deksia
        } else {
            if (drawnLayer) map.removeLayer(drawnLayer);
            $(".alert").alert().show();

            // add some error that no resutls were found
        }
    }).then(function () {
        // hide loader
        $(".loader1, .loader2").hide();
    })
}



//========================================= Location3 ==================================================
$(function () {
    $("#location3").autocomplete({
        minLength: 3, // resctriction in edina's implementation
        source: function (request, response) {
            $.get("http://unlock.edina.ac.uk/ws/search?name=" + request.term + "*&format=json&maxRows=999")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var names = [];
                    var alldata = JSON.parse(data);


                    for (var i = 0; i < alldata.features.length; i++) {
                        if (alldata.features[i].bbox[0] != alldata.features[i].bbox[2] || alldata.features[i].bbox[1] != alldata.features[i].bbox[3]) {
                            names.push({
                                label: alldata.features[i].properties.name,
                                id: alldata.features[i].id,
                                featuretype: alldata.features[i].properties.featuretype

                            })
                        }
                    };
                    // console.log(names);
                    response(names); // stelnei to array sto autocomplete gia na ta emfanisei
                });
        },
        select: function (event, ui) {
            $(this).data("selected_id", ui.item.id);
            $(".loader2").show();
            var operator= $('#operation_intersect').prop('checked') ? 'intersect' : 'within';

                $.get("http://unlock.edina.ac.uk/ws/search?featureType=" + $("#featuretype3").val() + "&buffer="+ document.getElementById('amount').value+ "&spatialMask=" + ui.item.id + "&operator=" +operator+"&format=json&maxRows=999")
                    .success(function (data) {
                        // create variable names to save all the requested resutls
                        var alldata1 = JSON.parse(data);

                        findAndDrawFeaturesOnMap(alldata1.features, this.url);
                    })
                    .fail(function () {
                        $(".loader2").hide();
                    });


           }
        })

    .data("uiAutocomplete")._renderItem = function (ul, item) { //prwto orisma einai h lista, kai to deutero orisma einai to kathe item pou thelw na valw sthn listas

        return $("<li />") //fftiaxnei ena kainourio li
            .data("item.autocomplete", item) // apothhkeuei panw sto li mia plhroforia pou xreiazetai autos
            .append("<a>" + "<img src='polygon1.png' height='18' width='18'>" + item.label + "," + "<small><i> " + item.featuretype + "</small></i>" + "</a>") //gia na valw eikona tha valw if (na valw img tag aristera), thn eikona meta to <a>
            .appendTo(ul);
    };

});
//.............................. end Location3 .......................................

//====================================== Draw rectangle button 3===========================================
$(function () {
    var drawnRectangle3 = drawnRectangle = new L.Draw.Rectangle(map, {
                repeatMode: false,
                shapeOptions: { color: 'green',
                                weight: 0.5,
                                fillOpacity: 0.15}
    });
    drawnRectangle3.type = "rectangle2";

    $('#draw_rectangle3').click(function (e) {
        if (!drawnRectangle3.enabled()) {
            drawnRectangle3.enable();
        } else {
            drawnRectangle3.disable();
        }
    })

    map.on("draw:created", function (e) {
        if (e.layerType == "rectangle2") {
            var bounds = e.layer.getBounds();
            $(".loader2").show();

            $.get("http://unlock.edina.ac.uk/ws/search?featureType=" + $("#featuretype3").val() + "&buffer="+ document.getElementById('amount').value+
                    "&minx=" + bounds.getWest() + "&miny=" + bounds.getSouth() + "&maxx=" + bounds.getEast() + "&maxy=" + bounds.getNorth() + "&format=json&maxRows=999")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var alldata1 = JSON.parse(data);

                    findAndDrawFeaturesOnMap(alldata1.features, this.url, e.layer);
                })
                .fail(function () {
                    map.removeLayer(e.layer);
                    $(".loader2").hide();
                })
                .complete(function () {
                    $("#draw_rectangle3").button('toggle');
                });
        }

    })

})

//------------------------end Draw rectangle button 3 ------------------------------------------------------