# 搭好 · dahao：动态双语介绍

24 秒、30 FPS、1280×720。中文为主，英文独立排版；交付 MP4、20 FPS WebP/GIF、静态封面与任务示意板。

本版使用生成的透明手绘主体、Dahao Display 个性标题字、连续位置/尺度变化、七步路线、工具选择和规则标注。src/DahaoFilm.tsx 是当前影片；旧 GiftFilm.tsx、DirectionKeyframe.tsx 和原插画作为历史来源保留，不用于当前首屏。

## 重建

依赖继续由 package-lock.json 固定。已有相同依赖时，LAUNCH_DEPENDENCIES 可指向其 package.json 所在目录，REMOTION_BROWSER_EXECUTABLE 可指定已有 Chromium。只用于媒体制作，不是产品运行依赖。

在 motion 目录执行：

```powershell
node render.mjs qa
node render.mjs films
python scripts/package_media.py --zh out/dahao-v2/dahao-zh.mp4 --en out/dahao-v2/dahao-en.mp4 --out out/release-dahao-new
python scripts/check_media.py out/release-dahao-new/manifest.json
```

先审阅两种语言代表帧，再完成整片并检查完整播放。封面采用第 60 帧，任务示意板采用第 582 帧；替换打包默认封面后，显式更新媒体测量和公开 hash。打包使用新目录，不覆盖之前的审阅包。

实际提示词见 illustration-prompts-v2.json。字体源与许可证见 ../THIRD_PARTY_NOTICES.md：Dahao Display 和 Dahao Text 均是已更名的字形子集，不能遗漏许可或把回退字体当成已加载。

公开文件逐项列入 release-files.json，二进制固定在 showcase-files.json。媒体重建不改产品配方与 sources.lock.json。编码参数参考 [Remotion 官方文档](https://www.remotion.dev/docs/renderer/render-media) 与 [FFmpeg MP4 文档](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv)。
