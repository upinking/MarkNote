# MarkNote Mobile

MarkNote 的 Android 手机版入口。第一版是 Capacitor 原生壳 + 单栏手机界面，面向阅读、轻编辑和局域网直连同步。

## 开发

```bash
npm run mobile:dev
```

同步不需要云账号。先在电脑端“设置 → 局域网同步”里开启同步，再把电脑地址和 6 位同步码填到手机端即可。

## 构建网页资源

```bash
npm run mobile:build
```

## 同步到 Android 壳

```bash
npm run mobile:sync
```

## 打开 Android 工程

```bash
npm run mobile:open
```

Android 原生工程位于 `mobile/android/`。
