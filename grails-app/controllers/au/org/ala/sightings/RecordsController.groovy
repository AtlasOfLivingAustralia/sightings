package au.org.ala.sightings

class RecordsController {

    def webService
    def username = 'mark.woolston@csiro.au' // until CAS is integrated

    def user() {
        // get records for current user
        def records
        if (grailsApplication.config.mock.records.service) {
            records = ProxyController.getRecords()
        } else {
            records = webService.getJson(grailsApplication.config.ala.recordsServerURL +
            "user/" + username)
            if (records.error) {
                // TODO: handle service errors
                println records.error
            }
        }
        [records: records]
    }

    def delete() {
        println "deleting " + params.id
        if (grailsApplication.config.mock.records.service) {
            ProxyController.deleteRecord(params.id)
        } else {
            webService.doDelete(grailsApplication.config.ala.recordsServerURL + params.id)
        }
        redirect(action: 'user')
    }
}
