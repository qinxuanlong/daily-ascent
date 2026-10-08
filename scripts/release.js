import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');

// 读取当前 package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
let targetVersion = process.argv[2];

// 若未指定版本号，默认在当前版本微增 patch 号
if (!targetVersion) {
  const parts = pkg.version.split('.').map(n => parseInt(n, 10) || 0);
  parts[2] = (parts[2] || 0) + 1;
  targetVersion = parts.join('.');
} else {
  // 去除可能携带的 v 前缀
  targetVersion = targetVersion.replace(/^v/, '');
}

const tagName = `v${targetVersion}`;

console.log(`\n📦 准备发布版本: ${tagName}`);

// 更新 package.json 版本号
pkg.version = targetVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
console.log(`✓ 已更新 package.json version 为 ${targetVersion}`);

// 检查是否有未提交更改
try {
  const status = execSync('git status --porcelain', { cwd: rootDir }).toString().trim();
  if (status) {
    console.log('✓ 正在自动暂存并提交代码变更...');
    execSync('git add -A', { cwd: rootDir, stdio: 'inherit' });
    execSync(`git commit -m "chore(release): 发布 ${tagName}"`, { cwd: rootDir, stdio: 'inherit' });
  }
} catch (err) {
  console.error('❌ Git commit 异常:', err.message);
}

// 检查 Tag 是否已经存在
try {
  const existingTags = execSync('git tag -l', { cwd: rootDir }).toString().split('\n');
  if (existingTags.includes(tagName)) {
    console.log(`⚠️ Tag ${tagName} 本地已存在，正在删除旧 tag 并重新打标签...`);
    execSync(`git tag -d ${tagName}`, { cwd: rootDir, stdio: 'inherit' });
  }
} catch {
  // 忽略
}

// 创建并推送 Tag
try {
  console.log(`🏷️ 创建 Git 标签: ${tagName}`);
  execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { cwd: rootDir, stdio: 'inherit' });

  console.log('🚀 正在推送到 GitHub 远程仓库 (包含标签)...');
  execSync('git push origin HEAD --tags', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n======================================================');
  console.log(`🎉 成功发布 ${tagName} 并推送到 GitHub！`);
  console.log('🤖 GitHub Actions 云端正在自动编译打包 Android APK...');
  console.log('📥 约 2~3 分钟后，可在下方 Releases 页面直接下载 APK:');
  console.log('👉 https://github.com/qinxuanlong/daily-ascent/releases');
  console.log('======================================================\n');
} catch (err) {
  console.error('❌ 推送标签失败，请检查网络或 GitHub 仓库推送权限:', err.message);
  process.exit(1);
}
