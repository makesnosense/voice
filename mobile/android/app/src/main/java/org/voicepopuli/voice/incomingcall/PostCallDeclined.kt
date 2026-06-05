package org.voicepopuli.voice.incomingcall

import com.google.android.gms.tasks.Tasks
import com.google.firebase.messaging.FirebaseMessaging
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit
import org.voicepopuli.voice.ServerConfig

fun postCallDeclined(roomId: String, callId: String) {
    val declinerFcmToken = Tasks.await(FirebaseMessaging.getInstance().token, 5, TimeUnit.SECONDS)

    val url = URL("${ServerConfig.BASE_URL}/api/rooms/$roomId/decline")
    val connection = url.openConnection() as HttpURLConnection
    try {
        connection.requestMethod = "POST"
        connection.connectTimeout = 5_000
        connection.readTimeout = 5_000
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true
        val body = """{"callId":"$callId","declinerFcmToken":"$declinerFcmToken"}"""
        connection.outputStream.use { stream -> stream.write(body.toByteArray(Charsets.UTF_8)) }
        connection.responseCode
    } finally {
        connection.disconnect()
    }
}
