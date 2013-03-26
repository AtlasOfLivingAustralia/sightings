package au.org.ala.sightings

class RecordsController {

    def webService
    def authService

    def DEFAULT_PAGE_SIZE = 50

    def recent() {

        def userId = authService.getLoggedInUserId(request)
        log.debug("Logged in user:" + userId)

        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:DEFAULT_PAGE_SIZE
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
        render( view: 'user', model:[records: records, userId:userId, isAdmin:authService.userInRole("ROLE_ADMIN"), sightingsOwner:"Recent", showUser:true, recentSightings:true])
    }

    def ajax() {
        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:DEFAULT_PAGE_SIZE
        def start = params.start?:0

        //is there a logged in user?
        def loggedInUser = params.loggedInUser

        //are we looking at a particular user's sightings
        def spotterId = params.spotterId

        //if logged in user == userId then some is looking at their own sightings
        def showUser = (loggedInUser == spotterId)

        if (params.sort) {
            opts += "?sort=" + params.sort
        }
        if (params.order) {
            opts += (opts ? "&" : "?") + "order=" + params.order
        }

        opts += (opts ? "&" : "?") + "pageSize=" + pageSize + "&start=" + start

        //println opts
        // get records for current user
        def records = null

        if(spotterId){
            //get the records for this user only
            records = webService.getJson(grailsApplication.config.ala.recordsServerURL +
                "user/" + spotterId + opts)
        } else {
            records = webService.getJson(grailsApplication.config.ala.recordsServerURL + opts)
        }

        if (records.error) {
            // TODO: handle service errors
            println records.error
        }
        records = records.records

        render( view:"recordRow", model: [records: records, showUser: showUser, spotterId: spotterId,
                loggedInUser: loggedInUser, otherUsersSightings: spotterId != loggedInUser,
                isAdmin:authService.userInRole("ROLE_ADMIN")])
    }

    def user() {

        def userId = authService.userId()
        log.trace("userId : " + userId)
        log.trace("username : " + authService.username())

        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:DEFAULT_PAGE_SIZE
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
        [records: records, userId:authService.userId(), spotterId: userId, loggedInUser:userId,  sightingsOwner:"My", usersSightings:true]
    }

    def userById() {
        def sightingsOwner = authService.userDisplayNameForId(params.spotterId)
        def loggedInUser = authService.getLoggedInUserId(request)

        // handle sort options
        def opts = ""
        def pageSize = params.pageSize?:DEFAULT_PAGE_SIZE
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
            "user/" + params.spotterId + opts)
            if (records.error) {
                // TODO: handle service errors
                println records.error
            }
            records = records.records
        }
        //println records
        render( view: 'user', model:[records: records,
                sightingsOwner: sightingsOwner,
                userId: loggedInUser,
                loggedInUser: loggedInUser,
                spotterId: params.spotterId,
                isAdmin: authService.userInRole("ROLE_ADMIN"),
                otherUsersSightings: params.spotterId != loggedInUser]
        )
    }

    def delete() {
        //log.debug "userId: " + authService.userId()
        //log.debug "source: " + params.source
        log.debug "deleting " + params.id
        def respCode
        if (grailsApplication.config.mock.records.service) {
            ProxyController.deleteRecord(params.id)
        } else {
            respCode = webService.doDelete(grailsApplication.config.ala.recordsServerURL + params.id)
            log.trace "response from delete = ${respCode}"
        }

        redirect(action: 'user')
    }
}