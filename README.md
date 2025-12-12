# チーム分けアプリ for NAiS

NAiSプロジェクトチーム向けのランダムチーム分けWebアプリケーションです。メンバーを管理し、様々な条件でチーム分けを実行できます。

## 概要

このアプリケーションは、プロジェクトチームのメンバーをランダムにチーム分けするためのシンプルなWebツールです。サーバー不要、アカウント登録不要で、ブラウザだけで即座に利用できます。

**主な特徴:**
- 🎲 3つのチーム分けモード(チーム数指定/人数指定/制約付き)
- 👥 メンバー管理機能(追加/編集/削除)
- 🔄 ワンクリックで再抽選
- 📊 カード形式/リスト形式の表示切替
- 💾 PNG画像でのエクスポート
- 📱 レスポンシブデザイン対応

## デモ

🚀 **Live Demo:** [https://ta-hasunuma.github.io/team-assignment/](https://ta-hasunuma.github.io/team-assignment/)

## 機能

### 1. メンバー管理

- **初期メンバー**: 起動時に10人のサンプルメンバー(ひらがな5人、カタカナ5人)が自動登録
- **追加**: 新しいメンバーを追加(名前とタイプを指定)
- **編集**: 既存メンバーの名前を変更
- **削除**: 不要なメンバーを削除
- **永続化**: SessionStorageでセッション中はデータを保持

### 2. チーム分けモード

#### モードA: チーム数指定
指定した数のチームに均等に分配します。

**例:** 10人のメンバーを3チームに分ける
- チーム1: 4人
- チーム2: 3人
- チーム3: 3人

#### モードB: 1チームの人数指定
各チームの人数を指定して分けます。

**例:** 10人のメンバーを4人ずつに分ける
- チーム1: 4人
- チーム2: 4人
- チーム3: 2人(余り)

#### モードC: 制約付き分け
特定のタイプのメンバーのみで1チームを作り、残りを他のチームに分配します。

**例:** ひらがなメンバー3人で1チームを作り、残りを2チームに分ける
- チーム1: ひらがなメンバー3人
- チーム2: 残りのメンバー
- チーム3: 残りのメンバー

### 3. 結果表示

- **カード形式**: メンバーをカードで見やすく表示(デフォルト)
- **リスト形式**: コンパクトなリスト表示に切替可能
- **再抽選**: 結果が気に入らない場合、ワンクリックで別のランダム結果を生成

### 4. 画像エクスポート

- PNG形式で結果を画像として保存
- ファイル名に日時を自動付与(例: `teams-20250128-143052.png`)
- Canvas APIによる高品質な画像生成

## 使用方法

### ステップ1: メンバー管理

1. アプリを開くと、初期メンバー10人が表示されます
2. **メンバーを追加する場合:**
   - 名前を入力
   - タイプ(ひらがな/カタカナ)を選択
   - 「メンバーを追加」をクリック
3. **メンバーを編集/削除する場合:**
   - 各メンバーの「編集」「削除」ボタンを使用

### ステップ2: チーム分け設定

3つのモードから選択します:

**チーム数を指定:**
- ラジオボタンで「チーム数を指定」を選択
- チーム数を入力(例: 3)

**1チームの人数を指定:**
- ラジオボタンで「1チームの人数を指定」を選択
- 人数を入力(例: 4)

**制約付き(ひらがな/カタカナ):**
- ラジオボタンで「制約付き」を選択
- タイプ(ひらがな/カタカナ)を選択
- そのタイプで作るチームの人数を入力
- 残りを分けるチーム数を入力

### ステップ3: 実行と結果確認

1. 「チーム分けを実行」ボタンをクリック
2. 結果が即座に表示されます
3. 必要に応じて:
   - 「表示切替」: カード/リスト表示を切替
   - 「再抽選」: 別のランダム結果を生成
   - 「画像として保存」: PNG形式でダウンロード

## 技術スタック

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: Flexbox/Grid、カスタムプロパティ、レスポンシブデザイン
- **Vanilla JavaScript (ES6+)**: フレームワークなし、モダンJS文法

### ブラウザAPI
- **SessionStorage API**: セッション中のデータ永続化
- **Canvas API**: PNG画像生成

### デプロイメント
- **GitHub Pages**: 静的サイトホスティング

### 依存関係
- **なし**: 外部ライブラリやフレームワークを使用していません

## ファイル構成

```
team-assignment/
├── index.html              # メインHTMLファイル
├── style.css               # スタイルシート
├── app.js                  # アプリケーションロジック
├── README.md               # このファイル
├── app.test-*.js           # テストファイル群
├── test-runner-*.html      # テスト実行環境
└── TASK8_VALIDATION.md     # 統合テスト検証レポート
```

**主要コンポーネント:**

- `AppController`: UIとロジックの統合管理
- `MemberManager`: メンバーCRUD操作とSessionStorage管理
- `TeamAssignmentEngine`: チーム分けアルゴリズム実装
- `ImageExporter`: Canvas APIによる画像生成

## ブラウザ互換性

このアプリケーションは、以下のモダンブラウザで動作確認済みです:

| ブラウザ | 最小バージョン | 備考 |
|---------|--------------|------|
| Chrome  | 90+          | 推奨 |
| Firefox | 88+          | 推奨 |
| Safari  | 14+          | 推奨 |
| Edge    | 90+          | 推奨 |

**必要な機能:**
- ES6+ JavaScript (クラス、アロー関数、分割代入など)
- SessionStorage API
- Canvas API
- CSS Custom Properties
- Flexbox/Grid

**非対応:**
- Internet Explorer (すべてのバージョン)

## GitHub Pages デプロイ手順

### 前提条件
- GitHubアカウント
- リポジトリにコードがプッシュ済み

### デプロイ手順

1. **GitHubリポジトリにアクセス**
   - ブラウザでリポジトリページを開く

2. **Settings (設定) に移動**
   - リポジトリのタブから「Settings」をクリック

3. **Pages セクションに移動**
   - 左サイドバーから「Pages」を選択

4. **Source (ソース) を設定**
   - "Deploy from a branch"を選択
   - Branch: `main` を選択
   - Folder: `/ (root)` を選択
   - 「Save」ボタンをクリック

5. **デプロイ完了を待つ**
   - 数分後、ページ上部に公開URLが表示されます
   - URL形式: `https://<username>.github.io/<repository-name>/`

6. **アクセス確認**
   - 表示されたURLにアクセスしてアプリを確認

### トラブルシューティング

**ページが表示されない場合:**
- `index.html`がリポジトリのルートディレクトリにあることを確認
- GitHub Actionsのワークフローが成功しているか確認
- ブラウザのキャッシュをクリアして再読み込み

**404エラーが出る場合:**
- リポジトリ名とURLが一致しているか確認
- ブランチが正しく設定されているか確認

## 開発

### ローカル開発環境のセットアップ

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/ta-hasunuma/team-assignment.git
   cd team-assignment
   ```

2. **ローカルサーバーを起動**
   
   Python 3を使用する場合:
   ```bash
   python3 -m http.server 8000
   ```
   
   Node.jsを使用する場合:
   ```bash
   npx http-server -p 8000
   ```

3. **ブラウザでアクセス**
   ```
   http://localhost:8000
   ```

### テストの実行

各テストファイルに対応するテストランナーをブラウザで開きます:

```
http://localhost:8000/test-runner.html      # Task 1
http://localhost:8000/test-runner-2.1.html  # Task 2.1
http://localhost:8000/test-runner-2.2.html  # Task 2.2
http://localhost:8000/test-runner-3.1.html  # Task 3.1
http://localhost:8000/test-runner-3.2.html  # Task 3.2
http://localhost:8000/test-runner-4.html    # Task 4
http://localhost:8000/test-runner-5.html    # Task 5
http://localhost:8000/test-runner-6.html    # Task 6
http://localhost:8000/test-runner-7.html    # Task 7
http://localhost:8000/test-runner-8.html    # Task 8 (Integration)
```

**テスト統計:**
- 合計テスト数: 100+
- テストカバレッジ: 全機能
- TDDアプローチ: RED-GREEN-REFACTOR

### 開発ガイドライン

このプロジェクトは**Test-Driven Development (TDD)** に従って開発されています:

1. **RED**: 失敗するテストを書く
2. **GREEN**: テストをパスする最小限のコードを書く
3. **REFACTOR**: コードをクリーンアップ
4. **VERIFY**: すべてのテストがパスすることを確認

### アーキテクチャ

```
MVC風の3層構造

UI層 (index.html, style.css)
    ↓
アプリケーション層 (app.js)
- AppController: UI統合管理
- MemberManager: メンバーCRUD
- TeamAssignmentEngine: チーム分けロジック
- ImageExporter: 画像生成
    ↓
ストレージ層 (SessionStorage API)
```

### コーディング規約

- **命名**: キャメルケース(JavaScript)、ケバブケース(CSS)
- **スタイル**: セミコロン使用、2スペースインデント
- **エラーハンドリング**: Result型パターン `{ok: boolean, value?: T, error?: string}`
- **コメント**: JSDoc形式でクラスとメソッドを文書化

## ライセンス

MIT License

Copyright (c) 2025 NAiS Project Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**開発者**: NAiS Project Team  
**バージョン**: 1.0.0  
**最終更新**: 2025-01-28
