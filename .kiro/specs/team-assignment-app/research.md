# Research & Design Decisions

---

## **Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

## Summary

- **Feature**: `team-assignment-app`
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - GitHub Pages は静的 HTML ファイルをホスティングする最適なソリューション(Jekyll 不要、設定最小)
  - Canvas API はブラウザ標準の HTML5 機能で画像生成に最適(追加ライブラリ不要)
  - Fisher-Yates シャッフルアルゴリズムがランダムチーム分けに最適(均等分散、実装容易)

## Research Log

### GitHub Pages ホスティング要件

- **Context**: 静的 Web アプリケーションの無料ホスティング方法を調査
- **Sources Consulted**:
  - https://docs.github.com/pages
  - GitHub Pages 公式ドキュメント
- **Findings**:
  - GitHub Pages は静的 HTML/CSS/JavaScript ファイルを無料でホスティング可能
  - 特別なビルドプロセス不要(Jekyll は任意、今回は不使用)
  - `index.html`をリポジトリルートに配置するだけでデプロイ可能
  - HTTPS が自動で提供される
  - カスタムドメイン対応(今回は不要)
- **Implications**:
  - サーバーサイド処理なし(完全クライアントサイド実装)
  - バックエンド API やデータベース不要
  - デプロイは`main`ブランチへの push のみ

### Canvas API による画像生成

- **Context**: チーム分け結果を画像として保存する機能の実装方法
- **Sources Consulted**:
  - https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
- **Findings**:
  - Canvas API は HTML5 標準で全モダンブラウザがサポート(Chrome 1+, Firefox 1.5+, Safari 2+)
  - `canvas.toDataURL()`メソッドで PNG/JPEG 形式の画像データ URL を生成可能
  - `toDataURL('image/png')`がデフォルトで最も互換性が高い
  - `toDataURL('image/jpeg', quality)`で JPEG 品質制御可能(0.0-1.0)
  - Data URL から`<a>`タグの`download`属性でローカル保存可能
  - 外部ライブラリ不要、ブラウザネイティブ機能のみで実装可能
- **Implications**:
  - 依存ライブラリなしで画像保存機能を実装
  - PNG 形式を採用(テキストの視認性重視)
  - Canvas 上にチーム情報をレンダリングし、画像化してダウンロード

### ランダムシャッフルアルゴリズム

- **Context**: メンバーをランダムにチーム分けするアルゴリズムの選定
- **Sources Consulted**:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  - Fisher-Yates shuffle algorithm (標準的なシャッフルアルゴリズム)
- **Findings**:
  - `Math.random()`は 0 以上 1 未満の疑似乱数を生成(暗号学的には不適だが、ゲーム用途には十分)
  - Fisher-Yates アルゴリズム(Knuth shuffle)が配列シャッフルの標準手法
  - O(n)時間計算量で均等分散を保証
  - JavaScript 実装が容易:
    ```javascript
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    ```
- **Implications**:
  - Fisher-Yates アルゴリズムをチーム分けロジックの基盤として採用
  - メンバー配列をシャッフル後、順番にチームへ割り当て
  - 追加のランダム性ライブラリ不要

### フロントエンド技術スタック選定

- **Context**: GitHub Pages 上で動作する静的 Web アプリの技術スタック
- **Findings**:
  - **バニラ JavaScript**: ビルドプロセス不要、学習コスト低、軽量
  - **フレームワーク不使用の理由**:
    - 小規模アプリ(単一ページ、限定機能)
    - ビルドツール不要でデプロイ簡易化
    - 依存関係ゼロでメンテナンス負荷最小化
  - **HTML5 + CSS3**: モダンブラウザで十分な表現力
  - **レスポンシブデザイン**: CSS Grid/Flexbox でモバイル対応
- **Implications**:
  - フレームワークレス、ビルドレスのシンプル構成
  - `index.html`, `style.css`, `app.js`の 3 ファイル構成
  - ブラウザ直接実行可能(開発サーバー不要)

### UI/UX デザイン実装方針

- **Context**: シンプル・ミニマル・青色基調のデザイン実装
- **Findings**:
  - CSS カスタムプロパティ(CSS Variables)で色テーマ管理
  - Flexbox/Grid でレスポンシブレイアウト
  - アニメーションなし(即座表示)でパフォーマンス最適化
  - カード形式とリスト形式の切り替えは CSS クラスで制御
- **Implications**:
  - メインカラー: `#2196F3`(Material Design Blue 500)
  - ボタン/カードにホバーエフェクトのみ(トランジション最小)
  - モバイルファーストアプローチ

## Architecture Pattern Evaluation

