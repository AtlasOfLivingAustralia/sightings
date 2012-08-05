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

}
