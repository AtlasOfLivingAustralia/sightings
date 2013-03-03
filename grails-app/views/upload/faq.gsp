<!DOCTYPE HTML>
<html>
<head>
    <title>FAQ | Report a sighting | Atlas of Living Australia</title>
    <meta name="layout" content="ala" />
    <!-- Shim to make HTML5 elements usable in older Internet Explorer versions -->
    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <r:script disposition="head">
        var serverUrl = "${grailsApplication.config.grails.serverURL}";
    </r:script>
    <r:require modules="application"/>
    <r:layoutResources/>
</head>
<body>
<div class="inner">
    <div class="page-header">
        <h1>Report a sighting FAQ</h1>

        <p class="hint">Click any topic to view. If you are having difficulties and can't find an answer here please
        email us at <a href="mailto:support@ala.org.au?subject=Problem submitting a record">support@ala.org.au</a>.</p>
        <div style="float:right;padding-right: 45px;">
            <span style="text-align: right;">
                <g:link mapping="mine" class="showMySightings">My sightings</g:link>
                |
                <g:link mapping="recent" class="showRecentSightings">Recent sightings</g:link>
                |
                <g:link controller="upload" class="showRecentSightings">Record a sighting</g:link>
            </span><br>
            <span style="text-align: right;">
                <button type="button" id="expand">Expand all</button>
                <button type="button" id="close">Close all</button>
            </span>
        </div>
    </div>
    <section id="faq" style="clear:both;">
        <section>
            <h2>Do I have to fill in all these fields?</h2><div>
            <p>No. The only requirement is that you identify the lifeform you are reporting. The minimal useful information is either:</p>
            <ol><li>Identification plus an image; or</li>
            <li>Identification plus a date and location.</li></ol>
            <p>We encourage you to enter as much information as you are sure about. Each extra piece of data makes your record more useful for analysis. For example, telling us how you determined the location coordinates allows us to interpret the coordinates more accurately.</p>
        </div></section>
        <section>
            <h2>What if I'm not sure about the species?</h2><div>
            <p>First try to confirm the species by searching the Atlas for the names you have and comparing your
            organism to the images in the Atlas. Or use other tools such as field guides, online identification
            keys or even Google to try to confirm the identification.</p>
            <p>Identification is sometimes very difficult even for experts so you will not always achieve a certain
            id. You can enter the name of a group of animals such as a genus or family if you are sure of that, or
            even a common group name such as 'snails'.</p>
            <p>If you are still not certain about what you have entered, then change the 'Confidence in
            identification' option to 'Uncertain'.</p>
        </div></section>
        <section>
            <h2>How can I find the coordinates for the location of my sighting?</h2><div>
            <p>There are a number of easy ways to do this:</p>
            <ul>
                <li>If you have an image and your camera or phone embeds geographical information, add your image
                first and we will try to load the coordinates (and date) from the image metadata.</li>
                <li>Type a description of the location in the box provided and click the right double arrow to look
                up the coordinates. You can then use the large map to refine the location by dragging the pin.
                <r:img dir="images/faq" file="lookup.png"/></li>
                <li>Click the 'Locate on a map' button (or on the small map) and drag the pin onto the map of
                Australia. The map will zoom in to your pin allowing you to fine-tune the location.</li>
                <li>Use Google maps to find the location, right click and choose 'What's here'. Clicking on the
                green arrow that appears will display the coordinates. Copy the coordinates that are shown as decimals
                and paste into the sightings form.</li>
                <li>Read the coordinates from a GPS device.</li>
                <li>Read the coordinates from a paper map.</li>
            </ul>
        </div></section>
        <section>
            <h2>What types of images can I upload?</h2><div>
            <p>We prefer you to upload jpeg files (.jpg or .jpeg) but you can also upload .png, .bmp and .gif files.</p>
        </div></section>
        <section>
            <h2>Can I add multiple images for a single submission?</h2><div>
            <p>Yes. They should of course all relate to the same observation.</p>
            <p>To add another image just click the 'Add more images' button. Or you can select multiple images in the
            file dialog and bring them all in at once.</p>
            <p>Tip: You can also add images by dragging them from your file system into the 'Media' box.</p>
        </div></section>
        <section>
            <h2>Can I upload video and sound files?</h2><div>
            <p>This tool does not currently support uploading sound or video but the Atlas can ingest both. We will add
            this capability soon. If you have sound or video that you think is significant, please contact us via
            <a href="mailto:info@ala.org.au">info@ala.org.au</a> and we will discuss a means of loading your files.</p>
        </div></section>
        <section>
            <h2>What should I put in the location description?</h2><div>
            <p>This should be a text description of the geographic location. Examples are a street address, the name of
            a town or river mouth. If you have ecological details such as 'in a tree' or 'in leaf litter', it is best to
            record these in the notes details.</p>
            <p>Tip: If you have entered location coordinates, you can click the left double arrow to lookup the location
            name from Google. You can then edit this description if you want.<r:img dir="images/faq" file="reverse-lookup.png"/>
            </p>
            <p>If you have chosen the location by dragging the pin on the map, the location description will be looked
            up automatically.</p>
            <p>If you have entered your own description, you can prevent it being overwritten by clicking on the lock
            symbol <r:img dir="images/faq" file="lock-open.png" class="inline"/>. It will appear like this
            <r:img dir="images/faq" file="lock-closed.png" class="inline"/> when the text is locked.</p>
        </div></section>
        <section>
            <h2>How do you get the date and location from my image?</h2><div>
            <p>Information such as the type of camera, the date and location can be embedded in an image. This is
            usually done by the camera or phone but can be embedded by image processing software as well.</p>
            <p>If your image contains an embedded date or location we try to extract that information when you add the
            image. If either or both are available, the values are shown in the list of images as in the example below.
            <r:img dir="images/faq" file="loaded-image.png"/></p>
            <p>You can choose to use these values for your submission by clicking the appropriate buttons. Or you can
            chose to automatically use embedded values by checking the 'Always use the information embedded in selected
            photos' option. This will load the date and location directly into the appropriate fields each time you
            add an image.<r:img dir="images/faq" file="always-use.png"/></p>
            <p>Tip: If you use image processing software such as Lightroom, Aperture or Photoshop, be aware that the
            software may strip this information out of the image when you export it. Some packages do this by default.
            They should all have an option to retain embedded metadata. For example in Lightroom the option is on the
            export dialog.<r:img dir="images/faq" file="lightroom-metadata.png"/></p>
            <p>If you want to share this information with us (to make your submission easier and faster), make sure you
            include embedded metadata when you export images. We do not store any information apart from date and
            location coordinates.</p>
        </div></section>
        <section>
            <h2>What are the different licenses I can choose for my images?</h2><div>
            <p>We encourage the use of Creative Commons licensing to protect the usage of your images. Some general
            information is available <a target="_blank" class="external" href="http://creativecommons.org/licenses/">here</a>. We offer the choice of
            four license types:</p>
            <ul>
                <li><a target="_blank" class="external" href="http://creativecommons.org/licenses/by/3.0/au/">Attribution</a></li>
                <li><a target="_blank" class="external" href="http://creativecommons.org/licenses/by-nc/3.0/au/">Attribution Non-commercial</a></li>
                <li><a target="_blank" class="external" href="http://creativecommons.org/licenses/by-sa/3.0/au/">Attribution-Share Alike</a></li>
                <li><a target="_blank" class="external" href="http://creativecommons.org/licenses/by-nc-sa/3.0/au/">Attribution-Noncommercial-Share Alike</a></li>
            </ul>
            <p>Non-commercial terms.<br>Although it's much more beneficial to release content
            under a non-commercial term than not at all, please consider whether a non-commercial term is really
            necessary. The use of this condition can restrict re-use by non-commercial and community based entities,
            not because they are making a profit but because some of their activities can be legally considered
            "commercial purposes" and they may need costly legal advice to make sure.</p>
        </div></section>
    </section>
</div>
<r:script>
    $('#faq h2').click(function () {
        var d = $(this).parent().find('div');
        d.toggle();
    });
    $('#expand').click(function () {
        $('#faq > section > div').show();
    });
    $('#close').click(function () {
        $('#faq > section > div').hide();
    });
</r:script>
<r:layoutResources/>
</body>
</html>
