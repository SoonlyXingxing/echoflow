# EchoFlow

本仓库当前包含一个移动端优先的 EchoFlow 原型，主要文件如下：

- `index.html`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `public/manifest.json`
- `public/sw.js`
- `public/icons/icon-192.svg`
- `public/icons/icon-512.svg`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`
- `src/components/PracticePage.tsx`
- `src/components/ProsodyCanvas.tsx`
- `src/hooks/useRecorder.ts`

## 为什么 GitHub `main` 看不到这些文件？

这些文件目前在本地开发分支 `work` 上，尚未合并到 `main`。如果 GitHub 页面停留在 `main` 分支，只会看到初始化提交（例如仅 `.gitkeep`）。

## 如何在 GitHub 上看到这 14 个文件

1. 推送 `work` 分支：
   ```bash
   git push -u origin work
   ```
2. 在 GitHub 上从 `work` 发起 Pull Request 到 `main`。
3. 合并 PR 后，切回 `main` 即可看到以上文件。

如果你希望我改成直接在 `main` 提交，也可以把后续变更策略改为直接基于 `main` 开发。
