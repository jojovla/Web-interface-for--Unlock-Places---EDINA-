var marker1; //Button 2: to xthsimopoiw gia na ektupwsw marker otan to feature type
var postcode;
var layerIndex = 1;



//===============================Countries==============================================
$(function () {
    var states = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
    $("#country").autocomplete({
        source: states

    });
});

//............................end Countries...............

//=============================== Location==========================================
$(function () {
    $("#location").autocomplete({
            minLength: 3, // resctriction in edina's implementation
            source: function (request, response) {
                $.get("http://unlock.edina.ac.uk/ws/search?name=" + request.term + "*&country=" + $("#country").val() + "&gazetteer=os,geonames,naturalearth&format=json&maxRows=100")
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
                                centroid: alldata.features[i].properties.centroid
                            }
                        };
                        response(names);
                    });
            },
            select: function (event, ui) {
                var featureGroup = L.featureGroup().addTo(map),
                    cityName = ui.item.feature.properties.name, // to xrhsimopoiw sto marker (pop-up)
                    featureTypeName = ui.item.feature.properties.featuretype, // to xrhsimopoiw sto marker (pop-up)
                    image = "polygon.png",
                    centre;

                //to if , else einai gia ta eikonidia sto marker
                if (ui.item.coordinate[0] == ui.item.coordinate[2] && ui.item.coordinate[1] == ui.item.coordinate[3]) {
                    centre = [ui.item.coordinate[0], ui.item.coordinate[1]];
                    image = "point1.png";
                } else { // draw vector line if the location is polygon
                    featureGroup.addLayer(
                        L.rectangle([
                            [ui.item.coordinate[1], ui.item.coordinate[0]],
                            [ui.item.coordinate[3], ui.item.coordinate[2]]
                        ], {
                            color: "#ff7800",
                            weight: 1
                        })
                    )
                    image = "polygon1.png"; // put polygon icon in the marker's pop-up
                    centre = ui.item.centroid.split(',');
                }; //to centroid tou polygon


                var marker = L.marker([centre[1], centre[0]]);
                featureGroup.addLayer(marker);
                marker.bindPopup("<img src='" + image + "' height='12' width='12'> <b>" + cityName + "</b>, <small><i>" + featureTypeName + "</i></b> <br> Latitude: " + centre[1] + "<br> Longitude: " + centre[0] + "</small>").openPopup();
                addResultLayer(featureGroup);
            }
        })
        // put next to the city the feature type
        //auto to kommati allazei pws tha emfavizetai to kathe stoixeio ths listas
        .data("uiAutocomplete")._renderItem = function (ul, item) { //prwto orisma einai h lista, kai to deutero orisma einai to kathe item pou thelw na valw sthn listas
            image = "polygon.png";
            if (item.coordinate[0] == item.coordinate[2] && item.coordinate[1] == item.coordinate[3]) {
                image = "point.png";
            }

            return $("<li />") //fftiaxnei ena kainourio li
                .data("item.autocomplete", item) // apothhkeuei panw sto li mia plhroforia pou xreiazetai autos
                .append("<a>" + "<img src='" + image + "' height='22' width='22'>" + item.label + "," + "<small><i> " + item.featuretype + "</small></i>" + "</a>") //gia na valw eikona tha valw if (na valw img tag aristera), thn eikona meta to <a>
                .appendTo(ul);
        };
});

//........................... end Location..........................

//===============================Postcode======================================================

$(function () {
    $("#postcode").autocomplete({
        source: function (request, response) {
            $.get("http://unlock.edina.ac.uk/ws/search?name=" + request.term + "&format=json")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var codes = [];
                    var alldata = JSON.parse(data);
                    for (var i = 0; i < alldata.features.length; i++) {
                        codes[i] = {
                            label: alldata.features[i].properties.name,
                            feature: alldata.features[i]
                        }
                    };
                    response(codes);
                });
        },
        select: function (event, ui) {
            postcode = ui.item.label; //to xrhsimopoiw sto pop-up
            myMapPost(ui.item.feature.bbox[1], ui.item.feature.bbox[0])
        }
    });
});
//........................... end Postcode .................

//====================================Coordinates==================================================
$(function () {
        $('#coordinates').keypress(function (e) {
            if (e.which == 13) {
                var coordinates = this.value.split(',');
                myMapCoord(coordinates[0], coordinates[1]);
            }
        })
    })
    //............end Coordinates....................


