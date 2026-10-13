#!/bin/bash
set -eu
umask 077
task_prefix="$HOME/__RUNTIME_RELATIVE__"
printf '\033[2J\033[H'
printf '%s\n' '搭好 · 打开这台 Mac 已安装的 OpenClaw' ''
if [[ "$(/usr/bin/uname -s)" != Darwin || ! -x "$task_prefix/bin/openclaw" || ! -x "$task_prefix/tools/node/bin/node" ]]; then
  printf '%s\n' '没有找到本次安装。请把这个状态告诉帮助者；此入口不会重新安装。' '' '按回车关闭。'
  read -r task_reply || true
  exit 1
fi
printf '%s\n' '正在使用：' "$task_prefix/bin/openclaw" ''
printf '%s\n' '首次打开会进入 OpenClaw 自己的设置向导；按屏幕提示选择即可，不用输入命令。'
printf '%s\n' '按已选方案设置模型。密钥只填在这个 Mac 的向导里，不发聊天，不截图。'
printf '%s\n' '如果询问查找已有账号或 AI 工具，选择 Ask first（先询问）并手动配置。'
printf '%s\n' '不导入旧记忆或个人资料。遇到插件安装或后台服务确认，请先看清提示再选择。' ''
printf '%s\n' '这个启动入口不建立 SSH 授权，不修改系统 PATH，不上传任何资料。'
printf '%s\n' '完成配置之前，安装成功不等于已能回答问题。' ''
task_status=0
/usr/bin/env -i HOME="$HOME" USER="$(/usr/bin/id -un)" LOGNAME="$(/usr/bin/id -un)" PATH="$task_prefix/tools/node/bin:$task_prefix/bin:/usr/bin:/bin:/usr/sbin:/sbin" LANG=en_US.UTF-8 TERM=xterm-256color "$task_prefix/bin/openclaw" || task_status=$?
printf '\n%s\n' 'OpenClaw 已退出。需要时重新双击此入口即可。' '如有问题，只反馈提示文字，不发送密钥或完整日志。' '按回车关闭。'
read -r task_reply || true
exit "$task_status"
