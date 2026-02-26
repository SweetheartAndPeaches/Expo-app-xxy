# WebView 应用配置说明

## 功能概述

这是一个专业的 WebView 容器应用，可以将任意网页嵌入到原生 APP 中，支持 iOS、Android 和 Web 三端。

## 已实现的功能

### 核心功能
- ✅ 完整的网页展示（基于 react-native-webview）
- ✅ 可配置的网页 URL
- ✅ 可配置的应用标题
- ✅ 返回键智能处理（支持网页内导航历史返回，仅原生平台）
- ✅ 硬件加速渲染（Android 使用硬件层）
- ✅ Web 平台支持（使用 iframe）

### 用户体验优化
- ✅ 加载状态指示器（仅原生平台）
- ✅ 网络错误处理和重试功能（仅原生平台）
- ✅ 返回键提示（仅原生平台，当可以返回时显示）
- ✅ 支持全屏视频播放
- ✅ 支持内联媒体播放
- ✅ 支持 Cookie 和 DOM 存储
- ✅ 支持 JavaScript 执行

### 安全与兼容性
- ✅ HTTPS 证书支持
- ✅ 混合内容模式（兼容性）
- ✅ 自动缩放适应屏幕
- ✅ WebView 缓存加速

## 平台差异说明

### Web 平台
- 使用原生的 HTML iframe 元素展示网页
- 不需要加载状态指示器（加载速度很快）
- 不支持返回键处理（浏览器自带返回功能）
- 不支持错误重试功能（使用浏览器原生错误处理）

### 原生平台（iOS/Android）
- 使用 react-native-webview 组件展示网页
- 支持加载状态指示器
- 支持网络错误处理和重试
- 支持返回键智能处理
- 支持硬件加速渲染

## 配置方法

### 1. 网页 URL 配置

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的网页 URL：

```env
EXPO_PUBLIC_WEBVIEW_URL=https://www.example.com
```

### 2. 应用标题配置

在 `.env` 文件中设置应用标题：

```env
EXPO_PUBLIC_APP_TITLE=我的应用
```

### 3. 应用图标配置

替换以下图标文件（需要自己准备图标资源）：

- `assets/images/icon.png` - 应用主图标（1024x1024 像素）
- `assets/images/adaptive-icon.png` - Android 自适应图标前景（1024x1024 像素）
- `assets/images/favicon.png` - Web 端图标（32x32 像素）

**图标设计建议**：
- 主图标：圆角正方形，清晰的品牌标识
- 自适应图标：透明背景，简洁的主体元素
- 建议使用专业的图标设计工具，如 Canva、Figma

### 4. 应用名称配置（可选）

编辑 `client/app.config.ts` 文件，修改 `name` 字段：

```typescript
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": "我的应用名称",  // 修改这里
    // ...
  };
};
```

### 5. Android 包名配置（可选）

编辑 `client/app.config.ts` 文件，修改 `android.package` 字段：

```typescript
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "android": {
      "package": "com.mycompany.webviewapp",  // 修改这里
      // ...
    },
  };
};
```

**包名格式**：`com.company.appname`
- `com`：固定前缀
- `company`：公司或个人名称（小写）
- `appname`：应用名称（小写，无空格）

## 高级配置（可选）

### 修改 User-Agent

如果网页需要特定的 User-Agent 才能正常显示，可以在 `client/screens/home/index.tsx` 中取消注释并修改：

```typescript
userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
```

### 禁用 JavaScript

如果网页不需要 JavaScript，可以设置：

```typescript
javaScriptEnabled={false}
```

### 禁用缩放

如果需要禁用页面缩放，可以设置：

```typescript
scalesPageToFit={false}
```

## 构建与部署

### 开发模式

```bash
# 启动开发服务器
cd /workspace/projects
coze dev
```

### 构建 Android APK

```bash
cd /workspace/projects/client
npx expo build:android
```

### 构建 Android App Bundle（推荐用于 Google Play）

```bash
cd /workspace/projects/client
npx expo build:android --type app-bundle
```

## 常见问题

### 1. 网页显示不全或布局错乱

**原因**：网页未做移动端适配

**解决方案**：
- 确保网页使用了响应式设计
- 检查网页的 viewport 设置
- 联系网页开发者进行移动端适配

### 2. 视频无法播放

**原因**：网页使用了 Flash 或不受支持的 HTML5 视频

**解决方案**：
- 确保视频使用 HTML5 标准格式
- 检查视频 URL 是否可访问
- 已启用全屏视频和内联播放支持

### 3. 无法下载文件

**原因**：WebView 默认不支持文件下载

**解决方案**：需要额外实现下载功能（如需，可联系开发者添加）

### 4. 网页加载缓慢

**优化建议**：
- 使用 CDN 加速
- 启用 WebView 缓存（已默认开启）
- 优化网页自身性能

### 5. 返回键无法退出应用

**解决方案**：
- 在 WebView 内返回到起始页面后，再按返回键即可退出应用
- 已添加返回键提示，显示"再按一次返回键退出应用"

## 技术栈

- **框架**：Expo 54 + React Native
- **WebView 组件**：react-native-webview（官方推荐）
- **路由**：Expo Router
- **状态管理**：React Hooks

## 许可证

本项目基于 Expo 模板构建，遵循 MIT 许可证。
