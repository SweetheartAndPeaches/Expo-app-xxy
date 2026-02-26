#!/bin/bash

# Android 快速构建脚本
# 使用 EAS Build 构建 Android APK（预览版本）

echo "=========================================="
echo "  Android APK 快速构建脚本"
echo "=========================================="
echo ""

# 检查是否在 client 目录
if [ ! -f "eas.json" ]; then
    echo "❌ 错误：请在 client 目录运行此脚本"
    echo "   正确路径: cd client && ./build-android.sh"
    exit 1
fi

echo "✅ 检测到 client 目录"
echo ""

# 检查 EAS CLI 是否安装
if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI 未安装，正在安装..."
    npm install -g eas-cli
    echo ""
fi

echo "✅ EAS CLI 已就绪"
echo ""

# 检查是否已登录
echo "🔍 检查登录状态..."
if ! eas whoami &> /dev/null; then
    echo "📝 需要登录 Expo 账号..."
    echo "   请在浏览器中打开链接并授权"
    echo ""
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
    echo ""
fi

echo "✅ 已登录 Expo 账号"
echo ""

# 确认构建配置
echo "=========================================="
echo "  构建配置"
echo "=========================================="
echo "平台: Android"
echo "类型: APK (预览版本)"
echo "用途: 内部测试"
echo ""
echo "⏱️  预计构建时间: 10-20 分钟"
echo ""

read -p "是否继续构建? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消构建"
    exit 0
fi

echo ""
echo "=========================================="
echo "  开始构建"
echo "=========================================="
echo ""

# 执行构建
eas build --platform android --profile preview

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ 构建成功！"
    echo "=========================================="
    echo ""
    echo "📦 下载 APK:"
    echo "   1. 访问 https://expo.dev"
    echo "   2. 选择你的项目"
    echo "   3. 进入 Builds 页面"
    echo "   4. 下载最新构建的 APK"
    echo ""
    echo "📱 安装到手机:"
    echo "   - 将 APK 文件传输到手机"
    echo "   - 允许安装未知来源"
    echo "   - 点击 APK 文件安装"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ❌ 构建失败"
    echo "=========================================="
    echo ""
    echo "请检查："
    echo "  1. Expo 账号是否已验证"
    echo "  2. 网络连接是否正常"
    echo "  3. 构建配置是否正确"
    echo ""
    echo "详细帮助: cat ANDROID_BUILD_GUIDE.md"
    exit 1
fi
