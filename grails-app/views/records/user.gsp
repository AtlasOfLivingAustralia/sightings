<%@ page import="org.codehaus.groovy.grails.web.json.JSONObject" %>
<!DOCTYPE HTML>
<html>
<head>
    <title>${sightingsOwner}<g:if test="${otherUsersSightings}">'s</g:if> sightings | Atlas of Living Australia</title>
    <meta name="layout" content="ala"/>
    <!-- Shim to make HTML5 elements usable in older Internet Explorer versions -->
    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <script src="http://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>
    <!-- App specific styles -->
    <r:script disposition="head">
        var serverUrl = "${grailsApplication.config.grails.serverURL}",
            bieUrl = "${grailsApplication.config.bie.baseURL}",
            biocacheUrl = "${grailsApplication.config.biocache.baseURL}",
            userId = "${userId}",
            recordsServerUrl = serverUrl + "/proxy/submitRecord/",
            bookmarkServerUrl = "${grailsApplication.config.ala.locationBookmarkServerURL}";
    </r:script>
    <r:require module="jQueryUI"/>
    <r:require module="jQueryCookie"/>
    <r:require module="bbq"/>
    <r:require module="applicationMin"/>
    <r:layoutResources/>
</head>

<body>
<div class="inner">
    <div class="rightfloat">
        <a href="${grailsApplication.config.grails.serverURL}" class="button orange" title="Record a sighting">Record a sighting</a>
    </div>
    <div class="page-header">
        <h1>${sightingsOwner}<g:if test="${otherUsersSightings}">'s</g:if> sightings</h1>

        <p>
            <g:if test="${usersSightings}">
               This is a simple list of the sightings you have submitted.
               You can filter, sort and map sightings using the Atlas's
               <a href="${grailsApplication.config.biocache.baseURL}occurrences/search?q=data_resource_uid:dr364&fq=alau_user_id:${userId}">occurrence explorer</a>.</p>

            </g:if>
            <g:elseif test="${otherUsersSightings}">
                This is a simple list of the sightings ${sightingsOwner} has submitted.
                 You can filter, sort and map sightings using the Atlas's
                 <a href="${grailsApplication.config.biocache.baseURL}occurrences/search?q=data_resource_uid:dr364&fq=alau_user_id:${userId}">occurrence explorer</a>.</p>
            </g:elseif>
            <g:else test="${recentSightings}">
                This is a simple list of the sightings submitted recently by users.
                 You can filter, sort and map sightings using the Atlas's
                 <a href="${grailsApplication.config.biocache.baseURL}occurrences/search?q=data_resource_uid:dr364">occurrence explorer</a>.</p>
            </g:else>
    </div>
    <section id="sortControls">
        <div class="what">Identification</div>
        <div class="when">Observation date</div>
        <div class="whereTitle">Location</div>
        <div class="sort">
            <label for="sortBy">Sort by</label>
            <g:select name="sortBy" from="['scientific name','common name','observation date','date created',
            'last updated','locality','identification confidence']"
            keys="['scientificName','commonName','eventDate','dateCreated',
                    'lastUpdated','locality','confidence']" value="dateCreated"/>
            <div id="sortOrder">
                <r:img id="sort-asc" dir="images/skin" file="sorted_asc.gif"/>
                <r:img id="sort-desc" dir="images/skin" file="sorted_desc.gif"/>
            </div>
        </div>
        %{--<div class="notes">Remarks</div>--}%
    </section>
    <section id="mySightings">
        <g:each in="${records}" var="rec">
            <section class="record" id="${rec.id}">

                <div class="what">
                    <span class="scientificName">${rec.scientificName}</span><br/>
                    <span class="commonName">${rec.commonName}</span><br/>
                    <g:if test="${rec.individualCount && rec.individualCount.isNumber() && rec.individualCount.toInteger() > 1}">
                        <span class="individualCount">
                            ${rec.individualCount}
                            ${rec.individualCount && rec.individualCount.isNumber()  && rec.individualCount.toInteger() == 1 ? 'individual' : 'individuals'}
                            recorded
                        </span><br>
                    </g:if>
                    <g:if test="${rec.identificationVerificationStatus != 'Confident'}">
                        <span>Identification ${rec.identificationVerificationStatus}</span><br>
                    </g:if>
                </div>

                <div class="when">
                    <g:if test="${rec.eventDate && rec.eventDate != JSONObject.NULL}">
                        <span class="event-date">Observation: <b>${rec.eventDate}
                            ${rec.eventTime != JSONObject.NULL ? rec.eventTime : ''}</b></span><br/>
                    </g:if>
                    <g:if test="${showUser}">
                        <span class="submitted-by">Recorded by:
                            <g:link mapping="spotter" params="[userId:rec.userId]">${rec.userDisplayName}</g:link>
                        </span>
                        <br/>
                    </g:if>
                    <span class="created">Added: <prettytime:display date="${new Date().parse("yyyy-MM-dd'T'HH:mm:ss'Z'", rec.dateCreated)}" /></span>
                </div>

                <div class="where">
                    <g:if test="${rec.decimalLatitude != JSONObject.NULL && rec.decimalLatitude != 'null'}">
                        <span class="locality">${rec.locality}</span><br>
                        <span class="lat">Lat: ${rec.decimalLatitude}</span><br>
                        <span class="lng">Lng: ${rec.decimalLongitude}</span><br>
                        <g:if test="${rec.georeferenceProtocol}">
                            <span class="source">Coord source: ${rec.georeferenceProtocol}</span><br>
                        </g:if>
                        <g:if test="${rec.georeferenceProtocol == 'GPS device'}">
                            <span>Geodetic datum: ${rec.geodeticDatum}</span><br>
                        </g:if>
                        <g:if test="${rec.georeferenceProtocol == 'physical map'}">
                            <span>Physical map scale: ${rec.physicalMapScale}</span><br>
                        </g:if>
                        <g:if test="${rec.georeferenceProtocol == 'other'}">
                            <span>Other protocol: ${rec.otherSource}</span><br>
                        </g:if>
                    </g:if>
                </div>

                <div class="actions">
                    <!--Record UserID: ${rec.userId}, UserId: ${userId} -->
                    <g:if test="${isAdmin || (rec.userId == userId && !otherUsersSightings)}">
                        <button type="button" class="delete">Remove</button>
                        <button type="button" class="edit">Edit</button><br/>
                    </g:if>

                    <g:if test="${rec.images && rec.images?.size() > 0}">
                        <g:each in="${rec.images[0..-1]}" var="img">
                            <img src="${img.thumb}"/>
                        </g:each>
                    </g:if>
                </div>

                <div class="extraMedia">
                </div>
                <div class="expandedView">
                </div>

            </section>
        </g:each>
    </section>
    <section style="padding-bottom:20px;margin-left:10px;">
        <a href="${grailsApplication.config.grails.serverURL}/">Add another sighting</a>
    </section>
