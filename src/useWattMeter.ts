import { useEffect, useRef, useState } from 'react'
import {
  loadCapacityWh,
  loadMarks,
  saveCapacityWh,
  saveMarks,
  sampleFromBattery,
  type Mark,
  type MeterSample,
  type Point,
} from './battery'

const EMPTY: MeterSample = {
  ok: false,
  supported: false,
  charging: false,
  batteryPct: 0,
  chargeW: 0,
  dischargeW: 0,
  netW: 0,
  rateReady: false,
  chargingTimeSec: 0,
  dischargingTimeSec: 0,
  verdict: 'no-battery',
  ts: 0,
}

export function useWattMeter() {
  const [sample, setSample] = useState<MeterSample>(EMPTY)
  const [history, setHistory] = useState<Point[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [capacityWh, setCapacityWh] = useState(38)
  const prevRef = useRef<{ t: number; level: number } | null>(null)
  const capRef = useRef(capacityWh)

  useEffect(() => {
    setMarks(loadMarks())
    const cap = loadCapacityWh()
    setCapacityWh(cap)
    capRef.current = cap
  }, [])

  useEffect(() => {
    capRef.current = capacityWh
    saveCapacityWh(capacityWh)
  }, [capacityWh])

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<unknown> }
    if (typeof nav.getBattery !== 'function') {
      setSample({ ...EMPTY, supported: false, verdict: 'no-battery' })
      return
    }
    let battery: {
      charging: boolean
      chargingTime: number
      dischargingTime: number
      level: number
      addEventListener: (t: string, fn: () => void) => void
      removeEventListener: (t: string, fn: () => void) => void
    } | null = null
    let timer = 0
    let cancelled = false

    const tick = () => {
      if (!battery) return
      const { sample: next, prev } = sampleFromBattery(battery, capRef.current, prevRef.current)
      prevRef.current = prev
      setSample(next)
      setHistory((h) => {
        const point = { ts: next.ts, netW: next.netW }
        const nextH = [...h, point]
        return nextH.length > 240 ? nextH.slice(-240) : nextH
      })
    }

    nav.getBattery().then((b) => {
      if (cancelled) return
      battery = b as typeof battery
      tick()
      battery?.addEventListener('chargingchange', tick)
      battery?.addEventListener('levelchange', tick)
      battery?.addEventListener('chargingtimechange', tick)
      battery?.addEventListener('dischargingtimechange', tick)
      timer = window.setInterval(tick, 1000)
    })

    return () => {
      cancelled = true
      window.clearInterval(timer)
      if (battery) {
        battery.removeEventListener('chargingchange', tick)
        battery.removeEventListener('levelchange', tick)
        battery.removeEventListener('chargingtimechange', tick)
        battery.removeEventListener('dischargingtimechange', tick)
      }
    }
  }, [])

  function addMark(label: string) {
    const text = label.trim().slice(0, 80)
    if (!text || !sample.ok) throw new Error('記録できません')
    const mark: Mark = {
      ts: Date.now(),
      label: text,
      netW: sample.netW,
      chargeW: sample.chargeW,
      dischargeW: sample.dischargeW,
      verdict: sample.verdict,
      batteryPct: sample.batteryPct,
      charging: sample.charging,
    }
    const next = [...marks, mark].slice(-80)
    setMarks(next)
    saveMarks(next)
    return mark
  }

  return { sample, history, marks, addMark, capacityWh, setCapacityWh }
}
