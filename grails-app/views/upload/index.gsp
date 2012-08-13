<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<!DOCTYPE HTML>
<html>
<head>
    <title>Report a sighting | Atlas of Living Australia</title>
%{--    <meta name="viewport" content="width=device-width">--}%
    <meta name="layout" content="ala" />
    <!-- Bootstrap CSS Toolkit styles -->
    %{--<link rel="stylesheet" href="http://blueimp.github.com/cdn/css/bootstrap.min.css">--}%
    <!-- Bootstrap styles for responsive website layout, supporting different screen sizes -->
    <link rel="stylesheet" href="http://blueimp.github.com/cdn/css/bootstrap-responsive.min.css">
    <!-- Bootstrap CSS fixes for IE6 -->
    <!--[if lt IE 7]><link rel="stylesheet" href="http://blueimp.github.com/cdn/css/bootstrap-ie6.min.css"><![endif]-->
    <!-- Bootstrap Image Gallery styles -->
    <link rel="stylesheet" href="http://blueimp.github.com/Bootstrap-Image-Gallery/css/bootstrap-image-gallery.min.css">
    <!-- Shim to make HTML5 elements usable in older Internet Explorer versions -->
    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <script src="http://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>
    <!-- App specific styles -->
    <r:script disposition="head">
        var serverUrl = "${ConfigurationHolder.config.grails.serverURL}",
            bieUrl = "${ConfigurationHolder.config.bie.baseURL}",
            userId = "mark.woolston@csiro.au",
            bookmarkServerUrl = "${ConfigurationHolder.config.ala.locationBookmarkServerURL}";
    </r:script>
    <r:require module="application"/>
    <r:require module="jQueryImageUpload"/>
    <r:require module="jQueryUI"/>
    <r:require module="jQueryCookie"/>
    <r:require module="jQueryTimeEntry"/>
    <r:require module="exif"/>
    <r:layoutResources/>