</div>
<script type="text/javascript">
    // wrap as a jQuery plugin and pass jQuery in to our anoymous function
    (function ($) {
        $.fn.cross = function (options) {
            return this.each(function (i) {
                // cache the copy of jQuery(this) - the start image
                var $$ = $(this);

                // get the target from the backgroundImage + regexp
                var target = $$.css('backgroundImage').replace(/^url|[\(\)'"]/g, '');

                // nice long chain: wrap img element in span
                $$.wrap('<span style="position: relative;"></span>')
                    // change selector to parent - i.e. newly created span
                    .parent()
                    // prepend a new image inside the span
                    .prepend('<img>')
                    // change the selector to the newly created image
                    .find(':first-child')
                    // set the image to the target
                    .attr('src', target);

                // the CSS styling of the start image needs to be handled
                // differently for different browsers
                if ($.browser.msie || $.browser.mozilla) {
                    $$.css({
                        'position' : 'absolute',
                        'left' : 0,
                        'background' : '',
                        'top' : this.offsetTop
                    });
                } else if ($.browser.opera && $.browser.version < 9.5) {
                    // Browser sniffing is bad - however opera < 9.5 has a render bug
                    // so this is required to get around it we can't apply the 'top' : 0
                    // separately because Mozilla strips the style set originally somehow...
                    $$.css({
                        'position' : 'absolute',
                        'left' : 0,
                        'background' : '',
                        'top' : "0"
                    });
                } else { // Safari
                    $$.css({
                        'position' : 'absolute',
                        'left' : 0,
                        'background' : ''
                    });
                }

                // similar effect as single image technique, except using .animate
                // which will handle the fading up from the right opacity for us
                $$.hover(function () {
                    $$.stop().animate({
                        opacity: 0
                    }, 250);
                }, function () {
                    $$.stop().animate({
                        opacity: 1
                    }, 250);
                });
            });
        };
    })(jQuery);

</script>


<r:script>
    $(function() {
        // set sort widget from url
        var params = $.deparam.querystring();
        if (params.sort) {
            $('#sortBy').val(params.sort);
        }
        // handle sort change
        $('#sortBy').change(function () {
            document.location.href = $.param.querystring(document.location.href, {sort: $(this).val()});
        });
        // handle order change
        $('#sort-desc, #sort-asc').click(function () {
            var params = {
                order: ($(this).attr('id') === 'sort-desc') ? 'desc' : 'asc',
                sort: $('#sortBy').val()
            };
            document.location.href = $.param.querystring(document.location.href, params);
        });
        // handle deletes
        $('.delete').click(function () {
            var id = $(this).parents('section').attr('id');
            document.location.href = "${grailsApplication.config.grails.serverURL}/records/delete/" + id;
        });
        // handle edits
        $('.edit').click(function () {
            var id = $(this).parents('section').attr('id');
            document.location.href = "${grailsApplication.config.grails.serverURL}/upload/edit/" + id;
        });

        $('.record').click(function () {
            var recordId = $(this).attr("id");
            $.ajax({
                url: "http://fielddata.ala.org.au/record/" + $(this).attr("id"),
                method: 'GET',
                dataType: 'jsonp',
                success: function (data) {
                   var text = '';
                   var hasImages = (data.record.images && data.record.images.length>0);
                   if(hasImages){
                    text += '<div class="largeImage"><img src="' + data.record.images[0].large +'"/></div>';
                   }
                   if(data.record.locality){
                    if(hasImages) text += '<div class="additionalInformation2Col">';
                    else text += '<div class="additionalInformation">';
                    var mapImage1 = 'http://maps.googleapis.com/maps/api/staticmap?center='+data.record.decimalLatitude+','+data.record.decimalLongitude+'&zoom=10&size=250x250\
&markers=size:large%7Ccolor:ref%7C'+data.record.decimalLatitude+','+data.record.decimalLongitude+'&sensor=false&maptype=hybrid';
                    var mapImage2 = 'http://maps.googleapis.com/maps/api/staticmap?center='+data.record.decimalLatitude+','+data.record.decimalLongitude+'&zoom=6&size=250x250\
&markers=size:large%7Ccolor:ref%7C'+data.record.decimalLatitude+','+data.record.decimalLongitude+'&sensor=false&maptype=hybrid';
                    text += '<img id="mapImage-'+ recordId +'"class="zoomedInMap" src="'+ mapImage2 + '" style="background:url(' + mapImage1 + ')"/>';
                    text += '<br/>';
                    text += '<span class="additionLabel">Locality:</span> ' + data.record.locality +'<br/>';
                    text += '</div>';
                   }
                   $('#' + recordId).find(".expandedView").html(text);
                   $('#mapImage-' + recordId).cross();
                },
                error: function(data){
                    console.log("Error retrieving record details: " + data);
                    console.log( data);
                }
            });
        });
    });
</r:script>
<r:layoutResources/>
</body>
</html>