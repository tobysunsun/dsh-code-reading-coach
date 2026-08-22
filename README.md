# dsh-code-reading-coach · 代码研读教练

一个 DeepSeek Harness **Agent 预设插件**：交互式引导你研读论文对应的开源代码
（训练框架、内核库、模型仓库……任何项目）。论文有固定结构，开源仓库却千差万别——
本模式用**五段研读法**带你从「不知道从哪入手」到「讲得出整个系统的故事」。

## 安装

```bash
# 从 GitHub 安装（推荐）—— 默认 profile（web）可直接复制运行：
dsh plugin --profile web add github:tobysunsun/dsh-code-reading-coach

# 或从 npm registry 安装（发布后可用）：
dsh plugin --profile web add dsh-code-reading-coach
```

> 用非默认 profile 启动 dsh 的用户（如 `dsh --profile tui`）请把命令中的 `web`
> 换成自己的 profile 名；不确定时执行 `ls ~/.dsh/profiles` 查看。
> 想锁定版本可 pin 提交：`github:tobysunsun/dsh-code-reading-coach#<commit-sha>`。

安装后**重启 dsh**（插件在启动时把预设文件同步到 `~/.dsh/.agent-presets/code-reading-coach/`），
然后新建会话，在预设选择器中选择「代码研读教练」。

> 第三方插件请先审阅源码再安装（本仓库很小，核心逻辑就在 `lib/index.js` 与 `preset/` 下）。

## 使用

新建会话选好预设后，直接说：

- 「我想读某个项目的代码」（给出 GitHub 地址或本地路径）
- 或贴上一篇论文链接 / PDF
- 或只有仓库没有论文：说「帮我搞懂这个仓库」

教练会从 Phase 0 开始逐步引导。

## 方法论：五段研读法

| 阶段 | 做什么 | 产出物 |
|---|---|---|
| **0 锚定** | 把论文蒸馏成 3–5 条核心主张，变成代码要回答的问题 | 主张清单 |
| **1 地形** | 先明确告知**语言 + 框架/架构**（并确认你熟不熟悉该框架），再扫描 README、依赖清单、目录树、测试布局 | 地形图（含技术栈清单） |
| **2 入口** | 找「能跑起来的东西」，追踪顶层执行流 | 执行流图 |
| **3 核心映射** | 完整阅读核心模块，逐条核对论文主张 | 论文↔代码映射表 |
| **4 闭环** | 跑最小测试、手推一条数据流、改一行观察、费曼复述 | 研读笔记 |

关键设计：仓库类型自适应（训练框架 / 内核库 / 模型仓库阅读路径不同）；深度三档
（概览 / 追踪 / 深潜）每阶段只问一个问题；深潜前有费曼检查点；代码与论文矛盾时
显式标记；产出物持续沉淀到工作区 `<仓库名>-notes.md`。

## 工作原理

`cordis.patch.yml` 把本插件插入 profile 的组合层；插件 `apply()` 时把包内
`preset/`（agent.cordis.yml、preset.yml、reading-method.mjs）幂等同步到
`${DSH_HOME:-~/.dsh}/.agent-presets/code-reading-coach/`——升级插件重启后自动更新。

## 卸载

```bash
dsh plugin --profile web remove dsh-code-reading-coach
```

（非默认 profile 同上，把 `web` 换成你的 profile 名。）

卸载**不会**自动删除预设目录（避免误删你改过的文件），如需移除：

```bash
rm -rf ~/.dsh/.agent-presets/code-reading-coach
```

## 开发

```text
dsh-code-reading-coach/
├── package.json          # dsh.bundle.patch → cordis.patch.yml；keywords 含 dsh-plugin
├── cordis.patch.yml      # 把插件插入 profile 组合
├── lib/index.js          # Cordis 插件：启动时同步预设文件
├── preset/               # 预设本体（方法论的修改都改这里）
│   ├── agent.cordis.yml
│   ├── preset.yml
│   └── reading-method.mjs
├── README.md
└── LICENSE
```

改方法论请编辑 `preset/reading-method.mjs` 中的 `SECTION_TEXT`；改预设组合编辑
`preset/agent.cordis.yml`。提交后升级（默认 profile 直接复制运行）：

```bash
dsh plugin --profile web add github:tobysunsun/dsh-code-reading-coach
```

## 许可

MIT © TobySUN。预设本体改编自 DeepSeek Harness 内置 `standard` preset（MIT）。
