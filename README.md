# WebView 容器应用

一个专业的跨平台 WebView 容器应用，可以将任意网页嵌入到原生 APP 中。支持 iOS、Android 和 Web 三端。

## 项目概述

本项目是一个基于 **Expo 54 + React Native** 的 WebView 容器应用，用于将网页内容无缝嵌入到原生移动应用中。通过简单的配置，即可将你的网页转化为专业的移动 APP。

### 核心特性

✅ **跨平台支持**：iOS、Android、Web 三端统一
✅ **灵活配置**：URL、标题、图标均可自定义
✅ **用户体验优化**：加载状态、错误处理、返回键智能处理
✅ **原生功能**：支持全屏视频、Cookie、JavaScript 执行
✅ **硬件加速**：Android 平台使用硬件渲染，性能更佳
✅ **易于发布**：支持一键构建 iOS 和 Android 版本

### 应用场景

- **网页转 APP**：将现有网站快速转化为移动应用
- **内容展示**：展示文档、博客、产品介绍等网页内容
- **混合开发**：作为原生 APP 的部分模块，展示网页内容
- **快速原型**：快速验证网页在移动端的显示效果

## 功能特性

### 核心功能

- ✅ 完整的网页展示（基于 react-native-webview）
- ✅ 可配置的网页 URL
- ✅ 可配置的应用标题和图标
- ✅ 返回键智能处理（支持网页内导航历史返回）
- ✅ 硬件加速渲染（Android 使用硬件层）

### 用户体验优化

- ✅ 加载状态指示器（原生平台）
- ✅ 网络错误处理和重试功能（原生平台）
- ✅ 返回键提示（原生平台，当可以返回时显示）
- ✅ 支持全屏视频播放
- ✅ 支持内联媒体播放
- ✅ 支持 Cookie 和 DOM 存储
- ✅ 支持 JavaScript 执行

### 安全与兼容性

- ✅ HTTPS 证书支持
- ✅ 混合内容模式（兼容性）
- ✅ 自动缩放适应屏幕
- ✅ WebView 缓存加速
- ✅ 支持所有必要的系统权限

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Expo CLI
- iOS 开发：需要 Mac + Xcode（可选，推荐使用 EAS Build）
- Android 开发：需要 Android Studio（可选，推荐使用 EAS Build）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/SweetheartAndPeaches/Expo-app-xxy.git
cd Expo-app-xxy

# 安装依赖
pnpm install
```

### 配置应用

1. **复制配置文件**

```bash
cd client
cp .env.example .env
```

2. **编辑 .env 文件**

```env
# 目标网页 URL（必需）
EXPO_PUBLIC_WEBVIEW_URL=https://your-website.com

# 应用名称（可选）
EXPO_PUBLIC_APP_TITLE=我的应用
```

3. **替换应用图标**（可选）

替换以下文件：
- `client/assets/images/icon.png` - 主图标（1024x1024 像素）
- `client/assets/images/adaptive-icon.png` - Android 自适应图标（1024x1024 像素）

### 运行应用

```bash
# 启动开发服务器（同时启动前端和后端）
coze dev

# 或仅启动前端
cd client
npx expo start
```

选择运行平台：
- 按 `i` 在 iOS 模拟器中运行
- 按 `a` 在 Android 模拟器中运行
- 按 `w` 在 Web 浏览器中运行

## 项目结构

```
Expo-app-xxy/
├── client/                     # Expo 前端代码（React Native）
│   ├── app/                    # Expo Router 路由配置
│   │   ├── _layout.tsx         # 根布局
│   │   └── index.tsx           # 首页入口
│   ├── screens/                # 页面实现
│   │   └── home/               # WebView 主页面
│   │       ├── index.tsx       # 页面组件
│   │       └── styles.ts       # 页面样式
│   ├── components/             # 可复用组件
│   ├── hooks/                  # 自定义 Hooks
│   ├── constants/              # 常量定义
│   ├── utils/                  # 工具函数
│   ├── assets/                 # 静态资源
│   ├── app.config.ts           # Expo 配置
│   ├── .env.example            # 环境变量示例
│   ├── package.json            # 前端依赖
│   └── README.md               # 前端文档
├── server/                     # Express 后端（可选）
│   ├── src/
│   │   └── index.ts            # 后端入口
│   └── package.json            # 后端依赖
├── package.json                # 根依赖配置
├── .coze                       # Coze 配置（禁止修改）
└── README.md                   # 项目文档
```

## 配置说明

### 网页 URL 配置

通过环境变量配置目标网页地址：

```env
# .env 文件
EXPO_PUBLIC_WEBVIEW_URL=https://c4e5cb87-e5c1-47fe-a7c4-398d5b9e6a57.dev.coze.site
```

或直接修改代码：

```typescript
// client/screens/home/index.tsx
const DEFAULT_CONFIG = {
  url: 'https://your-website.com',
  title: '我的应用',
};
```

### 应用标题配置

修改应用显示名称：

```typescript
// client/app.config.ts
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": "我的应用",  // 修改这里
    // ...
  };
};
```

### 应用图标配置

替换以下图标文件：

- **主图标**：`client/assets/images/icon.png`
  - 尺寸：1024x1024 像素
  - 格式：PNG
  - 用途：iOS 和 Android 应用图标

- **自适应图标**：`client/assets/images/adaptive-icon.png`
  - 尺寸：1024x1024 像素
  - 格式：PNG，透明背景
  - 用途：Android 自适应图标

### Android 包名配置

```typescript
// client/app.config.ts
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "android": {
      "package": "com.yourcompany.webviewapp",  // 修改这里
    },
  };
};
```

包名格式：`com.company.appname`

## 平台差异说明

### Web 平台
- 使用原生的 HTML `iframe` 元素展示网页
- 不需要加载状态指示器（加载速度很快）
- 不支持返回键处理（浏览器自带返回功能）
- 不支持错误重试功能（使用浏览器原生错误处理）

### 原生平台（iOS/Android）
- 使用 `react-native-webview` 组件展示网页
- 支持加载状态指示器
- 支持网络错误处理和重试
- 支持返回键智能处理
- 支持硬件加速渲染

## 发布到应用商店

### iOS 发布

详细步骤请参考：`client/IOS_PUBLISH_GUIDE.md`

**快速流程**：

```bash
# 1. 安装 EAS CLI
npm install -g eas-cli

