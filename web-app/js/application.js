if (typeof jQuery !== 'undefined') {
	(function($) {
		$('#spinner').ajaxStart(function() {
			$(this).fadeIn();
		}).ajaxStop(function() {
			$(this).fadeOut();
		});
	})(jQuery);
}

/* some temp static data for testing bookmarks */
var bookmarks = [
    {key:'home', lat:-35.2323, lng:149.021806, source: 'Google maps'},
    {key:'work', lat:-35.276955, lng:149.112421, source: 'Google maps'},
    {key:'desert', lat:-26.549223, lng:129.638672, source: 'GPS device', datum: 'WGS84'}
];

$(function() {

    //  for taxon concepts
    $(".name_autocomplete").autocomplete('http://bie.ala.org.au/search/auto.json', {
        //width: 350,
        extraParams: {limit:100},
        dataType: 'jsonp',
        parse: function(data) {
            var rows = new Array();
            data = data.autoCompleteList;
            for(var i=0; i<data.length; i++){
                rows[i] = {
                    data:data[i],
                    value: data[i].guid,
                    //result: data[i].matchedNames[0]
                    result: data[i].name
                };
            }
            return rows;
        },
        matchSubset: false,
        highlight: false,
        delay: 600,
        formatItem: function(row, i, n) {
            var result = (row.scientificNameMatches) ? row.scientificNameMatches[0] : row.commonNameMatches ;
            if (row.name != result && row.rankString) {
                result = result + "<div class='autoLine2'>" + row.rankString + ": " + row.name + "</div>";
            } else if (row.rankString) {
                result = result + "<div class='autoLine2'>" + row.rankString + "</div>";
            }
            //result = "<input type='button' value='Add' style='float:right'/>" + result
            return result;
        },
        cacheLength: 10,
        minChars: 3,
        scroll: false,
        max: 10,
        selectFirst: false
    }).result(function(event, item) {
        // user has selected an autocomplete item
        taxonStack.push(item.guid, item.name);
    });

    $('#undoTaxon').click(function () {
        taxonStack.pop();
    });

    // wire location lookups
    $('#reverseLookup').click(function () {
        var locText = $('#location').val();
        if (locText === "") { return; }
        new google.maps.Geocoder().geocode({
            address: locText,
            bounds: mainMap.map.getBounds()},
            function (results, status) {
                var latLng;
                if (status == google.maps.GeocoderStatus.OK) {
                    latLng = results[0].geometry.location;
                    $('#latitude').val(latLng.lat());
                    $('#longitude').val(latLng.lng()).change();
                    mainMap.show();
                }
            });
    });
    $('#lookup').click(function () {
        var lat = $('#latitude').val(),
            lng = $('#longitude').val();
        if (lat === "" || lng === "") { return; }
        new google.maps.Geocoder().geocode({
            location: new google.maps.LatLng(lat, lng)},
            function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $('#location').val(results[1].formatted_address);
                }
            });
    });

    // wire coordinate source
    $('#coordinateSource').change(function () {
        // hide all
        $('#precisionFields span').css('display','none');
        // show one
        switch ($(this).val()) {
            case 'GPS device': $('#geodeticDatumField').css('display','inline'); break;
            case 'physical map': $('#physicalMapScaleField').css('display','inline'); break;
            case 'other': $('#otherSourceField').css('display','inline'); break;
        }
    });

    // wire help dialogs
    $("#datumDialog" ).dialog({
        autoOpen: false,
        show: "blind",
        hide: "explode"
    });

    $( "#datumOpener" ).click(function() {
        $( "#datumDialog" ).dialog( "open" );
        return false;
    });

    // create small map
    smallMap.init('small-map');

    // create main map
    mainMap.init('main-map');

    // catch changes in main map pin
    mainMap.addListener({handler: function(mouseEvent, event) {
        screenLocation.setLat(mouseEvent.latLng.lat(),true);
        screenLocation.setLng(mouseEvent.latLng.lng(),true);
        screenLocation.setSource("Google maps");
    }});

    // map buttons
    $('#centerOnPin').click(function () {
        mainMap.setCenterToMarker();
    });
    $('#pinToCenter').click(function () {
        mainMap.setMarker(mainMap.map.getCenter(), undefined, {zoom: 'same'});
    });
    $('#showOz').click(function () {
        mainMap.resetMap();
    });
    $('#showWorld').click(function () {
        mainMap.resetMapToWorld();
    });
    $('#discardPin').click(function () {
        mainMap.removeMarker();
    });

    drag_area = document.getElementById('markers');
    drag_area.onmousedown = initDrag;

    // if the locality is edited it is no longer a lookup
    $('#location').change(function () {
        $('#usingReverseGeocodedLocality').val(false);
    });

    // location bookmarks
    $('#locationBookmarks').change(function () {
        var locKey = $(this).val(),
            loc;
        if (locKey !== '') {
            // this data will be supplied by a service but use static data for now
            $.each(bookmarks, function(i, obj) {
                if (obj.key === locKey) {
                    loc = obj;
                }
            });
            if (loc !== undefined) {
                $('#latitude').val(loc.lat);
                $('#longitude').val(loc.lng);
                $('#latitude').change();
                $('#longitude').change();
                if (loc.source !== undefined) {
                    $('#coordinateSource').val(loc.source);
                    $('#coordinateSource').change();
                }
                if (loc.datum !== undefined) {
                    $('#datum').val(loc.datum);
                }
            }
        }
    });
});

