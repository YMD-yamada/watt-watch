# watt-watch

ノートPCが **実際に受け取っている電力（推定W）** を、ブラウザだけで表示するアプリです。

ホスティング（Vercel）が静的ファイルを配るだけです。あなたのPCで Node サーバーは動かしません。計測と記録は開いているタブの中だけです。

## 公開URL

https://watt-watch-alpha.vercel.app/

PC上の Node サーバーは不要です。Chrome / Edge でノートPCから開いてください。

## 使い方

1. Chrome または Edge でノートPCから開く
2. ケーブルを1本挿し、15〜30秒待つ
3. 名前を付けて記録し、次のケーブルと比較する

電池容量（Wh）は機種に合わせて変えられます。Surface Pro 12 はおおよそ 38Wh です。

## 開発

```powershell
npm run dev
npm run smoke
```

本番は Vercel の静的ホストです。`npm run dev` は編集確認用で、常駐しません。
