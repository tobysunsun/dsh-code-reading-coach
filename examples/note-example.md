# 示例：五段研读法的一次完整产出

下面是一个「代码研读教练」在一次实际研读中会持续沉淀到工作区
`<仓库名>-notes.md` 的参考形态。这里的仓库是虚构的
`example-ai-agent/paper`，仅用来说明每一阶段的产出物长什么样。

## 核心主张清单（Phase 0 产出）

| # | 主张（来自论文） | 状态 |
|---|---|---|
| 1 | 用「课程式回放」提升长上下文利用率 | 待验证 |
| 2 | 奖励由规则 + 学习式融合，而非单一标量 | 待验证 |
| 3 | 采样在状态空间而非动作空间 | 待验证 |

## 地形图（Phase 1 产出）

- **技术栈**：Python 3.11 + PyTorch 2.2（框架：训练循环用 Lightning，配置用
  Hydra，测试用 pytest）。
- **目录职责（2 层）**：
  ```
  paper/
  ├── configs/      # Hydra 配置（数据集、模型、训练超参）
  ├── examples/     # 入口脚本：run_eval.py / run_train.py
  ├── src/
  │   ├── agent.py  # 采样与回放（主张 3）
  │   ├── reward.py # 奖励融合（主张 2）
  │   └── loop.py   # 课程式回放主循环（主张 1）
  └── tests/        # 单测与回归
  ```
- **候选入口**：`examples/run_train.py`、`configs/*.yaml`。

## 执行流图（Phase 2 产出）

```
run_train.py
  └─> configs/agent.yaml (Hydra)
       └─> src/loop.py: Trainer.train()
            ├─> agent.sample()      ─ src/agent.py:12
            ├─> reward.score()      ─ src/reward.py:31
            └─> agent.replay()      ─ src/loop.py:88
```

## 论文 ↔ 代码映射表（Phase 3 产出）

| 论文主张 | 代码符号 | 文件:行 | 验证状态 |
|---|---|---|---|
| 课程式回放 | `CurriculumReplay` | src/loop.py:88 | 已定位 |
| 奖励融合 | `reward.score` | src/reward.py:31 | 已定位 |
| 状态空间采样 | `agent.sample` | src/agent.py:12 | 矛盾（实为动作空间） |

## 遗留疑问（Phase 4 产出）

- 代码在 `agent.sample` 里从动作空间采样，与论文主张 3 的描述相反——可能是
  版本漂移，待找 commit 历史确认。
- 课程式回放的阶段切换没有在注释里说明，需读 `trainer` 完整逻辑。
