import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

function fileProtocolFix() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return {
    name: 'file-protocol-fix',
    closeBundle() {
      const htmlPath = join(__dirname, 'dist', 'index.html')
      const html = readFileSync(htmlPath, 'utf-8')
      let cleaned = html
        .replace(/\s+type="module"/g, '')
        .replace(/\s+crossorigin/g, '')  // covers crossorigin + crossorigin="..."
      // Move scripts from head to before </body>
      const scripts = [...cleaned.matchAll(/<script[\s\S]*?<\/script>/g)]
      if (scripts.length) {
        for (const s of scripts) cleaned = cleaned.replace(s[0], '')
        cleaned = cleaned.replace('</body>', scripts.map(s => s[0]).join('\n') + '\n</body>')
      }
      writeFileSync(htmlPath, cleaned, 'utf-8')
    }
  }
}

export default defineConfig({
  plugins: [react(), fileProtocolFix()],
  base: './',
})
