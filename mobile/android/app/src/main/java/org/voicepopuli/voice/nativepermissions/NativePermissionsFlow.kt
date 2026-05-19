package org.voicepopuli.voice.nativepermissions

import android.app.Activity
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log

class NativePermissionsFlow(private val activity: Activity) {

    private data class PermissionStep(
        val isGranted: () -> Boolean,
        val prompt: () -> Unit,
        val alwaysIncrementStepAfterPrompt: Boolean,
    )

    private val steps: List<PermissionStep> = listOf(
        PermissionStep(
            isGranted = {
                Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE ||
                activity.getSystemService(NotificationManager::class.java).canUseFullScreenIntent()
            },
            prompt = {
                activity.startActivity(
                    Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)
                        .setData(Uri.parse("package:${activity.packageName}"))
                )
            },
            alwaysIncrementStepAfterPrompt = true
        ),
        PermissionStep(
            isGranted = {
                activity.getSystemService(PowerManager::class.java)
                    .isIgnoringBatteryOptimizations(activity.packageName)
            },
            prompt = {
                activity.startActivity(
                    Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                        .setData(Uri.parse("package:${activity.packageName}"))
                )
            },
            alwaysIncrementStepAfterPrompt = true
        ),
        PermissionStep(
            isGranted = { !isMiui() || activity.isMiuiAutostartGranted() },
            prompt = { activity.promptMiuiAutostart(onSkip = { isStepInProgress = false; currentStepIndex++; runNativePermissions() }) },
            alwaysIncrementStepAfterPrompt = false
        ),
        PermissionStep(
            isGranted = { !isMiui() || activity.isMiuiAppPermissionsGranted() },
            prompt = { activity.promptMiuiAppPermissions(onSkip = { isStepInProgress = false; currentStepIndex++; runNativePermissions() }) },
            alwaysIncrementStepAfterPrompt = false
        ),
    )

    val hasStarted: Boolean get() = currentStepIndex > 0 || isStepInProgress
    private var currentStepIndex = 0
    private var isStepInProgress = false

    fun runNativePermissions() {
        Log.d("NativePermissions", "RUN ran")

        while (currentStepIndex < steps.size && steps[currentStepIndex].isGranted()) {
            Log.d("NativePermissions", "step $currentStepIndex granted, advancing")
            currentStepIndex++
            isStepInProgress = false
        }
        if (currentStepIndex < steps.size && !isStepInProgress) {
            Log.d("NativePermissions", "prompting step $currentStepIndex")
            isStepInProgress = true
            steps[currentStepIndex].prompt()
            if (steps[currentStepIndex].alwaysIncrementStepAfterPrompt) {
                currentStepIndex++ // enables some steps' "Deny" to act as "Skip"
                isStepInProgress = false
            }
        }
}
}
