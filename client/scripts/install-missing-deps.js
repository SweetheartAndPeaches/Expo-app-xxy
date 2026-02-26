#!/usr/bin/env node

/**
 * 自动检测并安装缺失的依赖
 * 使用方法: node scripts/install-missing-deps.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 检测缺失的依赖...\n');

try {
  // 运行 depcheck 并获取 JSON 输出
  // 注意：depcheck 发现问题时会返回非零退出码，但这不是错误
  let depcheckOutput;
  try {
    depcheckOutput = execSync('npx depcheck --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (execError) {
    // depcheck 返回非零退出码时仍然有输出
    if (execError.stdout) {
      depcheckOutput = execError.stdout;
    } else {
      throw execError;
    }
  }

  const result = JSON.parse(depcheckOutput);

  // 获取缺失的依赖
  const missing = result.missing || {};

  // 需要忽略的文件模式
  const ignoreFilePatterns = [
    /template\.config\.(ts|js)$/, // 模板配置文件
    /\.template\./, // 其他模板文件
    /declarations\.d\.ts$/, // 项目配置文件
  ];

  // 过滤包：排除内部别名和只被模板文件引用的包
  const missingPackages = Object.keys(missing).filter(pkg => {
    // 排除内部路径别名
    if (pkg.startsWith('@api/') || pkg.startsWith('@/') || pkg === '@api') {
      return false;
    }

    // 获取引用该包的文件列表
    const referencingFiles = missing[pkg] || [];

    // 过滤掉模板配置文件
    const nonTemplateFiles = referencingFiles.filter(file => {
      return !ignoreFilePatterns.some(pattern => pattern.test(file));
    });

    // 只有当存在非模板文件引用时才保留该包
    return nonTemplateFiles.length > 0;
  });

  if (missingPackages.length === 0) {
    console.log('✅ 没有发现缺失的依赖！');
    process.exit(0);
  }

  console.log('📦 发现以下缺失的依赖：');
  missingPackages.forEach((pkg, index) => {
    const files = missing[pkg];
    console.log(`  ${index + 1}. ${pkg}`);
    console.log(
      `     被引用于: ${files.slice(0, 2).join(', ')}${files.length > 2 ? ' ...' : ''}`,
    );
  });

  console.log('\n🚀 开始安装...\n');

  // 使用 expo install 安装所有缺失的包
  const packagesToInstall = missingPackages.join(' ');

  try {
    execSync(`pnpm expo install ${packagesToInstall}`, {
      stdio: 'inherit',
    });

    console.log('\n✅ 所有缺失的依赖已安装完成！');
  } catch (installError) {
    console.log('\n⚠️  expo install 失败，尝试使用 npm install...\n');

    execSync(`npm install ${packagesToInstall}`, {
      stdio: 'inherit',
    });

    console.log('\n✅ 所有缺失的依赖已通过 npm 安装完成！');
  }
} catch (error) {
  if (error.message.includes('depcheck')) {
    console.error('❌ depcheck 未安装或运行失败');
    console.log('💡 尝试运行: npm install -g depcheck');
  } else {
    console.error('❌ 发生错误:', error.message);
  }
  process.exit(1);
}