</head>
<body>
<div class="inner">
    <div class="page-header">
        <h1>Report a sighting</h1>
        <p class="hint">Hint: If you are submitting images, select them first and we will try to pre-load the date
        and location fields from the image metadata.</p>
    </div>
    <!-- WHAT -->
    <div class="heading ui-corner-left"><h2>What</h2><r:img uri="/images/what.png"/></div>
    <section class="sightings-block ui-corner-all">
        <a href="http://bie.ala.org.au/species/Notomys fuscus" target="_blank">
            <r:img id="taxonImage" class="taxon-image ui-corner-all" uri="/images/Notomys-fuscus.jpg"/>
        </a>
        <div class="left" style="width:53%;padding-top:15px;">
            <span class="scientificName">Notomys fuscus</span>
            <span class="commonName">Dusky Hopping-mouse</span>
            <div style="padding-top:10px;">
                <div style="float:left;padding-right:20px;"><label for="count">Number seen</label><g:textField name="count" style="width:40px;text-align:right;" value="1"/></div>
                <div style="float:left;"><label for="confidence">Confidence in identification</label><g:select from="['Confident','Uncertain']" name="confidence" value="1"/></div>
            </div>
        </div>
        <div class="left" style="width:35%;">
            <p>Not the right species? To change identification, type a scientific or common name into
            the box below and choose from the auto-complete list.</p>
            <input type="text" value="" id="taxa" name="taxonText" class="name_autocomplete ac_input" style="width:75%" autocomplete="off">
            <input type="hidden" name="lsid" id="lsid" value="urn:lsid:biodiversity.org.au:afd.taxon:dbb2125e-bf71-4388-b129-562e4d7a8eb4">
            <button class="ui-state-disabled" type="button" id="undoTaxon" disabled="disabled">Undo</button>
        </div>
    </section>
    <!-- WHEN -->
    <div class="heading ui-corner-left"><h2>When</h2><r:img uri="/images/when.png"/></div>
    <section class="sightings-block ui-corner-all">
        <div class="left" style="margin-top: 10px;width:40%;">
            <p><label for="date">Date</label> <input type="text" id="date"></p>
            <p>Click in the date field to pick from a calendar or just type in the date in
            dd-mm-yyy format.</p>
        </div>
        <div class="left" style="margin-top: 10px;margin-left:30px;width:54%;">
            <p><label for="time">Time</label> <input type="text" id="time" size="10"></p>
            <p>Type in the time (hh:mm 24hr clock) or use the time spinner. The centre dot sets the current time.
            Left/right arrows change the field. Up/down arrows change the values.</p>
        </div>
    </section>
    <!-- WHERE -->
    <div class="heading ui-corner-left"><h2>Where</h2><r:img uri="/images/where.png"/></div>
    <section class="sightings-block ui-corner-all">
        <div class="left" id="location-container">
            <div class="left">
                <label for="location" style="vertical-align:top;">Type in a description of the location.</label><br/>
                <g:textArea class="left" name="location" rows="5" cols="30"/>
            </div>
            <div class="left" id="symbol">
                <span id="reverseLookup" class="symbol" title="Lookup coordinates from description">&raquo;</span><br/>
                <span id="lookup" class="symbol" title="Lookup description from coordinates">&laquo;</span><br/>
            </div>
            <div style="clear:both;">
                <label for="locationBookmarks" class="minor">Choose from a bookmarked location.</label><br/>
                <g:select name="locationBookmarks" from="['Loading bookmarks..']"
                 keys="['loading']" noSelection="[null:'bookmarked locations']"/>
                <button type="button" id="saveBookmarkButton">Bookmark current location</button>
                <button type="button" id="manageBookmarksButton">Manage bookmarks</button>
            </div>
        </div>
        <div class="left" id="coordinate-container">
            <span>Enter coordinates (decimal degrees) if you already have them.</span><br/>
            <label for="latitude">Latitude</label><g:textField name="latitude" size="17"/>
            <label for="longitude">Longitude</label><g:textField name="longitude" size="17"/><br/>
            <g:hiddenField name="verbatimLatitude"/>
            <g:hiddenField name="verbatimLongitude"/>
            <g:hiddenField name="usingReverseGeocodedLocality" value="false"/>
            <label for="coordinateSource">What is the source of these coordinates?</label>
            <g:select name="coordinateSource" from="['Google maps','Google earth','GPS device','camera/phone','physical map','other']"/><br/>
            <div id="precisionFields">
                <span id="geodeticDatumField" class="ui-helper-hidden"><label for="datum">Enter the geodetic datum for your device</label>
                    <g:select name="datum" from="['WGS84','GDA94','AGD 1966','AGD 1984','other','unknown']"/>
                    <r:img id="datumOpener" class="help" uri="/images/question_mark.jpg"/>
                </span>
                <span id="physicalMapScaleField" class="ui-helper-hidden"><label for="physicalMapScale">Enter the scale of the map</label>
                <g:select name="physicalMapScale" from="${physicalMapScales}"/></span>
                <span id="otherSourceField" class="ui-helper-hidden"><label for="otherSource">Enter the source</label>
                <g:textField name="otherSource"/>

            </div>
        </div>
        <div class="right" id="small-map-container">
            <span>Or click the map to locate.</span>
            <div id="small-map"></div>
        </div>
        <section style="clear: both;">
            <div id="main-map-container">
                <div id="main-map" style="float: left;"></div>
                <div id="map-sidebar">
                    <button type="button" id="centerOnPin">Centre map on current pin</button>
                    <button type="button" id="pinToCenter">Move pin to centre of map</button>
                    <button type="button" id="showOz">Show whole of Australia</button>
                    <button type="button" id="showWorld">Show world</button>
                    <button type="button" id="discardPin">Discard pin</button>
                    <div id="markers" style="position:absolute; top:370px; left:680px; width:200px; height:100px;">
                        <div id="m1" class="drag" style="position:absolute; left:0; width:32px; height:32px;">
                            <img src="http://maps.gstatic.com/mapfiles/ms/icons/red-dot.png" width="32" height="32" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>
    <!-- MEDIA -->
    <div class="heading ui-corner-left"><h2>Media</h2><r:img uri="/images/media.png"/></div>
    <section class="sightings-block ui-corner-all">

    <!-- The file upload form used as target for the file upload widget -->
    <g:form name="fileupload" controller="image" action="upload" method="POST" enctype="multipart/form-data">
        <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
        <div class="fileupload-buttonbar">
            <div%{-- class="span7"--}%>
                <!-- The fileinput-button span is used to style the file input field as button -->
                <span class="btn btn-success fileinput-button">
                    <i class="icon-plus icon-white"></i>
                    <button type="button" id="addImageButtonLarge">
                        <img src="${resource(dir:'images/ala',file:'add-image-4.png')}"/><br/>
                        <span>Add images</span>
                    </button>
                    <button type="button" id="addImageButtonSmall" style="display: none;">
                        <span>Add more images</span>
                    </button>
                    <input type="file" name="files" id="files" multiple>
                </span>
                <span id="autoUseContainer">
                    <input type="checkbox" id="autoUse">
                    <label for="autoUse">Always use the information embedded in selected photos.</label>
                </span>
                %{--<button type="submit" class="btn btn-primary start">
                    <i class="icon-upload icon-white"></i>
                    <span>Start upload</span>
                </button>
                <button type="reset" class="btn btn-warning cancel">
                    <i class="icon-ban-circle icon-white"></i>
                    <span>Cancel upload</span>
                </button>
                <button type="button" class="btn btn-danger delete">
                    <i class="icon-trash icon-white"></i>
                    <span>Delete</span>
                </button>
                <input type="checkbox" class="toggle">--}%
            </div>
            <!-- The global progress information -->
            <div class="span5 fileupload-progress fade">
                <!-- The global progress bar -->
                <div class="progress progress-success progress-striped active">
                    <div class="bar" style="width:0%;"></div>
                </div>
                <!-- The extended global progress information -->
                <div class="progress-extended">&nbsp;</div>
            </div>
        </div>
        <!-- The loading indicator is shown during file processing -->
        %{--<div class="fileupload-loading"></div>
        <br>--}%
        <!-- The table listing the files available for upload/download -->
        <table id="filesTable" class="table table-striped"><tbody class="files" data-toggle="modal-gallery" data-target="#modal-gallery"></tbody></table>
    </g:form>
    </section>
    <!-- NOTES -->
    <div class="heading ui-corner-left"><h2>Notes</h2><r:img uri="/images/notes.png"/></div>
    <section class="sightings-block ui-corner-all">
        <label for="notes">Notes</label><g:textArea name="notes" rows="8" cols="80"/>
    </section>
