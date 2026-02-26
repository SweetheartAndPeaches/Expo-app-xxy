# iOS 发布指南

## 概述

✅ **这个 APP 完全支持发布到 iOS App Store！**

本项目基于 **Expo 54** 框架构建，使用 `react-native-webview`（官方推荐，完全支持 iOS），可以顺利发布到 iOS 平台。

## iOS 发布要求

### 必需条件

1. **Apple Developer 账号**
   - 需要 Apple Developer Program 会员资格
   - 费用：每年 $99 美元
   - 注册地址：https://developer.apple.com/programs/

2. **构建环境**（二选一）
   - **方案一（推荐）**：使用 Expo EAS Build（云端构建）
     - ✅ 不需要 Mac 电脑
     - ✅ 不需要本地安装 Xcode
     - ✅ 完全在线构建
   - **方案二**：本地构建
     - 需要 Mac 电脑
     - 需要安装 Xcode（最新版本）
     - 需要 CocoaPods

3. **App Store Connect 账号**
   - 使用 Apple Developer 账号登录 App Store Connect
   - 创建应用信息、上传截图、填写描述等

## 当前项目的 iOS 支持

### ✅ 已配置的功能

1. **iOS 基本配置** (`app.config.ts`)
   ```typescript
   "ios": {
     "supportsTablet": true  // 支持 iPad
   }
   ```

2. **WebView 支持**
   - ✅ 使用 `react-native-webview`（官方推荐，原生支持 iOS）
   - ✅ 支持 iOS 原生返回手势
   - ✅ 支持全屏视频播放
   - ✅ 支持 JavaScript 和 Cookie

3. **权限配置**
   - ✅ 相机权限（`expo-camera`）
   - ✅ 相册权限（`expo-image-picker`）
   - ✅ 麦克风权限（`expo-camera`）
   - ✅ 位置权限（`expo-location`）

### 📋 发布前的准备工作

1. **准备应用图标**
   - 主图标：`assets/images/icon.png`（1024x1024 像素）
   - 所有尺寸的图标会自动生成

2. **准备启动屏幕**
   - 启动图标：`assets/images/splash-icon.png`
   - 背景色已配置为白色

3. **配置 Bundle Identifier**
   ```typescript
   // app.config.ts 中修改
   // iOS 的 bundleId 会自动从 slug 生成
   "slug": "your-app-slug"  // 建议使用英文，如 "my-webview-app"
   ```

4. **配置应用信息**
   - 应用名称：修改 `app.config.ts` 中的 `name`
   - 版本号：`version: "1.0.0"`
   - 构建号：会自动递增

## 发布流程（推荐：EAS Build）

### 步骤 1：安装 EAS CLI

```bash
npm install -g eas-cli
```

### 步骤 2：配置 EAS 项目

```bash
cd /workspace/projects/client
eas build:configure
```

### 步骤 3：登录 Apple 账号

```bash
eas credentials
```

按照提示：
1. 选择 iOS 平台
2. 登录你的 Apple Developer 账号
3. 生成或导入证书和配置文件

### 步骤 4：构建 iOS 应用

```bash
# 开发版本（用于测试）
eas build --platform ios --profile development

# 或者构建生产版本（用于提交 App Store）
eas build --platform ios --profile production
```

构建时间：约 10-30 分钟（云端构建）

### 步骤 5：下载和安装

构建完成后：
1. 下载 `.ipa` 文件
2. 使用 TestFlight 安装测试（开发版本）
3. 或上传到 App Store Connect（生产版本）

### 步骤 6：提交到 App Store

```bash
eas submit --platform ios --latest
```

或者手动上传：
1. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
2. 创建新应用
3. 上传构建的 `.ipa` 文件
4. 填写应用信息、截图、描述等
5. 提交审核

## 本地构建方案（需要 Mac）

如果选择本地构建：

```bash
# 1. 安装依赖
cd /workspace/projects/client
npx expo install

# 2. 预构建（生成 iOS 原生项目）
npx expo prebuild --platform ios

# 3. 打开 Xcode
open ios/yourapp.xcworkspace

# 4. 在 Xcode 中配置签名、构建、归档
```

## iOS 审核注意事项

### WebView 应用审核常见问题

⚠️ **Apple 对 WebView 应用有严格要求**：

1. **必须提供完整功能**
   - 不能只是简单包装一个网页
   - 需要提供原生功能补充

2. **内容质量要求**
   - 网页内容必须高质量
   - 不能有大量广告或低质量内容

3. **性能要求**
   - 加载速度要快
   - 不能有频繁崩溃

4. **隐私政策**
   - 必须提供隐私政策
   - 说明数据收集和使用

### 本项目的优势

✅ **已实现的原生功能**：
- ✅ 返回键智能处理
- ✅ 加载状态指示器
- ✅ 错误处理和重试
- ✅ 硬件加速渲染
- ✅ 支持全屏视频

这些原生功能可以满足 Apple 的审核要求。

## 常见问题

### Q1：WebView 应用会被拒绝吗？
**A**：只要网页内容质量好，且提供原生功能补充，通常可以通过审核。Apple 主要关注：
- 是否提供独特价值
- 用户体验是否流畅
- 是否遵守 App Store 审核指南

### Q2：需要单独为 iOS 开发吗？
**A**：不需要！Expo 是跨平台框架，同一套代码可以同时构建 iOS 和 Android 版本。

### Q3：构建需要多长时间？
**A**：
- EAS Build 云端构建：10-30 分钟
- 本地构建（Mac）：5-15 分钟

### Q4：如何测试 iOS 版本？
**A**：
1. 开发版本：通过 TestFlight 安装测试
2. 生产版本：提交 App Store 审核，审核通过后可下载

### Q5：iOS 和 Android 功能有差异吗？
**A**：
- 核心功能完全相同
- iOS 支持原生返回手势（左滑返回）
- Android 支持物理返回键
- Web 平台使用 iframe 展示

## 推荐工具和资源

1. **Expo EAS Build**: https://docs.expo.dev/build/introduction/
2. **App Store Connect**: https://appstoreconnect.apple.com/
3. **react-native-webview 文档**: https://github.com/react-native-webview/react-native-webview
4. **Expo iOS 开发指南**: https://docs.expo.dev/workflow/ios/

## 总结

✅ **可以发布到 iOS**：完全支持，无需额外开发
✅ **跨平台**：同一套代码支持 iOS、Android、Web
✅ **简单易用**：推荐使用 EAS Build 云端构建
✅ **符合要求**：已实现原生功能，满足审核要求

**下一步建议**：
1. 注册 Apple Developer 账号（如果还没有）
2. 安装 EAS CLI 并配置项目
3. 构建开发版本并测试
4. 准备应用截图和描述
5. 提交到 App Store 审核

祝你发布顺利！🎉
