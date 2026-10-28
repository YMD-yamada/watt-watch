import { FormEvent, useMemo, useState } from 'react'
import type { Point } from './battery'
import { useWattMeter } from './useWattMeter'

const VERDICT: Record<string, string> = {
  unplugged: '未接続',
  charging: '充電中',
  weak: '弱充電',
  undersupply: '給電不足',
  full: 'ほぼ満充電',
  hold: '維持',
  'no-battery': '電池情報なし',
}

// 結果を一言で。ワット数が分からない人にも良し悪しが伝わるように
function verdictLine(sample: { supported: boolean; ok: boolean; charging: boolean; rateReady: boolean; netW: number; verdict: string }) {
  if (!sample.supported || !sample.ok) return ''
  if (!sample.charging) return 'ケーブルを挿すと、充電の速さを測れます。'
  if (!sample.rateReady) return '測っています。そのまま少し待ってください。'
  if (sample.verdict === 'charging') {
    return sample.netW >= 30
      ? '速い充電です。この充電器とケーブルは十分な力があります。'
      : 'ふつうに充電できています。'
  }
  if (sample.verdict === 'weak') return '充電はできていますが遅めです。強めの充電器か別のケーブルを試してください。'
  if (sample.verdict === 'undersupply') return '挿しているのに電池が減っています。充電器かケーブルの力が足りません。'
  if (sample.verdict === 'full') return 'ほぼ満充電なので差が出にくい状態です。80%未満で比べてください。'
  return '使う電力と充電がつり合って、電池の量を保っています。'
}

