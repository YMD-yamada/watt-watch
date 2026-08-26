# Monetization — watt-watch

更新: 2026-08-26

## Chosen pattern

- [x] Freemium（基本のリアルタイム表示は無料。比較CSV / 履歴は Pro）
- [x] Affiliate（USB-C インラインテスター紹介。coming soon）

## Status

- Implementation: フラグOFF
- Feature flag: `MONETIZATION_ENABLED=false`
- UI stub: 「比較CSVを書き出す」→ coming soon メッセージ

## Cost vs revenue

| 項目 | 見積（月） | メモ |
|---|---|---|
| Hosting / DB / Auth | ¥0 | Vercel Hobby 静的ホスト |
| External APIs | ¥0 | ブラウザ Battery API のみ |
| Store fees | — | 未公開 |
| **Total cost** | ¥0 | |
| **Revenue plan** | 当面¥0 | Hobby 無料枠。Pro CSV とテスター紹介は stub |

## Env placeholders

```env
MONETIZATION_ENABLED=false
```

実キーは置かない。
