/******************************************************************************\
 *  CONFIG MANAGEMENT
\******************************************************************************/
def ENV_NAME = "SIGHTINGS_CONFIG"
def default_config = "/data/sightings/config/${appName}-config.properties"
if(!grails.config.locations || !(grails.config.locations instanceof List)) {
    grails.config.locations = []
}
if(System.getenv(ENV_NAME) && new File(System.getenv(ENV_NAME)).exists()) {
    println "Including configuration file specified in environment: " + System.getenv(ENV_NAME);
    grails.config.locations = ["file:" + System.getenv(ENV_NAME)]
} else if(System.getProperty(ENV_NAME) && new File(System.getProperty(ENV_NAME)).exists()) {
    println "Including configuration file specified on command line: " + System.getProperty(ENV_NAME);
    grails.config.locations = ["file:" + System.getProperty(ENV_NAME)]
} else if(new File(default_config).exists()) {
    println "Including default configuration file: " + default_config;
    def loc = ["file:" + default_config]
    println ">> loc = " + loc
    grails.config.locations = loc
    println "grails.config.locations = " + grails.config.locations
} else {
    println "No external configuration file defined."
}
println "(*) grails.config.locations = ${grails.config.locations}"

/******************************************************************************\
 * ALA standard config
 \******************************************************************************/

appName = 'sightings'
security.cas.uriFilterPattern = '/,/urn.*,/upload/edit/.*,/records/user,/mine,/mine.*,/mine/.*,/upload/index/.*,/proxy/submitLocationBookmark,/proxy/deleteAllLocationBookmarks,/proxy/deleteLocationBookmark,/proxy/deleteLocationBookmark/.*,/recent/admin, /spotter/admin/.*'
security.cas.authenticateOnlyIfLoggedInPattern = '/recent,/recent,/recentImages,/recentImages/'
headerAndFooter.baseURL = "http://www2.ala.org.au/commonui"
security.cas.casServerName = 'https://auth.ala.org.au'
security.cas.uriExclusionFilterPattern = '/images.*,/css.*,/js.*'
security.cas.loginUrl = 'https://auth.ala.org.au/cas/login'
security.cas.logoutUrl = 'https://auth.ala.org.au/cas/logout'
security.cas.casServerUrlPrefix = 'https://auth.ala.org.au/cas'
security.cas.bypass = false
ala.baseURL = "http://www.ala.org.au/"
bie.baseURL = "http://bie.ala.org.au/"
biocache.baseURL = "http://biocache.ala.org.au/"
bie.searchPath = "/search"
grails.project.groupId = au.org.ala // change this to alter the default package name and Maven publishing destination
userDetails.url ="http://auth.ala.org.au/userdetails/userDetails/getUserListWithIds"
userDetails.emails.url = "http://auth.ala.org.au/userdetails/userDetails/getUserListFull"

/******************************************************************************\
 *  APP CONFIG
 \******************************************************************************/

if (!upload.images.path) {
    upload.images.path = '/data/sightings/images'
}
if (!mock.records.service) {
    mock.records.service = false
}

/******************************************************************************\
 *  GRAILS CONFIG
\******************************************************************************/
grails.project.groupId = appName // change this to alter the default package name and Maven publishing destination
grails.mime.file.extensions = true // enables the parsing of file extensions from URLs into the request format
grails.mime.use.accept.header = false
grails.mime.types = [ html: ['text/html','application/xhtml+xml'],
                      xml: ['text/xml', 'application/xml'],
                      text: 'text/plain',
                      js: 'text/javascript',
                      rss: 'application/rss+xml',
                      atom: 'application/atom+xml',
                      css: 'text/css',
                      csv: 'text/csv',
                      all: '*/*',
                      json: ['application/json','text/json'],
                      form: 'application/x-www-form-urlencoded',
                      multipartForm: 'multipart/form-data'
                    ]

// URL Mapping Cache Max Size, defaults to 5000
//grails.urlmapping.cache.maxsize = 1000

