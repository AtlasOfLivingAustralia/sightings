package au.org.ala.sightings

import org.springframework.web.multipart.MultipartFile
import grails.converters.JSON
import com.drew.imaging.ImageMetadataReader
import com.drew.metadata.Metadata
import com.drew.metadata.Directory
import com.drew.metadata.exif.ExifSubIFDDirectory
import com.drew.metadata.exif.GpsDirectory
import com.drew.lang.GeoLocation
import java.text.SimpleDateFormat
import java.text.DecimalFormat
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import org.imgscalr.Scalr

class ImageController {

    static defaultAction = "demo"

    def test() {}

    def exif() {
        def f = new File("/data/sightings/DSCN6487.jpg")
        def result = getExifMetadata(f)
        render result as JSON
    }

    private Map getExifMetadata(file) {
        def exif = [:]

        Metadata metadata = ImageMetadataReader.readMetadata(file);

        Directory directory = metadata.getDirectory(ExifSubIFDDirectory.class)
        if (directory) {
            Date date = directory.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL)
            exif.date = date
        }

        Directory gpsDirectory = metadata.getDirectory(GpsDirectory.class)
        if (gpsDirectory) {
            /*gpsDirectory.getTags().each {
                println it.getTagType()
                println it.getTagName()
                println it.getTagTypeHex()
                println it.getDescription()
                println it.toString()
            }*/
            //def lat = gpsDirectory.getRationalArray(GpsDirectory.TAG_GPS_LATITUDE)
            //def lng = gpsDirectory.getRationalArray(GpsDirectory.TAG_GPS_LONGITUDE)
            GeoLocation loc = gpsDirectory.getGeoLocation()
            exif.latitude = gpsDirectory.getDescription(GpsDirectory.TAG_GPS_LATITUDE)
            exif.longitude = gpsDirectory.getDescription(GpsDirectory.TAG_GPS_LONGITUDE)
            exif.decLat = loc.latitude
            exif.decLng = loc.longitude
        }

        return exif
    }

    private isoDateStrToDate(date) {
        if (date) {
            SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy")
            return sdf.format(date)
        }
        return ""
    }

    private isoDateStrToTime(date) {
        if (date) {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm")
            return sdf.format(date)
        }
        return ""
    }

    private doubleToString(d) {
        if (d) {
            DecimalFormat df = new DecimalFormat("0.0000000")
            return df.format(d)
        }
        return ""
    }

    def sample() {}

    def demo() {}

    def upload = {
        println "-------------------------------upload action"
        params.each { println it }
        def result = []
        if (request.respondsTo('getFile')) {
            MultipartFile file = request.getFile('files')
            //println "file is " + file
            if (file?.size) {  // will only have size if a file was selected
                def filename = file.getOriginalFilename().replaceAll(' ','_')
                def bits = filename.tokenize('.')
                def filenamename = bits[0]
                def ext = bits[1]
                def thumbFilename = filenamename + "-thumb." + ext
                //println "filename=${filename}"

                def colDir = new File(grailsApplication.config.upload.images.path as String)
                colDir.mkdirs()
                File f = new File(colDir, filename)
                //println "saving ${filename} to ${f.absoluteFile}"
                file.transferTo(f)
                def exifMd = getExifMetadata(f)

                // thumbnail it
                BufferedImage img = ImageIO.read(f)
                BufferedImage tn = Scalr.resize(img, 100, Scalr.OP_ANTIALIAS)
                File tnFile = new File(colDir, thumbFilename)
                try {
                    ImageIO.write(tn, ext, tnFile)
                } catch(IOException e) {
                    println "Write error for " + tnFile.getPath() + ": " + e.getMessage()
                }

                def md = [
                        name: filename,
                        size: file.size,
                        isoDate: exifMd.date,
                        date: isoDateStrToDate(exifMd.date) ?: 'Not available',
                        time: isoDateStrToTime((exifMd.date)),
                        decimalLatitude: doubleToString(exifMd.decLat),
                        decimalLongitude: doubleToString(exifMd.decLng),
                        verbatimLatitude: exifMd.latitude,
                        verbatimLongitude: exifMd.longitude,
                        url: grailsApplication.config.upload.images.url + filename,
                        thumbnail_url: grailsApplication.config.upload.images.url +
                                thumbFilename,
                        delete_url: grailsApplication.config.grails.serverURL +
                                "/image/delete?filename=" + filename,
                        delete_type: 'DELETE']
                result = [md]
            }
        }
        println result
        render result as JSON
    }

    def delete = {
        println "deleted " + params.filename
        render 'Deleted'
    }
}
