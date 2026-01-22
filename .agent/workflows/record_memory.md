---
description: 会話中の重要な気づきや決定事項をObsidianに記録する
---

# Record Memory Workflow

重要な洞察、決定事項、教訓が得られた際に、それを将来の自分が参照できるようにObsidianに記録するフロー。

## 1. 記録基準 (Criteria)
以下のいずれかに該当する場合に記録を提案・実行する。
*   **決定事項**: 今後の方針やルールが決まった時。
*   **気づき (Insight)**: ユーザーが「なるほど」「確かに」と強く反応したアイディアや哲学。
*   **教訓 (Lesson)**: エラー解決や失敗から得られた再発防止策。
*   **アイディア**: 将来やりたいことや、ふと思いついた機能案。

## 2. 保存手順 (Procedure)
1.  **内容の要約**: 記録すべき内容を簡潔なタイトルと本文にまとめる。
2.  **ファイル作成**: `write_to_file` ツールを使用してMarkdownファイルを作成する。

### ファイル仕様
*   **保存先**: `obsidian_vault/Antigravity_Memory/Inbox/`
    *   ※ ディレクトリがない場合は自動生成される(ツールが対応)。
*   **ファイル名**: `YYYY-MM-DD_Title_SnakeCase.md`
*   **内容 (Markdown)**:
    ```markdown
    ---
    created: YYYY-MM-DDTHH:MM:SS+09:00
    tags: [memory, insight, <topic>]
    type: <decision|insight|lesson|idea>
    ---

    # <Title>

    ## Content
    <詳細な内容>

    ## Context
    (関連する会話のコンテキストや背景)
    ```

3.  **完了通知**: 保存したファイルへのリンクをユーザーに提示する。
