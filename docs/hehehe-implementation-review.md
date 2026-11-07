# 禾禾充电桩底层检查与分发说明

本项目基于 cc2cx v3.20.0 的公开源码，源提交为 83f7e2ff5e8d3efd675b0b4e95e48f60104ba0aa。该源码继承 CC Switch 的 MIT 代码基础。

## 本次直接处理的逻辑

| 范围                    | 检查结果与处理                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 应用身份                | 显示名称为禾禾充电桩，程序名为 hehehe-charging-desktop，应用标识为 com.hehecharging.desktop，深链接为 hehecharging://      |
| 本地数据                | 默认数据目录使用 ~/.hehehe-charging-desktop/，数据库使用 hehehe-charging-desktop.db                                        |
| Windows 安装权限        | NSIS 使用 currentUser，MSI 使用 perUser 和 limited，MSI 直接安装到 LocalAppData 下的本应用目录，避免管理共享 Programs 目录 |
| MSI 卸载                | 移除了对共享 Programs 父目录的通配符删除与目录删除规则，并取消删除系统桌面目录的空目录动作                                 |
| 私有仓库下载            | 使用 manong6668/hehehe-charging-desktop 的发布页，浏览器负责 GitHub 认证                                                   |
| 更新入口                | 关于页面、托盘、数据库恢复及 cc-boot 下载入口改为本仓库                                                                    |
| 更新配置                | 当前预览版采用手动下载，配置中已移除上游更新地址和公钥，构建生成普通安装包                                                 |
| Claude Desktop 配置标识 | 使用独立的 profile UUID 与品牌名称，避免与上游 profile 身份混用                                                            |
| 图标                    | 使用本项目充电桩图标，生成 Windows ICO、macOS ICNS 和桌面 PNG                                                              |
| 分发验证                | verify-distribution.mjs 在构建前检查身份、数据目录、卸载范围与下载来源                                                     |
| 安装包验证              | verify-windows-package.ps1 只读检查实际 MSI 表，校验产品名、用户安装目录、注册表范围和卸载操作                             |

Windows 安装器内嵌微软官方 WebView2 引导程序，缺少运行时时由该程序下载运行时。MSI 无需通过过长的 PowerShell 自定义动作下载引导程序。中文版 MSI 使用 936 代码页，并阻止安装旧版本覆盖新版本。

## 功能调用路径

界面通过 Tauri invoke 调用 Rust 命令。Agent 安装逻辑位于 src-tauri/src/commands/misc.rs，覆盖平台与依赖检测、Node 准备、安装命令、下载校验、输出和进度事件。供应商切换位于 services/provider，按 Agent 类型写入对应 live 配置。本地代理默认监听 127.0.0.1，协议转换与路由位于 proxy 模块。

数据备份、恢复与迁移沿用已有实现。本项目分离了自己的应用数据目录。用户主动切换供应商或启用代理时，仍会修改选定 Agent 的配置。

## 验证范围

修改后已执行 TypeScript 类型检查、Vite 生产构建和分发配置检查。Agent 安装 API、首次启动、界面品牌、目录设置、配置交互及 App 集成共 29 项选定的前端回归测试已通过。App 集成测试把全量模块转换放在 beforeAll 中，避免把冷启动转换耗时算入首个交互测试。

Windows 使用本机 Rust、Visual Studio C++ Build Tools 与 Windows SDK 构建。macOS Apple Silicon 与 Intel 由 GitHub Actions 的对应原生 runner 构建。完成安装包构建后还应检查实际产物、哈希与各平台安装体验，只有成功产出的文件才能作为可下载版本交付。

## 仍需验证或配置的事项

- 当前构建为未签名预览版。正式分发需要 Windows Authenticode 证书与时间戳，macOS 需要 Developer ID、公证与票据装订。
- 该源码中 macOS 的 Codex UI 安装适配器实际获取 ChatGPT.app。这一继承行为需要单独调整并在 Mac 验证，当前产品构建与此安装动作分开验证。
- Agent 安装命令仍使用上游的动态版本与 npm 镜像回退。后续要做可重复的 Agent 环境分发，需要固定经过验证的版本并维护哈希和来源。
- Node 便携版的校验清单与文件来自同一镜像，当前校验验证文件与清单的一致性。要进一步加强供应链验证，需要引入可信发布元数据。
- 按维护者要求，目标仓库计划公开，使用公开 GitHub Releases 提供下载。应用内自动更新仍需独立的更新签名体系。远端创建与可见性尚待账号认证后验证。
- 实机安装、卸载、升级、断网、依赖下载失败、系统权限和各安全产品的检测结果需要按平台继续验证。签名状态、杀毒判定和管理员权限提示分别评估。

## 源码与产物上传范围

源代码、依赖锁文件、许可证、品牌资源、检查脚本和构建工作流应提交到仓库。构建缓存、运行数据库、API 密钥、发行证书和本地日志由 .gitignore 排除。安装包通过 Actions artifacts 和 Releases 保存，下载到本地后按 SHA-256 核对。公开仓库的源码、提交历史及 Release 文件会公开可见。
