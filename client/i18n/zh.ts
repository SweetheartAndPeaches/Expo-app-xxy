// 中文翻译 (Chinese)
export const zh = {
  // 应用名称
  appName: '9INR',
  
  // 权限引导弹窗
  permission: {
    title: '需要通知访问权限',
    description: '为了帮您智能识别和管理重要消息，我们需要您授权"通知访问权限"。',
    features: {
      smartIdentify: '智能识别重要消息',
      quickActions: '提供便捷的快捷操作',
      optimizeSpeed: '优化响应速度',
    },
    privacyTip: '此权限仅用于读取通知内容，不会修改或删除您的任何通知。您可随时在设置中关闭。',
    buttons: {
      enable: '去开启权限',
      confirmed: '我已开启，不再提醒',
      later: '稍后提醒',
    },
  },
  
  // 设置跳转提示
  settings: {
    autoOpenTitle: '即将打开设置',
    autoOpenMessage: `系统会尝试自动跳转到"通知访问权限"页面。

跳转成功后：
在列表中找到"9INR"，打开开关即可

如果跳转到了错误的页面：
请手动操作：设置 > 特殊访问 > 通知访问权限 > 找到"9INR"并开启

重要提示：
请开启"通知访问权限"开关，而不是"允许通知"开关`,
    
    manualGuideTitle: '无法自动跳转',
    manualGuideMessage: `请在系统设置中按以下步骤操作：

小米/红米手机：
设置 > 应用设置 > 应用管理 > 9INR > 通知管理 > 通知使用权

华为/荣耀手机：
设置 > 应用和服务 > 应用管理 > 9INR > 通知管理 > 通知使用权

OPPO/Vivo手机：
设置 > 应用 > 应用管理 > 9INR > 通知管理 > 通知使用情况

通用方法：
设置 > 特殊访问 > 通知访问权限 > 找到"9INR"并开启

注意：不是"允许通知"开关，而是"通知访问权限"开关！`,
    
    buttons: {
      cancel: '取消',
      openSettings: '打开设置',
      gotIt: '我知道了',
    },
  },
  
  // 通知状态
  notification: {
    newMessage: '新消息',
    enabled: '通知访问权限已开启',
    enabledMessage: '通知监听器正在运行，可以接收并显示通知。\n\n点击右上角的状态图标可以查看监听状态。',
    statusTitle: '通知监听状态',
    listenerRunning: '✅ 运行中',
    listenerStopped: '❌ 未运行',
    permissionEnabled: '✅ 已开启',
    permissionDisabled: '❌ 未开启',
    listenerHint: '通知监听器正在运行，可以接收通知',
  },
  
  // 通用
  common: {
    loading: '加载中...',
    error: '错误',
    retry: '重试',
    back: '返回',
    backHint: '再按一次退出',
  },
};

export type Translations = typeof zh;
