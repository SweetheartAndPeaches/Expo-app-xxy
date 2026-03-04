package com.anonymous.x7610999068365602850;

import android.app.Notification;
import android.content.Intent;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

public class NotificationListenerService extends NotificationListenerService {
    private static final String TAG = "NotificationListener";
    private static NotificationListenerService instance;
    private static List<StatusBarNotification> notificationCache = new ArrayList<>();
    
    // 单例模式
    public static NotificationListenerService getInstance() {
        return instance;
    }
    
    // 获取所有缓存的通知
    public static List<StatusBarNotification> getCachedNotifications() {
        return new ArrayList<>(notificationCache);
    }
    
    // 清空缓存
    public static void clearCache() {
        notificationCache.clear();
    }
    
    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        Log.d(TAG, "NotificationListenerService created");
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
        Log.d(TAG, "NotificationListenerService destroyed");
    }
    
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        
        // 忽略本应用的通知
        if (sbn.getPackageName().equals(getPackageName())) {
            return;
        }
        
        // 添加到缓存
        notificationCache.add(0, sbn);
        
        // 限制缓存数量，最多 100 条
        if (notificationCache.size() > 100) {
            notificationCache.remove(notificationCache.size() - 1);
        }
        
        // 发送事件
        Intent intent = new Intent("com.anonymous.x7610999068365602850.NOTIFICATION_RECEIVED");
        intent.putExtra("packageName", sbn.getPackageName());
        
        Notification notification = sbn.getNotification();
        if (notification != null) {
            // 使用 extras 获取通知内容
            android.os.Bundle extras = notification.extras;
            
            String title = extras.getCharSequence(Notification.EXTRA_TITLE) != null 
                ? extras.getCharSequence(Notification.EXTRA_TITLE).toString() 
                : "";
            String text = extras.getCharSequence(Notification.EXTRA_TEXT) != null 
                ? extras.getCharSequence(Notification.EXTRA_TEXT).toString() 
                : "";
            String bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT) != null 
                ? extras.getCharSequence(Notification.EXTRA_BIG_TEXT).toString() 
                : "";
            
            intent.putExtra("title", title);
            intent.putExtra("text", text.isEmpty() ? bigText : text);
        }
        
        intent.putExtra("timestamp", System.currentTimeMillis());
        
        sendBroadcast(intent);
        
        Log.d(TAG, "Notification posted: " + sbn.getPackageName());
    }
    
    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        super.onNotificationRemoved(sbn);
        Log.d(TAG, "Notification removed: " + sbn.getPackageName());
    }
}
