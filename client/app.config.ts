import { ExpoConfig, ConfigContext } from 'expo/config';

const appName = process.env.COZE_PROJECT_NAME || process.env.EXPO_PUBLIC_COZE_PROJECT_NAME || '9INR';
const projectId = process.env.COZE_PROJECT_ID || process.env.EXPO_PUBLIC_COZE_PROJECT_ID;
const slugAppName = projectId ? `app${projectId}` : 'myapp';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": appName,
    "slug": slugAppName,
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": `com.anonymous.x${projectId || '0'}`
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": `com.anonymous.x${projectId || '0'}`,
      "permissions": [
        "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
      ],
      "allowBackup": false
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL ? [
        "expo-router",
        {
          "origin": process.env.EXPO_PUBLIC_BACKEND_BASE_URL
        }
      ] : 'expo-router',
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": `9INR को फोटो अपलोड या सेव करने के लिए आपकी फोटो गैलरी तक पहुंच की अनुमति दें।`,
          "cameraPermission": `9INR को फोटो लेने के लिए आपके कैमरे का उपयोग करने की अनुमति दें।`,
          "microphonePermission": `9INR को वीडियो में ऑडियो रिकॉर्ड करने के लिए आपके माइक्रोफोन तक पहुंच की अनुमति दें।`
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": `9INR को आस-पास की सेवाएं और नेविगेशन प्रदान करने के लिए आपे स्थान तक पहुंच की आवश्यकता है।`
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": `9INR को फोटो और वीडियो लेने के लिए कैमरे तक पहुंच की आवश्यकता है।`,
          "microphonePermission": `9INR को वीडियो ऑडियो रिकॉर्ड करने के लिए माइक्रोफोन तक पहुंच की आवश्यकता है।`,
          "recordAudioAndroid": true
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
