---
id: in-game-editor
title: In-Game Editor
---

History Stages features a comprehensive in-game suite for modpack creators, streamlining the management of progression.

## Key Capabilities

The in-game editor provides a powerful set of tools for stage management, allowing modpack creators to configure their progression systems without ever leaving the game or manually editing JSON files:

*   **Stage Management:** Create new stages from scratch, edit existing configurations, duplicate stages for rapid iteration, and delete stages directly within the Minecraft client.
*   **Searchable Registries:** Efficiently find and select items, recipes, entities, dimensions, and structures. The editor features built-in search bars and filterable lists, supporting both full registry browsing and direct selection from the player's inventory.
*   **Dependency Editor:** A dedicated visual interface for configuring stage prerequisites. Modpack creators can easily set up requirements such as Entity Kills, XP Levels, Statistics, or other Individual Stages, and organize them into logical groups.
*   **NBT Editor:** A specialized visual editor designed for defining complex NBT (Named Binary Tag) criteria for item locking. It simplifies the process by providing autocompletion and real-time validation warnings to prevent errors.
*   **Validation & Overlap Warnings:** The editor actively identifies and warns about potential overlaps between global and individual stages, ensuring logical consistency in modpack progression. Entries that trigger the dual-phase lock system are clearly marked with a `[Dual]` badge.
*   **Config Editor:** Access and modify all mod settings (from both `historystages-common.toml` and `historystages-client.toml`) directly within the game. Settings are intuitively organized by categories and include a convenient reset-to-defaults option.

## Accessing the Editor

1.  Access to the editor requires **Permission Level 2 (OP)** on the server or in single-player mode.
2.  The editor can be opened via a dedicated button located in the **Pause Menu**.

## Multiplayer Synchronization

In multiplayer environments, changes made through the in-game editor are saved immediately and synchronized across all connected administrators, ensuring consistent configurations.
