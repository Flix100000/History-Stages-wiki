---
title: Stage Configuration
sidebar_position: 1
---

Each stage in History Stages is defined by a JSON file, allowing for granular control over progression elements. These files are typically located in `config/historystages/global/` for global stages and `config/historystages/individual/` for per-player stages. The structure and available fields are consistent across all supported Minecraft versions.

## Configuration Fields

Below is a comprehensive list of fields available in a stage JSON file, along with their types, descriptions, and examples. These fields enable modpack creators to define progression rules.

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `display_name` | String | A human-readable name for the stage, displayed in messages, tooltips, and toast notifications. | `"Stone Age"` |
| `mode` | String | Controls how the stage is unlocked and whether a Research Scroll is generated. See [Stage Modes](/docs/modpack-developers/stage-basics/stage-modes) for a full description of each option. Defaults to `"default"` when omitted. | `"auto"` |
| `research_time` | Integer | The duration in seconds required for a player to research this stage at a Research Pedestal. If omitted or set to `0`, the global default `researchTimeInSeconds` from `historystages/settings/gameplay.toml` is used. | `120` |
| `min_pedestal_tier` | Integer (1-4) | Minimum [pedestal tier](/docs/modpack-developers/in-game-tools/research-system#pedestal-tiers) required to research this stage. Defaults to `1` (any tier works). | `3` |
| `pedestal_tier_mode` | String | `"min"` (this tier and higher) or `"exact"` (only this exact tier). Defaults to `"min"`. | `"exact"` |
| `icon` | String | An optional item ID shown as the icon in unlock toast notifications. If omitted, it falls back to the global `defaultStageIcon` config. | `"minecraft:iron_ingot"` |
| `items` | List of Strings/Objects | A list of item IDs or objects with `id` and `nbt` criteria to be locked. This field supports NBT-specific locking for fine-grained control. | `["minecraft:iron_ingot"]` |
| `fluids` | List of Strings/Objects | Fluid IDs to be locked. An entry gates what a stack is *carrying*, not what it is, so one fluid covers every bucket and tank item that holds it. Entries can be objects with an `id` and an optional `unlock_actions` field. | `["minecraft:lava"]` |
| `tags` | List of Strings/Objects | A list of item tags (e.g., `c:ores/iron`) that, when locked, will prevent interaction with any item belonging to that tag. Entries can also be objects with an `id`, an optional `nbt`/`components` criterion (to match only tag members with specific NBT data), and an optional `unlock_actions` field. | `["c:ores/iron"]` |
| `mods` | List of Strings | A list of mod IDs (e.g., `mekanism`) that, when locked, will prevent interaction with all items originating from that specific mod. | `["mekanism"]` |
| `mod_exceptions` | List of Strings/Objects | A list of specific item IDs or NBT-defined items to be excluded from mod-level locking. This allows for selective unlocking within a globally locked mod. | `["mekanism:configurator"]` |
| `recipes` | List of Strings | A list of recipe IDs (e.g., `minecraft:iron_pickaxe`) that will be displayed with a "Locked" overlay in JEI/EMI, indicating they cannot be crafted until the stage is unlocked. | `["minecraft:iron_pickaxe"]` |
| `dimensions` | List of Strings | A list of dimension IDs (e.g., `minecraft:the_nether`) that players will be prevented from entering until the stage is unlocked. | `["minecraft:the_nether"]` |
| `structures` | Object | An object with a `structures` list of structure IDs or tag IDs (`#` prefix) to block access to, and an optional `block_generation` list to cap generation instead. See [Lock Types](/docs/modpack-developers/locking-zones/world-locks#structure-generation-limits). A legacy flat array (`"structures": [...]`) is still read for backwards compatibility and rewritten to the object form on save. | `{"structures": ["minecraft:stronghold", "#minecraft:village"]}` |
| `biomes` | Object | An object with a `biomes` list of biome IDs or tag IDs (`#` prefix) that players cannot survive in until the stage is unlocked. See [Lock Types](/docs/modpack-developers/locking-zones/world-locks#biome-locking). | — |
| `zones` | List of Objects | Named areas drawn by the pack author, each in one dimension, each built from one or more shapes and carrying its own rules. **Beta.** See [Zones](/docs/modpack-developers/locking-zones/zones). | — |
| `entities` | Object | An object containing optional sub-lists: `attacklock`, `spawnlock`, and `interactionlock`, used to control mob interactions. See [Lock Types](/docs/modpack-developers/locking-zones/entity-and-trade-locks#entity-control). | — |
| `trades` | Object | An object with three optional lists — `offers`, `professions` and `levels` — controlling what merchants will trade with the player. See [Lock Types](/docs/modpack-developers/locking-zones/entity-and-trade-locks#merchant-trades). | — |
| `hidden_display` | Object | Controls how locked items from this stage appear to players who have not yet unlocked it — hides or replaces names and tooltips. See [Stage Behavior](/docs/modpack-developers/locking-zones/stage-behavior#hidden-display). | — |
| `lose_on_death` | Boolean | Individual stages only. If `true`, this stage relocks for the player whenever they die. Omitted (not written) when `false`. See [Stage Behavior](/docs/modpack-developers/locking-zones/stage-behavior#lose-on-death). | `true` |
| `dependencies` | List of Objects | A list of prerequisite conditions that must be met before this stage can be unlocked. See [Stage Behavior](/docs/modpack-developers/locking-zones/stage-behavior#stage-dependencies). | — |

## Advanced Locking Features

Everything beyond the basic fields above has its own page:

- **[Lock Types](/docs/modpack-developers/locking-zones/lock-types)** — NBT-specific item locking, per-entry action locking, fluid locking, biome locking, structure generation limits, entity control, and merchant trades.
- **[Zones](/docs/modpack-developers/locking-zones/zones)** — player-drawn areas with their own independent rules: shapes, messages, damage, effects, barriers.
- **[Stage Behavior](/docs/modpack-developers/locking-zones/stage-behavior)** — hidden display, lose-on-death, stage dependencies (including AND/OR logic), folders, and ignored files.