var taxonStack = {
    // holds a stack of selected taxa
    stack: [],
    push: function (guid, name) {
        // add current taxon to stack
        this.stack.push({guid: $('#lsid').val(), name: $('.scientificName').html()});
        // set new taxon
        this.set(guid, name);
        // activate undo
        $('#undoTaxon').removeAttr('disabled');
        $('#undoTaxon').removeClass('ui-state-disabled');
    },
    pop: function () {
        var top = this.stack.pop();
        if (top) {
            this.set(top.guid, top.name);
        }
        if (this.stack.length === 0) {
            // disable undo
            $('#undoTaxon').attr('disabled','disabled');
            $('#undoTaxon').addClass('ui-state-disabled');
        }
    },
    // set the current taxon
    set: function (guid, name) {
        // set name up front
        $(".scientificName").html(name);
        // and guid
        $('#lsid').val(guid);
        // get some metadata for the preferred common name and the pic
        $.ajax({
            url: bieUrl + "species/shortProfile/" + guid + ".json",
            dataType: 'jsonp',
            success: function(data) {
                var commonName = data.commonName || "",
                    thumbnail = data.thumbnail || (serverUrl + "/images/noImage85.jpg");
                $(".commonName").html(commonName);
                $('#taxonImage').attr('src', thumbnail);
                $('#taxonImage').parent().attr('href', bieUrl + "species/" + guid);
            }
        });
    }
};

var smallMap = {
    // the google map object
    map: null,
    // the default bounds for the map
    initialBounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(-41.5, 114),
            new google.maps.LatLng(-13.5, 154)),
    centre: new google.maps.LatLng(-28, 134),
    // lines for lat and lng
    latLine: new google.maps.Polyline({strokeColor: "#000066",strokeWeight: 1,strokeOpacity: 1}),
    lngLine: new google.maps.Polyline({strokeColor: "#000066",strokeWeight: 1,strokeOpacity: 1}),
    // create the map
    init: function (containerId) {
        var options = {
            scrollwheel: false,
            streetViewControl: false,
            mapTypeControl: false,
            scaleControl: false,
            panControl: false,
            zoomControl: false,
            disableDoubleClickZoom: true,
            draggable: false,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            zoom: 2,
            center: this.centre
            },
            that = this;

        this.map = new google.maps.Map(document.getElementById(containerId), options);
        this.latLine.setMap(this.map);
        this.lngLine.setMap(this.map);

        google.maps.event.addListener(this.map, 'click', function () {
            var current = new Location().loadFromScreen();
            mainMap.toggle();
            if (current.isValid()) {
                mainMap.setMarker(current.decimalLatitude, current.decimalLongitude);
            }
        });

        mainMap.addListener({handler: function(mouseEvent, event) {
            //console.log(event);
            //if (event === 'dragend') {
                that.setLatLng(mouseEvent.latLng);
            //}
        }});

        screenLocation.addListener({handler: function(event, latLng) { // lat/lng input fields
            that.setLatLng(latLng);
        }});
    },
    setLatLng: function (latLng) {
        this.setLat(latLng.lat());
        this.setLng(latLng.lng());
    },
    setLatAndLng: function (lat, lng) {
        this.setLat(lat);
        this.setLng(lng);
    },
    setLat: function (lat) {
        //console.log( lat );
        this.latLine.setPath([
            new google.maps.LatLng(lat, 100),
            new google.maps.LatLng(lat, 170)
        ]);
    },
    setLng: function (lng) {
        //console.log( lng );
        this.lngLine.setPath([
            new google.maps.LatLng(0, lng),
            new google.maps.LatLng(-60, lng)
        ]);
    }
};

