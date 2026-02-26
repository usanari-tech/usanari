#!/bin/bash
# X 自動投稿スクリプト（cronから呼び出される）
# crontabに登録: 0 8,20 * * * /Users/yukinari/Desktop/antigravity/projects/twitter/intel/cron_auto_post.sh

export PATH="/usr/local/bin:/usr/bin:/bin"
export HOME="/Users/yukinari"

INTEL_DIR="/Users/yukinari/Desktop/antigravity/projects/twitter/intel"
LOG_DIR="$INTEL_DIR/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y%m%d_%H%M')
LOG_FILE="$LOG_DIR/cron_$TIMESTAMP.log"

echo "=== 自動投稿開始: $(date '+%Y/%m/%d %H:%M') ===" >> "$LOG_FILE"

cd "$INTEL_DIR"
/usr/local/bin/node auto_post.js --niche ai --headless >> "$LOG_FILE" 2>&1

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo "=== 投稿成功 ===" >> "$LOG_FILE"
else
    echo "=== エラー (exit: $EXIT_CODE) ===" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
