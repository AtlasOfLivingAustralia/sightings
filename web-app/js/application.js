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

    // wire coordinate source
    $('#coordinateSource').change(function () {
        // hide all
        $('#precisionFields span').css('display','none');
        // show one
        switch ($(this).val()) {
            case 'GPS device': $('#datum').css('display','inline'); break;
            case 'physical map': $('#physicalMap').css('display','inline'); break;
            case 'other': $('#otherSource').css('display','inline'); break;
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

    // catch changes in lat and lon
    $('#latitude').change(function () {
        smallMap.setLat($(this).val());
    });
    $('#longitude').change(function () {
        smallMap.setLng($(this).val());
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
            draggableCursor: 'pointer',
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            zoom: 2,
            center: this.centre
        };

        this.map = new google.maps.Map(document.getElementById(containerId), options);
        this.latLine.setMap(this.map);
        this.lngLine.setMap(this.map);

        google.maps.event.addListener(this.map, 'click', function () {
            alert("Show big map");
        });
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
}