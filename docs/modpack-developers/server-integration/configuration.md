---
title: Configuration (TOML)
sidebar_position: 2
---

History Stages keeps its settings in `config/historystages/settings/`. They can be edited by hand or through the in-game config editor, which writes the same files.

```
config/historystages/settings/
    visual.toml      what a player sees or hears
    gameplay.toml    what happens in the background
    graph.toml       the player-facing Stage Graph
```

**Both files live on the server and are sent to every player who joins.** The split between them is thematic, not a question of ownership — a pack author sets both, and neither is something an individual player is expected to touch. A client's own copies are used in singleplayer and while not connected anywhere; the moment they join a server, that server's values apply for the session, and their own come back when they leave. Their files on disk are never overwritten by a server.

Saving from the in-game editor requires permission level 2.

:::info
**Stage Graph:** `graph.toml` has around 90 keys of its own (canvas appearance, visibility rules, node styling). It is documented on the **[Stage Graph](../in-game-tools/stage-graph.md)** page and has its own tab in the config editor.
:::

The two files, in full:

- **[visual.toml](./visual-toml.md)** — tooltips, overlays, notifications, the open scroll document, and more.
- **[gameplay.toml](./gameplay-toml.md)** — logging, the core gameplay locks, research, loot replacements, structure/biome/zone lock behaviour.

## Updating from 5.x

Before 6.0.0 the settings lived in `config/historystages-client.toml` and `config/historystages-common.toml`, and they were split by *who owned the value* rather than by what it does. On first launch of 6.0.0 both old files are read and every setting is carried into its new home automatically — nothing needs to be re-entered. The old files are then renamed to `historystages-client.toml.migrated` and `historystages-common.toml.migrated` and left in place, so the originals are still there if anything looks wrong.

The migration writes a summary line to the log, and the config editor shows a one-off notice the first time it is opened afterwards.

Two settings were removed rather than moved, because nothing in the mod ever read them: `lockScrollWhileResearching` and `showDependencyScreenInPedestal`.

The carry-over is kept until 6.3. A pack skipping straight from 5.x to a later version will have to set its options again.

## Debugging and Logging

History Stages writes two kinds of log to `config/historystages/logs/`:

*   **Load-time diagnostic reports (`debug-*.log`)** — config validation and registry checks, listing both global and individual stages. Useful for finding problems at modpack startup.
*   **Runtime event logs (`runtime-*.log`)** — stage changes, blocked actions and inventory issues as they happen. Turn these on with `logging.enableRuntimeLogging` in `gameplay.toml`.

To stop the chat debug messages, set `logging.showDebugErrors = false` in `gameplay.toml`.
