<%@ page import="org.codehaus.groovy.grails.web.json.JSONObject" contentType="text/html;charset=UTF-8" %>
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
                <g:link mapping="spotter" params="[spotterId:rec.userId]">${rec.userDisplayName}</g:link>
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
        <g:if test="${isAdmin || ( (rec.userId == userId || rec.userId == loggedInUser) && !otherUsersSightings)}">
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