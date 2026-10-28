# Monetization — watt-watch

更新: 2026-08-26

## Chosen pattern

- [x] 応援（Ko-fi）。計測・記録・CSV 書き出しはすべて無料（2026-10-28 CSV を無料化。ユーザー数優先の方針）
- [x] Affiliate（USB-C インラインテスター紹介。coming soon）

## Status

- Implementation: フラグOFF
- Feature flag: `MONETIZATION_ENABLED=false`
- 「準備中」のPro表示は撤去（未完成に見えて使われにくいため）

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
