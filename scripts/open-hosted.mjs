import { spawn } from 'node:child_process'

const url = process.env.WATT_WATCH_URL || 'https://watt-watch-alpha.vercel.app'
if (process.platform === 'win32') {
  spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref()
} else {
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
}
