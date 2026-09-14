---
id: commands-and-permissions
title: Commands & Permissions
---

"""# Commands & Permissions

History Stages provides a set of administrative commands for managing stages, configurations, and player progression. These commands are intended for server operators and modpack developers.

All administrative commands require **Permission Level 2 (OP)** and utilize the `/history` prefix.

## Global Stage Commands (Server-Wide)

These commands manage global stages, which affect all players on the server.

| Command | Action | Details |
| :--- | :--- | :--- |
| `/history global unlock <stage_id>` | Unlocks a specific global stage. | Replace `<stage_id>` with the ID of the stage. Use `*` to unlock all defined global stages. |
| `/history global lock <stage_id>` | Relocks a specific global stage. | Replace `<stage_id>` with the ID of the stage. Use `*` to relock all global stages. |
| `/history global list` | Displays a list of all registered global stages. | Shows the `stage_id` and `display_name` for each global stage. |
| `/history global info <stage_id>` | Shows detailed configuration for a specific global stage. | Provides an overview of locked items, recipes, dimensions, entities, and other settings for the specified stage. |

## Individual Stage Commands (Per-Player)

These commands manage individual (per-player) stages, enabling personalized progression paths.

| Command | Action | Details |
| :--- | :--- | :--- |
| `/history individual unlock <player> <stage_id>` | Unlocks a stage for a specific player. | Replace `<player>` with the target player's username or a selector (e.g., `@a`, `@p`). Replace `<stage_id>` with the ID of the stage. |
| `/history individual lock <player> <stage_id>` | Relocks a stage for a specific player. | Replace `<player>` and `<stage_id>` as above. |
| `/history individual list <player>` | Lists all stages currently unlocked by a specific player. | Replace `<player>` with the target player's username. |

## Utility Commands

| Command | Action | Details |
| :--- | :--- | :--- |
| `/history reload` | Reloads all configurations and synchronizes data. | This command is **mandatory** after manual changes to JSON stage files (in `config/historystages/global/` or `individual/`) or TOML configuration files (e.g., `historystages-common.toml`). It ensures all connected clients receive updated configurations. |
| `/history debug structure` | Lists structure IDs and tags at the current position. | Useful for identifying structures for the `structures` lock feature. Only works for players. |
| `/history debug nbt preset` | Lists preset NBT fields for the held item. | Shows values for fields recognized by the NBT editor (e.g., `Enchantments`, `CustomModelData`). |
| `/history debug nbt custom` | Lists unrecognized NBT keys for the held item. | Shows key/value pairs ready for the editor's `+ Custom NBT Key` dialog. |
"""
