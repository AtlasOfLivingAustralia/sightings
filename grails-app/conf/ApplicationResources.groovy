// resource bundles
modules = {

    // TODO: separate upload-specific resources into their own bundle
    // TODO: move upload-specific js into it's own js file and leave application.js generic to all pages
    application {
        defaultBundle false
        resource url:'js/application.js'
        resource url:'css/sightings.css'
    }

    applicationMin {
        resource url:'css/sightings.css'
    }

    upload {
        defaultBundle false
        resource url:'js/image-handler.js'
        resource url:'js/bookmarks.js'
        resource url:'js/location.js'
        resource url:'js/sightings.js'
    }

    errors {
        resource url: 'css/errors.css'
    }

    blueimpIE {
        resource url: 'css/bootstrap-ie6.min.css'
    }

    jQueryImageUpload {
//        dependsOn 'jQuery'
        defaultBundle false
//        resource url: 'js/jquery.ui.widget.js', disposition: 'head'
        resource url: 'css/bootstrap-responsive.min.css'
        resource url: 'css/bootstrap-image-gallery.min.css'
        resource url: 'js/tmpl.min.js'
        resource url: 'js/load-image.min.js'
        resource url: 'js/canvas-to-blob.min.js'
        resource url: 'js/jquery.iframe-transport.js'
        resource url: 'js/jquery.fileupload.js'
        resource url: 'js/jquery.fileupload-fp.js'
        resource url: 'js/jquery.fileupload-ui-custom.js'
        resource url: 'js/main.js'
        resource url: 'js/locale.js'
        //resource url: 'css/bootstrap.min.css', disposition: 'head'
        resource url: 'css/jquery.fileupload-ui.css', disposition: 'head'
        resource url: 'js/cors/jquery.xdr-transport.js',
                wrapper: { s -> "<!--[if gte IE 8]>$s<![endif]-->" }
        resource url: 'css/bootstrap-ie6.min.css',
                wrapper: { s -> "<!--[if lt IE 7]>$s<![endif]-->" }
    }

    /*jQueryUI19 {
        defaultBundle false

        resource url: 'js/ui/jquery.ui.widget.js', disposition: 'head'
        resource url: 'js/ui/jquery.ui.core.js'
        resource url: 'js/ui/jquery.ui.button.js'
        resource url: 'js/ui/jquery.ui.datepicker.js'
        resource url: 'js/ui/jquery.ui.dialog.js'
        resource url: 'js/ui/jquery.ui.draggable.js'
        resource url: 'js/ui/jquery.ui.mouse.js'
        resource url: 'js/ui/jquery.ui.position.js'
        resource url: 'js/ui/jquery.ui.spinner.js'
        resource url: 'js/ui/jquery.ui.tooltip.js'

        resource url: 'js/ui/jquery.ui.effect-blind.js'
        resource url: 'js/ui/jquery.ui.effect-explode.js'
        resource url: 'js/ui/jquery.ui.effect-fade.js'
        resource url: 'js/ui/jquery.ui.effect-slide.js'
        resource url: 'js/ui/jquery.ui.effect-transfer.js'

        resource url: 'css/base/jquery.ui.base.css'
        resource url: 'css/base/jquery.ui.theme.css'
        resource url: 'css/base/jquery.ui.spinner.css'
    }*/

    jQueryUI {
        defaultBundle false
        resource url: 'js/jquery-ui-1.8.21.custom.min.js', disposition: 'head'
        resource url: 'js/jquery.ui.spinner.js'
        resource url: 'css/smoothness/jquery-ui-1.8.21.custom.css'
        resource url: 'css/base/jquery.ui.spinner.css'
    }

    jQueryCookie {
        resource url: 'js/jquery.cookie.js'
    }

    jQueryTimeEntry {
        resource url: 'js/jquery.timeentry.min.js'
        resource url: 'js/jquery.mousewheel.js'
    }

    exif {
        defaultBundle false
//        resource url: 'js/binaryajax.js', disposition: 'head'
        resource url: 'js/jquery.exif.js', disposition: 'head'
    }

    ajExif {
        defaultBundle false
        resource url: 'js/ajalabox/exif.js', disposition: 'head'
    }

    spinner {
        resource url: 'css/smartspinner/smartspinner.css'
        resource url: 'js/smartspinner.js'
    }
}
