package org.voicepopuli.voice

import android.app.Activity
import android.app.AlertDialog
import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent

private const val OP_AUTO_START = 10008
private const val OP_SHOW_WHEN_LOCKED = 10020
private const val OP_BACKGROUND_START_ACTIVITY = 10021
private const val OP_SERVICE_FOREGROUND = 10023


fun Activity.ensureMiuiAppPermissions(): Boolean {
    if (!isMiui()) return true

    val denied = buildList {
        if (!isMiuiPermissionGranted(OP_SHOW_WHEN_LOCKED)) add("Show on Lock screen")
        if (!isMiuiPermissionGranted(OP_BACKGROUND_START_ACTIVITY)) add("Display pop-up windows while running in the background")
        if (!isMiuiPermissionGranted(OP_SERVICE_FOREGROUND)) add("Permanent notification")
    }

    if (denied.isEmpty()) return true

    val permissionList = denied.joinToString("\n") { "• $it" }

    AlertDialog.Builder(this)
        .setTitle("Additional permissions needed")
        .setMessage("Voice needs the following permissions on Xiaomi devices to show incoming calls:\n\n$permissionList")
        .setPositiveButton("Open settings") { _, _ ->
            startActivity(miuiPermissionManagerIntent())
        }
        .setNegativeButton("Later", null)
        .show()
    return false
}

private fun Activity.isMiuiPermissionGranted(op: Int): Boolean {
    return try {
        val mgr = getSystemService(AppOpsManager::class.java)
        val method = AppOpsManager::class.java.getMethod(
            "checkOpNoThrow", Int::class.java, Int::class.java, String::class.java
        )
        val result = method.invoke(mgr, op, android.os.Process.myUid(), packageName) as Int
        result == AppOpsManager.MODE_ALLOWED
    } catch (e: Exception) {
        true
    }
}

private fun Activity.miuiPermissionManagerIntent() = Intent("miui.intent.action.APP_PERM_EDITOR").apply {
    setPackage("com.miui.securitycenter")
    putExtra("extra_package_uid", android.os.Process.myUid())
    putExtra("extra_pkgname", packageName)
}

fun Activity.ensureMiuiAutostart(): Boolean {
    if (!isMiui()) return true
    if (isMiuiAutostartGranted()) return true

    AlertDialog.Builder(this)
        .setTitle("Enable autostart")
        .setMessage("On Xiaomi devices, autostart must be enabled for Voice to receive incoming calls when the app is closed.")
        .setPositiveButton("Open settings") { _, _ ->
            startActivity(miuiAutostartIntent())
        }
        .setNegativeButton("Later", null)
        .show()
    return false
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
