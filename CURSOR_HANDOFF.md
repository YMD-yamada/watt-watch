# CURSOR_HANDOFF — watt-watch

更新: 2026-08-26

> **正本（このアプリの進捗）**: このファイルだけ。

## Active claim (multi-session)
- Session focus:
- Last touch: 2026-08-26 23:25
- Do not duplicate:

## Progress (source of truth)
- Done:
  - Client-only meter (Battery API). No Node server on the PC
  - Vercel Hobby production: https://watt-watch-alpha.vercel.app/
  - GitHub: https://github.com/YMD-yamada/watt-watch
- In progress: (none)
- Next:
  1. 公開URLでケーブル比較を実機確認
  2. ポートフォリオ掲載の反映確認

## Status
- [x] MVP 完了
- 現在のブランチ: `main`
- デプロイ先: https://watt-watch-alpha.vercel.app/

## What works
- ブラウザだけで充電/放電の推定ワット
- ケーブル名の記録（localStorage）
- Vercel 静的ホスト。PC負荷はタブ1つ分

## What is broken / blocked
- Firefox / 電池のないデスクトップは非対応
- USB-C PD の契約電圧は取れない（ブラウザAPIの限界）
- ワットは充電時間×電池容量からの推定

## Monetization（MUST）
- パターン: フリーミアム + アフィリエイト（USB-Cテスター）スタブ
- 実装状況: フラグOFF
- Feature flag: `MONETIZATION_ENABLED=false`
- コスト見込み: Vercel Hobby ¥0
- 収益でカバーする計画: コスト¥0。将来 Pro CSV
- 詳細ドキュメント: `MONETIZATION.md`

## Decision log (optional, append-only)
- 2026-08-26: 公開は Vercel 静的。WMIローカルサーバーは負荷のため廃止
- 2026-08-26: Electron にせず Vite ローカル。負荷を抑え、Start-LocalApp の npm run に載せる
- 2026-08-26: PDテスターの代替ではなく、本体実測。定格比較が必要ならハード側

## Tech stack
- Framework: Vite + React + TypeScript
- Deploy: Vercel Hobby
- DB: なし（marks は localStorage）
- Auth: なし
- 外部サービス (すべて Free Tier): Vercel Hobby

## Design notes
- Mobbin 参考: システムモニター / 大きな単一メトリクス
- カラー: 充電グリーン / 不足レッド / 維持ブルー

## Multi-session rules (MUST)
1. 作業開始前にこのファイルを必ず読む。
2. `In progress` が自分の意図と衝突したら、編集を始めず先に手を合わせて更新する。
3. 編集を始める前に `Active claim` を書く。終わったら claim を空けるか focus を更新する。
4. `Last touch` と `Progress` をセッション終了時に更新する。
5. 第2の handoff / progress ファイルを作らない。
6. Monetization 欄を空のまま終了しない。
