package au.org.ala.sightings

import org.springframework.web.context.request.RequestContextHolder
import au.org.ala.cas.util.AuthenticationCookieUtils
import org.apache.commons.lang.time.DateUtils

class AuthService {

  def grailsApplication

  def webService

  def serviceMethod() {}

  private def userEmailMap = [:]
  private def userIdMap = [:]

  private def lastRefresh

  def getLoggedInUserId(request){
      //def userName = AuthenticationCookieUtils.getUserName(request)
      //translate to userId...
      def userName = AuthenticationCookieUtils.getUserName(request)
      if(userName){
        getUserEmailMap()?.get(userName)?.get("id").toString()
      } else {
        null
      }
  }

  def userId() {
    //RequestContextHolder.currentRequestAttributes()?.getUserPrincipal()?.attributes.each {println it}
    return (RequestContextHolder.currentRequestAttributes()?.getUserPrincipal()?.attributes?.userid?.toString()?.toLowerCase()  ) ?: null
  }

  def username() {
    return (RequestContextHolder.currentRequestAttributes()?.getUserPrincipal()?.attributes?.email?.toString()?.toLowerCase()  ) ?: null
  }

  def displayName() {
    if (RequestContextHolder.currentRequestAttributes()?.getUserPrincipal()?.attributes?.firstname) {
      ((RequestContextHolder.currentRequestAttributes()?.getUserPrincipal()?.attributes?.firstname) +
              " " + (RequestContextHolder.currentRequestAttributes()?.getUserPrincipal()?.attributes?.lastname))
    } else {
      null
    }
  }

  protected boolean userInRole(role) {
    return  grailsApplication.config.security.cas.bypass ||
            RequestContextHolder.requestAttributes?.isUserInRole(role) // || isAdmin()
  }

  def userDisplayNameForEmail(email) {
      def map = getUserEmailMap().get(email)
      map("firstname") + " " + map("lastname")
  }

  def userDisplayNameForId(userId) {
      def map = getUserIdMap().get(userId)
      map.get("firstName") + " " + map.get("lastName")
  }

  def getUserEmailMap() {
    def now = new Date()
    if(!lastRefresh ||  DateUtils.addMinutes(lastRefresh, 10) < now){
            refreshMaps(now)
    }
    this.userEmailMap
  }

  def getUserIdMap() {
    def now = new Date()
    if(!lastRefresh ||  DateUtils.addMinutes(lastRefresh, 10) < now){
           refreshMaps(now)
    }
    this.userIdMap
  }

  def refreshMaps(now){
    try {
        def replacementEmailMap = [:]
        def replacementIdMap = [:]
        def userListJson = webService.doPost(grailsApplication.config.userDetails.emails.url)
        log.info "Refreshing user lists....."
        if (userListJson && !userListJson.error) {
            userListJson.resp.each {
                //println("Adding: " + it.email +" -> " + it.id)
                replacementEmailMap.put(it.email.toLowerCase(),  it);
                replacementIdMap.put(it.id.toString(),  it);
            }
        } else {
            log.info "error -  " + userListJson.getClass() + ":"+ userListJson
        }
        this.userEmailMap = replacementEmailMap
        this.userIdMap = replacementIdMap
        lastRefresh = now
    } catch (Throwable e) {
        log.error "Cache refresh error" + e.message
        e.printStackTrace(System.out)
     } catch (Error e) {
        log.error "Cache refresh error" + e.message
        e.printStackTrace(System.out)
    }
  }
}

