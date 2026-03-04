package com.anonymous.x7610999068365602850;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.List;

public class NotificationListenerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NotificationListenerModule";
    private static final String E_PERMISSION_DENIED = "E_PERMISSION_DENIED";
    private static final String E_LISTENER_NOT_ENABLED = "E_LISTENER_NOT_ENABLED";
    
    private final ReactApplicationContext reactContext;
    private BroadcastReceiver notificationReceiver;
    private boolean isListening = false;
    
    public NotificationListenerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // 注册广播接收器
        registerNotificationReceiver();
    }
    
    @Override
    public String getName() {
        return "NotificationListenerModule";
    }
    
    private void registerNotificationReceiver() {
        if (notificationReceiver != null) {
            return;
        }
        
        notificationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null || !intent.getAction().equals("com.anonymous.x7610999068365602850.NOTIFICATION_RECEIVED")) {
                    return;
                }
                
                String packageName = intent.getStringExtra("packageName");
                String title = intent.getStringExtra("title");
                String text = intent.getStringExtra("text");
                long timestamp = intent.getLongExtra("timestamp", 0);
                
                WritableMap params = Arguments.createMap();
                params.putString("packageName", packageName);
                if (title != null) params.putString("title", title);
                if (text != null) params.putString("text", text);
                params.putDouble("timestamp", timestamp);
                
                sendEvent("onNotificationReceived", params);
                
                Log.d(TAG, "Notification received: " + packageName);
            }
        };
        
        IntentFilter filter = new IntentFilter("com.anonymous.x7610999068365602850.NOTIFICATION_RECEIVED");
        reactContext.registerReceiver(notificationReceiver, filter, Context.RECEIVER_EXPORTED);
    }
    
    private void unregisterNotificationReceiver() {
        if (notificationReceiver != null) {
            try {
                reactContext.unregisterReceiver(notificationReceiver);
            } catch (Exception e) {
                Log.e(TAG, "Error unregistering receiver", e);
            }
            notificationReceiver = null;
        }
    }
    
    private void sendEvent(String eventName, Object params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
    
    @ReactMethod
    public void requestPermission(final Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting permission", e);
            promise.reject(E_PERMISSION_DENIED, "Failed to open notification listener settings");
        }
    }
    
    @ReactMethod
    public void checkPermission(final Promise promise) {
        try {
            String packageName = reactContext.getPackageName();
            String enabledListeners = Settings.Secure.getString(
                reactContext.getContentResolver(),
                "enabled_notification_listeners"
            );
            
            boolean isEnabled = enabledListeners != null && enabledListeners.contains(packageName);
            promise.resolve(isEnabled);
        } catch (Exception e) {
            Log.e(TAG, "Error checking permission", e);
            promise.reject(E_LISTENER_NOT_ENABLED, "Failed to check permission");
        }
    }
    
    @ReactMethod
    public void startListening(final Promise promise) {
        try {
            // 检查权限
            String packageName = reactContext.getPackageName();
            String enabledListeners = Settings.Secure.getString(
                reactContext.getContentResolver(),
                "enabled_notification_listeners"
            );
            
            if (enabledListeners == null || !enabledListeners.contains(packageName)) {
                promise.reject(E_PERMISSION_DENIED, "Notification listener permission not granted");
                return;
            }
            
            isListening = true;
            promise.resolve(null);
            
            Log.d(TAG, "Started listening for notifications");
        } catch (Exception e) {
            Log.e(TAG, "Error starting listening", e);
            promise.reject(E_LISTENER_NOT_ENABLED, "Failed to start listening");
        }
    }
    
    @ReactMethod
    public void stopListening(final Promise promise) {
        try {
            isListening = false;
            promise.resolve(null);
            
            Log.d(TAG, "Stopped listening for notifications");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping listening", e);
            promise.reject(E_LISTENER_NOT_ENABLED, "Failed to stop listening");
        }
    }
    
    @ReactMethod
    public void getNotifications(final Promise promise) {
        try {
            NotificationListenerService service = NotificationListenerService.getInstance();
            if (service == null) {
                promise.resolve(Arguments.createArray());
                return;
            }
            
            List<StatusBarNotification> notifications = service.getCachedNotifications();
            WritableArray result = Arguments.createArray();
            
            for (StatusBarNotification sbn : notifications) {
                WritableMap notificationMap = Arguments.createMap();
                notificationMap.putString("packageName", sbn.getPackageName());
                
                Notification notification = sbn.getNotification();
                if (notification != null && notification.extras != null) {
                    android.os.Bundle extras = notification.extras;
                    
                    CharSequence title = extras.getCharSequence(Notification.EXTRA_TITLE);
                    if (title != null) {
                        notificationMap.putString("title", title.toString());
                    }
                    
                    CharSequence text = extras.getCharSequence(Notification.EXTRA_TEXT);
                    CharSequence bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
                    if (text != null) {
                        notificationMap.putString("text", text.toString());
                    } else if (bigText != null) {
                        notificationMap.putString("text", bigText.toString());
                    }
                }
                
                notificationMap.putDouble("timestamp", sbn.getPostTime());
                result.pushMap(notificationMap);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting notifications", e);
            promise.reject("E_GET_NOTIFICATIONS", "Failed to get notifications");
        }
    }
    
    @ReactMethod
    public void clearNotifications(final Promise promise) {
        try {
            NotificationListenerService service = NotificationListenerService.getInstance();
            if (service != null) {
                service.clearCache();
            }
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Error clearing notifications", e);
            promise.reject("E_CLEAR_NOTIFICATIONS", "Failed to clear notifications");
        }
    }
    
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        unregisterNotificationReceiver();
    }
}
