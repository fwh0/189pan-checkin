# 天翼云盘自动签到（非 Fork）

这是一个独立的 GitHub 仓库，用于运行天翼云盘自动签到，并把结果发布到 GitHub Pages。

本项目刻意没有使用 Fork，因为 GitHub 对 Fork 仓库的 `schedule` 定时任务有额外限制；独立仓库的定时工作流更可靠。

## 功能

- 每天北京时间 09:07 和 17:07 自动签到
- 支持账号密码登录
- 支持多个账号，用 `&` 分隔
- 可选 SSON Cookie 登录，用于账号密码触发验证码时
- 自动更新 `index.md` 并部署到 GitHub Pages

## 来源与引用

本项目不是原仓库的 Fork，签到逻辑和接口使用参考了以下公开项目：

- [zzifan1/189pan1](https://github.com/zzifan1/189pan1)：原始天翼云盘签到项目
- [q952417961/189pan](https://github.com/q952417961/189pan)：本项目迁移前的 Fork 仓库
- [dext7r/189pan](https://github.com/dext7r/189pan)：Fork 链上的参考实现
- [wes-lin/Cloud189Checkin](https://github.com/wes-lin/Cloud189Checkin)：当前维护的签到实现
- [wes-lin/cloud189-sdk](https://github.com/wes-lin/cloud189-sdk)：登录和签到 API SDK（MIT）

原项目代码和文档的版权归各自作者所有；本项目只保留必要的签到逻辑和部署配置。若原作者认为引用方式不妥，请在本仓库开 Issue，我会调整或删除相关内容。

## 配置 Secrets

在仓库的 `Settings → Secrets and variables → Actions` 添加：

| Secret | 说明 |
|---|---|
| `TYYP_USERNAME` | 天翼云盘手机号 |
| `TYYP_PSW` | 天翼云盘密码 |
| `TYYP_SSON` | 可选，浏览器中的 SSON Cookie；账号密码登录遇到验证码时使用 |

多个账号用 `&` 分隔，顺序要一一对应，例如：

```text
TYYP_USERNAME=13800000001&13800000002
TYYP_PSW=密码1&密码2
```

不要把账号密码写进 README、工作流文件或提交记录，只放在 Secrets 里。

## 启用 Pages

在 `Settings → Pages` 把 Source 设置为 `GitHub Actions`。工作流会构建并部署 `index.md`。

## 运行

- 自动运行：每天北京时间 09:07、17:07
- 手动运行：Actions → 天翼云盘签到 → Run workflow

## 说明

- GitHub 的定时任务不是精确闹钟，可能延迟几分钟。
- 第二次运行通常只会显示“今天已经签到过”，这是正常的。
- 本项目仅用于个人账号的日常签到，请遵守天翼云盘的服务条款。