var mainMap = {
    // the google map object
    map: null,
    firstShow: true,
    // the default bounds for the map
    initialBounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(-41.5, 114),
            new google.maps.LatLng(-13.5, 154)),
    centre: new google.maps.LatLng(-28, 134),
    marker: null,
    activeMarker: false,
    listeners: [],
    // create the map
    init: function (containerId) {
        var options = {
            scrollwheel: false,
            streetViewControl: false,
            mapTypeControl: false,
            //scaleControl: false,
            panControl: false,
            //zoomControl: false,
            //disableDoubleClickZoom: true,
            draggableCursor: 'pointer',
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            zoom: 4,
            center: this.centre
            },
            that = this;

        this.map = new google.maps.Map(document.getElementById(containerId), options);
        this.marker = new google.maps.Marker({
            map:this.map,
            title: 'observation',
            draggable:true
        });

        google.maps.event.addListener(this.map, 'idle', function () {
            if (that.firstShow) {
                that.toggle();
                that.firstShow = false;
            }
        });

        google.maps.event.addListener(this.marker, 'drag', function (event) {
            $.each(that.listeners, function (i, lis) {
                lis.handler.apply(this, [event, 'drag']);
            });
        });

        google.maps.event.addListener(this.marker, 'dragend', function (event) {
            $.each(that.listeners, function (i, lis) {
                lis.handler.apply(this, [event, 'dragend']);
            });
        });

        /*google.maps.event.addListener(this.map, 'click', function (event) {
            if (!that.activeMarker) {
                that.setMarker(event.latLng);
            }
        });*/

        // Add a dummy overlay for later use.
        // Needed for API v3 to convert pixels to latlng.
        dummy = new DummyOView();

    },
    setMarker: function (lat, lng, options) {
        var latLng, zoom = 12;
        if (options && options.zoom !== undefined) {
            zoom = options.zoom;
        }
        if (lng === undefined) {
            // assume 1st arg is a google latLng
            latLng = lat;
        } else {
            latLng = new google.maps.LatLng(lat, lng);
        }
        this.marker.setPosition(latLng);
        if (!options || !options.center === 'same') {
            this.map.setCenter(latLng);
        }
        if (zoom !== 'same') {
            if (!this.inAustralia(latLng)) {
                this.map.setZoom(2);
            } else {
                this.map.setZoom(zoom);
            }
        }
        this.marker.setVisible(true);
        this.activeMarker = true;
    },
    removeMarker: function () {
        this.marker.setVisible(false);
    },
    resetMap: function() {
        this.map.fitBounds(this.initialBounds);
        this.map.setZoom(4);
    },
    resetMapToWorld: function() {
        this.map.fitBounds(this.initialBounds);
        this.map.setZoom(1);
    },
    setCenterToMarker: function() {
        this.map.setCenter(this.marker.getPosition());
    },
    redraw: function () {
        google.maps.event.trigger(this.map, "resize");
        this.map.fitBounds(this.initialBounds);
    },
    toggle: function () {
        var $container = $('#main-map-container');
        $container.slideToggle('slow');
    },
    show: function () {
        var $container = $('#main-map-container');
        $container.slideDown('slow');
    },
    hide: function () {
        var $container = $('#main-map-container');
        $container.slideUp('slow');
    },
    addListener: function(listener) {
        this.listeners.push(listener);
    },
    removeListener: function(listener) {
        this.listeners.remove(listener);
    },
    inAustralia: function(latLng) {
        return this.initialBounds.contains(latLng);
    }
};

var obj, xpos, ypos, drag_area, dummy;
var z_index = 0;

function DummyOView() {
    // Bind this to the map to access MapCanvasProjection
    this.setMap(mainMap.map);
    // MapCanvasProjection is only available after draw has been called.
    this.draw = function() {};
}

DummyOView.prototype = new google.maps.OverlayView();


document.onmouseup = function(e) {
    // Unregister mousemove handler
    document.onmousemove = null;
    if (obj) { obj = null; }
};

function initDrag(e) {

    if(!e) var e = window.event;

    // Drag image's parent div element
    obj = e.target ? e.target.parentNode : e.srcElement.parentElement;
    if(obj.className != "drag") {
        if(e.cancelable) e.preventDefault();
        obj = null;
        return;
    }

    if (obj) {
        // The currently dragged object always gets the highest z-index
        z_index++;
        obj.style.zIndex = z_index.toString();

        xpos = e.clientX - obj.offsetLeft;
        ypos = e.clientY - obj.offsetTop;

        document.onmousemove = moveObj;

    }
    return false;
}

function moveObj(e) {

    if(obj && obj.className == "drag") {

        if(!e) var e = window.event;
        obj.style.left = e.clientX - xpos + "px";
        obj.style.top = e.clientY - ypos + "px";

        obj.onmouseup = function() {

            var gd = mainMap.map.getDiv();
            var mLeft = gd.offsetLeft;
            var mTop = gd.offsetTop;

            var mWidth = gd.offsetWidth;
            var mHeight = gd.offsetHeight;

            var areaLeft = drag_area.offsetLeft;
            var areaTop = drag_area.offsetTop;

            var oWidth = obj.offsetWidth;
            var oHeight = obj.offsetHeight;

            // The object's pixel position relative to the document
            var x = obj.offsetLeft + areaLeft + oWidth/2;
            var y = obj.offsetTop + areaTop + oHeight/2;

            // Check if the cursor is inside the map div
            if (x > mLeft && x < (mLeft + mWidth) && y > mTop && y < (mTop + mHeight)) {

                // Difference between the x property of iconAnchor
                // and the middle of the icon width
                var anchorDiff = 1;

                // Find the object's pixel position in the map container
                var g = google.maps;
                var pixelpoint = new g.Point(x - mLeft -anchorDiff, y - mTop + (oHeight/2));

                // Corresponding geo point on the map
                var proj = dummy.getProjection();
                var latlng = proj.fromContainerPixelToLatLng(pixelpoint);

                // Create a corresponding marker on the map
                mainMap.setMarker(latlng, undefined, {zoom: 'same', center: 'same'});
                //var src = obj.firstChild.getAttribute("src");
                //createDraggedMarker(latlng, src);

                // Create dragged marker anew
                //fillMarker();
                $(obj).hide();
            }
        };
    }
    return false;
}
