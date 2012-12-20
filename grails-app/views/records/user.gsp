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
            isAdmin = ${isAdmin?:false},
            userId = "${userId}",
            recordsServerUrl = serverUrl + "/proxy/submitRecord/",
            fielddataUrl = "${grailsApplication.config.ala.recordsServerURL}",
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
    <g:set var="occurrenceExplorerLink">
        <g:if test="${usersSightings}">${grailsApplication.config.biocache.baseURL}occurrences/search?q=*:*&fq=data_resource_uid:dr364&fq=alau_user_id:${userId}</g:if>
        <g:elseif test="${otherUsersSightings}">${grailsApplication.config.biocache.baseURL}occurrences/search?q=*:*&fq=data_resource_uid:dr3644&fq=alau_user_id:${userId}</g:elseif>
        <g:else test="${recentSightings}">${grailsApplication.config.biocache.baseURL}occurrences/search?q=*:*&fq=data_resource_uid:dr364</g:else>
    </g:set>

    <div class="rightfloat">
        <span class="sightingLinks" style="padding-right: 20px;">
        <g:link mapping="mine" class="showMySightings">Show my sightings</g:link>
        |
        <g:link mapping="recent" class="showRecentSightings">Show recent sightings</g:link>
        |
        <a href="${occurrenceExplorerLink}">Occurrence explorer</a>
        </span>
        <a href="${grailsApplication.config.grails.serverURL}" class="button orange" title="Record a sighting">Record a sighting</a>
    </div>
    <div class="page-header">
        <h1>${sightingsOwner}<g:if test="${otherUsersSightings}">'s</g:if> sightings</h1>
        <p>

            <g:if test="${usersSightings}">
               This is a simple list of the sightings you have submitted.
               You can filter, sort and map sightings using the Atlas's
               <a href="${occurrenceExplorerLink}">occurrence explorer</a>.</p>
            </g:if>
            <g:elseif test="${otherUsersSightings}">
                This is a simple list of the sightings ${sightingsOwner} has submitted.
                 You can filter, sort and map sightings using the Atlas's
                 <a href="${occurrenceExplorerLink}">occurrence explorer</a>.</p>
            </g:elseif>
            <g:else test="${recentSightings}">
                This is a simple list of the sightings submitted recently by users.
                 You can filter, sort and map sightings using the Atlas's
                 <a href="${occurrenceExplorerLink}">occurrence explorer</a>.</p>
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
                    <g:if test="${rec.taxonConceptID}">
                        <span class="scientificName">
                            <a href="http://bie.ala.org.au/species/${rec.taxonConceptID}">${rec.scientificName}</a>
                        </span>
                    </g:if>
                    <g:else>
                        <span class="scientificName">
                           ${rec.scientificName}
                        </span>
                    </g:else>
                    <br/>
                    <span class="commonName">${rec.commonName}</span><br/>
                    <g:if test="${rec.individualCount && rec.individualCount.isNumber() && rec.individualCount.toInteger() > 1}">
                        <span class="individualCount">
                            ${rec.individualCount}
                            ${rec.individualCount && rec.individualCount.isNumber()  && rec.individualCount.toInteger() == 1 ? 'individual' : 'individuals'}
                            recorded
                        </span><br>
                    </g:if>
                    <g:if test="${rec.identificationVerificationStatus && rec.identificationVerificationStatus != 'Confident'}">
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
                        <button type="button" class="delete">Remove  <g:if test="${isAdmin}">[ADMIN USER]</g:if></button>
                        <button type="button" class="edit">Edit <g:if test="${isAdmin}">[ADMIN USER]</g:if></button><br/>
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
</div>

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

            //console.log("Selected record: " + recordId);
            //console.log("Has class detailsLoaded: " + $('#' + recordId).find(".expandedView").hasClass("detailsLoaded"));
            if($('#' + recordId).find(".expandedView").hasClass("detailsLoaded")){
              //console.log("Already loaded: " + recordId);
              if($('#' + recordId).find(".expandedView").is(":visible")){
                $('#' + recordId).find(".expandedView").hide('slow');
              } else {
                $('#' + recordId).find(".expandedView").show('slow');
              }
            } else {
              //console.log("Loading: " + recordId);
                $.ajax({
                    url: fielddataUrl + $(this).attr("id"),
                    method: 'GET',
                    dataType: 'jsonp',
                    success: function (data) {

                       var text = '';
                       var hasImages = (data.record.images && data.record.images.length>0);
                       if(hasImages){
                        text += '<div class="largeImage"><img src="' + data.record.images[0].large +'"/></div>';
                       }
                       if(data.record.decimalLatitude && data.record.decimalLongitude){
                        if(hasImages)
                            text += '<div class="additionalInformation2Col">';
                        else
                            text += '<div class="additionalInformation">';

                        var mapImage1 = getStaticMap(data.record.decimalLatitude, data.record.decimalLongitude, 6);
                        var mapImage2 = getStaticMap(data.record.decimalLatitude, data.record.decimalLongitude, 10);

                       // console.log("Image URL 1: " + mapImage1);
                       //console.log("Image URL 2: " + mapImage2);

                        text += '<div style="display:none;">' +
                         '<img id="mapImage-'+ recordId +'-zoomedOut" src="'+ mapImage1 + '"/>' +
                         '<img id="mapImage-'+ recordId +'-zoomedIn" src="'+ mapImage2 + '"/>' +
                         '</div>';

                        text += '<img id="mapImage-'+ recordId +'" src="'+ mapImage1 +'"/>';


                        text += '<br/>';
                        //if(hasImages)text += '<div class="sideInfo">';

                        if(data.record.locality)
                            text += '<span class="additionLabel">Locality:</span> ' + data.record.locality +'<br/>';
                        if(data.record.scientificName)
                            text += '<span class="additionLabel">Scientific name:</span> ' + data.record.scientificName +'<br/>';
                        if(data.record.commonName)
                            text += '<span class="additionLabel">Common name:</span> ' + data.record.commonName +'<br/>';
                        if(data.record.family)
                            text += '<span class="additionLabel">Family:</span> ' + data.record.family +'<br/>';

                        text += '</div>';
                       }
                       $('#' + recordId).find(".expandedView").html(text);

                       $('#mapImage-' + recordId).hover(
                            function () {
                                    $('#mapImage-'+ recordId).fadeOut(200, function() {
                                        $('#mapImage-'+ recordId).load(function() { $('#mapImage-'+ recordId).fadeIn(300); });
                                        $('#mapImage-'+ recordId).attr("src", $('#mapImage-'+ recordId + '-zoomedIn').attr("src"));
                                    });
                            },
                            function () {
                                    $('#mapImage-'+ recordId).fadeOut(200, function() {
                                        $('#mapImage-'+ recordId).load(function() { $('#mapImage-'+ recordId).fadeIn(300); });
                                        $('#mapImage-'+ recordId).attr("src", $('#mapImage-'+ recordId + '-zoomedOut').attr("src"));
                                    });
                            }
                       );

                       $('#' + recordId).find(".expandedView").addClass("detailsLoaded");

                        $('#mapImage-'+ recordId).attr('src', mapImage2);
                        $('#mapImage-'+ recordId).attr('src', mapImage1);


                      //  console.log("Image URL 1 (loaded): " + $('#mapImage-'+ recordId).attr('src'));
                        //console.log("Image URL 2 (loaded): " + $('#mapImage-'+ recordId).attr('src'));
                    },
                    error: function(data){
                        //console.log("Error retrieving record details: " + data);
                        //console.log( data);
                    }
                });
            }
        });
    });

    function getStaticMap(lat, lon, level){
      return 'http://maps.googleapis.com/maps/api/staticmap?center='+lat+','+lon+'&zoom='+level+'&size=250x250&markers=size:large%7Ccolor:ref%7C'+lat+','+lon+'&sensor=false&maptype=hybrid';
    }

</r:script>
<r:layoutResources/>
</body>
</html>