// What URL patterns should be processed by the resources plugin
grails.resources.adhoc.patterns = ['/images/*', '/css/*', '/js/*', '/plugins/*']


// The default codec used to encode data with ${}
grails.views.default.codec = "none" // none, html, base64
grails.views.gsp.encoding = "UTF-8"
grails.converters.encoding = "UTF-8"
// enable Sitemesh preprocessing of GSP pages
grails.views.gsp.sitemesh.preprocess = true
// scaffolding templates configuration
grails.scaffolding.templates.domainSuffix = 'Instance'

// Set to false to use the new Grails 1.2 JSONBuilder in the render method
grails.json.legacy.builder = false
// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true
// packages to include in Spring bean scanning
grails.spring.bean.packages = []
// whether to disable processing of multi part requests
grails.web.disable.multipart=false

// request parameters to mask when logging exceptions
grails.exceptionresolver.params.exclude = ['password']

// enable query caching by default
grails.hibernate.cache.queries = true

/******************************************************************************\
 *  ENVIRONMENTS
\******************************************************************************/
environments {
    development {
        grails.logging.jul.usebridge = true
        //grails.hostname = "localhost"
        grails.hostname = "moyesyside.ala.org.au"
        serverName = "http://${grails.hostname}:8085"
        contextPath = "/sightings"
        //grails.hostname = "192.168.0.18"
        grails.serverURL = "http://${grails.hostname}:8085/sightings"
        upload.images.url = "http://${grails.hostname}/sightings/images/"
//	      ala.locationBookmarkServerURL = "http://${grails.hostname}:8086/fielddata/location/"
//        ala.recordsServerURL = "http://${grails.hostname}:8086/fielddata/record/"
        ala.locationBookmarkServerURL = "http://fielddata.ala.org.au/location/"
        ala.recordsServerURL = "http://fielddata.ala.org.au/record/"
    }
    production {
        grails.logging.jul.usebridge = false
        grails.hostname = "sightings.ala.org.au"
        serverName = "http://${grails.hostname}"
        contextPath = ""
        grails.serverURL = "http://${grails.hostname}"
        upload.images.url = "http://${grails.hostname}/uploaded-media/"
        ala.locationBookmarkServerURL = "http://fielddata.ala.org.au/location/"
        ala.recordsServerURL = "http://fielddata.ala.org.au/record/"
        upload.images.path = '/data/sightings/uploaded-media'
    }
}

/******************************************************************************\
 *  LOG CONFIG
\******************************************************************************/
log4j = {
    // Example of changing the log pattern for the default console
    // appender:
    //
    appenders {
        environments{
            development {
                console name: "stdout", layout: pattern(conversionPattern: "%d [%c{1}]  %m%n"), threshold: org.apache.log4j.Level.DEBUG
            }
            production {
                rollingFile name: "sightingsLog",
                        maxFileSize: 104857600,
                        file: "/var/log/tomcat6/sightings.log",
                        threshold: org.apache.log4j.Level.DEBUG,
                        layout: pattern(conversionPattern: "%d [%c{1}]  %m%n")
                rollingFile name: "stacktrace", maxFileSize: 1024, file: "/var/log/tomcat6/sightings-stacktrace.log"
            }
        }
    }

   // all 'org.codehaus.groovy.grails.web.mapping'

    error  'org.codehaus.groovy.grails.web.servlet',  //  controllers
           'org.codehaus.groovy.grails.web.pages', //  GSP
           'org.codehaus.groovy.grails.web.sitemesh', //  layouts
           'org.codehaus.groovy.grails.web.mapping.filter', // URL mapping
           'org.codehaus.groovy.grails.web.mapping', // URL mapping
           'org.codehaus.groovy.grails.commons', // core / classloading
           'org.codehaus.groovy.grails.plugins', // plugins
           'org.codehaus.groovy.grails.orm.hibernate', // hibernate integration
           'org.springframework',
           'org.hibernate',
           'net.sf.ehcache.hibernate'
}
