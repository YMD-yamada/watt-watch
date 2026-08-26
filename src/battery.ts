export type MeterSample = {
  ok: boolean
  supported: boolean
  charging: boolean
  batteryPct: number
  chargeW: number
  dischargeW: number
  netW: number
  rateReady: boolean
  chargingTimeSec: number
  dischargingTimeSec: number
  verdict: string
  ts: number
}

export type Mark = {
  ts: number
  label: string
  netW: number
  chargeW: number
  dischargeW: number
  verdict: string
  batteryPct: number
  charging: boolean
}

export type Point = { ts: number; netW: number }

type BatteryLike = {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  addEventListener: (type: string, fn: () => void) => void
  removeEventListener: (type: string, fn: () => void) => void
}

const MARKS_KEY = 'watt-watch-marks'
const CAP_KEY = 'watt-watch-capacity-wh'
export const DEFAULT_CAPACITY_WH = 38

function finiteSec(n: number) {
  return Number.isFinite(n) && n >= 0 && n < 1e8 ? n : 0
}

export function verdictOf(charging: boolean, pct: number, netW: number, rateReady: boolean) {
  if (!charging) return 'unplugged'
  if (!rateReady) return 'charging'
  if (netW >= 8) return 'charging'
  if (netW > 0.5) return 'weak'
  if (netW <= -3) return 'undersupply'
  if (pct >= 95) return 'full'
  return 'hold'
}

function wattsFromTimes(b: BatteryLike, capacityWh: number) {
  if (b.charging) {
    const sec = finiteSec(b.chargingTime)
    const remain = Math.max(0, 1 - b.level)
    if (sec > 0 && remain > 0.002) return (remain * capacityWh) / (sec / 3600)
    return null
  }
  const sec = finiteSec(b.dischargingTime)
  if (sec > 0 && b.level > 0.002) return -((b.level * capacityWh) / (sec / 3600))
  return null
}

export function sampleFromBattery(
  b: BatteryLike,
  capacityWh: number,
  prev: { t: number; level: number } | null,
): { sample: MeterSample; prev: { t: number; level: number } } {
  const ts = Date.now()
  const fromTime = wattsFromTimes(b, capacityWh)
  let net = fromTime
  let rateReady = fromTime != null
  if (net == null && prev && ts > prev.t + 8000) {
    const hours = (ts - prev.t) / 3600000
    const dLevel = b.level - prev.level
    if (hours > 0 && Math.abs(dLevel) >= 0.004) {
      net = (dLevel / hours) * capacityWh
      rateReady = true
    }
  }
  const netW = net == null ? 0 : Math.round(net * 10) / 10
  const chargeW = netW > 0 ? netW : 0
  const dischargeW = netW < 0 ? -netW : 0
  const batteryPct = Math.round(b.level * 1000) / 10
  const sample: MeterSample = {
    ok: true,
    supported: true,
    charging: b.charging,
    batteryPct,
    chargeW,
    dischargeW,
    netW,
    rateReady,
    chargingTimeSec: finiteSec(b.chargingTime),
    dischargingTimeSec: finiteSec(b.dischargingTime),
    verdict: verdictOf(b.charging, batteryPct, netW, rateReady),
    ts,
  }
  const nextPrev =
    !prev || Math.abs(b.level - prev.level) >= 0.004 || ts - prev.t > 60000
      ? { t: ts, level: b.level }
      : prev
  return { sample, prev: nextPrev }
}

export function loadMarks(): Mark[] {
  try {
    const raw = localStorage.getItem(MARKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Mark[]
    return Array.isArray(parsed) ? parsed.slice(-80) : []
  } catch {
    return []
  }
}

export function saveMarks(marks: Mark[]) {
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks.slice(-80)))
}

export function loadCapacityWh() {
  const n = Number(localStorage.getItem(CAP_KEY))
  return Number.isFinite(n) && n >= 5 && n <= 200 ? n : DEFAULT_CAPACITY_WH
}

export function saveCapacityWh(n: number) {
  localStorage.setItem(CAP_KEY, String(n))
}
