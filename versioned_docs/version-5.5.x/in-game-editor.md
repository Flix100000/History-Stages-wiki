---
id: in-game-editor
title: In-Game Editor
---

History Stages features a comprehensive in-game suite for modpack creators, streamlining the management of progression.

## Key Capabilities

The in-game editor provides a powerful set of tools for stage management, allowing modpack creators to configure their progression systems without ever leaving the game or manually editing JSON files:

*   **Stage Management:** Create new stages from scratch, edit existing configurations, duplicate stages for rapid iteration, and delete stages directly within the Minecraft client.
*   **Stage Settings:** A dedicated settings screen for managing core stage metadata such as Stage ID, Display Name, and Research Time, keeping these properties separate from the lock entries. The same screen also exposes the [Stage Tier Gating](./research-system.md#stage-tier-gating) controls (`min_pedestal_tier` and `pedestal_tier_mode`) so the required pedestal tier for a stage can be configured without editing JSON.
*   **Searchable Registries:** Efficiently find and select items, recipes, entities, dimensions, and structures. The editor features a unified search and filter bar, supports both full registry browsing and direct selection from the player's inventory, and offers a multi-select mode with a dedicated "Selected" tab for bulk operations. The entity picker supports multi-select in the same way as the item picker.
*   **Dependency Editor:** A dedicated visual interface for configuring stage prerequisites. Modpack creators can easily set up requirements such as Entity Kills, XP Levels, Statistics, Scoreboard Objectives, or other Individual Stages, and organize them into logical groups.
*   **Dependency Graph:** A read-only visual overview of all stage dependencies in the modpack, rendered as an interactive node graph. Useful for spotting long dependency chains, missing links, or unintended cycles at a glance. Accessible from the Stage Overview screen.
*   **NBT Editor:** A specialized visual editor designed for defining complex NBT (Named Binary Tag) criteria for item locking. It simplifies the process by providing autocompletion and real-time validation warnings to prevent errors. On 1.21+ the editor also accepts arbitrary data components alongside the legacy NBT fields, and an inventory slot's current state can be imported directly with **Ctrl-click** instead of being transcribed by hand.
*   **Lock Actions Editor:** A visual editor for restricting individual entries to specific interactions (such as use, attack, equip, or pickup) instead of locking them completely, configurable per item, tag, or mod entry.
*   **Validation & Overlap Warnings:** The editor actively identifies and warns about potential overlaps between global and individual stages, ensuring logical consistency in modpack progression. Entries that trigger the dual-phase lock system are clearly marked with a `[Dual]` badge.
*   **Config Editor:** Access and modify all mod settings (from both `historystages-common.toml` and `historystages-client.toml`) directly within the game. Settings are intuitively organized by categories and include a convenient reset-to-defaults option. This includes the [Research Boosters](./research-system.md#research-boosters) list, so booster blocks and their tier requirements can be set up in-game without touching the TOML file.
*   **Feedback:** Save, duplicate, delete, and similar actions surface styled toast notifications instead of generic chat messages so the editor flow stays uninterrupted.

## Accessing the Editor

1.  Access to the editor requires **Permission Level 2 (OP)** on the server or in single-player mode.
2.  The editor can be opened via a dedicated button located in the **Pause Menu**.

## Multiplayer Synchronization

In multiplayer environments, changes made through the in-game editor are saved immediately and synchronized across all connected administrators, ensuring consistent configurations.
