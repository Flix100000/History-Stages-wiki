---
title: Home
sidebar_position: 1
---

**History Stages** is a progression and gatekeeping mod for Minecraft on Forge, NeoForge, and Fabric. It provides a framework for modpack creators to implement custom progression systems by locking game content behind research stages.

> **Note:** This wiki is always aligned with the latest version of the mod. Please be aware that the 1.19.X versions will not receive any further updates for the time being.

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
*   **Fluids:** Lock a fluid rather than a container, so one entry covers the vanilla bucket, every modded bucket and every tank item that holds it — along with the recipes producing or consuming it.
*   **NBT Data:** Lock items based on specific NBT criteria (e.g., specific enchantments).
*   **Dimensions:** Restrict access to specific dimensions.
*   **Structures:** Prevent players from entering specific structures until the required stage is unlocked. Supports plain structure IDs (e.g. `minecraft:stronghold`) and structure tags via a `#` prefix (e.g. `#minecraft:village`). The mod builds a tight, piece-aware lock zone around each structure with a red force-field overlay, cancels right-clicks, left-clicks, and projectile impacts inside the zone, and can optionally deal periodic damage. Structures can also be capped on how often they're allowed to generate instead of being blocked outright.
*   **Biomes:** Prevent players from surviving in specific biomes until the required stage is unlocked, with the same effect/damage/message toolkit as structure locking.
*   **Entities:** Prevent players from attacking specific mobs (`attacklock`), block non-combat interactions like breeding or mounting (`interactionlock`), or write a full spawn rule (`spawnlock`) — by source, dimension, biome, height, light, time, weather and moon phase, either while the stage is locked or only after it opens. The same rule can add biomes an entity spawns in rather than take them away.
*   **Zones:** Draw your own areas out of cubes, spheres and cylinders, each with its own rules — message, damage, potion effects, blocked interactions, explosion protection, a hard barrier, spawn suppression, and a visible force field. **Beta.**
*   **Merchant Trades:** Gate single offers, whole villager professions, or merchant levels across every profession at once.
*   **Loot:** Remove or replace locked items in chest loot and mob drops.
*   **Block Interactions:** Prevent opening GUIs of locked blocks (e.g., chests, furnaces) and significantly reduce mining speed.

## Configuration and Management

Modpack creators can define stages and manage configurations through two methods:

1.  **In-Game Editor:** A graphical interface accessible via the pause menu (requires OP permissions) for creating and modifying stages without editing files directly.
2.  **JSON Configuration:** Manual editing of `.json` files located in the `config/historystages/global/` and `config/historystages/individual/` directories. Files can be organized into nested folders for large modpacks — see [Folders](/docs/modpack-developers/locking-zones/stage-behavior#folders).

Large modpacks can also expose an interactive **[Stage Graph](/docs/modpack-developers/in-game-tools/stage-graph)** to players from the pause menu, visualizing the whole progression tree.

## Community & Support

Questions, support, or feedback? Join our [Discord server](https://discord.gg/BeZzxyZ9c4).

## License & Authors

**License:** All Rights Reserved — the source is public, but the mod is not open source.

Quick rules:

*   Use in modpacks (public, private, commercial): **allowed**
*   Use in Let's Plays, streams, servers: **allowed**
*   Fork to prepare a PR: **allowed**
*   Port to another Minecraft version or mod loader: **allowed under conditions** — see [Porting History Stages](../project/porting-history-stages.md)
*   Publish forks / modified versions / re-uploads: **not allowed**

Full terms: [LICENSE.txt](https://github.com/Flix100000/History-Stages/blob/neoforge-1.21.X/LICENSE.txt).

**Authors:** Flix100000, PixlStudios
