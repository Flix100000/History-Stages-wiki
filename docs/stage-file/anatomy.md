---
title: Anatomy of a Stage File
sidebar_position: 1
---

# Anatomy of a Stage File

One stage is one JSON file. Every field is optional except the ones you actually want to use — a
file holding nothing but a `display_name` is valid and simply locks nothing.

```json title="config/historystages/global/bronze_age.json"
{
  "display_name": "Bronze Age",
  "icon": "minecraft:copper_ingot",
  "mode": "default",
  "research_time": 120,

  "items": ["minecraft:iron_ingot"],
  "tags": ["c:ores/iron"],
  "recipes": ["minecraft:iron_pickaxe"],

  "dependencies": [
    { "logic": "AND", "stages": ["stone_age"] }
  ]
}
```

The stage's **id is the file name**, not a field —
see [Where Stage Files Live](/wiki/start-here/where-stage-files-live).

This page is a map of the fields. Each group links to the page that actually explains it.

## Identity

| Field | Type | What it does |
| :--- | :--- | :--- |
| `display_name` | String | The name players read — messages, tooltips, toasts, the graph. Not the id. |
| `icon` | String | Item id used as the icon in unlock toasts. Falls back to the `defaultStageIcon` setting. |

## How it is researched

| Field | Type | What it does |
| :--- | :--- | :--- |
| `mode` | String | How the stage opens, and whether a Research Scroll exists for it. `"default"` when omitted. → [Stage Modes](/wiki/stage-file/stage-modes) |
| `auto_trigger` | Object | For `auto` and `temporary` stages: the triggers that open it, and whether any or all of them must fire. → [Stage Modes](/wiki/stage-file/stage-modes#auto) |
| `temporary` | Object | For `temporary` stages: how long it stays open, how often it may fire, and the cooldown between times. → [Stage Modes](/wiki/stage-file/stage-modes#temporary) |
| `research_time` | Integer | Seconds at the pedestal. `0` or omitted uses the server-wide `researchTimeInSeconds`. |
| `min_pedestal_tier` | Integer 1–4 | Lowest [pedestal tier](/wiki/in-game-tools/research/pedestal#tiers) that may research it. Default `1`. |
| `pedestal_tier_mode` | String | `"min"` (this tier and above) or `"exact"` (only this tier). Default `"min"`. |
| `dependencies` | List of Objects | Conditions that must be met before it can be researched at all. → [Dependencies](/wiki/stage-file/dependencies) |
| `scroll_completion` | String | What happens to the scroll when research finishes — `"consume"`, `"replace"` or `"open"`. Overrides the server-wide `defaultScrollCompletion`. → [Research Scrolls](/wiki/in-game-tools/research/scrolls#what-happens-when-research-finishes) |

## What it locks

| Field | Type | What it locks |
| :--- | :--- | :--- |
| `items` | Strings / Objects | Item ids. Objects add [NBT criteria](/wiki/locking/items-and-recipes/nbt-and-components) and [`unlock_actions`](/wiki/locking/items-and-recipes/unlock-actions). → [Items, Tags & Mods](/wiki/locking/items-and-recipes/items-tags-mods) |
| `tags` | Strings / Objects | Item tags such as `c:ores/iron`. Same object form as `items`. |
| `mods` | Strings | Mod ids — every item the mod registers. |
| `mod_exceptions` | Strings / Objects | Items carved back out of a `mods` lock. |
| `recipes` | Strings | Recipe ids, shown with a padlock in JEI and EMI. → [Recipes](/wiki/locking/items-and-recipes/recipes) |
| `fluids` | Strings / Objects | Fluid ids. Gates what a stack is *carrying*, so one entry covers every bucket and tank. → [Fluids](/wiki/locking/items-and-recipes/fluids) |
| `dimensions` | Strings | Dimension ids players may not enter. → [Dimensions & Structures](/wiki/locking/world/dimensions-and-structures) |
| `structures` | Object | `structures` blocks entry; `block_generation` caps how often one may generate. → [Dimensions & Structures](/wiki/locking/world/dimensions-and-structures) |
| `biomes` | Object | Biomes players cannot survive in. → [Biomes](/wiki/locking/world/biomes) |
| `zones` | List of Objects | Areas you draw yourself, each with its own rules. **Beta.** → [Zones](/wiki/locking/world/zones) |
| `entities` | Object | `attacklock`, `interactionlock`, `spawnlock`. → [Entities & Spawns](/wiki/locking/creatures-and-trade/entities-and-spawns) |
| `trades` | Object | `offers`, `professions`, `levels`. → [Merchant Trades](/wiki/locking/creatures-and-trade/merchant-trades) |

Loot has no field of its own — locked items are filtered out of chest loot and mob drops by the
`loot` action, which is on unless an entry narrows it away. →
[Loot](/wiki/locking/items-and-recipes/loot)

## How it behaves once it exists

| Field | Type | What it does |
| :--- | :--- | :--- |
| `hidden_display` | Object | What locked players see instead of the real name and tooltip. → [Hidden Display](/wiki/stage-file/hidden-display) |
| `lose_on_death` | Boolean | Individual stages only. Relocks the stage when its owner dies. → [Lose on Death](/wiki/start-here/global-vs-individual#lose-on-death) |

## Fields other mods own

| Field | Type | What it does |
| :--- | :--- | :--- |
| `addons` | Object | Gated content belonging to another mod, one block per addon. → [Addon Development](/api/addon-development) |
| `addon_settings` | Object | Per-stage settings an addon has registered. |

These two are written and read by the addon that owns them. History Stages carries them through
untouched — an addon's block survives an edit in the editor even when that addon is not currently
installed, so uninstalling a mod does not quietly strip its data out of your stage files.

## Two shapes for one entry

Most locking fields take either a plain id or an object. The plain form is the common case and locks
everything about the entry:

```json
"items": ["minecraft:diamond_sword"]
```

The object form is for narrowing — a criterion that has to match, or a set of actions that stay
free:

```json
"items": [
  {
    "id": "minecraft:diamond_sword",
    "unlock_actions": ["pickup", "equip"],
    "nbt": { "components": { "minecraft:enchantments": { "minecraft:sharpness": 5 } } }
  }
]
```

Both forms can sit in the same list.

:::note[Legacy spellings still load]
Files written for older versions keep working. `"structures": [ ... ]` as a flat array is read and
rewritten into the object form on the next save; `lock_actions` is read alongside the newer
`unlock_actions`; `unlock_dimensions` on a spawn rule is read as a dimension condition. New files
are always written in the current form.
:::

## Next

- [Stage Modes](/wiki/stage-file/stage-modes) — how a stage opens: by research, by trigger, by
  script, or on a timer.
- [Dependencies](/wiki/stage-file/dependencies) — what has to happen first.
- [Hidden Display](/wiki/stage-file/hidden-display) — hiding names and tooltips from locked players.
- [Complete Examples](/wiki/stage-file/complete-examples) — whole files to copy.
