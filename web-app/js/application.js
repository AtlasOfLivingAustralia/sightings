if (typeof jQuery !== 'undefined') {
	(function($) {
		$('#spinner').ajaxStart(function() {
			$(this).fadeIn();
		}).ajaxStop(function() {
			$(this).fadeOut();
		});
	})(jQuery);
}

$(function() {

    //  for taxon lookups
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
        $("#scientificName").html(name);
        // and guid
        $('#lsid').val(guid);
        // get some metadata for the preferred common name and the pic
        $.ajax({
            url: bieUrl + "species/shortProfile/" + guid + ".json",
            dataType: 'jsonp',
            success: function(data) {
                var commonName = data.commonName || "",
                    thumbnail = data.thumbnail || (serverUrl + "/images/noImage85.jpg");
                $("#commonName").html(commonName);
                $('#taxonImage').attr('src', thumbnail);
                $('#taxonImage').parent().attr('href', bieUrl + "species/" + guid);
            }
        });
    }
};
