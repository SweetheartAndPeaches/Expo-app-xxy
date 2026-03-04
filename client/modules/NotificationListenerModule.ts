import { NativeModules, NativeEventEmitter, DeviceEventEmitter, Platform } from 'react-native';

interface NotificationItem {
  packageName: string;
  title?: string;
  text?: string;
  timestamp: number;
}

interface NotificationListenerModuleInterface {
  requestPermission(): Promise<void>;
  checkPermission(): Promise<boolean>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  getNotifications(): Promise<NotificationItem[]>;
  clearNotifications(): Promise<void>;
}

const LINKING_ERROR =
  `The package 'react-native-notification-listener' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const NotificationListenerModule: NotificationListenerModuleInterface =
  NativeModules.NotificationListenerModule
    ? NativeModules.NotificationListenerModule
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );

// Event Emitter
let emitter: any = null;

function getEmitter() {
  if (!emitter) {
    emitter = DeviceEventEmitter;
  }
  return emitter;
}

// TypeScript 导出
export type { NotificationItem };
export { NotificationListenerModule };

// 便捷函数
export async function requestPermission(): Promise<void> {
  return NotificationListenerModule.requestPermission();
}

export async function checkPermission(): Promise<boolean> {
  return NotificationListenerModule.checkPermission();
}

export async function startListening(): Promise<void> {
  return NotificationListenerModule.startListening();
}

export async function stopListening(): Promise<void> {
  return NotificationListenerModule.stopListening();
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return NotificationListenerModule.getNotifications();
}

export async function clearNotifications(): Promise<void> {
  return NotificationListenerModule.clearNotifications();
}

export function addNotificationListener(callback: (notification: NotificationItem) => void): void {
  getEmitter().addListener('onNotificationReceived', callback);
}

export function removeNotificationListener(callback: (notification: NotificationItem) => void): void {
  getEmitter().removeListener('onNotificationReceived', callback);
}
