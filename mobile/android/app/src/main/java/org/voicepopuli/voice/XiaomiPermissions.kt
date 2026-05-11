package org.voicepopuli.voice

import android.app.Activity
import android.app.AlertDialog
import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Intent

private const val OP_AUTO_START = 10008

fun Activity.ensureMiuiAutostart() {
    if (!isMiui()) return
    if (isMiuiAutostartGranted()) return

    AlertDialog.Builder(this)
        .setTitle("Enable autostart")
        .setMessage("On Xiaomi devices, autostart must be enabled for Voice to receive incoming calls when the app is closed.")
        .setPositiveButton("Open settings") { _, _ ->
            startActivity(miuiAutostartIntent())
        }
        .setNegativeButton("Later", null)
        .show()
}

fun isMiui(): Boolean = getSystemProperty("ro.miui.ui.version.name").isNotEmpty()

private fun Activity.isMiuiAutostartGranted(): Boolean {
    return try {
        val mgr = getSystemService(AppOpsManager::class.java)
        val method = AppOpsManager::class.java.getMethod(
            "checkOpNoThrow", Int::class.java, Int::class.java, String::class.java
        )
        val result = method.invoke(mgr, OP_AUTO_START, android.os.Process.myUid(), packageName) as Int
        result == AppOpsManager.MODE_ALLOWED
    } catch (e: Exception) {
        true // non-miui or api changed — assume granted, don't prompt
    }
}

private fun miuiAutostartIntent() = Intent().apply {
    component = ComponentName(
        "com.miui.securitycenter",
        "com.miui.permcenter.autostart.AutoStartManagementActivity"
    )
}

private fun getSystemProperty(key: String): String {
    return try {
        val clazz = Class.forName("android.os.SystemProperties")
        clazz.getMethod("get", String::class.java).invoke(null, key) as? String ?: ""
    } catch (e: Exception) { "" }
}
