---
description: Turn on automatic Text-to-Speech (TTS) for agent responses
---

1. [Instruction] From now on, **ALWAYS** check for the existence of `.agent/scripts/speak.sh`.
2. [Instruction] If it exists, execute the following command **in the background** immediately after every time you send a response to the user:
   `echo "YOUR_RESPONSE_TEXT" | .agent/scripts/speak.sh`
   or
   `.agent/scripts/speak.sh "YOUR_RESPONSE_TEXT"`
3. [Instruction] When calling `notify_user` or responding, assume this "VOICE MODE" is active until the user runs `/tts-off`.
4. [Instruction] Use the "Nanami" voice (Female) with +35% speed as configured in `speak.sh`.
