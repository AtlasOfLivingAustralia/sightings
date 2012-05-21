// resource bundles
modules = {

    application {
        defaultBundle false
        resource url:'js/application.js'
        resource url:'css/sightings.css'
    }

    jQueryImageUpload {
//        dependsOn 'jQuery'
        defaultBundle false
//        resource url: 'js/jquery.ui.widget.js', disposition: 'head'
        resource url: 'js/jquery.iframe-transport.js'
        resource url: 'js/jquery.fileupload.js'
        resource url: 'js/jquery.fileupload-fp.js'
        resource url: 'js/jquery.fileupload-ui.js'
        resource url: 'js/main.js'
        resource url: 'js/locale.js'
        //resource url: 'css/bootstrap.min.css', disposition: 'head'
        resource url: 'css/jquery.fileupload-ui.css', disposition: 'head'
        resource url: 'js/cors/jquery.xdr-transport.js',
                wrapper: { s -> "<!--[if gte IE 8]>$s<![endif]-->" }
    }

    jQueryUI19 {
        defaultBundle false

        resource url: 'js/ui/jquery.ui.widget.js', disposition: 'head'
        resource url: 'js/ui/jquery.ui.core.js'
        resource url: 'js/ui/jquery.ui.button.js'
        resource url: 'js/ui/jquery.ui.datepicker.js'
        resource url: 'js/ui/jquery.ui.dialog.js'
        resource url: 'js/ui/jquery.ui.mouse.js'
        resource url: 'js/ui/jquery.ui.position.js'
        resource url: 'js/ui/jquery.ui.spinner.js'

        resource url: 'css/base/jquery.ui.base.css'
        resource url: 'css/base/jquery.ui.theme.css'
        resource url: 'css/base/jquery.ui.spinner.css'
    }

    jQueryUI {
        defaultBundle false
        resource url: 'js/jquery-ui-1.8.20.custom.min.js', disposition: 'head'
        resource url: 'js/jquery.ui.spinner.js'
        resource url: 'css/smoothness/jquery-ui-1.8.20.custom.css'
    }

    jQueryTimeEntry {
        resource url: 'js/jquery.timeentry.min.js'
        resource url: 'js/jquery.mousewheel.js'
    }
}
