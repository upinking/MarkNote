---
name: marknote
description: Search, read, create, update, or archive notes in the user's local MarkNote Markdown library through the bundled MarkNote MCP tools.
---

# MarkNote 工作流

使用 `marknote` MCP 工具访问用户当前选择的 MarkNote 桌面资料库。

## 开始前

1. 首次使用或工具报告未配置时，调用 `library_status`。
2. 如果没有资料库，请让用户打开 MarkNote 并选择资料库文件夹；也可以说明如何设置 `MARKNOTE_LIBRARY_PATH`。
3. 查找内容时先用 `search_notes`，只在需要完整内容时调用 `read_note`。

## 写入规则

- `create_note`、`update_note`、`archive_note` 都会改变本地文件。调用前必须向用户说明目标路径和将要发生的变化，并取得明确确认。
- 更新或归档前必须先调用 `read_note`，把返回的 `revision` 原样传给 `expectedRevision`。
- 如果工具返回 `conflict`，重新读取笔记、解释两版内容的差异，并让用户决定；不得自动重试覆盖。
- 不执行永久删除。用户要求删除时，说明第一版只支持安全归档，并在用户确认后调用 `archive_note`。
- 新建笔记优先使用清楚、简短的相对路径；未写扩展名时工具会补 `.md`。

## 回答方式

向用户展示笔记路径，简要说明读了什么或改了什么。除非用户要求，不要把整篇长笔记重复贴进对话。
