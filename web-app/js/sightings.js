/* some temp static data for testing bookmarks */
var bookmarks = [
    {key:'home', lat:-35.2323, lng:149.021806, source: 'Google maps'},
    {key:'work', lat:-35.276955, lng:149.112421, source: 'Google maps'},
    {key:'desert', lat:-26.549223, lng:129.638672, source: 'GPS device', datum: 'WGS84'}
];

$(function() {

    // taxon
    taxon.set(guid);

    $('#undoTaxon').click(function () {
        taxonStack.pop();
    });

    // wire coordinate source
    $('#georeferenceProtocol').change(function () {
        // hide all
        $('#precisionFields span').css('display','none');
        // show one
        switch ($(this).val()) {
            case 'GPS device': $('#geodeticDatumField').css('display','inline'); break;
            case 'physical map': $('#physicalMapScaleField').css('display','inline'); break;
            case 'other': $('#otherSourceField').css('display','inline'); break;
        }
    });
    // fire coordinateSource change event if the field has been preloaded with a non-default value (eg in edit mode)
    if ($('#georeferenceProtocol').val() !== 'Google maps') {
        $('#georeferenceProtocol').change();
    }

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

    // activate submit button
    submitHandler.init();

    // create small map
    smallMap.init('small-map');

    // create main map
    mainMap.init('main-map');

    // catch changes in main map pin
    mainMap.addListener({handler: function(mouseEvent, event) {
        // update lat & lon on screen
        screenLocation.setLat(mouseEvent.latLng.lat(),true);
        screenLocation.setLng(mouseEvent.latLng.lng(),true);
        // change georeferenceProtocol (coord source) to google maps
        screenLocation.setSource("Google maps");
        // clear any verbatim lat & lon that have been set from other sources eg image exif
        screenLocation.clearVerbatimLatLon();
    }});

    $('#main-map-link').click(function () {
        mainMap.toggle();
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
                    $('#georeferenceProtocol').val(loc.source);
                    $('#georeferenceProtocol').change();
                }
                if (loc.datum !== undefined) {
                    $('#datum').val(loc.datum);
                }
            }
        }
    });
});

var submitHandler = {
    init: function () {
        var that = this;
        // wire submit button
        $('#submit,#alt-submit').click(function () {
            var missing = [];
            // check that we have the minimum data
            // removed for now but maybe we should check that at least 1 of date, location, image is present
            /*if (!screenDate.isValid()) {
                missing.push('Date');
            }
            if (!screenLocation.isValid()) {
                missing.push('Location');
            }*/
            if ($('#lsid').val() == '') {
                missing.push('Taxon');
            }
            if (missing.length > 0) {
                // show an error dialog
                that.showInsufficientDataDialog(missing);
            } else {
                that.submit();
            }
        });
    },
    showInsufficientDataDialog: function (missing) {
        // TODO: just alert for now - and only report missing taxon
        //var msg = missing.length === 2 ? "Both are missing." : missing[0] + " is missing.";
        var msg = missing[0] + " is missing.";
        alert("You must at least identify the species (or higher taxonomic group). " + msg);
    },
    submit: function () {
        var payload = $.extend({},
            screenDate.getAll(),
            screenLocation.getAll(),
            imageList.getAll(),
            taxon.getAll(),
            {userId: userId}
        );
        if ($('#occurrenceRemarks').val()) {
            payload.occurrenceRemarks = $('#occurrenceRemarks').val();
        }
        if (typeof recordId !== 'undefined') {
            payload.id = recordId;
        }
        $.ajax({
            url: recordsServerUrl,
            method: 'POST',
            dataType: 'json',
            data: payload,
            success: function (data) {
                if (data.error !== null) {
                    alert(data.error.error);
                } else {
                    document.location.href = serverUrl + "/records/user";
                }
            }
        });
    }
};

