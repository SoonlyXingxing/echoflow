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
- `src/types/schema.ts`

## 为什么 GitHub `main` 看不到这些文件？

这些文件目前在开发分支上，尚未合并到 `main`。如果 GitHub 页面停留在 `main` 分支，只会看到初始化提交（例如仅 `.gitkeep`）。

## PR 提示冲突（This branch has conflicts that must be resolved）怎么处理

如果 GitHub 显示以下文件冲突：

- `package.json`
- `src/components/ProsodyCanvas.tsx`
- `src/types/schema.ts`

请在本地按以下步骤处理：

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main
# 手动解决冲突后：
git add package.json src/components/ProsodyCanvas.tsx src/types/schema.ts
git commit -m "fix: resolve merge conflicts"
git push
```

本分支已经提供了这 3 个文件的可合并版本（无冲突标记，且类型定义完整），可直接作为冲突解决结果使用。

## 如何在 GitHub 上看到这些文件

1. 推送开发分支：
   ```bash
   git push -u origin <your-branch>
   ```
2. 在 GitHub 上从该分支发起 Pull Request 到 `main`。
3. 合并 PR 后，切回 `main` 即可看到以上文件。
