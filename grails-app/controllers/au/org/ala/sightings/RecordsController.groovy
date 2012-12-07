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
        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }
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
        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }
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

        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }
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

//    /**
//     * Get real records from the biocache so we can view them in this context.
//     * This is just a sanity check used during development.
//     * @param username the email/username of the collector
//     */
//    def realuser() {
//        def resp = webService.getJson(grailsApplication.config.biocache.baseURL +
//                "ws/occurrences/search.json?q=data_resource_uid:dr364&fq=user_id:${params.user}")
//        log.debug resp
//        def records = resp.occurrences.collect {
//            [scientificName: it.scientificName,
//             commonName: it.vernacularName,
//             eventDate: "2012-09-01T00:00:00Z",// it.eventDate,
//             guid: it.occurrenceID,
//             decimalLatitude: it.decimalLatitude,
//             decimalLongitude: it.decimalLongitude,
//             coordinateUncertaintyInMeters: it.coordinateUncertaintyInMeters
//             ]
//        }
//
//        render( view: 'user', model: [records: records] )
//    }

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
