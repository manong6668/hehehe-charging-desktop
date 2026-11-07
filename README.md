# 禾禾充电桩

面向 Windows 和 macOS 的 AI 编程工具管理器。支持 Agent 环境检测与安装、供应商 API 配置切换、MCP、Skills、提示词、本地代理和会话管理。

项目基于 CC Switch 与 cc2cx v3.20.0 修改。许可证为 MIT，原始版权见 LICENSE，来源说明见 THIRD_PARTY_NOTICES.md。

## 下载

计划通过公开仓库 manong6668/hehehe-charging-desktop 的 Releases 分发对应系统和架构的安装包。公开发布后，安装包可直接下载。仓库创建与上传状态以实际 GitHub 页面为准。

| 系统                | 文件                             |
| ------------------- | -------------------------------- |
| Windows x64         | HeheCharging_1.0.0_x64-setup.exe |
| Windows x64 MSI     | HeheCharging_1.0.0_x64.msi       |
| macOS Apple Silicon | HeheCharging_1.0.0_aarch64.dmg   |
| macOS Intel         | HeheCharging_1.0.0_x64.dmg       |

当前流水线构建未签名预览版。Windows 可能显示发布者或 SmartScreen 提示，macOS 构建尚未配置 Developer ID 和公证。各安装包同时提供 SHA-256 文件。

## 首次使用

1. 安装并打开禾禾充电桩。
2. 在 Agent 页面检查工具与依赖，按需要选择安装。
3. 添加自己的供应商 API 地址、密钥与模型配置，再选择要使用的客户端。
4. 在设置中进行备份，按需启用本地代理与配置同步。

默认应用数据目录为 `~/.hehehe-charging-desktop/`。数据库文件为 `hehehe-charging-desktop.db`。Windows 安装本体采用用户级目录和 HKCU 注册。应用内“查看下载”打开本项目仓库发布页。

## 开发与验证

使用 Node.js 22、pnpm 10.12.3 和 rust-toolchain.toml 固定的 Rust 工具链。Windows 原生构建需要 Visual Studio C++ Build Tools 和 Windows SDK，macOS 需要 Xcode 工具链。

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm verify:distribution
pnpm test:unit
pnpm dev
```

本地 Windows 安装包构建命令如下。

```sh
pnpm build:windows
node scripts/collect-installers.mjs src-tauri/target/release/bundle installers windows x64
```

## 四个平台产物

`.github/workflows/desktop-build.yml` 在 main 提交、版本标签或手动触发时执行。验证通过后，Windows runner 生成 EXE 与 MSI，macOS ARM64 和 Intel runner 分别生成 DMG。产物上传为 GitHub Actions artifacts。

推送版本标签时，流水线还会创建预发布 Release 并上传四种安装包、哈希及检查结果。仓库公开后，Release 中的文件也公开提供下载。各平台构建必须全部成功才进入发布步骤。

## 本版本修改

- 显示名称、图标、应用标识、深链接和应用数据目录使用禾禾充电桩独立身份。
- MSI 卸载清理限定在本应用资源，移除了共享 Programs 目录的删除规则。
- 下载与恢复页面使用本仓库的发布入口。
- 添加分发配置验证和实际 MSI 数据库检查。
- 配置 Windows、Apple Silicon 与 Intel 三个原生构建任务，生成四种安装包。

底层检查及验证范围见 docs/hehehe-implementation-review.md。正式签名和公证需要由维护者配置发行证书。
