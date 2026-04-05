package org.voicepopuli.voice.incomingcall

import org.voicepopuli.voice.ServerConfig
import java.net.HttpURLConnection
import java.net.URL

fun postCallDeclined(roomId: String) {
    val url = URL("${ServerConfig.BASE_URL}/api/rooms/$roomId/decline")
    val connection = url.openConnection() as HttpURLConnection
    try {
        connection.requestMethod = "POST"
        connection.connectTimeout = 5_000
        connection.readTimeout = 5_000
        connection.connect()
        connection.responseCode // the line that actually sends the request
    } finally {
        connection.disconnect()
    }
}
