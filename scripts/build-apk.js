import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const isWindows = process.platform === 'win32';

console.log('🚀 [1/3] 正在编译前端资源并同步至 Android 工程...');
const syncResult = spawnSync('npm', ['run', 'cap:sync'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit'
});

if (syncResult.status !== 0) {
  console.error('❌ 前端编译或同步失败，退出打包。');
  process.exit(1);
}

console.log('\n🤖 [2/3] 正在调用 Gradle 打包 Android APK...');
const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';

const gradleResult = spawnSync(gradlewCmd, ['assembleDebug', '--no-daemon'], {
  cwd: androidDir,
  shell: true,
  stdio: 'inherit'
});

if (gradleResult.status !== 0) {
  console.log('\n💡 提示: 本地打包未完成（通常是因为未安装本地 Android SDK）。');
  console.log('👉 推荐使用云端零配置打包：直接运行 `npm run release` 推送至 GitHub，云端虚拟机会自动编译出可直接下载安装的 APK！');
  process.exit(gradleResult.status || 1);
}

const sourceApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const targetDir = path.join(rootDir, 'dist-apk');
const targetApk = path.join(targetDir, 'Daily-Ascent.apk');

if (fs.existsSync(sourceApk)) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.copyFileSync(sourceApk, targetApk);
  console.log('\n🎉 [3/3] 本地 APK 打包成功！');
  console.log(`📦 安装包路径: ${targetApk}`);
} else {
  console.log('\n⚠️ 未找到生成的 APK 文件。');
}
