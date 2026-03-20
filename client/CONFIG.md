# 应用配置说明

## 配置方式

### 1. 访问地址和应用名称

通过环境变量配置，有两种方式：

#### 方式一：创建 .env 文件

复制 `.env.example` 为 `.env` 并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 目标网页 URL
EXPO_PUBLIC_WEBVIEW_URL=https://your-website.com

# 应用名称
EXPO_PUBLIC_APP_TITLE=你的应用名称
```

#### 方式二：直接修改代码默认值

编辑 `screens/home/index.tsx` 中的默认值：

```typescript
const DEFAULT_CONFIG = {
  url: process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://your-website.com',
  title: process.env.EXPO_PUBLIC_APP_TITLE || '你的应用名称',
};
```

### 2. 应用图标

替换以下图标文件（建议使用 1024x1024 或更大的正方形图片）：

| 文件路径 | 用途 |
|---------|------|
| `client/assets/images/icon.png` | 应用主图标 |
| `client/assets/images/adaptive-icon.png` | Android 自适应图标 |
| `client/assets/images/splash-icon.png` | 启动画面图标 |
| `client/assets/images/favicon.png` | Web 网站图标 |

**注意：** 更换图标后需要重新构建原生项目才能生效。

### 3. 应用包名（Android）

修改 `client/app.config.ts` 中的 `android.package` 配置：

```typescript
android: {
  package: 'com.yourcompany.yourapp',
  // ...
}
```

### 4. 应用名称（系统显示）

修改以下文件：

- `client/app.config.ts` 中的 `name` 字段
- `client/android/app/src/main/res/values/strings.xml` 中的 `app_name`
- `client/android/settings.gradle` 中的 `rootProject.name`

## 配置优先级

1. 环境变量（`.env` 文件或系统环境变量）
2. 代码中的默认值

## 当前配置

- **访问地址**: `https://gamepay-app-six.vercel.app`
- **应用名称**: `9INR`
