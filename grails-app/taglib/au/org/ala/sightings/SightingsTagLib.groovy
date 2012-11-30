package au.org.ala.sightings

import java.text.SimpleDateFormat
import org.codehaus.groovy.grails.web.json.JSONObject

class SightingsTagLib {

    static namespace = "si"
    static outFormat = new SimpleDateFormat("d MMM yyyy HH:mm")
    //static outFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm")

    def formatDate = { attrs ->
        println "date: " + attrs.date
        log.debug 'formatting date: ' + attrs.date
        def dateStr
        if (attrs.date && attrs.date != 'null' && !attrs.date.is(JSONObject.NULL) ) {
            def date = new Date().parse("yyyy-MM-dd'T'HH:mm:ss'Z'", attrs.date)
            dateStr = outFormat.format(date)
            // remove time if it is 00:00
            if (dateStr.size() > 15 && dateStr[-5..-1] == "00:00") {
                dateStr -= dateStr[-5..-1]
            }
        }
        else {
            dateStr = ''
        }
        out << dateStr
    }

}
