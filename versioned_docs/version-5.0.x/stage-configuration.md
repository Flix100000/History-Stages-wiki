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

### Entity Control

Modpack creators can define how players interact with specific entities through stage locking:

*   **`attacklock`:** This list specifies entity IDs (e.g., `minecraft:zombie`) that players will be prevented from damaging until the stage is unlocked. This can be used to gate combat progression.
    Example: `"attacklock": ["minecraft:zombie"]`
*   **`spawnlock`:** This list specifies entity IDs (e.g., `minecraft:skeleton`) that will be prevented from spawning entirely in the world, including spawners and commands. Entities that are `spawnlock`ed are also automatically `attacklock`ed.
    Example: `"spawnlock": ["minecraft:skeleton"]`

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
