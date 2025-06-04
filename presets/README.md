# プリセット管理構造

## ディレクトリ構造

```
public/presets/
├── presets-index.json     # プリセット一覧インデックス
├── street-run/           # 街ランカテゴリ
│   └── tokyo-street-run-2025.json
├── marathon/             # マラソンカテゴリ
│   └── marathon-training-16weeks.json
└── training/             # トレーニングカテゴリ
    └── 10k-training.json
```

## 新しいプリセットの追加方法

1. 適切なカテゴリディレクトリにJSONファイルを作成
2. `presets-index.json` にファイルパスを追加
3. アプリケーションが自動的に新しいプリセットを認識

## プリセットファイル形式

各プリセットファイルは以下の形式に従う：

```json
{
    "id": "unique-preset-id",
    "name": "プリセット名",
    "description": "プリセットの説明",
    "category": "street-run|marathon|training|custom",
    "config": {
        "id": "unique-preset-id",
        "name": "プリセット名",
        "description": "プリセットの説明",
        "startDateTime": "2025-06-07T08:30",
        "checkpoints": [
            // チェックポイント配列
        ]
    }
}
```

## 利点

- プリセットの個別管理が可能
- カテゴリ別の整理
- 新しいプリセットの追加が簡単
- ファイルサイズの分散
- 並列読み込みによる高速化
