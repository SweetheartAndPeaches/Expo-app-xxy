# Android 打包指南

本指南将帮助你将 WebView 应用打包成 Android APK 或 App Bundle。

## 打包方式对比

### 方式一：EAS Build（推荐）

**优势**：
- ✅ 云端构建，无需本地环境
- ✅ 自动管理签名证书
- ✅ 构建速度快
- ✅ 支持持续集成

**适用场景**：
- 没有本地 Android 开发环境
- 希望快速构建
- 需要频繁构建和发布

### 方式二：本地构建

**优势**：
- ✅ 完全控制构建过程
- ✅ 无需依赖网络
- ✅ 免费构建（不消耗 EAS 配额）

**适用场景**：
- 有本地 Android 开发环境
- 需要自定义构建配置
- 希望完全免费构建

---

## 方式一：EAS Build（推荐）

### 步骤 1：安装 EAS CLI

```bash
npm install -g eas-cli
```

### 步骤 2：登录 Expo 账号

```bash
eas login
```

按照提示：
1. 在浏览器中打开提供的链接
2. 登录你的 Expo 账号（如果没有，先注册 https://expo.dev）
3. 授权登录

### 步骤 3：配置项目

```bash
cd /workspace/projects/client
eas build:configure
```

这会自动生成 `eas.json` 配置文件。

### 步骤 4：配置 Android 包名（可选但推荐）

如果还没有配置包名，编辑 `app.config.ts`：

```typescript
"android": {
  "package": "com.yourcompany.webviewapp"  // 修改为你的包名
}
```

包名格式：
- 必须小写
- 通常格式：`com.公司名.应用名`
- 示例：`com.mycompany.webviewapp`

### 步骤 5：构建预览版本（APK，用于测试）

```bash
cd /workspace/projects/client

# 构建预览版本 APK
eas build --platform android --profile preview
```

**说明**：
- 构建类型：APK
- 用途：内部测试、分发给测试人员
- 安装方式：直接安装 APK 文件

**构建时间**：约 10-20 分钟

**下载方式**：
1. 构建完成后，会提供下载链接
2. 或在 Expo 控制台查看：https://expo.dev
3. 选择项目 → Builds → 下载 APK

### 步骤 6：构建生产版本（AAB，用于发布）

```bash
cd /workspace/projects/client

# 构建生产版本 App Bundle
eas build --platform android --profile production
```

**说明**：
- 构建类型：Android App Bundle（.aab）
- 用途：提交到 Google Play 商店
- 优势：更小的下载大小，支持动态功能

**构建时间**：约 10-20 分钟