</div>
<!-- modal-gallery is the modal dialog used for the image gallery -->
<div id="modal-gallery" class="modal modal-gallery hide fade" data-filter=":odd">
    <div class="modal-header">
        <a class="close" data-dismiss="modal">&times;</a>
        <h3 class="modal-title"></h3>
    </div>
    <div class="modal-body"><div class="modal-image"></div></div>
    <div class="modal-footer">
        <a class="btn modal-download" target="_blank">
            <i class="icon-download"></i>
            <span>Download</span>
        </a>
        <a class="btn btn-success modal-play modal-slideshow" data-slideshow="5000">
            <i class="icon-play icon-white"></i>
            <span>Slideshow</span>
        </a>
        <a class="btn btn-info modal-prev">
            <i class="icon-arrow-left icon-white"></i>
            <span>Previous</span>
        </a>
        <a class="btn btn-primary modal-next">
            <span>Next</span>
            <i class="icon-arrow-right icon-white"></i>
        </a>
    </div>
</div>
<!-- Dialogs -->
<div id="datumDialog" title="Geodetic datum" class="ui-helper-hidden">
    <p>For coordinates to be correctly interpreted we must also know the spatial reference system
    under which they were collected. Many GPS devices (as well as Google maps) use WGS84. The Australian standard GDA94 is
    virtually identical. Coordinates collected under other standards must be transformed to achieve the best accuracy.</p>
</div>
<div id="locationUpdateDialog" class="dialog ui-helper-hidden">
    <p>The image you just selected contains embedded location information that is different to the values already entered.</p>
    <p>The location embedded in the image is:<br/> lat = <span id="imageLat"></span>, lng = <span id="imageLng"></span></p>
    <p>A Google lookup places this at:<br/> <span id="lookupLocality"></span></p>
    <p>Do you want to use the location from this image?</p>
</div>
<div id="dateUpdateDialog" class="dialog ui-helper-hidden">
    <p>The image you just selected contains an embedded timestamp that is different to the date and time already entered.</p>
    <table>
        <tr><th></th><th>Current value</th><th>This image</th></tr>
        <tr><td>Date and time</td><td id="currentDateTime"></td><td id="imageDateTime"></td></tr>
    </table>
    <p>Do you want to use the image date and time?</p>
</div>
<div id="manageBookmarksDialog" class="dialog ui-helper-hidden" title="Manage your location bookmarks">
    <div><ul id="bookmarksList"></ul></div>
    <div><button type="button" class="small" id="deleteAllBookmarksButton">Delete all bookmarks</button></div>
</div>
<div id="confirmationDialog" class="dialog ui-helper-hidden">
    <p></p>
