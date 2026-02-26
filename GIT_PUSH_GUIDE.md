# Git 推送指南

代码已准备就绪，但需要身份验证才能推送到 GitHub。请按照以下步骤完成推送：

## 方法一：使用 GitHub Token（推荐）

### 1. 生成 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置 token 名称（如 "Expo-app-xxy"）
4. 选择权限（至少需要 `repo` 权限）
5. 点击 "Generate token"
6. **复制生成的 token**（只显示一次）

### 2. 使用 Token 推送

```bash
# 切换到项目目录
cd /workspace/projects

# 推送（会提示输入用户名和密码）
git push -u origin main
```

**输入提示**：
- Username: 输入你的 GitHub 用户名
- Password: 粘贴刚才生成的 GitHub Token

## 方法二：使用 SSH 密钥

### 1. 生成 SSH 密钥

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub
```

### 2. 添加 SSH 密钥到 GitHub

1. 复制公钥内容
2. 访问 https://github.com/settings/keys
3. 点击 "New SSH key"
4. 粘贴公钥内容
5. 保存

### 3. 更改远程仓库 URL 为 SSH

```bash
cd /workspace/projects

# 切换为 SSH URL
git remote set-url origin git@github.com:SweetheartAndPeaches/Expo-app-xxy.git

# 推送
git push -u origin main
```

## 方法三：使用 GitHub CLI（如果已安装）

```bash
# 登录 GitHub
gh auth login

# 推送
cd /workspace/projects
git push -u origin main
```

## 验证推送成功

推送成功后，访问以下地址查看代码：

https://github.com/SweetheartAndPeaches/Expo-app-xxy

## 当前代码状态

✅ 已提交到本地仓库：
- README.md（详细的项目文档）
- client/screens/home/index.tsx（WebView 主页面）
- client/screens/home/styles.ts（页面样式）
- client/.env.example（环境变量示例）
- client/WEBVIEW_CONFIG.md（WebView 配置文档）
- client/IOS_PUBLISH_GUIDE.md（iOS 发布指南）

✅ 远程仓库已配置：
- URL: https://github.com/SweetheartAndPeaches/Expo-app-xxy.git

## 常见问题

### Q1: 推送失败，提示 "Authentication failed"

**A**: 检查用户名和 Token 是否正确，确保 Token 有 `repo` 权限。

### Q2: 提示 "refusing to merge unrelated histories"

**A**: 强制推送（谨慎使用）：
```bash
git push -u origin main --force
```

### Q3: 提示 "remote already exists"

**A**: 更新远程仓库 URL：
```bash
git remote set-url origin https://github.com/SweetheartAndPeaches/Expo-app-xxy.git
```

## 需要帮助？

如果遇到问题，请：
1. 检查 GitHub Token 是否有效
2. 确认仓库 URL 是否正确
3. 查看错误信息并搜索解决方案
4. 联系仓库管理员

---

**选择适合你的方法完成推送即可！** 🚀