**后续步骤**：
1. 下载 .aab 文件
2. 登录 [Google Play Console](https://play.google.com/console)
3. 创建新应用或选择已有应用
4. 上传 .aab 文件
5. 填写应用信息和截图
6. 提交审核

---

## 方式二：本地构建

### 前置要求

1. **安装 Android Studio**
   - 下载：https://developer.android.com/studio
   - 安装并配置 Android SDK
   - 配置环境变量：
     ```bash
     export ANDROID_HOME=$HOME/Android/Sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```

2. **安装 Java Development Kit (JDK)**
   - 推荐使用 JDK 17
   - 下载：https://www.oracle.com/java/technologies/downloads/

3. **验证环境**
   ```bash
   java -version
   adb version
   ```

### 步骤 1：安装依赖

```bash
cd /workspace/projects/client
npx expo install
```

### 步骤 2：预构建（生成原生项目）

```bash
npx expo prebuild --platform android
```

这会在项目根目录生成 `android/` 目录。

### 步骤 3：打开 Android Studio

```bash
# macOS
open android/yourproject.xcworkspace

# Linux
open android/yourproject.xcworkspace

# Windows
start android/yourproject.xcworkspace
```

或者直接打开 `android/` 文件夹。

### 步骤 4：在 Android Studio 中构建

1. 等待 Gradle 同步完成
2. 选择构建类型：
   - `debug`：调试版本
   - `release`：发布版本

3. 构建命令（在 Android Studio 终端）：

```bash
# 构建 APK（调试版本）
cd android
./gradlew assembleDebug

# 构建 APK（发布版本）
./gradlew assembleRelease

# 构建 App Bundle（发布版本）
./gradlew bundleRelease
```

### 步骤 5：找到构建产物

```bash
# APK 文件位置
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk

# App Bundle 文件位置
android/app/build/outputs/bundle/release/app-release.aab
```

### 步骤 6：签名 APK（发布版本）

如果构建的是发布版本，需要签名：

1. 生成签名密钥：
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. 配置 `android/app/build.gradle` 添加签名配置。

---

## 常见问题

### Q1: EAS Build 失败，提示"账号未验证"

**A**: 登录 https://expo.dev，验证你的邮箱和手机号。

### Q2: 构建时间太长怎么办？

**A**:
- 使用 EAS Build 云端构建通常更快
- 减少依赖和资源
- 清理缓存：`eas build --clear-cache`

### Q3: 如何自定义应用名称和图标？

**A**: 编辑 `app.config.ts`：
```typescript
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": "我的应用",  // 应用名称
    "icon": "./assets/images/icon.png",  // 应用图标
    "android": {
      "package": "com.yourcompany.webviewapp",  // 包名
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
  };
};
```

### Q4: APK 和 AAB 有什么区别？

**A**:
- **APK**：直接安装，文件较大，适用于测试
- **AAB**：Google Play 专用，自动生成针对不同设备的优化包，适用于发布

### Q5: 如何安装 APK 到手机？

**A**:
1. 将 APK 文件传输到手机
2. 在手机设置中允许"未知来源"
3. 点击 APK 文件安装

或使用 ADB：
```bash
adb install app-debug.apk
```

### Q6: 构建的应用无法连接网络？

**A**:
- 检查 `app.json` 中的权限配置
- 确保 WebView 的 `originWhitelist` 配置正确
- Android 9+ 需要在 `android/app/src/main/AndroidManifest.xml` 中配置网络安全：
  ```xml
  <application
    android:usesCleartextTraffic="true"
    ...>
  ```

---

## 构建检查清单

### EAS Build
- [ ] 已安装 EAS CLI
- [ ] 已登录 Expo 账号
- [ ] 已配置 eas.json
- [ ] 已配置应用名称和图标
- [ ] 已配置包名（可选）
- [ ] 已验证账号信息

### 本地构建
- [ ] 已安装 Android Studio
- [ ] 已安装 JDK
- [ ] 已配置环境变量
- [ ] 已执行 prebuild
- [ ] 已配置签名密钥（发布版本）

---

## 推荐工具

- **EAS Dashboard**: https://expo.dev - 管理构建和应用
- **Android Studio**: 本地构建和调试
- **ADB**: 安装和调试 APK

---

## 后续步骤

### 发布到 Google Play

1. 注册 Google Play 开发者账号（$25 一次性）
2. 登录 [Google Play Console](https://play.google.com/console)
3. 创建新应用
4. 上传 .aab 文件
5. 填写应用信息：
   - 应用名称和描述
   - 应用截图（至少 2 张）
   - 应用图标
   - 隐私政策
6. 设置内容分级
7. 定价和分发范围
8. 提交审核

**审核时间**：通常 1-3 天

---

## 快速命令参考

```bash
# EAS Build
eas login                          # 登录 Expo
eas build:configure                # 配置项目
eas build --platform android --profile preview      # 构建 APK（测试）
eas build --platform android --profile production  # 构建 AAB（发布）

# 本地构建
npx expo prebuild --platform android  # 生成原生项目
cd android && ./gradlew assembleDebug    # 构建调试 APK
cd android && ./gradlew assembleRelease  # 构建发布 APK
cd android && ./gradlew bundleRelease    # 构建 AAB

# 安装 APK
adb install app-debug.apk        # 安装到连接的设备
```

---

**祝你打包顺利！🚀**
