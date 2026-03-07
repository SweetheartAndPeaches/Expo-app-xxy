import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRegistry } from 'react-native';
import NotificationListenerModule, { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-notification-listener';

// 存储通知的 key
const NOTIFICATIONS_KEY = '@app_notifications';

// 通知数据结构
export interface Notification {
  time: string;
  app: string;
  title: string;
  titleBig?: string;
  text: string;
  subText?: string;
  summaryText?: string;
  bigText?: string;
  audioContentsURI?: string;
  imageBackgroundURI?: string;
  extraInfoText?: string;
  groupedMessages?: Array<{ title: string; text: string }>;
  icon?: string;
  image?: string;
  receivedAt?: number;
}

/**
 * Headless 任务：在后台接收通知
 * 这个任务会在应用后台运行，接收所有通知
 */
const headlessNotificationListener = async ({ notification }: { notification: string }) => {
  try {
    console.log('[Headless] Received notification:', notification);

    if (!notification) {
      console.log('[Headless] Empty notification, skipping');
      return;
    }

    // 解析通知 JSON
    const notificationData: Notification = JSON.parse(notification);
    
    // 添加接收时间戳
    notificationData.receivedAt = Date.now();

    // 读取现有通知列表
    const existingNotificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const existingNotifications: Notification[] = existingNotificationsJson
      ? JSON.parse(existingNotificationsJson)
      : [];

    // 添加新通知到列表（保留最近的 50 条）
    const updatedNotifications = [notificationData, ...existingNotifications].slice(0, 50);

    // 保存通知列表
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));

    console.log('[Headless] Notification saved, total count:', updatedNotifications.length);
  } catch (error) {
    console.error('[Headless] Failed to process notification:', error);
  }
};

/**
 * 注册 headless 任务
 * 这个函数应该在应用启动时调用，而且要在其他模块导入之前调用
 */
export function registerNotificationListenerHeadlessTask() {
  // @ts-ignore - 类型定义可能不完整
  AppRegistry.registerHeadlessTask(RNAndroidNotificationListenerHeadlessJsName, () => headlessNotificationListener);
  console.log('[NotificationManager] Headless task registered');
}

/**
 * 获取所有通知
 */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return notificationsJson ? JSON.parse(notificationsJson) : [];
  } catch (error) {
    console.error('[NotificationManager] Failed to get notifications:', error);
    return [];
  }
}

/**
 * 获取最新的一条通知
 */
export async function getLatestNotification(): Promise<Notification | null> {
  try {
    const notifications = await getNotifications();
    return notifications.length > 0 ? notifications[0] : null;
  } catch (error) {
    console.error('[NotificationManager] Failed to get latest notification:', error);
    return null;
  }
}

/**
 * 清除所有通知
 */
export async function clearNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    console.log('[NotificationManager] Notifications cleared');
  } catch (error) {
    console.error('[NotificationManager] Failed to clear notifications:', error);
  }
}

/**
 * 删除指定通知（基于接收时间）
 */
export async function removeNotification(receivedAt: number): Promise<void> {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(n => n.receivedAt !== receivedAt);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('[NotificationManager] Failed to remove notification:', error);
  }
}

/**
 * 监听通知变化（通过轮询实现）
 * 因为 Headless JS 无法直接触发前端事件，所以需要轮询检查
 * @param callback 当有新通知时调用的回调
 * @param interval 轮询间隔（毫秒），默认 1000ms
 * @returns 清除轮询的函数
 */
export function listenForNewNotifications(
  callback: (notification: Notification) => void,
  interval: number = 2000 // 改为 2 秒检查一次，减少性能影响
): () => void {
  let lastNotificationCount = 0;
  let lastReceivedAt = 0;

  const checkForNewNotifications = async () => {
    try {
      const notifications = await getNotifications();
      
      if (notifications.length === 0) {
        lastNotificationCount = 0;
        lastReceivedAt = 0;
        return;
      }

      const latestNotification = notifications[0];
      
      // 检查是否有新通知
      if (
        notifications.length !== lastNotificationCount ||
        (latestNotification.receivedAt && latestNotification.receivedAt !== lastReceivedAt)
      ) {
        // 有新通知
        if (latestNotification.receivedAt && latestNotification.receivedAt !== lastReceivedAt) {
          callback(latestNotification);
        }
        
        lastNotificationCount = notifications.length;
        lastReceivedAt = latestNotification.receivedAt || 0;
      }
    } catch (error) {
      console.error('[NotificationManager] Failed to check for new notifications:', error);
    }
  };

  // 立即检查一次
  checkForNewNotifications();

  // 定期检查
  const intervalId = setInterval(checkForNewNotifications, interval);

  // 返回清除函数
  return () => clearInterval(intervalId);
}
