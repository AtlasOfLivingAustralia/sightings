/* Handles image selection, uploading and extraction of embedded data. */

var ExifLoader = {};

$(function() {

    /* ExifLoader handles the extraction of EXIF data from any files that are added to the upload list. */
    ExifLoader = {
        geocoder: new google.maps.Geocoder(),
        dataCache: {},

        onRowAdded: function (files) {
            //console.log("onRowAdded: name=" + files[0].name);

            imageList.rowAdded();

            if (ExifLoader.geocoder === undefined) { ExifLoader.geocoder = new google.maps.Geocoder(); }

            var dummy = [{files: files}];
            //$('#files').getExif(files[0], function (exifObject) {
            $('#files').fileExif.call(dummy, function (exifObject) {
                //console.log('fileExif called with ' + files[0].name);
                var loc = new Location(),
                    dt = new DateTime();

                // load location data
                loc.set ({latLng: {
                    lat: exifObject.GPSLatitude,
                    latRef: exifObject.GPSLatitudeRef,
                    lng: exifObject.GPSLongitude,
                    lngRef: exifObject.GPSLongitudeRef
                }});
                loc.coordinateSource = 'camera/phone';

                // load date-time data
                dt.setFromExifFormat(exifObject.DateTimeOriginal);

                // display data in image table
                imageList.injectLocationIntoNewlyAddedImage(files[0].name, loc);
                imageList.injectDateTimeIntoNewlyAddedImage(files[0].name, dt);
            });
        }

/*
        // called when a file is selected in the file input widget
        onFileSelect: function (event) {
            var that = event.data.that,
                $rows, lastRow,
                files = this.files,
                filesIndex = 0;

            console.log('file select called ' + filesIndex);

            imageList.rowAdded();

            if (ExifLoader.geocoder === undefined) { ExifLoader.geocoder = new google.maps.Geocoder(); }

            $(this).multiFileExif(function (exifObject) {
                console.log('fileExif called ' + filesIndex);
                console.log('file name is ' + files[filesIndex].name);
                var loc = new Location(),
                    dt = new DateTime();

                // load location data
                loc.set ({latLng: {
                    lat: exifObject.GPSLatitude,
                    latRef: exifObject.GPSLatitudeRef,
                    lng: exifObject.GPSLongitude,
                    lngRef: exifObject.GPSLongitudeRef
                }});
                loc.coordinateSource = 'camera/phone';

                // load date-time data
                dt.setFromExifFormat(exifObject.DateTimeOriginal);

                // display data in image table
                imageList.injectLocationIntoNewlyAddedImage(files[filesIndex].name, loc);
                imageList.injectDateTimeIntoNewlyAddedImage(files[filesIndex].name, dt);
                filesIndex++;
                console.log('filesIndex incremented ' + filesIndex);

                // add data to cache in case the table row is not created yet
                if (files[filesIndex]) {
                    that.dataCache[files[filesIndex].name] = {
                        location: loc,
                        datetime: dt
                    };
                }

                */
/*if (loc.decimalLatitude !== null && loc.decimalLongitude !== null) {
                    latLng = new google.maps.LatLng(loc.decimalLatitude, loc.decimalLongitude);
                    that.geocoder.geocode({'latLng': latLng}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                loc.locality = results[0].formatted_address;
                                loc.usingReverseGeocodedLocality = "true";
                            }
                        }
                        ExifPutter.set(dt, loc);
                    });
                } else if (dt.isValid()) {
                    ExifPutter.set(dt);
                }*//*

            });
        }*/
    };


    /* ExifPutter handles the disposition of any extracted EXIF data into the user's submission fields. */
    /*var ExifPutter = {
        set: function (dateTime, loc) {
            var screenLoc = new Location().loadFromScreen(),
                locationConflicts = loc.compare(screenLoc),
                screenDateTime = new DateTime().loadFromScreen(),
                dateTimeConflicts = dateTime.compare(screenDateTime),
                anyConflict = (locationConflicts.length > 0) || (dateTimeConflicts.length > 0);

            if (anyConflict) {
                // handle location and date conflicts separately
                if (locationConflicts.length > 0) {
                    // if both are in conflict we have to chain one dialog after the other
                    // so we optionally pass the dateTime into location to build the chain
                    this.locationDialog(loc, (dateTimeConflicts.length > 0) ? dateTime : undefined);
                } else if (dateTimeConflicts.length > 0) {
                    this.dateDialog(dateTime, screenDateTime);
                }
            } else {
                // just do it
                if (dateTime.isValid()) {
                    dateTime.putToScreen();
                }
                if (loc.isValid()) {
                    loc.putToScreen();
                    Bookmarks.selectNoBookmark();
                }
            }
        },
        // only pass in dateTime if the date dialog needs to be chained after this one
        locationDialog: function (loc, dateTime) {
            var that = this;
            // inject values into dialog
            $('#imageLat').html(loc.decimalLatitude);
            $('#imageLng').html(loc.decimalLongitude);
            $('#lookupLocality').html(loc.locality);

            // invoke dialog to ask whether to update values
            $("#locationUpdateDialog").dialog('option', 'buttons', {
                "Use image location": function () {
                    loc.putToScreen();
                    Bookmarks.selectNoBookmark();
                    $( this ).dialog( "close" );
                    // chain to the date dialog if dateTime has been passed
                    if (dateTime !== undefined) {
                        that.dateDialog(dateTime);
                    }
                },
                "Keep current location": function () {
                    $( this ).dialog( "close" );
                }
            });
            $("#locationUpdateDialog").dialog('open');
        },
        dateDialog: function (dateTime) {
            var screenDateTime = new DateTime().loadFromScreen();
            // inject values into dialog
            $('#currentDateTime').html(screenDateTime.getDateForScreen() + " " + screenDateTime.getTimeForScreen());
            $('#imageDateTime').html(dateTime.getDateForScreen() + " " + dateTime.getTimeForScreen());
            // invoke dialog to ask whether to update values
            $("#dateUpdateDialog").dialog('option', 'buttons', {
                "Use image date": function () {
                    dateTime.putToScreen();
                    $( this ).dialog( "close" );
                },
                "Keep current date": function () {
                    $( this ).dialog( "close" );
                }
            });
            $("#dateUpdateDialog").dialog('open');
        }
    },*/

    /* Handles the attributes and behaviour of the list of images to be uploaded. */
    imageList = {
        init: function () {
            var that = this;
            // wire the 'Use this ..' buttons
            $('#filesTable').on('click', '.useImageDate', function (e) {
                var $td = $(this).parents('td'),
                    dt = $td.data('dateTime');
                if (dt !== undefined) {
                    dt.putToScreen();
                    that.refreshButtonStates('date');
                }
            });
            $('#filesTable').on('click', '.useImageLocation', function (e) {
                var $td = $(this).parents('td');
                var loc = $td.data('location');
                if (loc !== undefined) {
                    loc.putToScreen();
                    that.refreshButtonStates('location');
                }
            });
            // listen for external changes to the location so we can update the button states
            mainMap.addListener({handler: function(mouseEvent, event) { // map drag
                that.refreshButtonStates('location');
            }});
            screenLocation.addListener({handler: function(event, latLng) { // lat/lng input fields
                that.refreshButtonStates('location');
            }});
            // listen for external changes to the date and time so we can update the button states
            screenDate.addListener({handler: function(event) { // date/time input fields
                that.refreshButtonStates('date');
            }});
        },
        refreshButtonStates: function (which) {
            var currentDt = new DateTime().loadFromScreen(),
                currentLoc = new Location().loadFromScreen(),
                dt, loc,
                refreshDate = (which === undefined || which === "date"),
                refreshLocation = (which === undefined || which === "location");
            $('#filesTable tr').each(function (i, row) {
                if (refreshDate) {
                    dt = $(this).find("td.imageDate").data('dateTime');
                    //console.log("Date: " + (dt === undefined || currentDt.isSame(dt)));
                    if (dt === undefined || currentDt.isSame(dt)) {
                        // then disable this one
                        $(this).find('button.useImageDate').attr('disabled','disabled');
                    } else {
                        // enable 'Use..' button
                        $(this).find('button.useImageDate').removeAttr('disabled');
                    }
                }
                if (refreshLocation) {
                    loc = $(this).find("td.imageLocation").data('location');
                    //console.log("Loc: " + (loc === undefined || currentLoc.isSame(loc)));
                    if (loc === undefined || currentLoc.isSame(loc)) {
                        // then disable this one
                        $(this).find('button.useImageLocation').attr('disabled','disabled');
                    } else {
                        // enable 'Use..' button
                        $(this).find('button.useImageLocation').removeAttr('disabled');
                    }
                }
            });
        },
        rowAdded: function () {
            // minimise 'Add..' button as soon as one image is added
            $('#addImageButtonLarge').hide();
            $('#addImageButtonSmall').show();
        },
        injectLocationIntoNewlyAddedImage: function (filename, loc) {
            var $rows = $('#filesTable tr'),
                name;

            if (loc.isValid()) {
                // check each row for matching name
                $.each($rows, function(i, row) {
                    //console.log("inject location: rows=" + $rows.length +" name=" + filename + " row=" + $(row).find("span.name").html());
                    if ($(row).find("span.name").html() === filename) {
                        // inject exif data
                        // show the value
                        $(row).find(".imageLatLng").html('Lat: ' + limit(loc.decimalLatitude, 6) +
                            ', Lng: ' + limit(loc.decimalLongitude, 6));
                        // store full object as jQuery data
                        $(row).find("td.imageLocation").data('location', loc);
                        // make sure the 'Use..' button is enabled
                        $(row).find("button.useImageLocation").removeAttr('disabled');
                    }
                });
            }
        },
        injectDateTimeIntoNewlyAddedImage: function (filename, dt) {
            var $rows = $('#filesTable tr'),
                name;

            if (dt.isValid()) {
                // check each row for matching name
                $.each($rows, function(i, row) {
                    if ($(row).find("span.name").html() === filename) {
                        // inject exif data
                        // show the value
                        $(row).find(".imageDateTime").html(dt.getDateForScreen() + ' ' +
                            dt.getTimeForScreen());
                        // store full object as jQuery data
                        $(row).find("td.imageDate").data('dateTime', dt);
                        // make sure the 'Use..' button is enabled
                        $(row).find("button.useImageDate").removeAttr('disabled');
                    }
                });
            }
        }
    };

    // wire putter dialogs
    /*$("#locationUpdateDialog" ).dialog({
        autoOpen: false,
        draggable: true,
        title: 'Update location from image metadata',
        modal: true,
        width: 400,
        show: "blind",
        hide: "explode"
    });
    $("#dateUpdateDialog" ).dialog({
        autoOpen: false,
        draggable: true,
        title: 'Update date and time from image metadata',
        modal: true,
        width: 400,
        show: "blind",
        hide: "explode"
    });
*/
    // wire the file selection widget
    // $('#files').change({that: ExifLoader}, ExifLoader.onFileSelect);

    imageList.init();
    //$(Document).bind('fileuploadsubmit', {that: ExifLoader}, ExifLoader.onAdd);
});

/*
// use dec_sep for internationalization
function Decimals(x, dec_sep)
{
    var tmp = x.toString();
    if (tmp.indexOf(dec_sep)>-1)
        return tmp.length-tmp.indexOf(dec_sep)-1;
    else
        return 0;
}
*/
