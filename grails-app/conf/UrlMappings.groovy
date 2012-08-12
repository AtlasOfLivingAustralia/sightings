class UrlMappings {

	static mappings = {

		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

        // pass dummy location bookmarks url
		"/$controller/$action?/location/user/$userid?"{
		}

		"/"(controller: 'upload', action:"index")
		"500"(view:'/error')
	}
}
