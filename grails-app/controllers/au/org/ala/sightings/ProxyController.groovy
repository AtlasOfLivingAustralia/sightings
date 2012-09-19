package au.org.ala.sightings

import grails.converters.JSON
import org.codehaus.groovy.grails.commons.ConfigurationHolder
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import grails.util.GrailsUtil
import org.joda.time.format.DateTimeFormat
import org.joda.time.format.DateTimeFormatter
import org.joda.time.DateTime

class ProxyController {

    def webService
    def username = 'mark.woolston@csiro.au' // until CAS is integrated
    static mockRecords = []

    /**
     * Do logouts through this app so we can invalidate the session.
     *
     * @param casUrl the url for logging out of cas
     * @param appUrl the url to redirect back to after the logout
     */
    def logout = {
        session.invalidate()
        redirect(url:"${params.casUrl}?url=${params.appUrl}")
    }

    /******* bookmarks ***************/
    def submitLocationBookmark = {
        params.each { println it }
        def serviceParams = [userId:username]
        params.each {
            if (!(it in ['action','controller'])) {
                serviceParams.put it.key as String, it.value as String
            }
        }
        println serviceParams
        def result = webService.doPost(ConfigurationHolder.config.ala.locationBookmarkServerURL +
                '/location', (serviceParams as JSON).toString())

        if (result.error) {
            println "Error: " + result.error
            render result.error as JSON
        } else {
            println result.resp
            render result.resp as JSON
        }
    }

    def deleteAllLocationBookmarks = {
        def responseCode = webService.doDelete(ConfigurationHolder.config.ala.locationBookmarkServerURL +
                "/location/user/" + username)
        def resp = [code: responseCode.toString()]
        render resp as JSON
    }

    def deleteLocationBookmark(String id)  {
        //params.each {println it}
        def responseCode = webService.doDelete(ConfigurationHolder.config.ala.locationBookmarkServerURL + "/location/" + id)
        //println "Code = ${responseCode} trying to delete bookmark ${id}"
        def resp = [code: responseCode.toString()]
        render resp as JSON
    }

    /**
     * for testing only
     * simulates the bookmark server for testing and development
     * jsonp
     */
    def dummyBookmarks() {
        def locs = '{"locations":[{"dateCreated":"2012-07-22T02:57:24Z","decimalLatitude":7.181685924530029,"decimalLongitude":79.88414764404297,"locality":"Columbo, Sri Lanka","userId":"mark.woolston@csiro.au","geodeticDatum":"WGS84","coordinateSource":"Google maps","id":"500b6c143004622fc0aa7eb9"},{"dateCreated":"2012-07-19T06:04:28Z","decimalLatitude":-37.575660705566406,"decimalLongitude":143.84042358398438,"locality":"Ballarat","userId":"mark.woolston@csiro.au","geodeticDatum":"WGS84","verbatimLatitude":"-35 13.95 0","verbatimLongitude":"149 1.29 0","coordinateSource":"camera/phone","id":"5007a36c3004622fc0aa7eb8"},{"dateCreated":"2012-07-18T02:13:48Z","decimalLatitude":-35.23249816894531,"decimalLongitude":149.02149963378906,"locality":"6 Ashburner St, Higgins ACT 2615, Australia","userId":"mark.woolston@csiro.au","usingReverseGeocodedLocality":"true","geodeticDatum":"WGS84","verbatimLatitude":"-35 13.95 0","verbatimLongitude":"149 1.29 0","coordinateSource":"camera/phone","id":"50061bdc3004622fc0aa7eb5"},{"dateCreated":"2012-07-18T02:10:51Z","decimalLatitude":-35.23270034790039,"decimalLongitude":149.02220153808594,"locality":"X Ashburner St, Higgins ACT 2615, Australia","userId":"mark.woolston@csiro.au","usingReverseGeocodedLocality":"false","geodeticDatum":"WGS84","verbatimLatitude":"-35 13.96 0","verbatimLongitude":"149 1.33 0","coordinateSource":"camera/phone","id":"50061b2b3004622fc0aa7eb4"},{"dateCreated":"2012-07-18T02:08:25Z","decimalLatitude":-35.23270034790039,"decimalLongitude":149.02220153808594,"locality":"1 Ashburner St, Higgins ACT 2615, Australia","userId":"mark.woolston@csiro.au","usingReverseGeocodedLocality":"true","geodeticDatum":"WGS84","verbatimLatitude":"-35 13.96 0","verbatimLongitude":"149 1.33 0","coordinateSource":"camera/phone","id":"50061a993004622fc0aa7eb3"},{"dateCreated":"2012-07-17T01:17:18Z","decimalLatitude":-29.89080047607422,"decimalLongitude":130.84190368652344,"locality":"Desert","userId":"mark.woolston@csiro.au","geodeticDatum":null,"verbatimLatitude":null,"coordinateSource":"physical map","verbatimLongitude":null,"otherSource":null,"physicalMapScale":null,"id":"5004bd1e3004622fc0aa7ea5"},{"dateCreated":"2012-07-16T05:26:15Z","decimalLatitude":-35.22999954223633,"decimalLongitude":149.02000427246094,"locality":"18 Rich Pl, Higgins ACT 2615, Australia","userId":"mark.woolston@csiro.au","geodeticDatum":null,"verbatimLatitude":null,"coordinateSource":"camera/phone","verbatimLongitude":null,"otherSource":null,"physicalMapScale":null,"id":"5003a5f73004622fc0aa7ea4"},{"dateCreated":"2012-07-16T05:09:59Z","decimalLatitude":-35.23231887817383,"decimalLongitude":149.02178955078125,"locality":"Higgins ACT 2615, Australia","userId":"mark.woolston@csiro.au","geodeticDatum":null,"verbatimLatitude":null,"coordinateSource":"camera/phone","verbatimLongitude":null,"otherSource":null,"physicalMapScale":null,"id":"5003a2273004622fc0aa7ea3"}]}'
        if (params.callback) {
            locs = params.callback + "(" + locs + ")"
        }
        render (contentType: "application/json", text: locs)
    }

