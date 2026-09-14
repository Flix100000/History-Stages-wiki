---
id: home
title: History Stages Wiki
sidebar_label: Home
slug: /
---

**History Stages** is a progression and gatekeeping mod for Minecraft on Forge, NeoForge, and Fabric. It provides a framework for modpack creators to implement custom progression systems by locking game content behind research stages.

## Core Mechanics

History Stages has two progression models that can be combined freely:

*   **Global Stages:** Server-wide "Eras". One unlock applies to every player. This is the only mode that can lock **Recipes** and **Mob Spawns**.
*   **Individual Stages:** Per-player, tracked by UUID. Each player has to unlock their own. Good for personal skill paths.

If a piece of content is listed in both types of stage at once, History Stages turns on a **Dual-Phase Lock** for it automatically (two-step unlock).

→ Full comparison, lock-type matrix, and pitfalls: **[Global vs Individual Stages](./global-vs-individual-stages.md)**.

## Content Locking Capabilities

History Stages allows for the restriction of various game elements until specific stages are unlocked:

*   **Items & Blocks:** Prevent usage, equipping, or interaction.
*   **Recipes:** Display a "Locked" overlay in recipe viewers (JEI/EMI) instead of hiding them. Locked items and recipes can optionally be hidden from JEI entirely via `hideLockedItemsInJei` / `hideLockedRecipesInJei`.
*   **Tags & Mods:** Lock entire item tags or all items from specific mod IDs.
*   **NBT Data:** Lock items based on specific NBT criteria (e.g., specific enchantments).
*   **Dimensions:** Restrict access to specific dimensions.
*   **Structures:** Prevent players from entering specific structures until the required stage is unlocked. Supports plain structure IDs (e.g. `minecraft:stronghold`) and structure tags via a `#` prefix (e.g. `#minecraft:village`). The mod builds a tight, piece-aware lock zone around each structure with a red force-field overlay, cancels right-clicks, left-clicks, and projectile impacts inside the zone, and can optionally deal periodic damage. Structures can also be capped on how often they're allowed to generate instead of being blocked outright.
*   **Biomes:** Prevent players from surviving in specific biomes until the required stage is unlocked, with the same effect/damage/message toolkit as structure locking.
*   **Entities:** Prevent players from attacking specific mobs (`attacklock`), block non-combat interactions like breeding or mounting (`interactionlock`), or prevent mobs from spawning entirely (`spawnlock`).
*   **Loot:** Remove or replace locked items in chest loot and mob drops.
*   **Block Interactions:** Prevent opening GUIs of locked blocks (e.g., chests, furnaces) and significantly reduce mining speed.

## Configuration and Management

Modpack creators can define stages and manage configurations through two methods:

1.  **In-Game Editor:** A graphical interface accessible via the pause menu (requires OP permissions) for creating and modifying stages without editing files directly.
2.  **JSON Configuration:** Manual editing of `.json` files located in the `config/historystages/global/` and `config/historystages/individual/` directories. Files can be organized into nested folders for large modpacks — see [Folders](./stage-configuration.md#folders).

Large modpacks can also expose an interactive **[Stage Graph](./stage-graph.md)** to players from the pause menu, visualizing the whole progression tree.

## Community & Support

Questions, support, or feedback? Join our [Discord server](https://discord.gg/BeZzxyZ9c4).

## Authors

Flix100000, PixlStudios
