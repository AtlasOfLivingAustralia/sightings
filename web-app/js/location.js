/*
 * Copyright (C) 2012 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */

/**
 *
 * Javascript to manage location and date definitions and their representation on the page.
 *
 * User: markew
 * Date: 16/07/12
 */
$(function() {
    $('#time').mask("99:99");
    $("#date").datepicker({
        dateFormat: "dd-mm-yy",
        maxDate: "+0",
        appendText: " (dd-mm-yyyy)",
        numberOfMonths: 1
    });
    screenLocation.init();
    screenDate.init();
    // preload date and time if they are supplied
    if (typeof eventDate !== 'undefined') {
        if (eventDate !== "" && eventDate !== 'null') {
            new DateTime().setFromStoredFormat(eventDate, eventTime).putToScreen();
        }
    }
    //$('#fields').validationEngine();
});

/* Manages locations --------------------------------------------------------------- */
var screenLocation = {
    latitudeField: null,
    longitudeField: null,
    autoLookup: true,
    usingReverseGeocodedLocality: false,
    coordinateUncertaintyInMetersField:null,
    geocoder: null,
    listeners: [],
    init: function () {
        var that = this, lat, lng;
        this.latitudeField = $('#latitude');
        this.longitudeField = $('#longitude');
        this.coordinateUncertaintyInMetersField = $('#coordinateUncertaintyInMeters');
        this.geocoder = new google.maps.Geocoder();

        // catch changes in lat and lon
        $('#latitude,#longitude').change(function () {
            lat = that.getLat();
            lng = that.getLng();

            // don't use a configured listener for this so we avoid infinite loops
            mainMap.setMarker(lat, lng);

            // notify other listeners
            $.each(that.listeners, function (i, lis) {
                lis.handler.apply(that, ['latLngChange', new google.maps.LatLng(lat, lng)]);
            });
        });

        // catch edits to the locality field
        $('#location').change( function () {
            that.setUsingReverseGeocodedLocality(false);
        });
        $("#location").keypress(function(e) {
            if(e.which == 13) {
                that.geocodeLookup();
                return false;
            }
        });
        // wire location lookups
        $('#reverseLookup').click(function () {
            var locText = that.getLocality();
            if (locText === "") { return; }
            that.geocoder.geocode({
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
            that.geocoder.geocode({
                location: new google.maps.LatLng(lat, lng)},
                function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        that.setLocality(results[1].formatted_address);
                        that.setUsingReverseGeocodedLocality(true);
                    }
                });
        });

        // wire geocode icon
        $('#isLookedUp').click(function () {
            if (that.getLocality() === "") { return; }
            that.setUsingReverseGeocodedLocality(!that.usingReverseGeocodedLocality);
        });

        // listen for dragend events in main map so we can modify locality
        mainMap.addListener({handler: function (mouseEvent, event) {
            if (event === 'dragend') {
                if (that.getLocality() === "" || that.usingReverseGeocodedLocality) {
                    // reverse geocode locality
                    that.reverseGeocodeLocality(that.getLat(), that.getLng());
                }
            }
        }});
    },
    geocodeLookup: function(){
        var locText = this.getLocality();
        if (locText === "") { return; }
        this.geocoder.geocode({
            address: locText,
            bounds: mainMap.map.getBounds()
        },
        function (results, status) {
            var latLng;
            if (status == google.maps.GeocoderStatus.OK) {
                latLng = results[0].geometry.location;
                $('#latitude').val(latLng.lat());
                $('#longitude').val(latLng.lng()).change();
                mainMap.show();
            }
        });
    },
    getAll: function () {
        // nothing else matters if there is no lat/lon
        if (!this.getLat()) {
            return {};
        }
        var l = {
            decimalLatitude: this.getLat(),
            decimalLongitude: this.getLng(),
            coordinateUncertaintyInMeters: this.getCoordinateUncertaintyInMeters(),
            verbatimLatitude: $('#verbatimLatitude').val(),
            verbatimLongitude: $('#verbatimLongitude').val(),
            locality: this.getLocality(),
            georeferenceProtocol: this.getSource()
            },
            other = $('#otherSource').val(),
            props = {}, p;
        // only propagate non-null values
        for (p in l) {
            if (l.hasOwnProperty(p) && l[p]) {
                props[p] = l[p];
            }
        }
        if (this.usingReverseGeocodedLocality) {
            props.usingReverseGeocodedLocality = true;
        }
        if (props.georeferenceProtocol === 'GPS device') {
            props.geodeticDatum = $('#geodeticDatum').val();
        }
        if(props.decimalLatitude && props.decimalLongitude && !props.geodeticDatum){
            props.geodeticDatum = 'WGS84';
        }
        if (props.georeferenceProtocol === 'other') {
            props.otherSource = other;
        }
        if (props.georeferenceProtocol === 'physical map') {
            props.physicalMapScale = $('#physicalMapScale').val();
        }
        return props;
    },
    setLatLng: function (lat, lng, options) {
        var opts = options || {};
        this.setLat(lat, opts.noNotify);
        this.setLng(lng, opts.noNotify);
        if (opts.autoLookup && (this.getLocality() === "" || this.usingReverseGeocodedLocality)) {
            // reverse geocode locality
            this.reverseGeocodeLocality(lat, lng);
        }
    },
    getLat: function () {
        return $('#latitude').val();
    },
    getLng: function () {
        return $('#longitude').val();
    },
    getCoordinateUncertaintyInMeters: function () {
        return $('#coordinateUncertaintyInMeters').val();
    },
    setLat: function (num, noNotify) {
        this.latitudeField.val(num);//limit(num));
        if (noNotify !== true) {
            this.latitudeField.change();
        }
    },
    setLng: function (num, noNotify) {
        this.longitudeField.val(num);//limit(num));
        if (noNotify !== true) {
            this.longitudeField.change();
        }
    },
    getSource: function () {
        return $('#georeferenceProtocol').val();
    },
    clearVerbatimLatLon: function () {
        $('#verbatimLatitude').val('');
        $('#verbatimLongitude').val('');
    },
    setSource: function (source) {
        $('#georeferenceProtocol').val(source).change();
    },
    getLocality: function () {
        return $('#location').val();
    },
    setLocality: function (source) {
        $('#location').val(source).change();
    },
    setUsingReverseGeocodedLocality: function (value) {
        if (value === true) {
            $('#isLookedUp').removeClass('lookup-off');
            this.usingReverseGeocodedLocality = true;
        } else {
            $('#isLookedUp').addClass('lookup-off');
            this.usingReverseGeocodedLocality = false;
        }
    },
    isValid: function () {
        return new Location().loadFromScreen().isValid();
    },
    reverseGeocodeLocality: function (lat, lng) {
        var latLng = new google.maps.LatLng(lat, lng),
            that = this;
        this.geocoder.geocode({'latLng': latLng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    that.setLocality(results[0].formatted_address);
                    that.setUsingReverseGeocodedLocality(true);
                }
            }
        });
    },
    addListener: function(listener) {
        this.listeners.push(listener);
    },
    removeListener: function(listener) {
        this.listeners.remove(listener);
    },
    showInvalidLatitudeAlert: function (status) {
        var text;
        switch (status) {
            case 0: // shouldn't be here
                return;
            case 1: // generic error
                text = 'The latitude ' + this.getLat() + ' is not valid.'; break;
            case 2: // DMS format
                text = 'The latitude appears to be in degree, minutes, seconds format.' +
                    ' Please use decimal degrees.';
        }
        this.latitudeField.focus();
        alert(text);
    },
    showInvalidLongitudeAlert: function (status) {
        var text;
        switch (status) {
            case 0: // shouldn't be here
                return;
            case 1: // generic error
                text = 'The longitude ' + this.getLng() + ' is not valid.'; break;
            case 2: // DMS format
                text = 'The longitude appears to be in degree, minutes, seconds format.' +
                    ' Please use decimal degrees.';
        }
        this.longitudeField.focus();
        alert(text);
    }
};

