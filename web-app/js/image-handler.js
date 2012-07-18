/* Handles image selection, uploading and extraction of embedded data. */

$(function() {

    /* ExifLoader handles the extraction of EXIF data from any files that are added to the upload list. */
    var ExifLoader = {
        geocoder: new google.maps.Geocoder(),
        onFileSelect: function (event) {
            var that = event.data.that;
            if (ExifLoader.geocoder === undefined) { ExifLoader.geocoder = new google.maps.Geocoder(); }
            $(this).fileExif(function (exifObject) {
                var loc = new Location(),
                    dt = new DateTime(),
                    latLng;
                loc.set ({latLng: {
                    lat: exifObject.GPSLatitude,
                    latRef: exifObject.GPSLatitudeRef,
                    lng: exifObject.GPSLongitude,
                    lngRef: exifObject.GPSLongitudeRef
                }});
                loc.coordinateSource = 'camera/phone';
                dt.setFromExifFormat(exifObject.DateTimeOriginal);

                if (loc.decimalLatitude !== null && loc.decimalLongitude !== null) {
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
                }
            });
        }
    },
    /* ExifPutter handles the disposition of any extracted EXIF data into the user's submission fields. */
    ExifPutter = {
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
    };

    // wire putter dialogs
    $("#locationUpdateDialog" ).dialog({
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

    // wire the file selection widget
    $('#files').change({that: ExifLoader}, ExifLoader.onFileSelect);

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
