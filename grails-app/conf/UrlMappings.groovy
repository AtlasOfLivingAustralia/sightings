class UrlMappings {

	static mappings = {

        //admin urls which force CAS
        name adminRecent: "/recent/admin"(controller: "records"){ action = [GET:"recent"] }
        name adminAjax: "/records/ajax/admin"(controller: "records"){ action = [GET:"ajax"] }
        name adminSpotter: "/spotter/admin/$spotterId"(controller: "records"){ action = [GET:"userById"] }

        name recent: "/recent"(controller: "records"){ action = [GET:"recent"] }
        name mine: "/mine"(controller: "records"){ action = [GET:"user"] }
        name mine: "/mine;$jsessionidparam=$jsessionid"(controller: "records"){ action = [GET:"user"] }
        name spotter: "/spotter/$spotterId"(controller: "records"){ action = [GET:"userById"] }

		"/"(controller: 'upload', action:"index")
        "/$id"(controller: 'upload', action:"index")
        "/simulateSubmitError/$id?" (controller: 'upload', action: 'simulateSubmitError')

		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

        // pass dummy location bookmarks url
	//	"/$controller/$action?/location/user/$userid?"{ }

		"500"(view:'/error')
	}
}
