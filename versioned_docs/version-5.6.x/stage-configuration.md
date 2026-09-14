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
| `mode` | String | Controls how the stage is unlocked and whether a Research Scroll is generated. See [Stage Modes](./stage-modes.md) for a full description of each option. Defaults to `"default"` when omitted. | `"auto"` |
| `research_time` | Integer | The duration in seconds required for a player to research this stage at a Research Pedestal. If omitted or set to `0`, the global default `researchTimeInSeconds` from `historystages-common.toml` is used. | `120` |
| `min_pedestal_tier` | Integer (1-4) | Minimum [pedestal tier](./research-system.md#pedestal-tiers) required to research this stage. Defaults to `1` (any tier works). | `3` |
| `pedestal_tier_mode` | String | `"min"` (this tier and higher) or `"exact"` (only this exact tier). Defaults to `"min"`. | `"exact"` |
| `icon` | String | An optional item ID shown as the icon in unlock toast notifications. If omitted, it falls back to the global `defaultStageIcon` config. | `"minecraft:iron_ingot"` |
| `items` | List of Strings/Objects | A list of item IDs or objects with `id` and `nbt` criteria to be locked. This field supports NBT-specific locking for fine-grained control. | `["minecraft:iron_ingot"]` |
| `tags` | List of Strings/Objects | A list of item tags (e.g., `forge:ores/iron`) that, when locked, will prevent interaction with any item belonging to that tag. Entries can also be objects with an `id`, an optional `nbt`/`components` criterion (to match only tag members with specific NBT data), and an optional `unlock_actions` field. | `["forge:ores/iron"]` |
| `mods` | List of Strings | A list of mod IDs (e.g., `mekanism`) that, when locked, will prevent interaction with all items originating from that specific mod. | `["mekanism"]` |
| `mod_exceptions` | List of Strings/Objects | A list of specific item IDs or NBT-defined items to be excluded from mod-level locking. This allows for selective unlocking within a globally locked mod. | `["mekanism:configurator"]` |
| `recipes` | List of Strings | A list of recipe IDs (e.g., `minecraft:iron_pickaxe`) that will be displayed with a "Locked" overlay in JEI/EMI, indicating they cannot be crafted until the stage is unlocked. | `["minecraft:iron_pickaxe"]` |
| `dimensions` | List of Strings | A list of dimension IDs (e.g., `minecraft:the_nether`) that players will be prevented from entering until the stage is unlocked. | `["minecraft:the_nether"]` |
| `structures` | Object | An object with a `structures` list of structure IDs or tag IDs (`#` prefix) to block access to, and an optional `block_generation` list to cap generation instead (see below). A legacy flat array (`"structures": [...]`) is still read for backwards compatibility and rewritten to the object form on save. | `{"structures": ["minecraft:stronghold", "#minecraft:village"]}` |
| `biomes` | Object | An object with a `biomes` list of biome IDs or tag IDs (`#` prefix) that players cannot survive in until the stage is unlocked. | (see below) |
| `entities` | Object | An object containing optional sub-lists: `attacklock`, `spawnlock`, and `interactionlock`, used to control mob interactions. | (see below) |
| `hidden_display` | Object | Controls how locked items from this stage appear to players who have not yet unlocked it — hides or replaces names and tooltips. | (see below) |
| `lose_on_death` | Boolean | Individual stages only. If `true`, this stage relocks for the player whenever they die. Omitted (not written) when `false`. | `true` |
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

On Minecraft 1.21+, the matcher additionally supports arbitrary [data components](https://minecraft.wiki/w/Data_component_format) via a top-level `components` object alongside the legacy NBT fields. This lets stages target items that store their state in data components rather than custom NBT (e.g. dyed leather armor, jukebox playable, food, custom mod components):

```json
{
  "items": [
    {
      "id": "minecraft:leather_chestplate",
      "nbt": {
        "components": {
          "minecraft:dyed_color": { "rgb": 16711680 }
        }
      }
    }
  ]
}
```

### NBT Criteria on Tag Entries

Tag entries support the same `nbt` and `components` criteria as item entries. When an NBT criterion is present on a tag entry, only tag members that also match that criterion are locked — other items in the same tag remain accessible.

```json
{
  "tags": [
    "forge:tools/swords",
    {
      "id": "forge:tools/swords",
      "nbt": {
        "components": {
          "minecraft:enchantments": { "minecraft:sharpness": 5 }
        }
      }
    }
  ]
}
```

> **Note:** Tag entries with an NBT criterion are skipped in code paths where no ItemStack is available (e.g., loot table checks without context), because NBT matching requires an actual stack. Plain string tag entries remain unaffected.

### Per-Entry Action Locking (`unlock_actions`)

By default, every entry in `items`, `tags`, and `mods` blocks all interactions with the matching content. The optional `unlock_actions` field allows modpack creators to instead restrict only specific interactions per entry, leaving the others available even while the stage is locked.

The recognised action names are:

`equip`, `attack`, `place`, `break`, `pickup`, `use`, `loot`, `recipe`, `gui`, `icon`

> **`place` vs `use`:** These two actions are distinct. `place` gates block placement — when locked, the item cannot be placed as a block. `use` gates right-click usage (e.g. opening a GUI, drinking a potion, activating a tool) but does **not** affect block placement. Locking `use` alone will not prevent a placeable block from being placed.

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

### Biome Locking

The `biomes` block restricts players from surviving in specific biomes until the stage is unlocked. Entries are biome IDs or biome tags (`#` prefix):

```json
{
  "biomes": {
    "biomes": ["minecraft:desert", "#minecraft:is_forest"]
  }
}
```

While a player stands inside a locked biome, the mod can apply potion effects, deal periodic damage, show a periodic warning message, and cancel right-clicks, left-clicks/mining, and projectile impacts — all configurable per-server in `historystages-common.toml` under `biome_lock` (see [Configuration](./configuration.md#biome-locking-biome_lock)). This mirrors the existing structure-lock behaviour, applied to biomes instead of structure zones.

### Structure Generation Limits

Beyond blocking entry, individual entries in `structures` can instead cap how many times a structure is allowed to generate in the world rather than blocking it outright. This is configured via the `block_generation` field inside the `structures` object (accessible from the in-game editor's structure context menu):

```json
{
  "structures": {
    "block_generation": [
      "minecraft:stronghold",
      {
        "id": "#minecraft:village",
        "phase": "while_locked",
        "max": 3,
        "reset_on_relock": false
      }
    ]
  }
}
```

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | — | Structure ID or tag (`#` prefix). |
| `phase` | String | `"while_locked"` | `"while_locked"` — the cap only counts while the stage is locked; generation is unrestricted after unlock. `"after_unlock"` — nothing generates while the stage is locked; the cap only starts counting once the stage is unlocked. |
| `max` | Integer | `0` | Maximum number of times the structure (or all members of the tag, combined) may generate. `0` blocks it entirely, same as a plain string entry. |
| `reset_on_relock` | Boolean | `false` | If `true`, the generation counter resets when the stage is relocked. |

This only applies to **global** stages — world generation is a permanent, world-wide decision, so it cannot be gated per-player. Counts are tracked world-wide (not per-dimension) starting from the moment the rule takes effect; chunks generated before the rule was added are not retroactively affected. Treasure maps also stop pointing at structures whose limit has been reached.

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

    Spawnlock entries also accept an optional `unlock_dimensions` field that lists the dimensions where the lock does **not** apply. In every dimension not listed, the entity is still blocked.

    ```json
    "spawnlock": [
      {
        "id": "minecraft:wither_skeleton",
        "unlock_dimensions": ["minecraft:the_nether"]
      }
    ]
    ```

    In this example, Wither Skeletons are fully blocked from spawning in every dimension except the Nether.

*   **`interactionlock`:** This list specifies entity IDs whose non-combat interactions (naming, leashing, shearing, milking, breeding, trading, mounting, equipping armor/saddles, etc.) are blocked until the stage is unlocked. Attacking and spawning are unaffected — use `attacklock` / `spawnlock` for those.

    Each entry can be a plain entity ID (blocks every recognised interaction) or an object with `unlock_actions` and/or `lock_items`:

    ```json
    "interactionlock": [
      "minecraft:villager",
      {
        "id": "minecraft:horse",
        "unlock_actions": ["mount"],
        "lock_items": ["minecraft:saddle"]
      }
    ]
    ```

    | Field | Type | Description |
    | :--- | :--- | :--- |
    | `unlock_actions` | List of Strings | Actions that are **not** locked; every other recognised action stays blocked. Recognised actions: `breed`, `mount`, `trade`, `leash`, `shear`, `milk`, `name`, `equip`, `other`. |
    | `lock_items` | List of Strings/Objects | Optional held-item filter. When present, the lock only applies while the player is holding one of these items (plain item IDs, `#tag` entries, or `{ "id": ..., "nbt": {...} }` objects). Omitted or empty means the lock applies regardless of what is held, including an empty hand. |

    In the example above, villagers cannot be interacted with at all (trading, naming, etc.), while horses can be mounted freely but cannot be saddled, bred, or leashed until the stage is unlocked, and only while a saddle is in hand.

### Hidden Display

The `hidden_display` block controls how locked items from a stage appear to players who have not yet unlocked it. All effects apply only while the item is locked for the viewing player — once the stage is unlocked, items display normally.

```json
{
  "hidden_display": {
    "name_mode": "replace",
    "name_text": "???",
    "tooltip_mode": "replace",
    "tooltip_text": "Unlock the Stone Age to reveal this item.",
    "show_lock_hints": false
  }
}
```

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name_mode` | String | `"off"` | `"off"` — item name unchanged. `"hidden"` — name is cleared. `"replace"` — name is replaced with `name_text`. |
| `name_text` | String | `""` | The replacement name shown when `name_mode` is `"replace"`. |
| `tooltip_mode` | String | `"off"` | `"off"` — tooltip unchanged. `"hidden"` — all extra tooltip lines are stripped. `"replace"` — tooltip is replaced with `tooltip_text`. |
| `tooltip_text` | String | `""` | The replacement tooltip shown when `tooltip_mode` is `"replace"`. Use `\n` for multi-line text. |
| `show_lock_hints` | Boolean | `true` | When `false`, the padlock icon and "Locked" hint line are not added to the tooltip. Only useful in combination with `tooltip_mode: "replace"` to fully control what locked players see. |

Individual entries in `items` and `tags` lists can additionally override the stage-default `name_text` and `tooltip_text` on a per-entry basis by adding `name_text` and `tooltip_text` fields directly to the entry object. The `name_mode` and `tooltip_mode` from `hidden_display` still determine whether hiding or replacement is active — only the text itself is overridden.

### Lose on Death

Individual stages can be set to relock automatically when the owning player dies, via `"lose_on_death": true`. This is not available for global stages (there is no single player to relock a server-wide stage for).

The relock happens on death itself, not on respawn, so the stage's newly re-locked items are included in the player's death drops. Combined with `keepInventory`, this can be used to make specific progression items the only thing a player risks losing on death. If the stage is in `temporary` mode with an active timer, dying ends that timer early and starts the cooldown as if it had expired naturally, without counting against `max_triggers` any differently than a normal expiry.

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
*   **`scoreboard`**: Requires a scoreboard objective to satisfy a numeric comparison. If no `score_holder` is specified, the check is evaluated against the player's own score.
    *   *Parameters:* `objective` (objective name), `op` (comparison operator: `>=`, `<=`, `==`, `>`, `<`, `!=`), `value` (integer), `score_holder` (optional — a specific score holder name; defaults to the acting player)

### Folders

Stage JSON files can be organized into nested subfolders under `config/historystages/global/` and `config/historystages/individual/`. Folders are purely organizational — **the stage ID is the file name, not the folder path**, and IDs must still be unique across the entire tree regardless of which folder they sit in. A duplicate ID anywhere in the tree is rejected at load time with an error in the debug log.

Folder and file names may contain letters, digits, `-`, and `_`, but cannot start with `_` (an underscore prefix opts a file or folder out of loading — see below) and cannot use `..`, backslashes, or drive letters. Folders can be nested up to 8 levels deep.

The in-game editor's **organize mode** on the Stage Overview screen lets you tick multiple stages and folders and drag them onto a target folder in one move — moving a folder brings its contents along automatically. See [In-Game Editor](./in-game-editor.md#organize-mode).

### Ignored Files

Any JSON file or folder within the stage configuration directories whose name starts with an underscore (`_`) will be ignored by History Stages. This feature is useful for storing templates, backup configurations, or work-in-progress stage definitions without them being loaded into the game.
