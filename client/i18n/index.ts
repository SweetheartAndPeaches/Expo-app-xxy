// 国际化配置
import { hi } from './hi';
import { zh } from './zh';

export type { Translations } from './hi';

// 支持的语言
export const languages = {
  hi: 'हिंदी', // 印地语
  zh: '中文',   // 中文
} as const;

export type LanguageCode = keyof typeof languages;

// 获取配置的语言，默认印地语
const getConfiguredLanguage = (): LanguageCode => {
  const lang = process.env.EXPO_PUBLIC_APP_LANGUAGE || 'hi';
  return lang as LanguageCode;
};

// 当前语言
export const currentLanguage = getConfiguredLanguage();

// 获取翻译
export const t = currentLanguage === 'zh' ? zh : hi;

// 导出翻译对象
export { hi, zh };