    /******* records ***************/
    // TODO: move to records controller
    def submitRecord() {
        def serviceParams = [userId:username]

        // event date
        /*def dt = new DateTime(params.year)
        dt = dt.monthOfYear().setCopy(params.month?.toInteger() as int)
        dt = dt.dayOfMonth().setCopy(params.day as String)
        if (params.hours) { dt = dt.hourOfDay().setCopy(params.hours as String) }
        if (params.minutes) { dt = dt.minuteOfHour().setCopy(params.minutes as String) }
        println dt
        serviceParams.eventDate = dt.toString()
        println serviceParams.eventDate*/

        // alternate event date
        def dateStr = params.year
        if (params.month) {
            dateStr += '-' + params.month
            if (params.day) {
                dateStr += '-' + params.day
                if (params.hours && params.minutes) {
                    dateStr += 'T' + params.hours + ':' + params.minutes
                }
            }
        }
        serviceParams.eventDate = dateStr

        // media
        //println grailsApplication.config.upload.images.url
        def media = []
        if (params.associatedMedia) {
            params.associatedMedia.tokenize(',').each {
                media << grailsApplication.config.upload.images.url + it.replaceAll(' ','_')
            }
        }
        serviceParams.associatedMedia = media

        // remaining parameters
        params.each {
            if (!(it.key in ['action','controller','associatedMedia','year','month','day','hours','minutes','eventDate'])) {
                serviceParams.put it.key as String, it.value as String
            }
        }

        def body = (serviceParams as JSON).toString()
        println body
        def result

        if (grailsApplication.config.mock.records.service) {
            println "mocking"
            def key = (body + new Date().toGMTString()).encodeAsMD5()
            serviceParams.id = key
            serviceParams.images = []
            mockRecords << serviceParams
            result = [error: null, resp: [id: key]]
        } else {
            result = webService.doPost(grailsApplication.config.ala.recordsServerURL, body)
        }

        println "result = " + result
        render result as JSON
    }

    def dummyGetRecords() {
        def records = [records: getRecords()]
        render records as JSON
    }

    static getRecords() {
        return mockRecords.reverse()
    }

    static void deleteRecord(String id) {
        def target = mockRecords.find {it.id == id}
        if (target) {
            mockRecords - target
        }
        println "record ${id} deleted"
    }

    def reloadConfig = {
        // reload system config
        def resolver = new PathMatchingResourcePatternResolver()
        def resource = resolver.getResource(grailsApplication.config.grails.config.locations[0])
        def stream = null

        try {
            stream = resource.getInputStream()
            ConfigSlurper configSlurper = new ConfigSlurper(GrailsUtil.getEnvironment())
            if(resource.filename.endsWith('.groovy')) {
                def newConfig = configSlurper.parse(stream.text)
                grailsApplication.getConfig().merge(newConfig)
            }
            else if(resource.filename.endsWith('.properties')) {
                def props = new Properties()
                props.load(stream)
                def newConfig = configSlurper.parse(props)
                grailsApplication.getConfig().merge(newConfig)
            }
            String res = "<ul>"
            grailsApplication.config.each { key, value ->
                if (value instanceof Map) {
                    res += "<p>" + key + "</p>"
                    res += "<ul>"
                    value.each { k1, v1 ->
                        res += "<li>" + k1 + " = " + v1 + "</li>"
                    }
                    res += "</ul>"
                }
                else {
                    res += "<li>${key} = ${value}</li>"
                }
            }
            render res + "</ul>"
        }
        catch (GroovyRuntimeException gre) {
            println "Unable to reload configuration. Please correct problem and try again: " + gre.getMessage()
            render "Unable to reload configuration - " + gre.getMessage()
        }
        finally {
            stream?.close()
        }

    }

}