var degMinSecs = {
    // regex for matching dms latitude
    latDMSregex: /((-)?(90[ :°°d]*00[ :\'\'m]*00(\.0+)?|([0-8][0-9](\.\d+)?)[ :°°d]*([0-5]?[0-9](\.\d+)?)[ :\'\'\'m]*([0-5]?[0-9](\.\d+)?))[ :\?\"\"s]*(N|n|S|s)?)/,
    // regex for matching dms longitude
    lngDMSregex: /((-)?(180[ :°°d]*00[ :\'\'m]*00(\.0+)?|(1[0-7][0-9](\.\d+)?|0[0-9][0-9](\.\d+)?)[ :°°d]*([0-5]?[0-9](\.\d+)?)[ :\'\'m]*([0-5]?[0-9](\.\d+)?))[ :\?\"s]*(E|e|W|w)?)/,
    // checks a string to see if it may be in degree-minutes-seconds format
    /*
     valid formats are:
     dd mm' ss.ss"
     -35° 7' 23.80", +148° 58' 3.87"  - google maps
     -36.0° 1.0' 58.8000000000045", 145.0° 59.0' 43.199899999920035"  - iPhone
     dd° mm' ss.ss"
     dd°mm'ss.ss" (no spaces)
     dd mm ss.ss
     param value - the value string
     param which - either lat or lng, if neither specified, either will match
     */
    getFloatArray: function (value) {
        var arr = [], i, bits = value.split(/[^\d.]/), f;
        arr.push(value[0] === '-' ? '-' : '');
        for (i = 0; i < bits.length && arr.length < 4; i++) {
            if (bits[i] !== "") {
                f = parseFloat(bits[i]);
                if (!isNaN(f)) {
                    arr.push(f);
                }
            }
        }
        return arr;
    },
    isDegMinSec: function (value, which) {
        // first make sure it's not a valid decimal
        if (this.isDecimal(value)) {
            return false;
        }
        /*// check against regex
        if (which === 'lat') {
            return this.latDMSregex.test(value);
        } else if (which === 'lng') {
            return this.lngDMSregex.test(value);
        } else {
            return this.latDMSregex.test(value) || this.lngDMSregex.test(value);
        }*/
        return this.getFloatArray(value).length === 4;
    },
    isDecimal: function (x) {
        return $.isNumeric(x);
    },
    degMinSecToDecDeg: function (value, which) {
        var arr = this.getFloatArray(value);
        /*var matches = value.match(which === 'lat' ? this.latDMSregex : this.lngDMSregex);
        if (matches === null || matches.length < 7) { return null; }
        var sign = matches[2],
            unsignedDegrees = parseFloat(matches[5]),
            degrees = sign === '-' ? -unsignedDegrees : unsignedDegrees,
            minutes = parseFloat(matches[6]),
            seconds = parseFloat(matches[7]);*/
        if (arr.length < 4) { return null; }

        return { decimalValue: this.toDecimalDegrees(arr.slice(1,4), arr[0]),
            degrees: arr[0] === '-' ? -arr[1] : arr[1], minutes: arr[2], seconds: arr[3] };
    },
    toDecimalDegrees: function (num, ref) {
        // expect num to be an array of length 3
        if (num.length !== 3) { return 0 }
        //console.log(num[0] + " " + num[1] + " " + num[2]);
        var degrees = num[0],
            minutes = num[1],
            seconds = num[2],
        // determine the num decimal places of minutes and seconds (so we don't artificially add 'accuracy')
            minutesPlaces = numDecimalPlaces(minutes,'.'),
            secondsPlaces = numDecimalPlaces(seconds,'.'),
            apparentAccuracy;

        /* roughly calculate the apparent accuracy based on:
         1 second ~= .0003 degree so take 4 places as a min
         add a decimal place for each decimal place in the seconds value
         1 minute ~= .0166 degree so add start with 2 and add 1 place for each decimal place in minutes
         take the greater of the two estimates
         */
        apparentAccuracy = Math.max(4 + secondsPlaces, 2 + minutesPlaces);
        //console.log(apparentAccuracy);
        degrees = degrees + minutes/60 + seconds/3600;
        // limit result to the same apparent resolution as the input
        degrees = degrees.toFixed(apparentAccuracy);
        if (ref === 'S' || ref === 'W' || ref === '-') {
            degrees = -degrees;
        } else {
            degrees = +degrees;
        }
        return degrees;
    },
    updateConversionFromDMSFields: function () {
        var deg, min, sec, that = this;
        $.each(['Lat', 'Lng'], function (i, obj) {
            deg = $('#degrees'+obj).val();
            min = $('#minutes'+obj).val();
            sec = $('#seconds'+obj).val();
            if (deg !== '' && min !== '') {
                $('#dec'+obj).html(that.degMinSecToDecDeg(deg + ' ' + min + ' ' + sec, obj.toLowerCase()).decimalValue);
            }
        });
    },
    clearConvertFromDMSDialog: function () {
        $('#dmsConvertDialog input').val('');
        $('#decLat').html('');
        $('#decLng').html('');
    },
    // called when either lat or long or both fail decimal validation and seem to be deg/min/secs
    // each value is checked because we don't want to try to show decimals as DMS
    showConvertFromDMSDialog: function (lat, lng) {
        var decLat = this.isDegMinSec(lat, 'lat') ? this.degMinSecToDecDeg(lat, 'lat') : null,
            decLng = this.isDegMinSec(lng, 'lng') ? this.degMinSecToDecDeg(lng, 'lng') : null,
            that = this;
        this.clearConvertFromDMSDialog();

        // load values into the dialog
        $('#enteredLat').html(lat);
        $('#enteredLng').html(lng);
        if (decLat !== null) {
            $('#degreesLat').val(decLat.degrees);
            $('#minutesLat').val(decLat.minutes);
            $('#secondsLat').val(decLat.seconds);
            $('#decLat').html(decLat.decimalValue);
        }
        if (decLng !== null) {
            $('#degreesLng').val(decLng.degrees);
            $('#minutesLng').val(decLng.minutes);
            $('#secondsLng').val(decLng.seconds);
            $('#decLng').html(decLng.decimalValue);
        }

        // show the dialog
        $('#dmsConvertDialog').dialog({
            width: 500,
            modal: true,
            buttons: {
                "Use the decimal equivalents": function() {
                    // write dialog calculated values to screen
                    var lat = $('#decLat').html(),
                        lng = $('#decLng').html();
                    if (lat !== '') {
                        screenLocation.setLat(lat);
                        // clear validation warnings
                        $('#latitude').validationEngine('hide');
                    }
                    if (lng !== '') {
                        screenLocation.setLng(lng);
                        // clear validation warnings
                        $('#longitude').validationEngine('hide');
                    }
                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });

        // handle edits to the fields
        $('#dmsConvertDialog input').change(function () {
            that.updateConversionFromDMSFields();
        });
    },
    // only for EXIF format DMS coords where the components are in arrays
    isDegMinSecAsArray: function (o) {
        return $.isArray(o.lat) && $.isArray(o.lng);
    },
    // only for EXIF format DMS coords where the components are in arrays
    degMinSecAsArrayToString: function (num, ref) {
        var sign = (ref === 'S' || ref === 'W') ? "-" : "";
        return sign + num[0] + " " + num[1] + " " + num[2];
    }
};

function Location () {
    this.decimalLatitude = null;
    this.decimalLongitude = null;
    this.coordinateUncertaintyInMeters = null;
    this.verbatimLatitude = "";
    this.verbatimLongitude = "";
    this.locality = "";
    this.usingReverseGeocodedLocality = "false";
    this.georeferenceProtocol = "";
    this.geodeticDatum = "WGS84";  //setting a default of WGS84
    this.physicalMapScale = "";
    this.otherSource = "";
}

Location.prototype.isValid = function () {
    return hasValue(this.decimalLatitude) && hasValue(this.decimalLongitude);
};

Location.prototype.set = function (data) {
    var that = this;
    $.each(['locality','georeferenceProtocol','geodeticDatum','physicalMapScale','otherSource'], function (i,prop) {
        if (data[prop] !== undefined) {
            that[prop] = data[prop];
        }
    });
    if (data.latLng !== undefined) {
        if (degMinSecs.isDegMinSecAsArray(data.latLng)) {
            this.verbatimLatitude = degMinSecs.degMinSecAsArrayToString(data.latLng.lat, data.latLng.latRef);
            this.verbatimLongitude = degMinSecs.degMinSecAsArrayToString(data.latLng.lng, data.latLng.lngRef);
            this.decimalLatitude = degMinSecs.toDecimalDegrees(data.latLng.lat, data.latLng.latRef);
            this.decimalLongitude = degMinSecs.toDecimalDegrees(data.latLng.lng, data.latLng.lngRef);
        } else {
            this.verbatimLatitude = data.latLng.lat;
            this.verbatimLongitude = data.latLng.lng;
            this.decimalLatitude = this.verbatimLatitude;
            this.decimalLongitude = this.verbatimLongitude;
        }
        // reverse geocode locality if blank
    }
    return this;
};

Location.prototype.loadFromScreen = function () {
    this.decimalLatitude = screenLocation.getLat();
    this.decimalLongitude = screenLocation.getLng();
    this.coordinateUncertaintyInMeters = screenLocation.getCoordinateUncertaintyInMeters();
    this.verbatimLatitude = $('#verbatimLatitude').val();
    this.verbatimLongitude = $('#verbatimLongitude').val();
    this.locality = screenLocation.getLocality();
    this.usingReverseGeocodedLocality = screenLocation.usingReverseGeocodedLocality;
    this.georeferenceProtocol = screenLocation.getSource();
    this.geodeticDatum = $('#geodeticDatum').val();
    if (this.georeferenceProtocol === 'physical map') {
        this.physicalMapScale = $('#physicalMapScale').val();
    }
    this.otherSource = $('#otherSource').val();
    return this;
};

Location.prototype.loadFromBookmark = function (bkm) {
    this.decimalLatitude = bkm.decimalLatitude;
    this.decimalLongitude = bkm.decimalLongitude;
    this.verbatimLatitude = bkm.verbatimLatitude;
    this.verbatimLongitude = bkm.verbatimLongitude;
    this.locality = bkm.locality;
    this.usingReverseGeocodedLocality = bkm.usingReverseGeocodedLocality;
    this.georeferenceProtocol = bkm.georeferenceProtocol;
    this.geodeticDatum = bkm.geodeticDatum;
    this.physicalMapScale = bkm.physicalMapScale;
    this.otherSource = bkm.otherSource;
    return this;
};

Location.prototype.makeBookmark = function () {
    var bkm = {},
        that = this;
    bkm.decimalLatitude = this.decimalLatitude;
    bkm.decimalLongitude = this.decimalLongitude;
    bkm.locality = this.locality;
    // only add usingRev.. if it is true
    if (this.usingReverseGeocodedLocality === "true") {
        bkm.usingReverseGeocodedLocality = "true";
    }
    $.each(['verbatimLatitude','verbatimLongitude','georeferenceProtocol','geodeticDatum',
        'otherSource'], function (i,prop) {
        if (that[prop] !== "") {
            bkm[prop] = that[prop];
        }
    });
    if (this.georeferenceProtocol === 'physical map') {
        bkm.physicalMapScale = this.physicalMapScale;
    }
    return bkm;
};

Location.prototype.putToScreen = function (options) {
    screenLocation.setLatLng(this.decimalLatitude, this.decimalLongitude, options);
    screenLocation.setSource(this.georeferenceProtocol);
    screenLocation.setUsingReverseGeocodedLocality(this.usingReverseGeocodedLocality);
    // TODO: all the following should be migrated to screenLocation object
    $('#verbatimLatitude').val(this.verbatimLatitude).change();
    $('#verbatimLongitude').val(this.verbatimLongitude).change();
    screenLocation.setLocality(this.locality);
    $('#geodeticDatum').val(this.geodeticDatum).change();
    $('#physicalMap').val(this.physicalMapScale).change();
    $('#otherSource').val(this.otherSource).change();
    return this;
};

Location.prototype.displayLatLng = function () {
    return "Lat:" + this.decimalLatitude + ", Lng:" + this.decimalLongitude;
};

Location.prototype.compare = function (loc) {
    var conflicts = [],
        that = this;
    $.each(['decimalLatitude','decimalLongitude','locality'], function (i, prop) {
        // allow type coercion in the value comparison
        if (hasValue(loc[prop]) && hasValue(that[prop]) && loc[prop] != that[prop]) {
            conflicts.push(prop);
        }
    });
    return conflicts;
};

Location.prototype.isSame = function (loc) {
    var that = this,
        same = true;
    if (loc === undefined || !loc.isValid() || !this.isValid()) {
        return false;
    }
    $.each(['decimalLatitude','decimalLongitude','locality'], function (i, prop) {
        // allow type coercion in the value comparison
        if (loc[prop] != that[prop]) {
            same = false;
        }
    });
    return same;
};

// 0 = ok, 1 = invalid, 2 = DMS format
Location.prototype.validateLatitude = function () {
    var lat;

    if (this.decimalLatitude === null || this.decimalLatitude === '') {
        return 0;
    }
    // check for DMS format
    if (this.decimalLatitude.indexOf('"') > -1 || this.decimalLatitude.indexOf("'") > -1) {
        return 2;
    }
    // check for non-numeric chars
    try {
        lat = parseFloat(this.decimalLatitude);
    } catch (e) {
        return 1;
    }
    return (lat >= -90 && lat <= 90) ? 0 : 1;
};

Location.prototype.validateLongitude = function () {
    var lon;
    if (this.decimalLongitude === null || this.decimalLongitude === '') {
        return 0;
    }
    // check for DMS format
    if (this.decimalLongitude.indexOf('"') > -1 || this.decimalLongitude.indexOf("'") > -1) {
        return 2;
    }
    // check for non-numeric chars
    try {
        lon = parseFloat(this.decimalLongitude);
    } catch (e) {
        return 1;
    }
    return (lon >= -180 && lon <= 180) ? 0 : 1;
};

function hasValue(x) {
    return (x !== undefined) && (x !== null) && (x !== "") && (x !== [])
}

/* Manages the current date and time --------------------------------------------------------------- */
var screenDate = {
    dateField: null,
    timeField: null,
    listeners: [],
    init: function () {
        var that = this, date, time;
        this.dateField = $('#date');
        this.timeField = $('#time');

        // catch changes in date and time
        $('#date,#time').change(function () {
            date = that.dateField.val();
            time = that.timeField.val();
            // notify listeners
            $.each(that.listeners, function (i, lis) {
                lis.handler.apply(that, ['dateTimeChange']);
            });
        });
    },
    getAll: function () {
        var dt = new DateTime().loadFromScreen();
        return dt.isValid() ? dt.getEvent() : [];
    },
    getDate: function () {
        return this.dateField.val();
    },
    setDate: function (date, noNotify) {
        this.dateField.val(date);
        if (noNotify !== true) {
            this.dateField.change();
        }
    },
    getTime: function () {
        return this.timeField.val();
    },
    setTime: function (time, noNotify) {
        if (time !== null && time.length > 4) {
            this.timeField.val(time);
            if (noNotify !== true) {
                this.timeField.change();
            }
        }
    },
    isValid: function () {
        return new DateTime().loadFromScreen().isValid();
    },
    isEmpty: function () {
        return this.dateField == null;
    },
    addListener: function(listener) {
        this.listeners.push(listener);
    },
    removeListener: function(listener) {
        this.listeners.remove(listener);
    },
    showInvalidTimeAlert: function () {
        this.timeField.focus();
        alert('The time ' + this.getTime() + ' is not valid.');
    }
};

/*
Represents any date as a date string in the form 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'
and a time string in the form 'HH:MM'. A blank/empty time is valid.
 */
function DateTime () {
    this.date = null;
    this.time = null;
    this.verbatimDate = "";
}

DateTime.prototype.isValid = function () {
    return hasValue(this.date);
    // TODO check format of date
    // TODO check format of time
};

DateTime.prototype.storageDateToScreen = function (storageDate) {
    switch (storageDate.length) {
        case 4: return storageDate;  // year only
        case 7: return storageDate.substr(5,2) + '-' + storageDate.substr(0,4);
        case 10: return storageDate.substr(8,2) + '-' + storageDate.substr(5,2) + '-' + storageDate.substr(0,4);
        default: return "";
    }
};

DateTime.prototype.screenDateToStorage = function (screenDate) {
    switch (screenDate.length) {
        case 4: return screenDate;  // year only
        case 7: return screenDate.substr(3,4) + '-' + screenDate.substr(0,2);
        case 10: return screenDate.substr(6,4) + '-' + screenDate.substr(3,2) + '-' + screenDate.substr(0,2);
        default: return "";
    }
};

// screen format id dd-mm-yyyy
DateTime.prototype.getDateForScreen = function () {
    return (this.isValid() ? this.storageDateToScreen(this.date) : "");
};

DateTime.prototype.getTimeForScreen = function () {
    return this.time;//isValid() ? this.time.slice(0,5) : "";
};

// @param date - string in the form dd-mm-yyyy
// @param time - string in the form hh:mm
DateTime.prototype.set = function (date, time) {
    this.date = this.screenDateToStorage(date);
    this.time = time;
    return this;
};

DateTime.prototype.getEvent = function () {
    return {
        eventDate: this.date,
        eventTime: this.time
    }
};

DateTime.prototype.setFromExifFormat = function (dateStr) {
    // exif format example is "2012:03:21 19:51:53"
    if (!dateStr) { return {}; }
    var dt = dateStr.split(' ');
    this.date = dt[0];
    this.time = dt[1];
    // discard seconds
    if (this.time.length > 5) {
        this.time = this.time.slice(0,5);
    }
    this.verbatimDate = dateStr;
    return this;
};

DateTime.prototype.setFromStoredFormat = function (dateStr, timeStr) {
    if (!dateStr) { return {}; }
    this.verbatimDate = dateStr;
    // assume one of YYYY, YYYY-MM, YYYY-MM-DD
    this.date = dateStr;
    if (typeof timeStr !== 'undefined') {
        if (timeStr !== null && timeStr.length >= 5) {
            this.time = timeStr;
        }
    }
    return this;
};

DateTime.prototype.setFromIsoFormat = function (dateStr) {
    // iso format example is "2005-10-22T03:08:18Z"
    // TODO: use a date library
    if (!dateStr) { return {}; }
    if (dateStr.length !== 20) {
        alert("invalid iso date " + dateStr);
        return this;
    }
    var dt = dateStr.split('T');
    this.date = dt[0];
    this.time = dt[1].slice(0,5);
    this.verbatimDate = dateStr;
    return this;
};

DateTime.prototype.loadFromScreen = function () {
    this.date = this.screenDateToStorage(screenDate.getDate());
    this.time = screenDate.getTime();
    return this;
};

DateTime.prototype.putToScreen = function (noNotify) {
    screenDate.setDate(this.getDateForScreen(), noNotify);
    screenDate.setTime(this.getTimeForScreen(), noNotify);
    return this;
};

DateTime.prototype.compare = function (dat) {
    var conflicts = [];
    if (dat.isValid() && this.isValid() && dat.date != this.date) {
        conflicts.push('date');
    }
    if (dat.isValid() && this.isValid() && dat.time != this.time) {
        conflicts.push('time');
    }
    return conflicts;
};

DateTime.prototype.isSame = function (dat) {
    return !(dat === undefined || dat.date != this.date || dat.time != this.time);
};

DateTime.prototype.validateTime = function () {
    // expects nn:nn as string or empty string or null
    var hours, minutes;
    if (this.time === null || this.time === '') {
        return true;
    }
    if (this.time.length !== 5) {
        return false;
    }
    try {
        hours = parseInt(this.time.substr(0,2));
        minutes = parseInt(this.time.substr(3,2));
    } catch (e) {
        return false;
    }
    return hours >= 0 && hours <=23 && minutes >= 0 && minutes <= 59
};

function numDecimalPlaces (x, dec_sep) {
    var tmp = x.toString(),
        sep = dec_sep || '.';
    if (tmp.indexOf(sep)>-1)
        return tmp.length-tmp.indexOf(sep)-1;
    else
        return 0;
}

function limit (num, places) {
    var max = places || 7;
    if (num !== NaN) {
        if (numDecimalPlaces(num) > max) {
            return num.toFixed(max);
        }
    }
    return num;
}
