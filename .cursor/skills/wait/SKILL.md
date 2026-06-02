---
name: wait
description: Pause for a user-specified duration, then execute the rest of the user's request. Use when the user invokes `/wait <duration> then <task>` or otherwise asks to wait, sleep, or pause before proceeding.
---

# Wait

Pause, then run the follow-up task.

## How

1. Parse `<duration>` from the user message. Units: `s`, `m`/`min`, `h`/`hr`. Bare numbers = seconds. Combined forms like `1m30s` are summed.
2. Call `AwaitShell` with **no `task_id`** and `block_until_ms` set to the duration in milliseconds. Do not use shell `sleep`.
3. After it returns, execute the follow-up task normally.

If no follow-up is given, just confirm the wait is over.

## Example

User: `/wait 30 mins then check the ui after rebuilt`

→ `AwaitShell({ block_until_ms: 1800000 })` → then check the UI.
