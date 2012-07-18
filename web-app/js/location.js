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
 * Javascript to manage location and date definitions.
 *
 * User: markew
 * Date: 16/07/12
 */
/* Manages locations --------------------------------------------------------------- */
$(function() {
    var currentLocation = new Location();
});

function Location () {
    this.decimalLatitude = null;
    this.decimalLongitude = null;
    this.verbatimLatitude = "";
    this.verbatimLongitude = "";
    this.locality = "";
    this.usingReverseGeocodedLocality = "false";
    this.coordinateSource = "";
    this.geodeticDatum = "";
    this.physicalMapScale = "";
    this.otherSource = "";
}

Location.prototype.isValid = function () {
    return hasValue(this.decimalLatitude) && hasValue(this.decimalLongitude);
};

Location.prototype.numDecimalPlaces = function (x, dec_sep) {
    var tmp = x.toString();
    if (tmp.indexOf(dec_sep)>-1)
        return tmp.length-tmp.indexOf(dec_sep)-1;
    else
        return 0;
};

Location.prototype.isDecimalDegrees = function (x) {
    return !(x === undefined || isNaN(x));
};

Location.prototype.isDegMinSec = function (o) {
    return $.isArray(o.lat) && $.isArray(o.lng);
};

Location.prototype.degMinSecToString = function (num, ref) {
    var sign = (ref === 'S' || ref === 'W') ? "-" : "";
    return sign + num[0] + " " + num[1] + " " + num[2];
};

Location.prototype.toDecimalDegrees = function (num, ref) {
    // expect num to be an array of length 3
    if (num.length !== 3) { return 0 }
    //console.log(num[0] + " " + num[1] + " " + num[2]);
    var degrees = num[0],
            minutes = num[1],
            seconds = num[2],
            // determine the num decimal places of minutes and seconds (so we don't artificially add 'accuracy')
            minutesPlaces = this.numDecimalPlaces(minutes,'.'),
            secondsPlaces = this.numDecimalPlaces(seconds,'.'),
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
    if (ref === 'S' || ref === 'W') {
        degrees = -degrees;
    } else {
        degrees = +degrees;
    }
    return degrees;
};

Location.prototype.set = function (data) {
    var that = this;
    $.each(['locality','coordinateSource','geodeticDatum','physicalMapScale','otherSource'], function (i,prop) {
        if (data[prop] !== undefined) {
            that[prop] = data[prop];
        }
    });
    if (data.latLng !== undefined) {
        if (this.isDegMinSec(data.latLng)) {
            this.verbatimLatitude = this.degMinSecToString(data.latLng.lat, data.latLng.latRef);
            this.verbatimLongitude = this.degMinSecToString(data.latLng.lng, data.latLng.lngRef);
            this.decimalLatitude = this.toDecimalDegrees(data.latLng.lat, data.latLng.latRef);
            this.decimalLongitude = this.toDecimalDegrees(data.latLng.lng, data.latLng.lngRef);
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
    this.decimalLatitude = $('#latitude').val();
    this.decimalLongitude = $('#longitude').val();
    this.verbatimLatitude = $('#verbatimLatitude').val();
    this.verbatimLongitude = $('#verbatimLongitude').val();
    this.locality = $('#location').val();
    this.usingReverseGeocodedLocality = $('#usingReverseGeocodedLocality').val();
    this.coordinateSource = $('#coordinateSource').val();
    this.geodeticDatum = $('#datum').val();
    if (this.coordinateSource === 'physical map') {
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
    this.coordinateSource = bkm.coordinateSource;
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
    $.each(['verbatimLatitude','verbatimLongitude','coordinateSource','geodeticDatum',
        'otherSource'], function (i,prop) {
        if (that[prop] !== "") {
            bkm[prop] = that[prop];
        }
    });
    if (this.coordinateSource === 'physical map') {
        bkm.physicalMapScale = this.physicalMapScale;
    }
    return bkm;
};

Location.prototype.putToScreen = function () {
    $('#latitude').val(this.decimalLatitude).change();
    $('#longitude').val(this.decimalLongitude).change();
    $('#verbatimLatitude').val(this.verbatimLatitude).change();
    $('#verbatimLongitude').val(this.verbatimLongitude).change();
    $('#location').val(this.locality).change();
    $('#usingReverseGeocodedLocality').val(this.usingReverseGeocodedLocality).change();
    $('#coordinateSource').val(this.coordinateSource).change();
    $('#datum').val(this.geodeticDatum).change();
    $('#physicalMap').val(this.physicalMapScale).change();
    $('#otherSource').val(this.otherSource).change();
    return this;
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

function hasValue(x) {
    return (x !== undefined) && (x !== null) && (x !== "") && (x !== [])
}

/* Manages the current date and time --------------------------------------------------------------- */
function DateTime () {
    this.year = null;
    this.month = null;
    this.day = null;
    this.time = null;
    this.verbatimDate = "";
}

DateTime.prototype.isValid = function () {
    return hasValue(this.year) && hasValue(this.month) && hasValue(this.day) && hasValue(this.time);
};

DateTime.prototype.getDateForScreen = function () {
    console.log(this.isValid());
    if (this.isValid()) {
        return this.day + "-" + this.month + "-" + this.year;
    } else {
        return "";
    }
    //return (this.isValid() ? (this.day + "-" + this.month + "-" + this.year) : "");
};

DateTime.prototype.getTimeForScreen = function () {
    return this.time;//isValid() ? this.time.slice(0,5) : "";
};

DateTime.prototype.setFromExifFormat = function (dateStr) {
    // exif format example is "2012:03:21 19:51:53"
    if (!dateStr) { return {}; }
    var dt = dateStr.split(' ');
    this.year = dt[0].slice(0,4);
    this.month = dt[0].slice(5,7);
    this.day = dt[0].slice(8,10);
    this.time = dt[1];
    this.verbatimDate = dateStr;
    return this;
};

DateTime.prototype.loadFromScreen = function () {
    var date = $('#date').val(),
        bits;
    if (date !== "") {
        bits = date.split('-');
        this.year = bits[2];
        this.month = bits[1];
        this.day = bits[0];
    }
    this.time = $('#time').val();
    return this;
};

DateTime.prototype.putToScreen = function () {
    var d = this.getDateForScreen();
    var t = this.getTimeForScreen();
    $('#date').val(this.getDateForScreen());
    $('#time').val(this.getTimeForScreen());
    return this;
};

DateTime.prototype.compare = function (dat) {
    var conflicts = [];
    if (dat.isValid() && this.isValid() && dat.year != this.year && dat.month != this.month && dat.day != this.day) {
        conflicts.push('date');
    }
    if (dat.isValid() && this.isValid() && dat.time != this.time) {
        conflicts.push('time');
    }
    return conflicts;
};
