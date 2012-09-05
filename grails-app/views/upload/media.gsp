<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<!DOCTYPE HTML>
<html>
<head>
    <title>Upload media | Atlas of Living Australia</title>
    <meta name="layout" content="ala" />
    <!-- Shim to make HTML5 elements usable in older Internet Explorer versions -->
    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <script src="http://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>
    <!-- App specific styles -->
    <r:script disposition="head">
        var serverUrl = "${ConfigurationHolder.config.grails.serverURL}",
            bieUrl = "${ConfigurationHolder.config.bie.baseURL}",
            userId = "mark.woolston@csiro.au",
            guid = "${guid}",
            recordsServerUrl = serverUrl + "/proxy/submitRecord/",
            bookmarkServerUrl = "${ConfigurationHolder.config.ala.locationBookmarkServerURL}";
    </r:script>
    <r:require module="applicationMin"/>
    <r:require module="jQueryImageUpload"/>
    <r:require module="jQueryUI"/>
    <r:require module="jQueryCookie"/>
    <r:require module="jQueryTimeEntry"/>
    <r:require module="exif"/>
%{--    <r:require module="spinner"/>--}%
    <r:layoutResources/>
</head>
<body>
<div class="inner">
    <div class="page-header">
        <h1>Upload images</h1>
        <h2>It is quick and easy to upload your images and submit a record for each unique sighting.</h2>
        %{--<button type="button" id="submit">Submit images</button>--}%

        <!-- The file upload form used as target for the file upload widget -->
        <g:form name="fileupload" controller="image" action="upload" method="POST" enctype="multipart/form-data">
            <div class="fileupload-buttonbar">
                <span class="btn btn-success fileinput-button">
                   <button type="button" id="addImageButton">
                   <img src="${resource(dir:'images/ala',file:'add-image-4.png')}"/><br/>
                        <span>Add images</span>
                    </button>
                    <input type="file" name="files" id="files" multiple>
                </span>
                <p id="intro-text">Simply click the 'Add images' button and select as many images as you like. We will extract as much
                information from the image files as we can. You then fill in the rest of the information and submit all
                the records in one click.</p>
                <button type="button" id="submitImagesButton" disabled="disabled">
                    <img src="${resource(dir:'images/ala',file:'add-image-4.png')}"/><br/>
                    <span>Submit images</span>
                </button>
            </div>
            <!-- The table listing the files available for upload/download -->
            <table id="multiFilesTable" class="table table-striped multi-table">
                <thead><tr><th></th><th>Image</th><th>Identification</th><th>Date</th><th>Location</th><th></th></tr></thead>
                <tbody class="files" data-toggle="modal-gallery" data-target="#modal-gallery"></tbody>
            </table>
        </g:form>
    </div>
</div>
<!-- Dialogs -->
<!-- The template to display files available for upload -->
<script id="template-upload" type="text/x-tmpl">
    {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade" style="min-height:150px;">
        <td style="vertical-align: middle;"><input type="checkbox" class="row-check"/></td>
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
            <span class="imageDateTime">{%=file.date%}</span><br/>
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
    <tr class="record template-download fade">
        <td style="vertical-align: middle;"><input type="checkbox" class="row-check"/></td>
        {% if (file.error) { %}
        <td></td>
        <td class="name"><b><span class="name">{%=file.name%}</span></b><br/><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
        {% } else { %}
        <td class="preview">{% if (file.thumbnail_url) { %}
            <a href="{%=file.url%}" title="{%=o.formatFileSize(file.size)%}" rel="gallery" download="{%=file.name%}"><img src="{%=file.thumbnail_url%}"></a><br/>
            {% } %}
        <b><span class="name">{%=file.name%}</span></b></td>
        <td class="identification">
            <div class="id-show ui-helper-hidden">
                <span class="scientificName"></span><br/>
                <span class="commonName"></span><br/>
                <button type="button" class="identify">Change</button>
            </div>
            <div class="id-edit">
                <input type="text" value="" id="taxa" name="taxonText" class="name_autocomplete ac_input" style="width:75%" autocomplete="off">
                <input type="hidden" name="lsid" id="lsid" value="${guid}">
            </div>
        </td>
        <td class="imageDate">
            Date image was captured:<br/>
            <span class="imageDateTime">
                <span class="imageDate">{%=file.date%}</span>
                <span class="imageTime">{%=file.time%}</span>
            </span><br/>
            <input type="hidden" class="imageDateISO8601" value="{%=file.isoDate%}"/>
        </td>
        <td class="imageLocation">
            Location image was captured:<br/>
            <span class="imageLatLng">{% if (file.decimalLatitude) { %}
            Lat: <span class="lat">{%=file.decimalLatitude%}</span>,
            Lng: <span class="lng">{%=file.decimalLongitude%}</span>
                {% } else { %}
                Not available
                {% } %}
            </span><br/>
            <input type="hidden" class="imageVerbatimLatitude" value="{%=file.verbatimLatitude%}"/>
            <input type="hidden" class="imageVerbatimLongitude" value="{%=file.verbatimLongitude%}"/>
        </td>
        {% } %}
        <td class="delete">
            <button class="btn btn-danger" data-type="{%=file.delete_type%}" data-url="{%=file.delete_url%}">
                <i class="icon-trash icon-white"></i>
                <span>{%=locale.fileupload.destroy%}</span>
            </button>
        </td>
    </tr>
    {% } %}
</script>
<r:script>
    $(function() {
        // Initialize the jQuery File Upload widget:
        $('#fileupload').fileupload({
            autoUpload: true
        });
        // Enable iframe cross-domain access via redirect option:
        $('#fileupload').fileupload(
                'option',
                'redirect',
                window.location.href.replace(
                        /\/[^\/]*$/,
                        '/cors/result.html?%s'
                )
        );
        // enable submit button when files are added
        $('#fileupload').bind('fileuploadadd', function () {
            $('#submitImagesButton').removeAttr('disabled');
        });
        // disable submit button if removing an image leaves none to submit
        $('#fileupload').bind('fileuploaddestroyed', function () {
            if ($('#multiFilesTable tbody tr').length === 0) {
                $('#submitImagesButton').attr('disabled','disabled');
            }
        });
    });
</r:script>
<r:layoutResources/>
</body>
</html>
