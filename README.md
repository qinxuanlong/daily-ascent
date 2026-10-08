# 🎮 每日攀升 (Daily Ascent)

一款专为消除启动阻力与精神过载打造的**游戏化打卡系统**。

> **核心心法**：有产出就是升级 · 断更不清零 · 过载可挂机 · 一周一主线

---

## 🌟 核心功能特性

1. **每日打卡 & 极简反馈**：
   - 聚焦今晚产出，打卡即刻 `+1⭐ 经验`。
   - **过载模式**：疲惫状态下只写一行挂机也算通关，连击保留，降低心理启动门槛。
2. **断更不清零**：
   - 工作日（周一至周五）连续打卡累计连击；
   - 周末不强制打卡，不断连击；
   - 意外断更不惩罚，记录历史最高连击并触发「重新出发」成就。
3. **05:00 睡到睡切日逻辑**：
   - 凌晨 5 点前均计入前一日，满足夜猫子和深夜复盘习惯。
4. **一周一主线 & 关卡路线图**：
   - 周一锁定主线（闲鱼 / 网文 / 漫剧），周内不可分心换线。
   - 每条主线配置 6 级渐进关卡路线，随时手动标记通关，清晰掌握所处阶段。
5. **周六 Boss 战 & 纯爽乐趣锚点**：
   - 周六完成闭环成果一键击杀 Boss，获得 `+2⭐` 经验。
   - 专属乐趣提醒：记录一件纯爽的事，给精神充能。
6. **周日成就结算 & 下周启动锚点**：
   - 汇总本周打卡、连击、关卡推进与新获徽章，带来充盈成就感；
   - 提前锁定下周主线与启动第一步。
7. **明日第一步（启动锚点）**：
   - 每次打卡完毕自动唤出「明天第一步」输入弹窗；
   - 次日打开页面顶部高亮显示前一天留下的锚点，告别启动犹豫。
8. **认知资产沉淀**：
   - **徽章墙**：9 种成就徽章（首次产出、三日连击、七日连击、第一单、第一章、第一片、技能卡满10、Boss击杀、重新出发）。
   - **技能卡集**：集中收录每日打卡练就的经验与技能。
   - **最近记录**：按时间倒序追踪打卡历程。
9. **坚果云 WebDAV 双向同步（云存储）**：
   - 本地离线优先，数据持久化于 localStorage。
   - 接入坚果云免费 WebDAV 协议，支持账号配置、连通性测试、手动双向合并同步、打卡后自动静默同步。
10. **本地数据安全保障**：
    - 支持一键导出/导入完整 JSON 数据文件，随时迁移备份，带防误触清空确认。
11. **Android 原生 App & 本地定时打卡通知**：
    - 基于 Capacitor 打包为原生 Android 移动端应用（`.apk`）；
    - 内置系统级每日定时打卡通知，支持自定义时刻（如每晚 21:00）；
    - 本地定时机制，断网离线也能准时响铃推送；
    - 接入 GitHub Actions CI/CD，自动在 GitHub Releases 发布最新 APK 供下载。

---

## 🛠️ 技术架构

- **前端框架**：Vue 3 (Composition API / `<script setup>`)
- **移动端框架**：Capacitor 8 (@capacitor/android, @capacitor/local-notifications)
- **构建工具**：Vite 6
- **样式方案**：纯原生 CSS 自定义属性（深色护眼极客风格）
- **数据存储**：
  - 本地存储：`localStorage`（存储抽象层封装，便于多端扩展）
  - 云端同步：坚果云 WebDAV (`fetch` + HTTP Basic Auth + Union Merge 去重合并）

---

## 🚀 本地启动与构建

### 1. 安装依赖
```bash
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```

### 3. 构建发布 Web 版本
```bash
npm run build
```
构建产物输出于 `dist/` 目录。

### 4. Android 相关 npm 命令
```bash
# 1. 一键触发 GitHub 云端打包并发布到 Releases (推荐，零配置直接生成 APK 供下载)
npm run release

# 2. 本地一键打包 APK (生成于 dist-apk/Daily-Ascent.apk)
npm run build:apk

# 3. 编译前端并同步至 Android 工程
npm run cap:sync

# 4. 在 Android Studio 中打开工程
npm run cap:open
```

---

## 📦 GitHub Releases 自动打包下载

本项目已配置 GitHub Actions 自动化编译工作流（`.github/workflows/build-apk.yml`）：

1. **一键自动发布（推荐）**：
   在终端直接运行：
   ```bash
   npm run release
   ```
   脚本会自动递增版本号、创建并推送 Git 标签至 GitHub，同时唤起 GitHub Actions 云端打包，2~3 分钟内即可在 [Releases](https://github.com/qinxuanlong/daily-ascent/releases) 页面生成并下载 **`Daily-Ascent.apk`**！

   *(注：也可指定版本号发布，如 `npm run release 1.0.1`)*

2. **手动网页触发**：
   随时在 GitHub 仓库的 **Actions** 标签页，找到 **"构建并发布 Android APK"** 点击 **Run workflow** 即可在几分钟内下载生成的 APK 安装包。


