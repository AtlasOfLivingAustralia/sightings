package au.org.ala.sightings

import grails.converters.JSON
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import groovy.json.JsonSlurper

class WebService {

    def get(String url) {
        def conn = new URL(url).openConnection()
        try {
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            return conn.content.text
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out calling web service. URL= \${url}."]
            println error.error
            return error as JSON
        } catch (Exception e) {
            def error = [error: "Failed calling web service. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
            println error.error
            return error as JSON
        } finally {
            if (conn != null){
                conn.disconnect()
            }
        }
    }

    def getJson(String url) {
        def conn = new URL(url).openConnection()
        try {
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            def json = conn.content.text
            return JSON.parse(json)
        } catch (ConverterException e) {
            def error = ['error': "Failed to parse json. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
            println error.error
            return error
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out getting json. URL= \${url}."]
            println error.error
            return error
        } catch (Exception e) {
            def error = [error: "Failed to get json from web service. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
            println error.error
            return error
        } finally {
            if (conn != null){
                conn.disconnect()
            }
        }
    }

    def doPost(String url, String postBody) {
        //println "WebService:" + postBody
        def conn = new URL(url).openConnection()
        try {
            conn.setDoOutput(true)
            conn.setRequestMethod("POST")
            conn.setRequestProperty("Content-Type", "application/json");
            OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream())
            wr.write(postBody)
            wr.flush()
            BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            def resp = ""
            while ((line = rd.readLine()) != null) {
                resp += line
            }
            rd.close()
            wr.close()
            return [error:  null, resp: JSON.parse(resp)]
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out calling web service. URL= \${url}."]
            println error.error
            return [error: error]
        } catch (Exception e) {
            def error = [error: "Failed calling web service. ${e.getClass()} ${e.getMessage()} ${e} URL= ${url}."]
            println error.error
            return [error: error]
        } finally {
            if (conn != null){
                conn.disconnect()
            }
        }
    }

    def doPost(String url) {
        //println "WebService:" + postBody
        HttpURLConnection conn = (HttpURLConnection)(new URL(url).openConnection())
        try {
            conn.setRequestMethod("POST")
            conn.setDoOutput(false)
            conn.setRequestProperty("Content-Type", "application/json");
            BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            def resp = ""
            while ((line = rd.readLine()) != null) {
                resp += line
            }
            rd.close()
            return [error:  null, resp: JSON.parse(resp)]
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out calling web service. URL= \${url}."]
            println error.error
            return [error: error]
        } catch (Exception e) {
            def error = [error: "Failed calling web service. ${e.getClass()} ${e.getMessage()} ${e} URL= ${url}."]
            println error.error
            return [error: error]
        } finally {
            if (conn != null){
                conn.disconnect()
            }
        }
    }

    def doDelete(String url) {
        def conn = new URL(url).openConnection()
        try {
            conn.setRequestMethod("DELETE")
            return conn.getResponseCode()
        } catch(Exception e){
            println error.error
            return 500
        } finally {
            if (conn != null){
                conn.disconnect()
            }
        }
    }
}
