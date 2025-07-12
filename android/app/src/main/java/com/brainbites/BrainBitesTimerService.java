package com.brainbites;

import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.facebook.react.HeadlessJsTaskService;

public class BrainBitesTimerService extends Service {
    private static final String TAG = "BrainBitesTimer";
    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "brainbites_timer_channel";
    private static final String PREFS_NAME = "BrainBitesTimerPrefs";
    private static final String KEY_REMAINING_TIME = "remaining_time";
    private static final String KEY_NEGATIVE_TIME = "negative_time";
    
    // Actions
    public static final String ACTION_UPDATE_TIME = "update_time";
    public static final String ACTION_ADD_TIME = "add_time";
    public static final String ACTION_START_TIMER = "start_timer";
    public static final String ACTION_STOP_TIMER = "stop_timer";
    public static final String ACTION_APP_FOREGROUND = "app_foreground";
    public static final String ACTION_APP_BACKGROUND = "app_background";
    public static final String ACTION_GET_TIME = "get_time";
    public static final String EXTRA_TIME_SECONDS = "time_seconds";
    
    private PowerManager powerManager;
    private KeyguardManager keyguardManager;
    private SharedPreferences sharedPrefs;
    private NotificationManager notificationManager;
    private Handler handler;
    private Runnable timerRunnable;
    
    private int remainingTimeSeconds = 0;
    private int negativeTimeSeconds = 0;
    private boolean isAppInForeground = true;
    private boolean isTimerRunning = false;
    private long lastTickTime = 0;
    
    private BroadcastReceiver screenReceiver;
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        sharedPrefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
        
        createNotificationChannel();
        loadSavedTime();
        
