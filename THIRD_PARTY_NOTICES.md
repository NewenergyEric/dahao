# 当前许可范围 · 2026-10-12

项目自有代码、Skill、文档、模板与展示素材按根目录 [MIT](LICENSE) 提供，署名 NewenergyEric and contributors。独立 Skill 与通用 Windows 构建包均附同一许可证。

第三方材料保留原许可：Noto Sans SC 与得意黑的字体子集沿用各自 SIL OFL 1.1 声明；Remotion 展示模板保留 motion/UPSTREAM-LICENSE.txt，构建依赖遵守各自条款，不随项目许可重新授权。独立 Skill 不捆绑字体、影片或 node_modules。

下面是按制作阶段保存的来源记录；其中“私有/许可待选”描述的是当时状态，当前授权以上述说明为准。素材未包含真实客户照片、聊天、密钥或操作录屏。

---

# 搭好更名与动效改版 · 2026-10-12

- 产品与项目 Skill 经用户确认更名为「搭好 · dahao」。当前范围继续为七步清单和 Windows 项目内合成示例。
- 新交接电脑插画通过内置 image_gen 生成，使用作者既有 A1 素材板作手绘风格参考；不是私人照片或实际客户操作截图。真实提示词见 motion/illustration-prompts-v2.json。原先两张静物插画及源文件保留作历史。
- 标题字体源于 [得意黑 Smiley Sans v2.0.1](https://github.com/atelier-anchor/smiley-sans/releases/tag/v2.0.1)，遵守 SIL OFL 1.1，完整声明保留在 motion/public/fonts/SmileySans-OFL.txt。字形子集已更名为 Dahao Display，不使用原字体保留名称作为衍生字体族名。来源 ZIP SHA-256 为 299c0be6c960ae37361762eca76f7d0cd516615435bb96c0d4b98a1e70178a07。
- 正文字体 Dahao Text 为已有 Noto Sans SC 的新字形子集，原许可保留在 motion/public/fonts/OFL.txt。两者只供项目媒体与页面使用，没有全局安装字体。
- 新动效与文案独立编写；底层配置引擎、示例包、配方及来源固定值保持原样。项目公开许可证仍待作者决定，仓库保持私有。

以下为旧版素材来源，按对应阶段理解。

---

# 本轮素材来源增补 · 2026-10-12

项目维持私有开发交付，许可证与版权仍由作者决定。本节记录素材来源，不代选公开许可。

- 本轮电脑礼物与周末出行插画由内置 image_gen 工具生成；第一张使用本次新写的文字提示，第二张使用第一张作身份和材质参考。提示词在 motion/illustration-prompts.json。没有使用客户照片、私人聊天、凭据或现有商业角色。
- 新版中英文文案、六段动画与旅行示意由本项目编写。旅行内容为合成示意，非真实客户案例或运行器录屏。
- 媒体打包与检查脚本复用同一作者的 skill-launch-studio 工具；Remotion 固定依赖和原模板许可仍分别见 motion/package-lock.json 与 motion/UPSTREAM-LICENSE.txt。
- gift-sans.woff2 为已有 Noto Sans SC 原字体的字形子集，沿用 motion/public/fonts/OFL.txt 的 SIL OFL 1.1 声明；原 setup-sans.woff2 为旧方向稿保留。
- 下方“没有完整影片”的说明只描述旧方向稿阶段。新版交付已有独立来源与媒体检查记录，见 docs/media-validation.json。

---

# 来源与许可状态

搭好 · dahao 的项目许可证尚待作者选择，本项目未公开发布。以下记录材料来源，不替作者选择授权条款。

## 配置基础

配置引擎、测试、固定配方和合成订单样例源自同一作者审核过的通用实现。复制时的 client_setup.py SHA-256 为 `269f2c07004091fb282d1e0110a346235ec8f4c829f74d0e3e0d47eb4a4f6b89`，后续加入只读系统分流入口。没有复制客户目录、机器设置、凭据、日志、回执或备份。运行配置引擎只需要 CPython 标准库，不分发 Python 安装包。

基础实现只读参考过 CiciStudio 固定提交 `ca2cbcdc9054cf1fe48e60171578209971ac0d38` 的 [recipes.py](https://github.com/NewenergyEric/CiciStudio/blob/ca2cbcdc9054cf1fe48e60171578209971ac0d38/cici_foundry/recipes.py)、[change_plans.py](https://github.com/NewenergyEric/CiciStudio/blob/ca2cbcdc9054cf1fe48e60171578209971ac0d38/cici_foundry/change_plans.py) 和 [product_delivery.py](https://github.com/NewenergyEric/CiciStudio/blob/ca2cbcdc9054cf1fe48e60171578209971ac0d38/cici_foundry/product_delivery.py) 的配方、计划、前镜像和交付原则，没有复制或分发这些模块，也不依赖 FoundryAPI 服务。公开可见不等于已经得到再分发授权。

## 粉色关键帧

- 中文文案、粉色电脑与小助手图形为本项目原创方向稿，画面明确标注目标体验。该阶段只制作关键帧，没有生成完整影片。
- 制作实际采用作者的 skill-launch-studio 文案工作流、skill-productization 证据契约和 remotion-best-practices。共享 Skills 未修改。
- Remotion 工程依赖配置复用作者的展示模板；原模板许可声明完整保留在 `motion/UPSTREAM-LICENSE.txt`。本项目的关键帧组件与单帧渲染入口单独编写，不包含旧媒体打包脚本。
- 本地 Noto Sans SC 字体子集按当前关键帧文字生成，原 SIL OFL 1.1 声明保留在 `motion/public/fonts/OFL.txt`。
- `motion/package-lock.json` 固定 Remotion 4.0.534、React 19.2.0 等依赖；不分发 node_modules。制作环境依赖各自的许可，Remotion 条款见[官方说明](https://www.remotion.dev/docs/license)。这些第三方许可不等于已经替本项目选择许可证。

运行时包来源仍固定为 `bundled://safe-order-summary`。以上外部链接仅用于来源说明，不是自动下载地址；订单与实例均为合成演示，不含真实客户数据。
