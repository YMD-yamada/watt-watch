import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
      shell: true,
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${args.join(' ')} exited ${code}`))
    })
  })
}

await run(['run', 'build'])
const dist = path.join(root, 'dist')
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
if (!html.includes('watt-watch') && !html.includes('root')) {
  throw new Error('dist/index.html missing app')
}
const assets = fs.readdirSync(path.join(dist, 'assets'))
if (assets.length === 0) throw new Error('no built assets')
console.log('smoke ok', { assets: assets.length })
