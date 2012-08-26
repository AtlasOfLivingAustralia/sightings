<!DOCTYPE HTML>
<html>
<head>
    <title>View my sighting | Atlas of Living Australia</title>
    <meta name="layout" content="ala" />
    <!-- Shim to make HTML5 elements usable in older Internet Explorer versions -->
    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <script src="http://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>
    <!-- App specific styles -->
    <r:script disposition="head">
        var serverUrl = "${grailsApplication.config.grails.serverURL}",
            bieUrl = "${grailsApplication.config.bie.baseURL}",
            userId = "mark.woolston@csiro.au",
            recordsServerUrl = serverUrl + "/proxy/submitRecord/",
            bookmarkServerUrl = "${grailsApplication.config.ala.locationBookmarkServerURL}";
    </r:script>
    <r:require module="jQueryUI"/>
    <r:require module="jQueryCookie"/>
    <r:require module="applicationMin"/>
    <r:layoutResources/>
</head>
<body>
    <div class="inner">
        <div class="page-header">
            <h1>My sightings</h1>
        </div>
        <section id="mySightings">
            <g:each in="${records}" var="rec">
                <section class="record" id="${rec.id}">
                    <div class="what">
                        <span class="scientificName">${rec.scientificName}</span><br/>
                        <span class="commonName">${rec.commonName}</span><br/>
                        <g:if test="${rec.quantity > 1}">${rec.quantity}</g:if>
                        %{--<span class="id">${rec.id}</span>--}%
                    </div>
                    <div class="when">
                        <span class="date">${rec.eventDate}</span>
                    </div>
                    <div class="where">
                        <span class="lat">Lat: ${rec.decimalLatitude}</span>
                        <span class="lng">Lng: ${rec.decimalLongitude}</span><br/>
                    </div>
                    <div class="actions">
                        <button type="button" class="delete">Remove</button>
                        <button type="button" class="edit">Edit</button>
                    </div>
                </section>
            </g:each>
        </section>
        <section style="padding-bottom:20px;margin-left:10px;">
            <a href="${grailsApplication.config.grails.serverURL}/upload/demo/">Add another sighting</a>
        </section>
    </div>
    <r:script>
        $(function() {
            $('.delete').click(function () {
                var id = $(this).parents('section').attr('id');
                document.location.href = "${grailsApplication.config.grails.serverURL}/records/delete/" + id;
            })
        });
    </r:script>
    <r:layoutResources/>
</body>
</html>