        // Register screen on/off receiver
        registerScreenReceiver();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            handleAction(intent);
        }
        
        return START_STICKY;
    }
    
    private void handleAction(Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Handling action: " + action);
        
        switch (action) {
            case ACTION_ADD_TIME:
                int secondsToAdd = intent.getIntExtra(EXTRA_TIME_SECONDS, 0);
                addTime(secondsToAdd);
                break;
                
            case ACTION_START_TIMER:
                startTimer();
                break;
                
            case ACTION_STOP_TIMER:
                stopTimer();
                break;
                
            case ACTION_APP_FOREGROUND:
                handleAppForeground();
                break;
                
            case ACTION_APP_BACKGROUND:
                handleAppBackground();
                break;
                
            case ACTION_GET_TIME:
                broadcastCurrentTime();
                break;
        }
    }
    
    private void addTime(int seconds) {
        remainingTimeSeconds += seconds;
        saveTime();
        updateNotification();
        broadcastUpdate();
        
        Log.d(TAG, "Added " + seconds + " seconds. Total: " + remainingTimeSeconds);
        
        // Start timer if not running and we have time
        if (remainingTimeSeconds > 0 && !isTimerRunning) {
            startTimer();
        }
    }
    
    private void startTimer() {
        if (isTimerRunning) return;
        
        isTimerRunning = true;
        lastTickTime = System.currentTimeMillis();
        
        // Start foreground service
        startForeground(NOTIFICATION_ID, createNotification());
        
        // Start timer loop
        timerRunnable = new Runnable() {
            @Override
            public void run() {
                tickTimer();
                handler.postDelayed(this, 1000);
            }
        };
        handler.post(timerRunnable);
        
        Log.d(TAG, "Timer started");
    }
    
    private void stopTimer() {
        isTimerRunning = false;
        
        if (timerRunnable != null) {
            handler.removeCallbacks(timerRunnable);
            timerRunnable = null;
        }
        
        stopForeground(true);
        Log.d(TAG, "Timer stopped");
    }
    
    private void tickTimer() {
        long currentTime = System.currentTimeMillis();
        int elapsedSeconds = (int) ((currentTime - lastTickTime) / 1000);
        lastTickTime = currentTime;
        
        boolean isScreenOn = powerManager.isInteractive();
        boolean isLocked = keyguardManager.isKeyguardLocked();
        
        // Timer counts down when:
        // 1. Screen is ON
        // 2. Device is NOT locked
        // 3. BrainBites app is NOT in foreground
        // 4. We have time OR we're counting negative
        boolean shouldDeductTime = isScreenOn && !isLocked && !isAppInForeground;
        
        if (shouldDeductTime && elapsedSeconds > 0) {
            if (remainingTimeSeconds > 0) {
                // Normal countdown
                remainingTimeSeconds = Math.max(0, remainingTimeSeconds - elapsedSeconds);
                
                // Check for warnings
                if (remainingTimeSeconds == 300) {
                    showLowTimeNotification(5);
                } else if (remainingTimeSeconds == 60) {
                    showLowTimeNotification(1);
                } else if (remainingTimeSeconds == 0) {
                    handleTimeExpired();
                }
            } else {
                // Count negative time (overtime usage)
                negativeTimeSeconds += elapsedSeconds;
                
                // Log every 10 seconds
                if (negativeTimeSeconds % 10 == 0) {
                    Log.d(TAG, "Overtime: -" + formatTime(negativeTimeSeconds));
                }
            }
        }
        
        // Update every second
        updateNotification();
        
        // Save every 5 seconds
        if (System.currentTimeMillis() % 5000 < 1000) {
            saveTime();
        }
        
        // Broadcast update
        broadcastUpdate();
    }
    
    private void handleAppForeground() {
        isAppInForeground = true;
        Log.d(TAG, "App in foreground - timer paused");
    }
    
    private void handleAppBackground() {
        isAppInForeground = false;
        Log.d(TAG, "App in background - timer active");
        
        // Ensure timer is running if we have time
        if (remainingTimeSeconds > 0 && !isTimerRunning) {
            startTimer();
        }
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "BrainBites Timer",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows remaining app time");
            channel.setShowBadge(false);
            notificationManager.createNotificationChannel(channel);
        }
    }
    
    private Notification createNotification() {
        Intent intent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        String title;
        String text;
        int iconRes = android.R.drawable.ic_menu_recent_history;
        
        if (remainingTimeSeconds > 0) {
            title = "⏱️ BrainBites Timer";
            text = formatTime(remainingTimeSeconds) + " remaining";
        } else if (negativeTimeSeconds > 0) {
            title = "⚠️ Overtime Usage!";
            text = "-" + formatTime(negativeTimeSeconds) + " (earning negative points)";
            iconRes = android.R.drawable.ic_dialog_alert;
        } else {
            title = "⏰ Time's Up!";
            text = "Complete quizzes to earn more time";
        }
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(iconRes)
            .setContentTitle(title)
            .setContentText(text)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .build();
    }
    
    private void updateNotification() {
        if (isTimerRunning) {
            notificationManager.notify(NOTIFICATION_ID, createNotification());
        }
    }
    
    private void showLowTimeNotification(int minutes) {
        String title = "⚠️ Low Time Warning!";
        String text = "Only " + minutes + " minute" + (minutes > 1 ? "s" : "") + " left!";
        
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build();
            
        notificationManager.notify(NOTIFICATION_ID + 1, notification);
    }
    
    private void handleTimeExpired() {
        Log.d(TAG, "Time expired!");
        
        // Show expiry notification
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("⏰ Time's Up!")
            .setContentText("Complete quizzes to earn more time!")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build();
            
        notificationManager.notify(NOTIFICATION_ID + 2, notification);
    }
    
    private void saveTime() {
        sharedPrefs.edit()
            .putInt(KEY_REMAINING_TIME, remainingTimeSeconds)
            .putInt(KEY_NEGATIVE_TIME, negativeTimeSeconds)
            .apply();
    }
    
    private void loadSavedTime() {
        remainingTimeSeconds = sharedPrefs.getInt(KEY_REMAINING_TIME, 300); // Default 5 minutes
        negativeTimeSeconds = sharedPrefs.getInt(KEY_NEGATIVE_TIME, 0);
        Log.d(TAG, "Loaded time: " + remainingTimeSeconds + "s, negative: " + negativeTimeSeconds + "s");
    }
    
    private void broadcastUpdate() {
        Intent intent = new Intent("com.brainbites.TIMER_UPDATE");
        intent.putExtra("remainingTime", remainingTimeSeconds);
        intent.putExtra("negativeTime", negativeTimeSeconds);
        intent.putExtra("isRunning", isTimerRunning);
        sendBroadcast(intent);
    }
    
    private void broadcastCurrentTime() {
        broadcastUpdate();
    }
    
    private String formatTime(int seconds) {
        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        int secs = seconds % 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, secs);
        } else {
            return String.format("%ds", secs);
        }
    }
    
    private void registerScreenReceiver() {
        screenReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (Intent.ACTION_SCREEN_OFF.equals(intent.getAction())) {
                    Log.d(TAG, "Screen turned OFF");
                } else if (Intent.ACTION_SCREEN_ON.equals(intent.getAction())) {
                    Log.d(TAG, "Screen turned ON");
                }
            }
        };
        
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction(Intent.ACTION_SCREEN_ON);
        registerReceiver(screenReceiver, filter);
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        stopTimer();
        if (screenReceiver != null) {
            unregisterReceiver(screenReceiver);
        }
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}