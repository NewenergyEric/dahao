# 粉色方向关键帧

本次只做中文方向稿；没有渲染新整片。主色为粉色、奶油色、莓果色，画面是目标体验示意，不是实际运行器界面。

使用 motion/package-lock.json 固定的 Remotion 依赖；有现成依赖时可用 LAUNCH_DEPENDENCIES 指向其 package.json 所在目录，浏览器由 REMOTION_BROWSER_EXECUTABLE 指定。配置后在 motion 目录运行 `node direction.mjs`，输出 out/direction-zh.png。不需要为运行配置引擎安装 Node。

字体本地加载并等待 FontFace 完成，字形子集检查通过才渲染。引用的 Noto 字体许可在 public/fonts/OFL.txt，原展示模板许可在 UPSTREAM-LICENSE.txt。这些许可不等于本项目已选择发布许可。
