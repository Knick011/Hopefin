package com.brainbites;

import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class BrainBitesLifecycleListener implements Application.ActivityLifecycleCallbacks {
    private static final String TAG = "BrainBitesLifecycle";
    
    private int activityReferences = 0;
    private boolean isActivityChangingConfigurations = false;
    
    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {}
    
    @Override
    public void onActivityStarted(Activity activity) {
        if (++activityReferences == 1 && !isActivityChangingConfigurations) {
            // App entered foreground
            Log.d(TAG, "BrainBites app entered foreground");
            notifyTimerService(activity, true);
        }
    }
    
    @Override
    public void onActivityResumed(Activity activity) {}
    
    @Override
    public void onActivityPaused(Activity activity) {}
    
    @Override
    public void onActivityStopped(Activity activity) {
        isActivityChangingConfigurations = activity.isChangingConfigurations();
        if (--activityReferences == 0 && !isActivityChangingConfigurations) {
            // App entered background
            Log.d(TAG, "BrainBites app entered background");
            notifyTimerService(activity, false);
        }
    }
    
    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}
    
    @Override
    public void onActivityDestroyed(Activity activity) {}
    
    private void notifyTimerService(Activity activity, boolean isForeground) {
        try {
            Intent intent = new Intent(activity, BrainBitesTimerService.class);
            intent.setAction(isForeground ? 
                BrainBitesTimerService.ACTION_APP_FOREGROUND : 
                BrainBitesTimerService.ACTION_APP_BACKGROUND);
            activity.startService(intent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to notify timer service", e);
        }
    }
}