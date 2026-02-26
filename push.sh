#!/bin/bash

# Git 推送脚本
# 请在你的本地机器上运行此脚本

echo "=========================================="
echo "  WebView 应用代码推送脚本"
echo "=========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 检测到项目根目录"
echo ""

# 添加所有文件
echo "📝 添加所有文件到暂存区..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "feat: 完善 WebView 容器应用并添加详细文档

- 更新 README.md，添加项目概述、功能特性、配置说明
- 添加 iOS 发布指南文档
- 添加 WebView 配置文档
- 添加快速开始指南
- 添加常见问题解答
- 支持跨平台发布（iOS/Android/Web）
- 添加 Git 推送指南"

# 推送到远程仓库
echo "🚀 推送到 GitHub..."
echo ""
echo "=========================================="
echo "  需要身份验证"
echo "=========================================="
echo ""
echo "如果提示输入用户名和密码："
echo "  Username: 输入你的 GitHub 用户名"
echo "  Password: 粘贴你的 GitHub Personal Access Token"
echo ""
echo "获取 Token 方法："
echo "  1. 访问 https://github.com/settings/tokens"
echo "  2. 点击 Generate new token (classic)"
echo "  3. 选择 repo 权限"
echo "  4. 复制生成的 token"
echo ""
echo "=========================================="
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📦 查看代码："
    echo "  https://github.com/SweetheartAndPeaches/Expo-app-xxy"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "  1. 用户名和 Token 是否正确"
    echo "  2. Token 是否有 repo 权限"
    echo "  3. 网络连接是否正常"
    echo ""
    echo "详细帮助请查看：GIT_PUSH_GUIDE.md"
    exit 1
fi
