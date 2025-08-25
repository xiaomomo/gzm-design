#!/bin/bash
set -e

TARGET_DIR="/Users/liuqingjie/code/ai-tts/future-ai-lab/ui/public/static/haibao"

# 删除目标目录（如果存在）
if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
fi

# 构建项目
pnpm build

# 创建目标目录并复制构建产物
mkdir -p "$TARGET_DIR"
cp -r ./dist/* "$TARGET_DIR/"