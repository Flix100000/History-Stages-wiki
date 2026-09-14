---
id: stage-configuration
title: Stage Configuration
---

Each stage in History Stages is defined by a JSON file, allowing for granular control over progression elements. These files are typically located in `config/historystages/global/` for global stages and `config/historystages/individual/` for per-player stages. The structure and available fields are consistent across all supported Minecraft versions.

## Configuration Fields

Below is a comprehensive list of fields available in a stage JSON file, along with their types, descriptions, and examples. These fields enable modpack creators to define progression rules.

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `display_name` | String | A human-readable name for the stage, displayed in messages, tooltips, and toast notifications. | `"Stone Age"` |
| `research_time` | Integer | The duration in seconds required for a player to research this stage at a Research Pedestal. If omitted or set to `0`, the global default `researchTimeInSeconds` from `historystages-common.toml` is used. | `120` |
| `icon` | String | An optional item ID shown as the icon in unlock toast notifications. If omitted, it falls back to the global `defaultStageIcon` config. | `"minecraft:iron_ingot"` |
| `items` | List of Strings/Objects | A list of item IDs or objects with `id` and `nbt` criteria to be locked. This field supports NBT-specific locking for fine-grained control. | `["minecraft:iron_ingot"]` |
| `tags` | List of Strings | A list of item tags (e.g., `forge:ores/iron`) that, when locked, will prevent interaction with any item belonging to that tag. | `["forge:ores/iron"]` |
| `mods` | List of Strings | A list of mod IDs (e.g., `mekanism`) that, when locked, will prevent interaction with all items originating from that specific mod. | `["mekanism"]` |
| `mod_exceptions` | List of Strings/Objects | A list of specific item IDs or NBT-defined items to be excluded from mod-level locking. This allows for selective unlocking within a globally locked mod. | `["mekanism:configurator"]` |
| `recipes` | List of Strings | A list of recipe IDs (e.g., `minecraft:iron_pickaxe`) that will be displayed with a "Locked" overlay in JEI/EMI, indicating they cannot be crafted until the stage is unlocked. | `["minecraft:iron_pickaxe"]` |
| `dimensions` | List of Strings | A list of dimension IDs (e.g., `minecraft:the_nether`) that players will be prevented from entering until the stage is unlocked. | `["minecraft:the_nether"]` |
| `structures` | List of Strings | A list of structure IDs or tag IDs (`#` prefix) to block access to. | `["minecraft:stronghold", "#minecraft:village"]` |
| `entities` | Object | An object containing two optional sub-lists: `attacklock` and `spawnlock`, used to control mob interactions. | (see below) |
| `dependencies` | List of Objects | A list of prerequisite conditions that must be met before this stage can be unlocked. | (see below) |

## Advanced Locking Features

### NBT-Specific Item Locking

History Stages provides NBT-based locking, allowing modpack creators to target items with precision. This is applicable for enchanted books, potions with specific effects, or complex mod items with unique NBT data.

```json
{
  "items": [
    {
      "id": "minecraft:enchanted_book",
      "nbt": {
        "StoredEnchantments": [
          {"id": "minecraft:sharpness", "lvl": "1-4"}
        ]
      }
    }
  ]
}
```

In this example, only enchanted books with Sharpness levels 1-4 would be locked, while other enchanted books remain accessible.

### Per-Entry Action Locking (`unlock_actions`)

By default, every entry in `items`, `tags`, and `mods` blocks all interactions with the matching content. The optional `unlock_actions` field allows modpack creators to instead restrict only specific interactions per entry, leaving the others available even while the stage is locked.

The recognised action names are:

`equip`, `attack`, `place`, `break`, `pickup`, `use`, `loot`, `recipe`, `gui`, `icon`

The field lists the actions that are **not** locked — every other action remains blocked. A plain string entry (or an object without `unlock_actions`) keeps the default behaviour of locking every action.

```json
{
  "items": [
    "minecraft:diamond_pickaxe",
    {
      "id": "minecraft:diamond_sword",
      "unlock_actions": ["pickup", "equip"]
    }
  ],
  "tags": [
    {
      "id": "forge:ingots/iron",
      "unlock_actions": ["pickup"]
    }
  ]
}
```

In this example, the diamond pickaxe stays fully locked, while the diamond sword can still be picked up and equipped — only attacking, crafting, and other actions remain blocked. Iron ingots from the tag can be picked up but cannot be used, equipped, or crafted with.

> **Note:** The legacy `lock_actions` field (which listed the locked actions directly) is still read for backwards compatibility, but new entries are always written using `unlock_actions`.

### Entity Control

Modpack creators can define how players interact with specific entities through stage locking:

*   **`attacklock`:** This list specifies entity IDs (e.g., `minecraft:zombie`) that players will be prevented from damaging until the stage is unlocked. This can be used to gate combat progression.
    Example: `"attacklock": ["minecraft:zombie"]`
*   **`spawnlock`:** This list specifies entity IDs (e.g., `minecraft:skeleton`) that will be prevented from spawning entirely in the world, including spawners and commands. Entities that are `spawnlock`ed are also automatically `attacklock`ed.
    Example: `"spawnlock": ["minecraft:skeleton"]`

    Each spawnlock entry can also be an object with an `unlock_sources` field, allowing modpack creators to selectively block only certain spawn sources for that entity while leaving the others available. The recognised sources are: `natural`, `spawner`, `structure`, `breeding`, `summon`, `spawn_egg`. Sources listed in `unlock_sources` are **not** blocked; everything else is. A plain string entry (or an object without `unlock_sources`) keeps the default behaviour of blocking every source.

    ```json
    "spawnlock": [
      "minecraft:zombie",
      {
        "id": "minecraft:skeleton",
        "unlock_sources": ["spawner", "spawn_egg"]
      }
    ]
    ```

    In this example, zombies cannot spawn at all, while skeletons are blocked from natural, structure, breeding, and summon spawns but can still be produced by spawners and spawn eggs.

### Stage Dependencies

To create a structured progression path, stages can be configured with prerequisites that must be fulfilled before they can be unlocked. These dependencies are managed through the visual Dependency Editor within the in-game stage editor, ensuring seamless client-server validation.

Modpack creators can group multiple dependencies together. When grouped, all conditions within the group must be met to satisfy the requirement. The system supports several dependency types, each defined by a specific `type` field and associated parameters:

*   **`xp_level`**: Requires the player to reach a specified minimum experience level.
    *   *Parameters:* `level` (integer)
*   **`entity_kills`**: Requires the player to defeat a specific number of a designated entity type.
    *   *Parameters:* `entity` (entity ID, e.g., `minecraft:zombie`), `count` (integer)
*   **`statistic`**: Requires the player to achieve a certain value in any tracked Minecraft statistic.
    *   *Parameters:* `stat` (statistic ID, e.g., `minecraft:play_time`), `value` (integer)
*   **`individual_stage`**: Requires the player to have already unlocked another specific individual stage.
    *   *Parameters:* `stage` (stage ID)

### Ignored Files

Any JSON file within the stage configuration directories that starts with an underscore (`_`) will be ignored by History Stages. This feature is useful for storing templates, backup configurations, or work-in-progress stage definitions without them being loaded into the game.