//========================================= Location2 ==================================================
$(function () {
    $("#location2").autocomplete({
        minLength: 3, // resctriction in edina's implementation
        source: function (request, response) {
            $.get("http://unlock.edina.ac.uk/ws/search?name=" + request.term + "*&gazetteer=os,geonames,naturalearth&format=json&maxRows=999")
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
            $(".loader1").show();

            $.get("http://unlock.edina.ac.uk/ws/search?featureType=" + $("#featuretype").val() + "&spatialMask=" + ui.item.id + "&format=json&maxRows=999")
                .success(function (data) {
                    // create variable names to save all the requested resutls
                    var alldata1 = JSON.parse(data);

                    findAndDrawFeaturesOnMap(alldata1.features);


                })
                .fail(function () {
                    $(".loader1").hide();
                });
        }
    })

    .data("uiAutocomplete")._renderItem = function (ul, item) { //prwto orisma einai h lista, kai to deutero orisma einai to kathe item pou thelw na valw sthn listas

        return $("<li />") //fftiaxnei ena kainourio li
            .data("item.autocomplete", item) // apothhkeuei panw sto li mia plhroforia pou xreiazetai autos
            .append("<a>" + "<img src='polygon.png' height='22' width='22'>" + item.label + "," + "<small><i> " + item.featuretype + "</small></i>" + "</a>") //gia na valw eikona tha valw if (na valw img tag aristera), thn eikona meta to <a>
            .appendTo(ul);
    };

});
//.............................. end Location2 ...................

//=================================================Feature type===============================================================
$(function () {
    $("#featuretype").autocomplete({
            minLength: 3, // resctriction in edina's implementation
            source: function (request, response) {

                http: //unlock.edina.ac.uk/ws/search?featureType="+ request.term +"*&gazetteer=os
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

// =====================================.Function tou xarth===============================================

// ..............otan anoige to parathyro exei ton xarth..............
$(function () {
    // create a map in the "map" div, set the view to a given place and zoom
    map = L.map('map', {
        zoomControl: false
    }).setView([51.505, -0.09], 5);
    // change zoom icon position
    map.addControl(L.control.zoom({
        position: "topright"
    }));
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // add a feature group as a layer on the map to capture all drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // add every created drawn item on the existing feature group layer
    map.on('draw:created', function (e) {
        drawnItems.addLayer(e.layer);
    });

    drawEditControl = new L.Control.Draw({
        draw: false,
        edit: {
            featureGroup: drawnItems
        }
    })

})



//====================================== Draw rectangle button ===========================================
$(function () {
    $('#draw_rectangle').click(function (e) {
        var drawnRectangle = new L.Draw.Rectangle(map, {
            repeatMode: false
        });
        drawnRectangle.type = "rectangle1";
        drawnRectangle.enable();
        // map.addControl(drawEditControl);
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

                    findAndDrawFeaturesOnMap(alldata1.features, e.layer);
                })
                .fail(function () {
                    $(".loader1").hide();
                });
        }
    })

})

//------------------------end Draw rectangle button ------------------------------------------------------

//=========================== Handdle result layers ======================================================

function addResultLayer(featureGroup) {
        // add a new layer in the results
       $("<tr class='result_layer'><td><input type='checkbox' value=1 checked='true'/> Layer "+layerIndex++ +" <span class='delete glyphicon glyphicon-trash'></span></td></tr>").
            appendTo($("#search_results")).
            data("layer", featureGroup)
        $(".metadataBox").show();
        // adjust zoom level to query results
        map.fitBounds(featureGroup.getBounds());
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




//=========================================================Marker================================================

//marker gia
function myMapCoord(lat, lng) {
    map.setView([lat, lng], 6);
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("Selected coordinates: <br><small><i>Latitude: " + lat + "<br> Longitude: " + lng + "</i></small>").openPopup();
}

//market gia to postcode
function myMapPost(lat, lng) {
        map.setView([lat, lng], 15);
        var marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup("Selected Postcode: <small><i>" + postcode + "</i></small>").openPopup();

    }
    //=========================================== Draw a rectangular and return the features within this rectangular=======================================================

function findAndDrawFeaturesOnMap(features, drawnLayer) {
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
                                marker1.bindPopup("<b>" + features[k].properties.name + "</b><br><small><i>Feature type: " + features[k].properties.featuretype + "<br> Lat: " + features[k].bbox[0] + ", Long: " + features[k].bbox[1] + " <br>Gazetteer: " + features[k].properties.custodian + "</i></small>")
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
                                    color: 'red'
                                }).addTo(map);
                                //var centre=features[k].properties.centroid.split(',');
                                drawItem.bindPopup("<b>" + features[k].properties.name + "</b><br><small><i>Feature type: " + features[k].properties.featuretype + "<br> Area: " + features[k].properties.area + "<br> Perimeter: " + features[k].properties.perimeter + " <br>Gazetteer: " + features[k].properties.custodian + " <br> Centroid:" + features[k].properties.centroid.split(',') + "</i></small>");
                                featureGroup.addLayer(drawItem);
                            }

                        }
                    }
                })
            );
        }
    }

    $.when.apply(undefined, ajax_calls).
    done(function () {
        if (featureGroup.getLayers().length) {
            if (drawnLayer) featureGroup.addLayer(drawnLayer);
            addResultLayer(featureGroup)
        } else {
            if (drawnLayer) map.removeLayer(drawnLayer)
            // add some error that no resutls were found
        }
    }).
    then(function () {
        // hide loader
        $(".loader1").hide();
    })
}
