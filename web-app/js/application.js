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
        // remove name from autocomplete widget
        $(".name_autocomplete").val("");
    });

    $('#undoTaxon').click(function () {
        taxonStack.pop();
    });

});
