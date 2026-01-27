#!/bin/bash
# TTS Wrapper Script
# Settings: Voice=Nanami (Female), Speed=+35%

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="/Users/yukinari/Desktop/antigravity"

# Use absolute path to the virtual environment python
PYTHON_EXEC="$WORKSPACE_ROOT/.venv/bin/python"
TTS_SCRIPT="$WORKSPACE_ROOT/.agent/scripts/tts_engine.py"

# Execute
# Takes input from stdin (pipe) or arguments
if [ -p /dev/stdin ]; then
    cat - | "$PYTHON_EXEC" "$TTS_SCRIPT" --voice ja-JP-NanamiNeural --rate +35% "$@"
else
    "$PYTHON_EXEC" "$TTS_SCRIPT" --voice ja-JP-NanamiNeural --rate +35% "$@"
fi
