package com.brainbites.modules;

import android.app.AppOpsManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

public class UsageStatsModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "UsageStatsModule";
    private static final String TAG = "BrainBitesTimer";
    private static final String PREFS_NAME = "BrainBitesPrefs";
    private static final String KEY_AVAILABLE_TIME = "available_time";
    private static final String KEY_BLOCKED_APPS = "blocked_apps";
    private static final String CHANNEL_ID = "brainbites_timer";
    private static final int NOTIFICATION_ID = 1001;

    private final ReactApplicationContext reactContext;
    private SharedPreferences prefs;
    private UsageStatsManager usageStatsManager;
    private Handler handler;
    private Runnable timerRunnable;
    private boolean isTimerRunning = false;
    private long availableTimeSeconds = 300; // Start with 5 minutes

    public UsageStatsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        this.usageStatsManager = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
        this.handler = new Handler(Looper.getMainLooper());
        
        // Load saved time
        this.availableTimeSeconds = prefs.getLong(KEY_AVAILABLE_TIME, 300);
        
        // Create notification channel
        createNotificationChannel();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void isTimerServiceAvailable(Promise promise) {
        try {
            boolean hasPermission = hasUsageStatsPermission();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestUsageStatsPermission(Promise promise) {
        try {
            if (!hasUsageStatsPermission()) {
                Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } else {
                promise.resolve(false); // Already has permission
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getAvailableTime(Promise promise) {
        try {
            promise.resolve((double) availableTimeSeconds);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void addBonusTime(double seconds, Promise promise) {
        try {
            availableTimeSeconds += (long) seconds;
            saveAvailableTime();
            updateNotification();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void consumeTime(double seconds, Promise promise) {
        try {
            availableTimeSeconds = Math.max(0, availableTimeSeconds - (long) seconds);
            saveAvailableTime();
            updateNotification();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void startMonitoring(Promise promise) {
        try {
            if (!hasUsageStatsPermission()) {
                promise.reject("NO_PERMISSION", "Usage stats permission not granted");
                return;
            }

            startTimerService();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void stopMonitoring(Promise promise) {
        try {
            stopTimerService();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            WritableArray apps = Arguments.createArray();
            PackageManager pm = reactContext.getPackageManager();
            List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);

            for (ApplicationInfo appInfo : packages) {
                // Filter out system apps
                if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                    WritableMap app = Arguments.createMap();
                    app.putString("packageName", appInfo.packageName);
                    app.putString("appName", pm.getApplicationLabel(appInfo).toString());
                    apps.pushMap(app);
                }
            }

            promise.resolve(apps);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void setBlockedApps(ReadableArray packageNames, Promise promise) {
        try {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < packageNames.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(packageNames.getString(i));
            }
            
            prefs.edit().putString(KEY_BLOCKED_APPS, sb.toString()).apply();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), reactContext.getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private void saveAvailableTime() {
        prefs.edit().putLong(KEY_AVAILABLE_TIME, availableTimeSeconds).apply();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "BrainBites Timer",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows remaining app time");
            
            NotificationManager notificationManager = reactContext.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void startTimerService() {
        if (isTimerRunning) return;
        
        isTimerRunning = true;
        Intent serviceIntent = new Intent(reactContext, TimerService.class);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent);
        } else {
            reactContext.startService(serviceIntent);
        }
        
        startMonitoringApps();
    }

    private void stopTimerService() {
        isTimerRunning = false;
        Intent serviceIntent = new Intent(reactContext, TimerService.class);
        reactContext.stopService(serviceIntent);
        
        if (timerRunnable != null) {
            handler.removeCallbacks(timerRunnable);
        }
    }

    private void startMonitoringApps() {
        timerRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isTimerRunning) return;
                
                checkCurrentApp();
                handler.postDelayed(this, 1000); // Check every second
            }
        };
        
        handler.post(timerRunnable);
    }

    private void checkCurrentApp() {
        if (availableTimeSeconds <= 0) {
            // No time left, potentially close/minimize apps
            return;
        }

        String currentApp = getCurrentForegroundApp();
        if (currentApp != null && isAppBlocked(currentApp)) {
            // Deduct time
            availableTimeSeconds--;
            saveAvailableTime();
            updateNotification();
            
            if (availableTimeSeconds <= 0) {
                // Time's up - send user back to BrainBites
                Intent intent = reactContext.getPackageManager()
                        .getLaunchIntentForPackage(reactContext.getPackageName());
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(intent);
                }
            }
        }
    }

    private String getCurrentForegroundApp() {
        long currentTime = System.currentTimeMillis();
        List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                currentTime - 1000 * 10, // Last 10 seconds
                currentTime
        );
        
        if (stats != null && !stats.isEmpty()) {
            UsageStats recentStats = null;
            for (UsageStats usageStats : stats) {
                if (recentStats == null || 
                    usageStats.getLastTimeUsed() > recentStats.getLastTimeUsed()) {
                    recentStats = usageStats;
                }
            }
            
            if (recentStats != null) {
                return recentStats.getPackageName();
            }
        }
        
        return null;
    }

    private boolean isAppBlocked(String packageName) {
        String blockedApps = prefs.getString(KEY_BLOCKED_APPS, "");
        if (blockedApps.isEmpty()) return false;
        
        String[] apps = blockedApps.split(",");
        for (String app : apps) {
            if (app.equals(packageName)) {
                return true;
            }
        }
        
        return false;
    }

    private void updateNotification() {
        NotificationManager notificationManager = 
            (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        
        if (availableTimeSeconds <= 0) {
            notificationManager.cancel(NOTIFICATION_ID);
            return;
        }
        
        String timeString = formatTime(availableTimeSeconds);
        boolean isWarning = availableTimeSeconds < 300; // Less than 5 minutes
        
        Intent intent = reactContext.getPackageManager()
                .getLaunchIntentForPackage(reactContext.getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
                reactContext, 0, intent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_menu_recent_history)
                .setContentTitle(isWarning ? "⚠️ Time Almost Up!" : "⏱️ BrainBites Timer")
                .setContentText(timeString + " remaining")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .setContentIntent(pendingIntent)
                .setOnlyAlertOnce(true);
        
        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }

    private String formatTime(long seconds) {
        long hours = TimeUnit.SECONDS.toHours(seconds);
        long minutes = TimeUnit.SECONDS.toMinutes(seconds) % 60;
        long secs = seconds % 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, secs);
        } else {
            return String.format("%ds", secs);
        }
    }

    // Inner Service class
    public static class TimerService extends Service {
        @Override
        public int onStartCommand(Intent intent, int flags, int startId) {
            // Create notification for foreground service
            createNotificationChannel();
            
            Intent notificationIntent = getPackageManager()
                    .getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this, 0, notificationIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle("BrainBites Timer Active")
                    .setContentText("Monitoring app usage")
                    .setSmallIcon(android.R.drawable.ic_menu_recent_history)
                    .setContentIntent(pendingIntent)
                    .build();
            
            startForeground(NOTIFICATION_ID, notification);
            
            return START_STICKY;
        }
        
        @Override
        public IBinder onBind(Intent intent) {
            return null;
        }
        
        private void createNotificationChannel() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "BrainBites Timer Service",
                        NotificationManager.IMPORTANCE_LOW
                );
                NotificationManager manager = getSystemService(NotificationManager.class);
                manager.createNotificationChannel(channel);
            }
        }
    }
}