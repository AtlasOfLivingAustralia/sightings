<%@ page import="org.codehaus.groovy.grails.web.json.JSONObject" %>
<!DOCTYPE HTML>
<html>
<head>
    <title>View my sighting | Atlas of Living Australia</title>
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
    <div class="page-header">
        <h1>${sightingsOwner} sightings</h1>
        <p>
            <g:if test="${usersSightings}">
               This is a simple list of the sightings you have submitted.
            </g:if>
            <g:elseif test="${otherUsersSightings}">
                This is a simple list of the sightings this user has submitted.
            </g:elseif>
            <g:else test="${recentSightings}">
                This is a simple list of the sightings submitted recently by users.
            </g:else>
             You can filter, sort and map sightings using the Atlas's
        <a href="${grailsApplication.config.biocache.baseURL}occurrences/search?q=data_resource_uid:dr364">occurrence explorer</a>.</p>
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
                %{--<div class="media">
                        <g:if test="${rec.images}">
                            <img src="${rec.images[0].thumb}"/>
                        </g:if>
                    </div>--}%
                <div class="what">
                    <span class="scientificName">${rec.scientificName}</span><br/>
                    <span class="commonName">${rec.commonName}</span><br/>
                    <g:if test="${rec.individualCount && rec.individualCount.isNumber() && rec.individualCount.toInteger() > 1}">
                        <span class="individualCount">${rec.individualCount}
                            ${rec.individualCount && rec.individualCount.isNumber()  && rec.individualCount.toInteger() > 1 ? 'individuals' : 'individual'}
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
                    <span class="last-updated">Edited: <si:formatDate date="${rec.lastUpdated}"/></span><br/>
                    <span class="created">Created: <si:formatDate date="${rec.dateCreated}"/></span>
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
                    <g:if test="${isAdmin || rec.userId == userId }">
                        <button type="button" class="delete">Remove</button>
                        <button type="button" class="edit">Edit</button><br/>
                    </g:if>

                    <g:if test="${rec.images && rec.images?.size() > 0}">
                        <g:each in="${rec.images[0..-1]}" var="img">
                            <a href="${img.large}">
                                <img src="${img.thumb}"/>
                            </a>
                        </g:each>
                    </g:if>
                </div>

                <div class="extraMedia">
                </div>
            </section>
        </g:each>
    </section>
    <section style="padding-bottom:20px;margin-left:10px;">
        <a href="${grailsApplication.config.grails.serverURL}/">Add another sighting</a>
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
    });
</r:script>
<r:layoutResources/>
</body>
</html>