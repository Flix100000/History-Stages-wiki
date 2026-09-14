---
id: home
title: History Stages Wiki
sidebar_label: Home
slug: /
---

**History Stages** is a progression and gatekeeping mod for Minecraft on Forge, NeoForge, and Fabric. It provides a framework for modpack creators to implement custom progression systems by locking game content behind research stages.

## Core Mechanics

History Stages offers a flexible progression system built around three core models, which can be seamlessly combined within the same modpack:

*   **Global Stages:** These stages act as server-wide "Eras". Progression is shared among all players. Once a global stage is unlocked, its associated content becomes instantly accessible to everyone on the server.
*   **Individual Stages:** These stages provide personalized progression paths. Unlocks are tracked per player using their unique UUID, meaning each player must research and unlock these stages independently.
*   **Dual-Phase Stages:** This hybrid model automatically activates when an item, tag, or mod is assigned to both a global and an individual stage. It creates a two-step unlocking process:
    *   **Phase 1 (Global Lock):** The content remains locked for everyone until the associated global stage is unlocked server-wide.
    *   **Phase 2 (Individual Lock):** Even after the global stage is unlocked, the content remains locked for each player until they personally unlock their corresponding individual stage.
    
    *Note: Dual-phase entries are clearly marked with a `[Dual]` badge in the in-game editor and feature a distinct lock icon in player inventories.*

## Content Locking Capabilities

History Stages allows for the restriction of various game elements until specific stages are unlocked:

*   **Items & Blocks:** Prevent usage, equipping, or interaction.
*   **Recipes:** Display a "Locked" overlay in recipe viewers (JEI/EMI) instead of hiding them.
*   **Tags & Mods:** Lock entire item tags or all items from specific mod IDs.
*   **NBT Data:** Lock items based on specific NBT criteria (e.g., specific enchantments).
*   **Dimensions:** Restrict access to specific dimensions.
*   **Structures:** Prevent players from entering specific structures until the required stage is unlocked. Supports plain structure IDs (e.g. `minecraft:stronghold`) and structure tags via a `#` prefix (e.g. `#minecraft:village`). Optionally deals damage while inside a locked structure and blocks container/spawner interactions.
*   **Entities:** Prevent players from attacking specific mobs (`attacklock`) or prevent mobs from spawning entirely (`spawnlock`).
*   **Loot:** Remove or replace locked items in chest loot and mob drops.
*   **Block Interactions:** Prevent opening GUIs of locked blocks (e.g., chests, furnaces) and significantly reduce mining speed.

## Configuration and Management

Modpack creators can define stages and manage configurations through two methods:

1.  **In-Game Editor:** A graphical interface accessible via the pause menu (requires OP permissions) for creating and modifying stages without editing files directly.
2.  **JSON Configuration:** Manual editing of `.json` files located in the `config/historystages/global/` and `config/historystages/individual/` directories.

## License & Authors

*   **License:** GNU General Public License version 3 (GPLv3)
*   **Authors:** Flix100000, PixlStudios