# 2. 配置项目
cd client
eas build:configure

# 3. 登录 Apple 账号
eas credentials

# 4. 构建 iOS 应用
eas build --platform ios --profile production

# 5. 提交到 App Store
eas submit --platform ios --latest
```

**要求**：
- Apple Developer 账号（$99/年）
- 应用截图、描述、隐私政策
- 符合 App Store 审核指南

### Android 发布

```bash
# 1. 构建 Android APK
cd client
npx expo build:android

# 2. 构建 Android App Bundle（推荐用于 Google Play）
npx expo build:android --type app-bundle
```

**要求**：
- Google Play 开发者账号（$25 一次性）
- 应用图标和截图
- 符合 Google Play 政策

## 开发规范

### 路径别名

Expo 配置了 `@/` 路径别名指向 `client/` 目录：

```tsx
// 正确
import { Screen } from '@/components/Screen';

// 避免相对路径
import { Screen } from '../../../components/Screen';
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规范
- 组件文件使用 `useMemo` 优化样式创建

### 依赖管理

新增依赖时，需在 `client/` 或 `server/` 目录分别添加：

```bash
# 添加前端依赖
cd client
npx expo install package-name

# 添加后端依赖
cd server
pnpm add package-name

# 在根目录同步依赖
cd /workspace/projects
pnpm install
```

## 高级配置

### 自定义 User-Agent

```typescript
// client/screens/home/index.tsx
<WebView
  userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
  // ...
/>
```

### 禁用 JavaScript

```typescript
<WebView
  javaScriptEnabled={false}
  // ...
/>
```

### 禁用缩放

```typescript
<WebView
  scalesPageToFit={false}
  // ...
/>
```

## 常见问题

### Q1: WebView 显示不全或布局错乱？

**A**: 确保目标网页做了移动端适配（响应式设计），设置正确的 viewport。

### Q2: 视频无法播放？

**A**: 检查视频是否使用 HTML5 标准格式，URL 是否可访问。应用已启用全屏视频和内联播放支持。

### Q3: 返回键无法退出应用？

**A**: 在 WebView 内返回到起始页面后，再按返回键即可退出应用。

### Q4: 如何调试 WebView 中的网页？

**A**:
- Chrome DevTools: `chrome://inspect`（仅 Android）
- Safari Web Inspector: 开发 → Simulator → 选择设备（仅 iOS）

### Q5: 网页加载缓慢？

**A**:
- 使用 CDN 加速
- 已启用 WebView 缓存
- 优化网页自身性能

## 技术栈

- **框架**: Expo 54 + React Native
- **WebView**: react-native-webview（官方推荐）
- **路由**: Expo Router
- **状态管理**: React Hooks
- **类型检查**: TypeScript
- **代码检查**: ESLint
- **包管理**: pnpm
- **构建工具**: Expo EAS Build

## 文档

- [WebView 配置指南](./client/WEBVIEW_CONFIG.md) - 详细配置说明
- [iOS 发布指南](./client/IOS_PUBLISH_GUIDE.md) - iOS 发布完整流程
- [Expo 官方文档](https://docs.expo.dev/) - Expo 框架文档
- [react-native-webview 文档](https://github.com/react-native-webview/react-native-webview) - WebView 组件文档

## 许可证

MIT License

## 支持

如有问题，请：
- 提交 Issue
- 查看文档
- 联系开发者

---

**Enjoy building your WebView app! 🚀**
