package au.org.ala.sightings

import org.springframework.web.context.request.RequestContextHolder

class AuthService {

  def grailsApplication

  def serviceMethod() {}

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
}
