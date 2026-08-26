# CURSOR_HANDOFF — watt-watch

更新: 2026-08-26

> **正本（このアプリの進捗）**: このファイルだけ。

## Active claim (multi-session)
- Session focus: host on Vercel (client-only, no PC server)
- Last touch: 2026-08-26 23:12
- Do not duplicate:

## Progress (source of truth)
- Done:
  - Local Vite app on 127.0.0.1:18793
  - WMI BatteryStatus loop + SSE live view
  - Cable label marks (LocalAppData jsonl)
- In progress: (none)
- Next:
  1. ケーブルを挿して画面で実測確認
  2. Desktop「自作アプリ」から起動できるか確認

## Status
- [x] MVP 完了
- 現在のブランチ: `main`
- デプロイ先: ローカルのみ（クラウドなし）

## What works
- 充電/放電ワットのリアルタイム表示
- 直近約2分の正味ワット推移
- ケーブル名を付けて記録
- `/api/latest` `/api/stream` `/api/marks`

## What is broken / blocked
- USB-C の PD 契約（20V/3A 等）は OS から取れない。本体が受け取ったWのみ
- 電池の無いデスクトップでは動かない

## Monetization（MUST）
- パターン: フリーミアム + アフィリエイト（USB-Cテスター）スタブ
- 実装状況: フラグOFF
- Feature flag: `MONETIZATION_ENABLED=false`
- コスト見込み: 無料枠のみ（ローカル、外部APIなし）
- 収益でカバーする計画: コスト¥0。将来 Pro で比較CSV。テスター紹介は coming soon
- 詳細ドキュメント: `MONETIZATION.md`
- 備考: 「比較CSVを書き出す」は coming soon UI

## Decision log (optional, append-only)
- 2026-08-26: Electron にせず Vite ローカル。負荷を抑え、Start-LocalApp の npm run に載せる
- 2026-08-26: PDテスターの代替ではなく、本体実測。定格比較が必要ならハード側

## Tech stack
- Framework: Vite + React + TypeScript
- Deploy: ローカル 127.0.0.1:18793
- DB: なし（marks は %LOCALAPPDATA%\watt-watch\marks.jsonl）
- Auth: なし
- 外部サービス (すべて Free Tier): なし

## Design notes
- Mobbin 参考: システムモニター / バッテリーダッシュボード（大きな単一メトリクス）
- カラー: 充電グリーン / 不足レッド / 維持ブルー
- 特記: ケーブル比較が主目的なので記録表を同画面に置く

## Multi-session rules (MUST)
1. 作業開始前にこのファイルを必ず読む。
2. `In progress` が自分の意図と衝突したら、編集を始めず先に手を合わせて更新する。
3. 編集を始める前に `Active claim` を書く。終わったら claim を空けるか focus を更新する。
4. `Last touch` と `Progress` をセッション終了時に更新する。
5. 第2の handoff / progress ファイルを作らない。
6. Monetization 欄を空のまま終了しない。
