#!/usr/bin/env node
/**
 * 预设完整性与语法校验脚本。
 *
 * 校验三项：预设三件套齐全且 preset.yml 含 name/description；
 * lib/index.js 与 preset/reading-method.mjs 语法正确（node --check）；
 * cordis.patch.yml 是合法的 YAML 且映射到 insert 行。供 `npm run check`
 * 与 CI 使用。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
let failures = 0

function fail(message) {
  console.error(`✗ ${message}`)
  failures += 1
}

// 1. 预设三件套与 preset.yml 元数据
const presetFiles = ['agent.cordis.yml', 'preset.yml', 'reading-method.mjs']
for (const file of presetFiles) {
  const path = join(root, 'preset', file)
  if (!existsSync(path)) fail(`preset/${file} 缺失`)
}
const presetYml = join(root, 'preset', 'preset.yml')
if (existsSync(presetYml)) {
  const text = readFileSync(presetYml, 'utf8')
  if (!/name:\s*\S/.test(text)) fail('preset.yml 缺少 name')
  if (!/description:\s*\S/.test(text)) fail('preset.yml 缺少 description')
}

// 2. JS 语法检查（node --check 能识别 ESM 下的 import/export）
for (const file of ['lib/index.js', 'preset/reading-method.mjs']) {
  const path = join(root, file)
  if (!existsSync(path)) {
    fail(`${file} 缺失`)
    continue
  }
  try {
    execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' })
    console.log(`✓ 语法通过：${file}`)
  } catch (error) {
    fail(`${file} 语法错误：${error.stderr?.toString() ?? error.message}`)
  }
}

// 3. cordis.patch.yml 形状（需含 insert 行）
const patch = join(root, 'cordis.patch.yml')
if (!existsSync(patch)) fail('cordis.patch.yml 缺失')
else {
  const text = readFileSync(patch, 'utf8')
  if (!/^\s*-\s*insert\s*:/m.test(text)) fail('cordis.patch.yml 缺少 insert 段')
}

if (failures > 0) {
  console.error(`\n预设校验失败：${failures} 项`)
  process.exit(1)
}
console.log('✓ 预设校验通过（三件套齐全、元数据完整、语法与 patch 形状正确）')
