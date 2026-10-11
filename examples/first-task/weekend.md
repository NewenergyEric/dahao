# 第一件小事：两天一夜，轻装出发

本文件是为介绍产品重新编写的合成任务和目标输出示意，不来自用户聊天、真实行程或客户资料；尚未由真实 Agent 执行。它帮助确认“什么结果算有用”，不代表当前工具已能完成此任务。

## 输入示意

“周末想出去两天，带一个小包，尽量轻装。帮我分清要带什么、出发前确认什么。如果信息不够，先列出要问的。”

## 目标输出示意

- [ ] 随身带：手机、证件、充电器；按个人需要补充替换衣物。
- [ ] 出发前：核对目的地天气、交通和住宿安排；当前未进行任何查询或预订。
- [ ] 待确认：目的地、具体日期、同行人数及个人必需品。

完成条件：用户能分别看到已知内容、需要准备的事项与仍缺的信息，能够据此继续补充。不能虚构天气、车次、价格、预订或个人偏好。

## 与安装清单的关系

先通过依赖、网络、准备工具、Agent、行为约束和 Skills 的检查；再在所选运行器中实际加载规则与 Skill，使用用户明确提供且获授权的输入完成任务。文件存在、人工勾选或本示例文本都不能替代真实加载与任务验收。

## English summary

This is a newly authored synthetic scenario, not a live Agent result or a private itinerary. The user wants to pack light for a two-day trip. A useful outcome separates items to bring (phone, ID and charger), arrangements to verify (weather, transport and accommodation), and missing details (destination, dates and group size). No searches, bookings or assumptions about the user's private preferences have been made.