var taxon = {
    guid: null,
    scientificName: null,
    commonName: null,
    imageUrl: null,
    bieUrl: null,
    set: function (guid, name, noStack) {
        var that = this;
        // set name up front while we lookup full profile from bie
        if (name !== undefined) {
            this.scientificName = name;
            $("#scientificName").html(name);
        }
        // and guid
        if (guid) {
            $('#lsid').val(guid);
            this.guid = guid;
            // lookup taxon details in bie
            $.ajax({
                url: bieUrl + 'ws/species/info/' + guid + '.json',
                dataType: 'jsonp',
                success: function (data) {
                    that.scientificName = data.taxonConcept.name;
                    that.commonName = data.taxonConcept.commonNameSingle || "";
                    that.imageUrl = data.taxonConcept.smallImageUrl || (serverUrl + "/images/noImage85.jpg");
                    that.bieUrl = bieUrl + "species/" + that.guid;
                    // push any current taxon onto stack (unless we are popping from the stack)
                    if (noStack === undefined) {
                        taxonStack.push(guid, name);
                    }
                    // show new taxon
                    that.putToScreen();
                    // make sure screen is set up for having a taxon
                    that.setTaxonKnownMode();
                }
            });
        }
    },
    setTaxonKnownMode: function () {
        // switch to 'taxon chosen' mode
        $('#taxonBlock').removeClass('hidden');
        $('#chooseTaxonText').addClass('hidden');
        $('#changeTaxonText').removeClass('hidden');
    },
    putToScreen: function () {
        $('#scientificName').html(this.scientificName);
        $('#commonName').html(this.commonName);
        $('#taxonImage').attr('src', this.imageUrl);
        $('#taxonImage').parent('a').attr('href', this.bieUrl);
    },
    getAll: function () {
        return this.guid ? {
            scientificName: this.scientificName,
            commonName: this.commonName,
            taxonConceptID: this.guid,
            individualCount: $('#count').val(),
            identificationVerificationStatus: $('#identificationVerificationStatus').val()
        } : {};
    },
    isValid: function () {
        return this.guid !== null;
    }
};

var taxonStack = {
    // holds a stack of selected taxa
    stack: [],
    push: function (guid, name) {
        // add current taxon to stack
        this.stack.push({guid: $('#lsid').val(), name: $('.scientificName').html()});
        // activate undo
        $('#undoTaxon').removeAttr('disabled');
        $('#undoTaxon').removeClass('ui-state-disabled');
    },
    pop: function () {
        var top = this.stack.pop();
        if (top) {
            taxon.set(top.guid, top.name, true);
        }
        if (this.stack.length === 0) {
            // disable undo
            $('#undoTaxon').attr('disabled','disabled');
            $('#undoTaxon').addClass('ui-state-disabled');
        }
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

        if (document.getElementById(containerId) !== null) {
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
        }

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

        if (document.getElementById(containerId) !== null) {
            // create map
            this.map = new google.maps.Map(document.getElementById(containerId), options);

            // create a marker
            this.marker = new google.maps.Marker({
                map:this.map,
                title: 'observation',
                draggable:true
            });

            // hide map after it is drawn
            google.maps.event.addListener(this.map, 'idle', function () {
                if (that.firstShow) {
                    that.toggle();
                    that.firstShow = false;
                }
            });

            // listen for drag events
            google.maps.event.addListener(this.marker, 'drag', function (event) {
                $.each(that.listeners, function (i, lis) {
                    lis.handler.apply(this, [event, 'drag']);
                });
            });

            // listen for dragend
            google.maps.event.addListener(this.marker, 'dragend', function (event) {
                $.each(that.listeners, function (i, lis) {
                    lis.handler.apply(this, [event, 'dragend']);
                });
            });

            // Add a dummy overlay for later use.
            // Needed for API v3 to convert pixels to latlng.
            dummy = new DummyOView();

            // wire map buttons
            $('#centerOnPin').click(function () {
                that.setCenterToMarker();
            });
            $('#pinToCenter').click(function () {
                that.setMarker(that.map.getCenter(), undefined, {zoom: 'same'});
                screenLocation.setLatLng(that.map.getCenter().lat(), that.map.getCenter().lng(), {autoLookup: true});
            });
            $('#showOz').click(function () {
                that.resetMap();
            });
            $('#zoomPin').click(function () {
                that.zoomIntoPin();
            });
            $('#showWorld').click(function () {
                that.resetMapToWorld();
            });
            $('#discardPin').click(function () {
                that.removeMarker();
            });

            drag_area = document.getElementById('markers');
            drag_area.onmousedown = initDrag;
        }
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
        this.hideMenuMarker();  // don't want the menu pin once a pin is set on the map
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
    zoomIntoPin: function () {
        this.setCenterToMarker();
        this.map.setZoom(15);
    },
    hideMenuMarker: function () { // hides the marker in the menu so it can't be dragged
        $('#m1').hide();
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

                // set the coords to the screen
                screenLocation.setLatLng(latlng.lat(), latlng.lng(), {autoLookup: true});

                // hide the draggable pin in the menu
                $(obj).hide();
            }
        };
    }
    return false;
}