function toCsv(rows: { ts: number; label: string; chargeW: number; dischargeW: number; verdict: string; batteryPct: number }[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = rows.map((m) =>
    [new Date(m.ts).toLocaleString('ja-JP'), m.label, m.chargeW.toFixed(1), (-m.dischargeW).toFixed(1), VERDICT[m.verdict] || m.verdict, `${m.batteryPct}`]
      .map(esc)
      .join(','),
  )
  return ['日時,名前,充電W,放電W,判定,残量%', ...lines].join('\r\n')
}

function formatW(n: number | undefined) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)} W`
}

function formatEta(sec: number) {
  if (!sec) return ''
  const m = Math.round(sec / 60)
  if (m < 90) return `約 ${m} 分`
  return `約 ${(m / 60).toFixed(1)} 時間`
}

function Sparkline({ points }: { points: Point[] }) {
  const w = 640
  const h = 120
  const values = points.map((p) => p.netW)
  if (values.length < 2) {
    return <svg className="spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" />
  }
  const min = Math.min(-5, ...values)
  const max = Math.max(15, ...values)
  const span = max - min || 1
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / span) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const zeroY = h - ((0 - min) / span) * h
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="直近のワット推移">
      <line x1="0" y1={zeroY} x2={w} y2={zeroY} className="spark-zero" />
      <path d={d} className="spark-line" />
    </svg>
  )
}

export default function App() {
  const { sample, history, marks, addMark, capacityWh, setCapacityWh } = useWattMeter()
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const tone = sample.verdict || 'unplugged'
  const hero = useMemo(() => {
    if (!sample.supported) {
      return {
        value: '—',
        hint: 'この端末では電池の情報が取れません。スマホでは測れないので、ノートPCの Chrome か Edge で開いてください。',
      }
    }
    if (!sample.ok) return { value: '—', hint: '電池が見つかりません' }
    if (!sample.rateReady) {
      return {
        value: sample.charging ? '充電中' : formatW(0),
        hint: 'ワット算出を安定させています。ケーブルを挿したまま15〜30秒待ってください。',
      }
    }
    if (sample.charging && sample.chargeW >= 0.3) {
      return { value: formatW(sample.chargeW), hint: '推定充電ワット（電池容量から算出）' }
    }
    if (sample.dischargeW >= 0.3) {
      return { value: formatW(-sample.dischargeW), hint: '推定放電ワット' }
    }
    return { value: formatW(sample.netW), hint: '正味（+が充電）' }
  }, [sample])

  function onMark(ev: FormEvent) {
    ev.preventDefault()
    if (!label.trim()) return
    setSaving(true)
    setError('')
    try {
      addMark(label)
      setLabel('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '記録に失敗')
    } finally {
      setSaving(false)
    }
  }

  function exportCsv() {
    const blob = new Blob(['\uFEFF' + toCsv(marks)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'watt-watch.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const line = verdictLine(sample)
  const eta = sample.charging
    ? formatEta(sample.chargingTimeSec)
    : formatEta(sample.dischargingTimeSec)

  return (
    <div className={`app tone-${tone}`}>
      <header className="top">
        <div>
          <p className="kicker">watt-watch</p>
          <h1>いまの電力</h1>
        </div>
        <p className="live">{sample.supported ? 'LIVE' : '非対応'}</p>
      </header>

      <p className="lede host-note">
        計測はこのタブの中だけで行います。あなたのPCをサーバーにはしません。記録もこのブラウザ内に残ります。
      </p>

      <section className="hero" aria-live="polite">
        <p className="watts">{hero.value}</p>
        {line ? <p className="verdict-line">{line}</p> : null}
        <p className="hint">{hero.hint}</p>
        <div className="pills">
          <span className="pill">{sample.charging ? '充電中' : 'ACなし / 放電'}</span>
          {sample.verdict !== 'charging' && sample.verdict !== 'unplugged' ? (
            <span className="pill">{VERDICT[sample.verdict] || '—'}</span>
          ) : null}
          <span className="pill">残量 {sample.supported ? `${sample.batteryPct}%` : '—'}</span>
          {eta ? <span className="pill">{sample.charging ? `満充電まで ${eta}` : `残 ${eta}`}</span> : null}
        </div>
      </section>

      <section className="chart-card">
        <div className="chart-head">
          <h2>直近の推移</h2>
          <p>正味ワット。0より上が充電、下が放電。</p>
        </div>
        <Sparkline points={history} />
      </section>

      <section className="grid">
        <article>
          <h2>このケーブルを記録</h2>
          <p className="lede">挿して15〜30秒待ってから名前を付けます。この端末のブラウザにだけ保存されます。</p>
          <form onSubmit={onMark} className="mark-form">
            <label>
              名前
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="例: 純正65W / ハブ経由"
                maxLength={80}
              />
            </label>
            <button type="submit" disabled={saving || !label.trim() || !sample.ok}>
              {saving ? '記録中…' : 'いまの値を記録'}
            </button>
          </form>
          {error ? <p className="err">{error}</p> : null}
        </article>
        <article>
          <h2>読み方</h2>
          <ul>
            <li>表示はケーブル定格ではなく、充電時間と電池容量からの推定ワットです。</li>
            <li>Chrome / Edge のノートPC向け。Firefox / デスクトップは電池情報が取れません。</li>
            <li>満充電に近いと差が出ません。80%未満で比較してください。</li>
          </ul>
          <label>
            電池容量（Wh）
            <input
              type="number"
              min={5}
              max={200}
              step={1}
              value={capacityWh}
              onChange={(e) => setCapacityWh(Number(e.target.value) || 38)}
            />
          </label>
          <button type="button" className="ghost" onClick={exportCsv} disabled={marks.length === 0}>
            記録をCSVで保存
          </button>
        </article>
      </section>

      <section className="table-card">
        <h2>記録</h2>
        {marks.length === 0 ? (
          <p className="lede">まだありません。ケーブルを挿して記録してください。</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>充電</th>
                <th>放電</th>
                <th>判定</th>
                <th>残量</th>
              </tr>
            </thead>
            <tbody>
              {[...marks].reverse().map((m) => (
                <tr key={m.ts}>
                  <td>{m.label}</td>
                  <td className="mono">{formatW(m.chargeW)}</td>
                  <td className="mono">{formatW(-m.dischargeW)}</td>
                  <td>{VERDICT[m.verdict] || m.verdict}</td>
                  <td className="mono">{m.batteryPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <footer className="support-foot">
        <a href="https://ko-fi.com/ymdapps" target="_blank" rel="noopener noreferrer">
          このアプリを応援する（Ko-fi）
        </a>
      </footer>
    </div>
  )
}
