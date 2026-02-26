---
description: Prosper Publisher - 指定されたドラフト記事をNote.comに投稿する（投稿のみ）
---

ユーザーが「このドラフトを投稿して」「記事の下書きをアップして」と依頼した場合、このワークフローを使用します。
**執筆や画像生成は行いません。** 既存のMarkdownファイルを選択して投稿するだけです。

1.  **対象ファイルの特定**:
    ユーザーが指定したドラフトファイル（例: `projects/prosper/writer/drafts/test_matrix.md`）のパスを特定してください。
    不明な場合は `find_by_name` 等で探してください。

2.  **投稿スクリプトの実行**:
    以下のコマンドを実行します。

```bash
projects/prosper/.venv/bin/python projects/prosper/scripts/prosper_publisher.py "{DraftPath}"
```

3.  **完了報告**:
    「投稿が完了しました」と報告してください。
