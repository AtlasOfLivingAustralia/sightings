package au.org.ala.sightings

import org.springframework.web.multipart.MultipartFile
import org.codehaus.groovy.grails.commons.ConfigurationHolder
import grails.converters.JSON

class ImageController {

    static defaultAction = "demo"

    def test() {}

    def demo() {}

    def upload = {
        println "-------------------------------upload action"
        params.each { println it }
        def result = []
        if (request.respondsTo('getFile')) {
            MultipartFile file = request.getFile('files')
            //println "file is " + file
            if (file?.size) {  // will only have size if a file was selected
                def filename = file.getOriginalFilename()
                //println "filename=${filename}"

                def colDir = new File(ConfigurationHolder.config.upload.location.images as String)
                colDir.mkdirs()
                File f = new File(colDir, filename)
                //println "saving ${filename} to ${f.absoluteFile}"
                file.transferTo(f)
                result = [[
                        name: filename,
                        size: file.size,
                        url: 'http://localhost/data/sightings/images/' + filename,
                        thumbnail_url: 'http://localhost/data/sightings/images/' + filename,
                        delete_url: ConfigurationHolder.config.grails.serverURL +
                                "/image/delete?filename=" + filename,
                        delete_type: 'DELETE']]
            }
        }
        //println result
        render result as JSON
    }

    def delete = {
        println "deleted " + params.filename
        render 'Deleted'
    }
}
