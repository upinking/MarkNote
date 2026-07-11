# MarkNote Mobile

MarkNote 的 Android 手机版入口。使用 Capacitor 原生壳 + 单栏手机界面，支持阅读、轻编辑和 GitHub 私有仓库手动同步。

## 开发

```bash
npm run mobile:dev
```

## GitHub 同步

1. 新建一个专门存放笔记的 GitHub 私有仓库，并至少创建一个文件以初始化 `main` 分支。
2. 创建 Fine-grained personal access token，只允许访问该仓库，并授予 `Contents: Read and write` 权限。
3. 在电脑端和手机端填写相同的用户名、仓库名、分支及远端文件夹（默认 `notes`）。
4. 保存 Token 后点击同步按钮。Token 在 Android 上使用系统 Keystore 加密保存。

同步会先比较上一次同步版本。两端同时修改同一篇笔记时，MarkNote 会询问保留手机版本、GitHub 版本还是两个都保留；选择两个都保留时会生成带时间戳的冲突副本。

## 构建网页资源

```bash
npm run mobile:build
```

## 将网页资源复制到 Android 壳

```bash
npm run mobile:sync
```

## 打开 Android 工程

```bash
npm run mobile:open
```

Android 原生工程位于 `mobile/android/`。
