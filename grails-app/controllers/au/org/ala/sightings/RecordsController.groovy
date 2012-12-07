package au.org.ala.sightings

class RecordsController {

    def webService
    def authService
    //def username = 'mark.woolston@csiro.au' // until CAS is integrated

    def recentImages() {
        def userId = authService.getLoggedInUserId(request)

        // handle sort options
        def opts = ""
        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }
        //println opts
        // get records for current user
        def records = webService.getJson(grailsApplication.config.ala.recordsServerURL + "images" + opts)
        if (records.error) {
            // TODO: handle service errors
            println records.error
        }
        records = records.records
        //println records
        render( view: 'user', model:[records: records, userId:userId, sightingsOwner:"Recent", showUser:true,  recentSightings:true])
    }

    def recent() {

        def userId = authService.getLoggedInUserId(request)
        log.debug("Logged in user:" + userId)

        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:50
        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }

        opts += (opts ? "&" : "?") + "pageSize=" + pageSize

        // get records for current user
        def records = webService.getJson(grailsApplication.config.ala.recordsServerURL + opts)
        if (records.error) {
            // TODO: handle service errors
            println records.error
        }
        records = records.records
        //println records
        render( view: 'user', model:[records: records, userId:userId, sightingsOwner:"Recent", showUser:true, recentSightings:true])
    }

    def user() {

        def userId = authService.userId()
        log.debug("userId : " + userId)
        log.debug("username : " + authService.username())

        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:50
        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }

        opts += (opts ? "&" : "?") + "pageSize=" + pageSize

        //println opts
        // get records for current user
        def records
        if (grailsApplication.config.mock.records.service) {
            records = ProxyController.getRecords()
        } else {
            records = webService.getJson(grailsApplication.config.ala.recordsServerURL +
            "user/" + userId + opts)
            if (records.error) {
                // TODO: handle service errors
                println records.error
            }
            records = records.records
        }
        //println records
        [records: records, userId:authService.userId(), sightingsOwner:"My", usersSightings:true]
    }

    def userById() {

        def sightingsOwner = authService.userDisplayNameForId(params.userId)

        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:50
        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }

        opts += (opts ? "&" : "?") + "pageSize=" + pageSize

        //println opts
        // get records for current user
        def records
        if (grailsApplication.config.mock.records.service) {
            records = ProxyController.getRecords()
        } else {
            records = webService.getJson(grailsApplication.config.ala.recordsServerURL +
            "user/" + params.userId + opts)
            if (records.error) {
                // TODO: handle service errors
                println records.error
            }
            records = records.records
        }
        //println records
        render( view: 'user', model:[records: records, sightingsOwner: sightingsOwner, userId: params.userId, otherUsersSightings:true])
    }

    def delete() {
        log.info "deleting " + params.id
        if (grailsApplication.config.mock.records.service) {
            ProxyController.deleteRecord(params.id)
        } else {
            webService.doDelete(grailsApplication.config.ala.recordsServerURL + params.id)
        }
        redirect(action: 'user')
    }
}