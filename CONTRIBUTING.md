# Contributing · 开发者/贡献者指南

这是给**想贡献或了解实现**的人看的。普通用户请直接看 [README.md](README.md)。

## 项目结构

```text
dsh-code-reading-coach/
├── package.json          # dsh.bundle.patch → cordis.patch.yml；keywords 含 dsh-plugin
├── cordis.patch.yml      # 把插件插入 profile 的组合层
├── lib/index.js          # Cordis 插件：启动时同步预设文件
├── preset/               # 预设本体（方法论的修改都改这里）
│   ├── agent.cordis.yml  # 预设组合：persona + reading:method 章节 + 工具集
│   ├── preset.yml        # 预设选择器显示的 name / description
│   └── reading-method.mjs# 五段研读法方法论（SECTION_TEXT）所在的 prompt section 插件
├── CONTRIBUTE/           # awesome-dsh-plugin 登记提交的参考条目
├── README.md             # 面向用户的说明
└── LICENSE               # MIT
```

## 工作原理

`cordis.patch.yml` 把本插件插入 profile 的组合层；插件 `apply()` 时把包内
`preset/`（agent.cordis.yml、preset.yml、reading-method.mjs）**幂等同步**到
`${DSH_HOME:-~/.dsh}/.agent-presets/code-reading-coach/`——用户升级插件并重启后
自动更新到最新版，且不会覆盖用户对 `preset/` 的本地改动之外的部分
（单文件内容一致时跳过写入）。

## 开发与提交

改方法论：编辑 `preset/reading-method.mjs` 中的 `SECTION_TEXT`。
改预设组合：编辑 `preset/agent.cordis.yml`。

改完记得把 `preset/` 的改动**同步复制到本地预设目录**，这样能在你本机直接测：
`~/.dsh/.agent-presets/code-reading-coach/`。

提交并让用户升级（默认 profile 直接复制运行）：

```bash
git add -A
git commit -m "feat: <这次改了什么>"
git push origin main

dsh plugin --profile web add github:tobysunsun/dsh-code-reading-coach
```

`lib/index.js` 的逻辑改动只影响安装/同步行为；别在 `lib/` 里放用户能改到的方法论文本。

## 发布到 awesome-dsh-plugin 精选列表

让插件出现在 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
（也即 Plugin manager 页的中文介绍来源）的方式：

1. Fork 该仓库。
2. 把 `CONTRIBUTE/awesome-entry.yml` 的内容放到 `data/plugins/tobysunsun__dsh-code-reading-coach.yml`
   （不要手改 README，它是生成的）。
3. 运行 `node scripts/generate-readme.mjs` 刷新两个 README。
4. 提交并提 PR。

自动检查的硬性门槛：

- 包必须声明 `dsh.bundle` manifest —— 本仓库已有 `dsh.bundle.patch`，满足 ✅
- 仓库须带 `dsh-plugin` topic —— 已加 ✅
- 仓库创建 **>1 天** 且 **≥10 次提交** —— 请积累到满足后再提

## 发布到 npm（可选）

若要让用户用 `dsh plugin --profile web add dsh-code-reading-coach`（不带 `github:` 前缀）
安装，发布到 npm registry：

```bash
npm publish
```

需先确认包名未被占用，并处理 `@deepseek-ai/cordis`、`@deepseek-ai/dsh-tools` 的
peerDependencies。

## 安全提示

- 插件随 profile 启动，`lib/index.js` 运行在本机进程内，请在提交前审阅。
- 本插件只写 `${DSH_HOME}/.agent-presets/` 下的三个预设文件，不做其它改动。
