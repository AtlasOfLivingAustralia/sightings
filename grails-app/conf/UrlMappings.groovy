class UrlMappings {

	static mappings = {

        name recent: "/recent"(controller: "records"){ action = [GET:"recent"] }
        "/recent/"(controller: "records"){ action = [GET:"recent"] }
        "/recentImages"(controller: "records"){ action = [GET:"recentImages"] }
        "/recentImages/"(controller: "records"){ action = [GET:"recentImages"] }
        name mine: "/mine"(controller: "records"){ action = [GET:"user"] }
        "/mine/"(controller: "records"){ action = [GET:"user"] }
        name spotter: "/spotter/$userId"(controller: "records"){ action = [GET:"userById"] }

		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

        // pass dummy location bookmarks url
	//	"/$controller/$action?/location/user/$userid?"{ }

		"/"(controller: 'upload', action:"index")
		"500"(view:'/error')
	}
}
