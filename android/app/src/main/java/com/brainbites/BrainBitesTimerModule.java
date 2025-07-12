package com.brainbites.modules;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.brainbites.BrainBitesTimerService;

public class BrainBitesTimerModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "BrainBitesTimer";
    private static final String TAG = "BrainBitesTimerModule";
    private static final String PREFS_NAME = "BrainBitesTimerPrefs";
    
    private final ReactApplicationContext reactContext;
    private BroadcastReceiver timerUpdateReceiver;
    private SharedPreferences sharedPrefs;
    
    public BrainBitesTimerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.sharedPrefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        registerTimerReceiver();
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    @ReactMethod
    public void startTracking(Promise promise) {
        try {
            Log.d(TAG, "Starting timer tracking");
            Intent intent = new Intent(reactContext, BrainBitesTimerService.class);
            intent.setAction(BrainBitesTimerService.ACTION_START_TIMER);
            reactContext.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting tracking", e);
            promise.reject("START_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void stopTracking(Promise promise) {
        try {
            Log.d(TAG, "Stopping timer tracking");
            Intent intent = new Intent(reactContext, BrainBitesTimerService.class);
            intent.setAction(BrainBitesTimerService.ACTION_STOP_TIMER);
            reactContext.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping tracking", e);
            promise.reject("STOP_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void addTime(double seconds, Promise promise) {
        try {
            int secondsInt = (int) seconds;
            Log.d(TAG, "Adding " + secondsInt + " seconds");
            
            Intent intent = new Intent(reactContext, BrainBitesTimerService.class);
            intent.setAction(BrainBitesTimerService.ACTION_ADD_TIME);
            intent.putExtra(BrainBitesTimerService.EXTRA_TIME_SECONDS, secondsInt);
            reactContext.startService(intent);
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error adding time", e);
            promise.reject("ADD_TIME_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void getRemainingTime(Promise promise) {
        try {
            int remainingTime = sharedPrefs.getInt("remaining_time", 0);
            promise.resolve(remainingTime);
        } catch (Exception e) {
            Log.e(TAG, "Error getting remaining time", e);
            promise.reject("GET_TIME_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void getNegativeTime(Promise promise) {
        try {
            int negativeTime = sharedPrefs.getInt("negative_time", 0);
            promise.resolve(negativeTime);
        } catch (Exception e) {
            Log.e(TAG, "Error getting negative time", e);
            promise.reject("GET_NEGATIVE_TIME_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void clearNegativeTime(Promise promise) {
        try {
            sharedPrefs.edit().putInt("negative_time", 0).apply();
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error clearing negative time", e);
            promise.reject("CLEAR_NEGATIVE_TIME_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void notifyAppState(String state, Promise promise) {
        try {
            Intent intent = new Intent(reactContext, BrainBitesTimerService.class);
            
            if ("app_foreground".equals(state)) {
                intent.setAction(BrainBitesTimerService.ACTION_APP_FOREGROUND);
            } else if ("app_background".equals(state)) {
                intent.setAction(BrainBitesTimerService.ACTION_APP_BACKGROUND);
            }
            
            reactContext.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error notifying app state", e);
            promise.reject("NOTIFY_STATE_ERROR", e.getMessage());
        }
    }
    
    private void registerTimerReceiver() {
        timerUpdateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if ("com.brainbites.TIMER_UPDATE".equals(intent.getAction())) {
                    int remainingTime = intent.getIntExtra("remainingTime", 0);
                    int negativeTime = intent.getIntExtra("negativeTime", 0);
                    boolean isRunning = intent.getBooleanExtra("isRunning", false);
                    
                    WritableMap params = Arguments.createMap();
                    params.putInt("remainingTime", remainingTime);
                    params.putInt("negativeTime", negativeTime);
                    params.putBoolean("isRunning", isRunning);
                    
                    sendEvent("TimerUpdate", params);
                }
            }
        };
        
        IntentFilter filter = new IntentFilter("com.brainbites.TIMER_UPDATE");
        reactContext.registerReceiver(timerUpdateReceiver, filter);
    }
    
    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }
    
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (timerUpdateReceiver != null) {
            reactContext.unregisterReceiver(timerUpdateReceiver);
        }
    }
}