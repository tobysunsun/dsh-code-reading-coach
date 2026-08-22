/**
 * dsh-code-reading-coach — 代码研读教练（Code Reading Coach）agent 预设安装器。
 *
 * 插件启动时把包内 `preset/` 目录同步到 `${DSH_HOME:-~/.dsh}/.agent-presets/
 * code-reading-coach/`，使「代码研读教练」出现在新建会话的预设选择器中。
 * 同步是幂等的：目标文件内容与包内一致时跳过写入；升级插件并重启后自动更新。
 *
 * 卸载插件不会自动删除用户预设目录（避免误删用户改过的文件）——README 中
 * 说明了手动移除方式。
 */
import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cordis 插件名，供装载器诊断使用。 */
export const name = 'dsh-code-reading-coach'

/** 预设 id：即 .agent-presets 下的目录名。 */
const PRESET_ID = 'code-reading-coach'

/** 随插件分发的预设文件清单（顺序即写入顺序）。 */
const PRESET_FILES = ['agent.cordis.yml', 'preset.yml', 'reading-method.mjs']

/**
 * 同步包内 preset 到 DSH 用户预设目录。单文件不一致才覆盖，一致则跳过。
 * @param sourceDir - 包内 preset 目录的绝对路径。
 * @param targetDir - ${DSH_HOME}/.agent-presets/<PRESET_ID>。
 */
async function syncPreset(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true })
  let changed = 0
  let skipped = 0
  for (const file of PRESET_FILES) {
    const src = join(sourceDir, file)
    const dst = join(targetDir, file)
    let identical = false
    try {
      const [a, b] = await Promise.all([readFile(src), readFile(dst)])
      identical = a.equals(b)
    } catch {
      // 目标缺失或任一读取失败 → 直接写入
    }
    if (identical) {
      skipped += 1
      continue
    }
    await copyFile(src, dst)
    changed += 1
  }
  return { changed, skipped }
}

export function apply(ctx) {
  const sourceDir = fileURLToPath(new URL('../preset/', import.meta.url))
  const dshHome = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const targetDir = join(dshHome, '.agent-presets', PRESET_ID)
  syncPreset(sourceDir, targetDir)
    .then(({ changed, skipped }) => {
      ctx.logger.info(
        `code-reading-coach: preset synced to ${targetDir} (${changed} updated, ${skipped} up-to-date)`,
      )
    })
    .catch((error) => {
      ctx.logger.warn(`code-reading-coach: preset install failed: ${error?.message ?? error}`)
    })
}
