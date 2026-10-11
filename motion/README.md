# Agent Gift · 粉色双语短片

当前为 2026-10-12 原创插画版：24 秒、30 FPS、1280×720。分别制作中文和英文，输出 MP4、20 FPS WebP/GIF、静态封面及任务示意板。旧 direction-zh.png 和单帧源码保留作历史方向稿，README 已使用新短片。

## 素材与工程

- public/illustrations/gift-scene.png：内置生图工具生成的粉色电脑礼物场景。
- public/illustrations/weekend-scene.png：以上一张为角色与材质参考生成的周末出行场景。
- illustration-prompts.json：本次真实提示词、工具与参考用途；工具未提供 model/seed，不虚构这些值。
- src/GiftFilm.tsx：按帧控制的六段故事、独立文字层和状态说明，主视觉没有用 SVG 或 PPT 图形替代生图。
- public/fonts/gift-sans.woff2：从已有 Noto Sans SC 原字体提取的当前字形子集；字体许可仍在 public/fonts/OFL.txt。

画面为原创任务与目标流程示意，不是已实现运行器的截图，也不证明 Agent 已安装。

## 重建

依赖由 package-lock.json 固定。已有相同依赖时，LAUNCH_DEPENDENCIES 可指向其 package.json 所在目录；REMOTION_BROWSER_EXECUTABLE 可指定已有 Chromium。也可在本工程中根据锁文件安装制作依赖。上述依赖只用于制作媒体，不属于产品运行或电脑安装步骤。

在 motion 目录运行：

```powershell
node render.mjs qa
node render.mjs films
python scripts/package_media.py --zh out/gift-zh.mp4 --en out/gift-en.mp4 --out out/release-new
python scripts/check_media.py out/release-new/manifest.json
```

先审阅两种语言的代表帧，再渲染完整影片，最后检查完整播放、编码、预览帧率、体积和链接。打包输出必须是新目录；封面选用审阅过的首屏 out/gift-zh-60.png / gift-en-60.png，任务板采用 out/gift-zh-550.png / gift-en-550.png。替换打包默认封面后重新计算媒体测量与公开 hash，并运行验证。

正式交付路径在 assets/readme；素材、字体和媒体必须逐项加入 release-files.json 与 showcase-files.json，由维护者显式审阅 pin。产品 recipes 与 sources.lock.json 不因媒体重建而改变。渲染器参数参考 [Remotion 官方文档](https://www.remotion.dev/docs/renderer/render-media)，MP4 faststart 参考 [FFmpeg 文档](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv)。
