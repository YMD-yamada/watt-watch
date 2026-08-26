# RELEASE_FLOW — watt-watch

静的 Web。Vercel Hobby（無料枠）。PC をサーバーにしない。

## 公開

1. `main` へ push → Vercel がビルド
2. 本番URLをポートフォリオへ登録（`personal-site/tools/publish-app-listing.mjs --portfolio-only`）
3. ドメイン購入・ストア提出は人間必須

## 確認

- `npm run smoke`（ローカル build のみ。サーバー常駐なし）
- 本番URLを Chrome で開き、充電ON/OFFが見えること