| Option                 | Description                      | Strengths                            | Risks / Limitations                  | Notes                        |
| ---------------------- | -------------------------------- | ------------------------------------ | ------------------------------------ | ---------------------------- |
| Single-Page Vanilla JS | HTML/CSS/JS のみの単一ページ構成 | ビルド不要、依存ゼロ、高速、学習容易 | 大規模化で保守困難(今回は該当せず)   | 採用: 機能範囲が限定的で最適 |
| React/Vue SPA          | モダンフレームワーク             | コンポーネント化、状態管理容易       | ビルド必須、依存管理、学習コスト     | 不採用: 過剰な複雑性         |
| Web Components         | 標準 Web Components API          | 再利用性、標準準拠                   | ブラウザ互換性、ボイラープレート増加 | 不採用: 小規模アプリに不要   |

## Design Decisions

### Decision: バニラ JavaScript によるフレームワークレス実装

- **Context**: 小規模な静的 Web アプリで最適な技術スタックを決定
- **Alternatives Considered**:
  1. React + Vite - モダン SPA フレームワーク
  2. Vue.js - 軽量なプログレッシブフレームワーク
  3. Vanilla JS - フレームワークなし
- **Selected Approach**: Vanilla JavaScript (Option 3)
- **Rationale**:
  - 機能が限定的(10 要件、単一ページ)でフレームワークの恩恵が少ない
  - ビルドプロセス不要で GitHub Pages デプロイが最小構成
  - 学習コスト低く、プロジェクトチーム全員がメンテナンス可能
  - 依存関係ゼロでセキュリティリスク最小化
- **Trade-offs**:
  - **Benefits**: シンプル、高速、依存なし、デプロイ容易
  - **Compromises**: 大規模化時の再構成コスト(現時点で拡張予定なし)
- **Follow-up**: 将来的に機能拡張が必要になった場合、軽量フレームワークへの移行を検討

### Decision: Fisher-Yates シャッフルアルゴリズムの採用

- **Context**: メンバーをランダムにチーム分けするロジック
- **Alternatives Considered**:
  1. Array.sort() + Math.random() - シンプルだが分布不均等
  2. Fisher-Yates shuffle - 標準アルゴリズム
  3. Lodash/Underscore shuffle - 外部ライブラリ
- **Selected Approach**: Fisher-Yates shuffle (Option 2)
- **Rationale**:
  - 均等分布を保証(すべての順列が等確率)
  - O(n)時間計算量で効率的
  - 実装がシンプルで外部依存不要
  - 業界標準アルゴリズム
- **Trade-offs**:
  - **Benefits**: 正確性、効率性、依存なし
  - **Compromises**: なし
- **Follow-up**: なし(標準実装として確立)

### Decision: Canvas API による画像生成

- **Context**: チーム分け結果を画像として保存する機能
- **Alternatives Considered**:
  1. html2canvas(外部ライブラリ) - DOM to Canvas 変換
  2. Canvas API(ネイティブ) - 直接描画
  3. SVG + Blob - ベクター画像
- **Selected Approach**: Canvas API (Option 2)
- **Rationale**:
  - HTML5 標準、全モダンブラウザサポート
  - 外部依存なし
  - PNG/JPEG 出力が容易
  - 描画制御が完全
- **Trade-offs**:
  - **Benefits**: 依存なし、互換性高、制御容易
  - **Compromises**: DOM 要素を直接画像化できない(Canvas 上で再描画必要)
- **Follow-up**: Canvas 描画ロジックで日本語フォントレンダリングをテスト

### Decision: クライアントサイド状態管理(セッションストレージ)

- **Context**: メンバーリストとチーム分け設定の一時保存
- **Alternatives Considered**:
  1. LocalStorage - 永続化
  2. SessionStorage - セッション間のみ
  3. 状態管理なし - メモリのみ
- **Selected Approach**: SessionStorage (Option 2)
- **Rationale**:
  - 要件 10.2「セッション中のみブラウザ内に保持」に準拠
  - ページリロード時に状態復元可能
  - ブラウザを閉じると自動削除(プライバシー保護)
- **Trade-offs**:
  - **Benefits**: 要件準拠、プライバシー保護、実装容易
  - **Compromises**: ブラウザ閉鎖時にデータ消失(仕様通り)
- **Follow-up**: なし

## Risks & Mitigations

- **Risk 1: Canvas 日本語フォントレンダリング** - 一部ブラウザでフォントが正しく表示されない可能性 → デフォルトシステムフォント使用、フォールバック設定
- **Risk 2: 古いブラウザ非対応** - IE11 などレガシーブラウザで Canvas/ES6 動作しない → 要件でモダンブラウザ限定、非対応メッセージ表示
- **Risk 3: 画像保存時のファイル名** - ブラウザによってダウンロード挙動が異なる → 標準的な`download`属性使用、タイムスタンプ付きファイル名
- **Risk 4: 大人数チーム分けのパフォーマンス** - 100 人以上でシャッフル遅延 → 現実的なユースケースは 10-20 人程度、問題なし

## References

- [GitHub Pages Documentation](https://docs.github.com/pages) - 静的サイトホスティング
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - 画像生成 API
- [HTMLCanvasElement.toDataURL() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) - 画像エクスポート
- [Math.random() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) - 乱数生成
- Fisher-Yates Shuffle Algorithm - ランダムシャッフル標準アルゴリズム
