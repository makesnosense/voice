package org.voicepopuli.voice.incomingcall

import java.net.HttpURLConnection
import java.net.URL
import org.voicepopuli.voice.ServerConfig

fun postCallDeclined(roomId: String, callId: String) {
    val url = URL("${ServerConfig.BASE_URL}/api/rooms/$roomId/decline")
    val connection = url.openConnection() as HttpURLConnection
    try {
        connection.requestMethod = "POST"
        connection.connectTimeout = 5_000
        connection.readTimeout = 5_000
        val body = """{"callId":"$callId"}"""
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true
        connection.outputStream.use { stream -> stream.write(body.toByteArray(Charsets.UTF_8)) }
        connection.responseCode
    } finally {
        connection.disconnect()
    }
}
