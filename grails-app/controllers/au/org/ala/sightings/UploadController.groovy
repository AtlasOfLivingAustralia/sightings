package au.org.ala.sightings

class UploadController {

    def authService, webService

    /**
     * Creates a new sighting
     * @param id an lsid of a taxon - may be blank
     * @return
     */
    def index(String id) {
        def model = [physicalMapScales: scales]
        if (id && id.startsWith("urn:lsid")) {
            // TODO bie lookup ?
            log.debug "id is a lsid"
            model['guid'] = id

        } else if (id) {
            // treat this as a demo index
            model += getDemoSpecies(id)
        }
        // else no taxon is selected

        model['userId'] = authService.userId()
        model['userName'] = authService.username()
        model
    }

    /**
     * Edits an existing record
     * @param id of the record to edit
     * @return
     */
    def edit(String id) {
        def model = [physicalMapScales: scales]
        if (id) {
            def resp = webService.getJson(
                    grailsApplication.config.ala.recordsServerURL + id)
            log.debug resp.record
            model += resp.record
            model += [recordId: id]
        }

        def isAdmin = authService.userInRole("ROLE_ADMIN")
        def userId = authService.userId()
        if (!isAdmin && userId != model['userId']){
            response.sendError(403)
        } else {
            model["isAdmin"] = isAdmin
            model["adminUser"] = userId
            model
        }
    }

    def demo() {}

    def media() {
        def model = [physicalMapScales: scales]
        model
    }

    private Map getDemoSpecies(id) {
        switch (id) {
            case '1': return [scientificName: 'Notomys fuscus', commonName: 'Dusky Hopping-mouse',
                    guid: 'urn:lsid:biodiversity.org.au:afd.taxon:dbb2125e-bf71-4388-b129-562e4d7a8eb4',
                    imageUrl: 'http://bie.ala.org.au/repo/1009/24/250681/smallRaw.jpg']
            case '2': return [scientificName: 'Notomys alexis', commonName: 'Spinifex Hopping-mouse',
                    guid: 'urn:lsid:biodiversity.org.au:afd.taxon:49001532-929e-4b78-97d3-c885e97d671b',
                    imageUrl: 'http://bie.ala.org.au/repo/1051/177/1772158/smallRaw.jpg']
            case '3': return [scientificName: 'Papilio aegeus', commonName: 'Large Citrus Butterfly',
                    guid: 'urn:lsid:biodiversity.org.au:afd.taxon:f2b75626-e37a-4c54-8632-e3c5560c8039',
                    imageUrl: 'http://bie.ala.org.au/repo/1013/127/1279857/smallRaw.jpg']
            case '4': return [scientificName: 'Hirundo (Hirundo) neoxena', commonName: 'Welcome Swallow',
                    guid: 'urn:lsid:biodiversity.org.au:afd.taxon:4701f4ee-6fbc-475b-be7d-3eaa9acfa8fb',
                    imageUrl: 'http://bie.ala.org.au/repo/1013/167/1674015/smallRaw.jpg']
            default: return [:]
        }
    }

    static scales = [
            '1:25,000,000',
            '1:10,000,000',
            '1:5,000,000',
            '1:3,000,000',
            '1:2,000,000',
            '1:1,000,000',
            '1:500,000',
            '1:250,000',
            '1:126,720',
            '1:125,000',
            '1:100,000',
            '1:80,000',
            '1:63,360',
            '1:62,500',
            '1:50,000',
            '1:31,680',
            '1:25,000',
            '1:24,000',
            '1:20,000',
            '1:15,840',
            '1:12,000',
            '1:10,000',
            '1:9,600',
            '1:9,000',
            '1:6,000',
            '1:5,000',
            '1:4,800',
            '1:2,500',
            '1:2,400',
            '1:2,000',
            '1:1,200',
            '1:1,000',
            'other'
            ,'unknown'
    ]
}
