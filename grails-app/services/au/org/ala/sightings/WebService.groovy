package au.org.ala.sightings

import grails.converters.JSON

class WebService {

    def doPost(String url, String postBody) {
        //println "WebService:" + postBody
        def conn = new URL(url).openConnection()
        try {
            conn.setDoOutput(true)
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
        }
    }

    def doDelete(String url) {
        def conn = new URL(url).openConnection()
        conn.setRequestMethod("DELETE")
        return conn.getResponseCode()
    }
}