</div>
<div id="messageDialog" class="dialog ui-helper-hidden">
    <p></p>
</div>
<!-- The template to display files available for upload -->
<script id="template-upload" type="text/x-tmpl">
    {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade">
        <td class="preview"><span class="fade"></span></td>
        <td class="name"><b><span class="name">{%=file.name%}</span></b><br/><span>{%=o.formatFileSize(file.size)%}</span></td>
        {% if (file.error) { %}
        <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
        {% } else if (o.files.valid && !i) { %}
        %{--<td>
            <div class="progress progress-success progress-striped active"><div class="bar" style="width:0%;"></div></div>
        </td>--}%
        <td class="imageDate">
            Date image was captured:<br/>
            <span class="imageDateTime">Not available</span><br/>
            <button type="button" class="useImageDate" disabled="disabled">Use this date</button>
        </td>
        <td class="imageLocation">
            Location image was captured:<br/>
            <span class="imageLatLng">Not available</span><br/>
            <button type="button" class="useImageLocation" disabled="disabled">Use this location</button>
        </td>
        <td class="imageInfo">
            Use all info<br/>from this image<br/>
            <button type="button" class="useImageInfo" disabled="disabled">Use both</button>
        </td>
        <td class="start">{% if (!o.options.autoUpload) { %}
            %{--<button class="btn btn-primary">
                <i class="icon-upload icon-white"></i>
                <span>{%=locale.fileupload.start%}</span>
            </button>--}%
            {% } %}</td>
        {% } else { %}
        <td colspan="2"></td>
        {% } %}
        <td class="cancel">{% if (!i) { %}
            %{--<button class="btn btn-warning">
                <i class="icon-ban-circle icon-white"></i>
                <span>{%=locale.fileupload.cancel%}</span>
            </button>--}%
            {% } %}</td>
    </tr>
    {% } %}
</script>
<!-- The template to display files available for download -->
<script id="template-download" type="text/x-tmpl">
    {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-download fade">
        {% if (file.error) { %}
        <td></td>
        <td class="name"><span>{%=file.name%}</span></td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
        {% } else { %}
        <td class="preview">{% if (file.thumbnail_url) { %}
            <a href="{%=file.url%}" title="{%=file.name%}" rel="gallery" download="{%=file.name%}"><img src="{%=file.thumbnail_url%}"></a>
            {% } %}</td>
        <td class="name">
            <a href="{%=file.url%}" title="{%=file.name%}" rel="{%=file.thumbnail_url&&'gallery'%}" download="{%=file.name%}">{%=file.name%}</a>
        </td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td colspan="2"></td>
        {% } %}
        <td class="delete">
            <button class="btn btn-danger" data-type="{%=file.delete_type%}" data-url="{%=file.delete_url%}">
                <i class="icon-trash icon-white"></i>
                <span>{%=locale.fileupload.destroy%}</span>
            </button>
            <input type="checkbox" name="delete" value="1">
        </td>
    </tr>
    {% } %}
</script>
<r:script>
    $(function() {
        var countSpinner = $("#count").spinner({min: 1});
        $("#date").datepicker({
            dateFormat: "dd-mm-yy",
            maxDate: "+0",
            appendText: " (dd-mm-yyyy)",
            numberOfMonths: 3
        });
        $('#time').timeEntry({
            spinnerImage: 'img/spinnerDefault.png',
            spinnerBigImage: 'img/spinnerDefaultBig.png',
            show24Hours: true
        });
    });
</r:script>
<!-- The Templates plugin is included to render the upload/download listings -->
<script src="http://blueimp.github.com/JavaScript-Templates/tmpl.min.js"></script>
<!-- The Load Image plugin is included for the preview images and image resizing functionality -->
<script src="http://blueimp.github.com/JavaScript-Load-Image/load-image.min.js"></script>
<!-- The Canvas to Blob plugin is included for image resizing functionality -->
<script src="http://blueimp.github.com/JavaScript-Canvas-to-Blob/canvas-to-blob.min.js"></script>
<!-- Bootstrap JS and Bootstrap Image Gallery are not required, but included for the demo -->
%{--<script src="http://blueimp.github.com/cdn/js/bootstrap.min.js"></script>
<script src="http://blueimp.github.com/Bootstrap-Image-Gallery/js/bootstrap-image-gallery.min.js"></script>--}%
<!-- The XDomainRequest Transport is included for cross-domain file deletion for IE8+ -->
<r:layoutResources/>
</body>
</html>
