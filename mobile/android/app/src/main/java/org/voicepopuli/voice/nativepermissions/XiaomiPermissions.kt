package org.voicepopuli.voice.nativepermissions

import android.app.Activity
import android.app.AlertDialog
import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Intent
import org.voicepopuli.voice.R

private const val OP_AUTO_START = 10008
private const val OP_SHOW_WHEN_LOCKED = 10020
private const val OP_BACKGROUND_START_ACTIVITY = 10021
private const val OP_SERVICE_FOREGROUND = 10023

fun isMiui(): Boolean = getSystemProperty("ro.miui.ui.version.name").isNotEmpty()

fun Activity.isMiuiAutostartGranted(): Boolean {
    return try {
        val mgr = getSystemService(AppOpsManager::class.java)
        val method =
            AppOpsManager::class.java.getMethod("checkOpNoThrow", Int::class.java, Int::class.java, String::class.java)
        val result = method.invoke(mgr, OP_AUTO_START, android.os.Process.myUid(), packageName) as Int
        result == AppOpsManager.MODE_ALLOWED
    } catch (e: Exception) {
        true
    }
}

fun Activity.isMiuiAppPermissionsGranted(): Boolean =
    isMiuiPermissionGranted(OP_SHOW_WHEN_LOCKED) &&
        isMiuiPermissionGranted(OP_BACKGROUND_START_ACTIVITY) &&
        isMiuiPermissionGranted(OP_SERVICE_FOREGROUND)

fun Activity.promptMiuiAutostart(onSkip: () -> Unit) {
    AlertDialog.Builder(this)
        .setTitle(getString(R.string.miui_autostart_title))
        .setMessage(getString(R.string.miui_autostart_message))
        .setPositiveButton(getString(R.string.miui_open_settings)) { _, _ -> startActivity(miuiAutostartIntent()) }
        .setNegativeButton(getString(R.string.miui_skip)) { _, _ -> onSkip() }
        .show()
        .setCanceledOnTouchOutside(false)
}

fun Activity.promptMiuiAppPermissions(onSkip: () -> Unit) {
    val denied = buildList {
        if (!isMiuiPermissionGranted(OP_SHOW_WHEN_LOCKED)) add(getString(R.string.miui_permission_show_on_lock_screen))
        if (!isMiuiPermissionGranted(OP_BACKGROUND_START_ACTIVITY)) add(getString(R.string.miui_permission_popup_windows))
        if (!isMiuiPermissionGranted(OP_SERVICE_FOREGROUND)) add(getString(R.string.miui_permission_permanent_notification))
    }
    val permissionList = denied.joinToString("\n") { "• $it" }

    AlertDialog.Builder(this)
        .setTitle(getString(R.string.miui_permissions_title))
        .setMessage(getString(R.string.miui_permissions_message, permissionList))
        .setPositiveButton(getString(R.string.miui_open_settings)) { _, _ -> startActivity(miuiPermissionManagerIntent()) }
        .setNegativeButton(getString(R.string.miui_skip)) { _, _ -> onSkip() }
        .show()
        .setCanceledOnTouchOutside(false)
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

private fun miuiAutostartIntent() = Intent().apply {
    component = ComponentName(
        "com.miui.securitycenter",
        "com.miui.permcenter.autostart.AutoStartManagementActivity"
    )
}

private fun getSystemProperty(key: String): String {
    return try {
      val systemProperties = Class.forName("android.os.SystemProperties")
      systemProperties.getMethod("get", String::class.java).invoke(null, key) as? String ?: ""
    } catch (e: Exception) { "" }
}
