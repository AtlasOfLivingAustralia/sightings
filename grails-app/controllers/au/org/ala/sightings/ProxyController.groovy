package au.org.ala.sightings

import grails.converters.JSON
import org.codehaus.groovy.grails.commons.ConfigurationHolder

class ProxyController {

    def webService
    def username = 'mark.woolston@csiro.au' // until CAS is integrated

    def submitLocationBookmark = {
        params.each { println it }
        def serviceParams = [userId:username]
        params.each {
            if (!(it in ['action','controller'])) {
                serviceParams.put it.key as String, it.value as String
            }
        }
        println serviceParams
        def result = webService.doPost(ConfigurationHolder.config.fielddata.baseURL +
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
        def responseCode = webService.doDelete(ConfigurationHolder.config.fielddata.baseURL + "/location/user/" + username)
        def resp = [code: responseCode.toString()]
        render resp as JSON
    }

    def deleteLocationBookmark(String id)  {
        //params.each {println it}
        def responseCode = webService.doDelete(ConfigurationHolder.config.fielddata.baseURL + "/location/" + id)
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

    /**
     * for testing only
     * simulates the submission of a fielddata record for testing and development
     * jsonp
     */
    def submitRecord() {
        def serviceParams = [userId:username]
        def media = []
        params.associatedMedia.tokenize(',').each {
            //media << 'http://localhost/' + grailsApplication.config.upload.images.path + '/' + it
        }
        params.remove('action')
        params.remove('controller')
        params.remove('associatedMedia')
        params.each {
            serviceParams.put it.key as String, it.value as String
        }
        serviceParams.associatedMedia = media
        /*params.remove('controller')
        params.remove('action')
        def media = []
        params['associatedMedia[]'].each {
            println "media = " + it
            media << grailsApplication.config.upload.images.path + '/' + it
        }
        params.associatedMedia = media*/
        media.each { println it }
        serviceParams.each {println it}
        def body = (serviceParams as JSON).toString()
        println body

        def result = webService.doPost(grailsApplication.config.ala.recordsServerURL, body)

        println "result = " + result
        render result as JSON
    }
}
