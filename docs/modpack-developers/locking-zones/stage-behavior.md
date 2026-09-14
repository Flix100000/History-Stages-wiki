---
title: Stage Behavior
sidebar_position: 5
---

Settings that shape how a stage behaves once it exists, rather than what it locks: how locked content is
displayed, whether an individual stage can be lost, what a stage demands before it opens, and how stage
files are organized on disk.

## Hidden Display

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

## Lose on Death

Individual stages can be set to relock automatically when the owning player dies, via `"lose_on_death": true`. This is not available for global stages (there is no single player to relock a server-wide stage for).

The relock happens on death itself, not on respawn, so the stage's newly re-locked items are included in the player's death drops. Combined with `keepInventory`, this can be used to make specific progression items the only thing a player risks losing on death. If the stage is in `temporary` mode with an active timer, dying ends that timer early and starts the cooldown as if it had expired naturally, without counting against `max_triggers` any differently than a normal expiry.

## Stage Dependencies

To create a structured progression path, stages can demand that things be done before they open. Dependencies are normally built in the visual Dependency Editor inside the in-game stage editor, but they are plain JSON and can be written by hand.

`dependencies` is a list of **groups**. A group is not a single condition — it holds one list per kind of requirement, plus a `logic` field saying how its own entries are connected:

```json
"dependencies": [
  {
    "logic": "AND",
    "items": [ { "id": "minecraft:iron_ingot", "count": 16 } ],
    "item_tags": [ { "id": "#minecraft:planks", "count": 8 } ],
    "stages": [ "stone_age" ],
    "individual_stages": [ { "stage_id": "apprentice", "mode": "all_online" } ],
    "advancements": [ "minecraft:story/mine_diamond" ],
    "xp_level": { "level": 30, "consume": true },
    "entity_kills": [ { "entity_id": "minecraft:enderman", "count": 50 } ],
    "stats": [ { "stat_id": "minecraft:play_time", "min_value": 72000 } ],
    "scoreboard": [ { "objective": "quests", "op": ">=", "value": 5 } ]
  }
]
```

Every list is optional — leave out what the group does not use. An `addons` block can sit alongside them for requirement kinds owned by other mods; see [Requirements](/api/requirements).

| Field | Demands |
| :--- | :--- |
| `items` | Items handed in at the Research Pedestal. Entries take `id`, `count`, and an optional `nbt` criterion. |
| `item_tags` | An item tag handed in at the pedestal, same entry shape. A tag entry does not behave like a list of items — see below. |
| `stages` | Another global stage is already unlocked. Plain stage IDs. |
| `individual_stages` | An individual stage is held. `mode` is `"all_online"` (everyone currently online), `"all_ever"` (everyone the server has ever seen), or `"player"` (only whoever is researching). A global stage may not use `"player"`: it would let the first qualifying player open the stage for everybody, including those without the prerequisite. |
| `advancements` | The player has earned an advancement. |
| `xp_level` | A single object rather than a list. `consume` takes the levels away on unlock. |
| `entity_kills` | The player has killed `count` of `entity_id`. |
| `stats` | A tracked statistic has reached `min_value`. |
| `scoreboard` | An objective satisfies a comparison. `op` is one of `>=`, `<=`, `==`, `>`, `<`, `!=`. Without `score_holder`, the acting player's own score is read. |

Four of these need a single player to measure and are therefore **individual-only**: `advancements`, `xp_level`, `entity_kills` and `stats`. Written into a global stage by hand they are skipped rather than checked against whoever happened to trigger it. The rest — items, item tags, stages, individual stages and scoreboard — work in both scopes. → [Requirements](/api/requirements) has the same split from the addon side.

### AND, OR, and where the line runs

**`logic` applies inside a group and never between groups.** Groups are always joined by AND: every group has to be satisfied. Within one group, `"AND"` (the default) demands every entry and `"OR"` demands any single one.

So "sixteen iron *or* eight gold, and thirty levels either way" is two groups — an OR group holding the two items, and a second group holding the level. Putting all three into one OR group would let thirty levels alone open the stage.

The Research Scroll tooltip and the graph's detail panel both print the heading of each group, so a player can see which entries an OR applies to.

### Item tags settle on the first deposit

An `item_tags` entry is not shorthand for "any one of these items". The first matching item thrown into the pedestal is written onto the scroll, and from then on that entry demands **that** item for the rest of its count — so `8x #minecraft:planks` means eight planks of one kind, not eight planks scraped together from four different woods.

The choice lives on the individual scroll, next to the counter, and there is no way to reset it. Two players researching the same stage can settle on different items. While an entry is still open, its icon cycles through the tag's members once a second, so it reads as a choice rather than as one specific item.

Deposits are matched in a fixed order: concrete items first, then tags that have already settled, then open tags. An open tag gives up its freedom last.

## Folders

Stage JSON files can be organized into nested subfolders under `config/historystages/global/` and `config/historystages/individual/`. Folders are purely organizational — **the stage ID is the file name, not the folder path**, and IDs must still be unique across the entire tree regardless of which folder they sit in. A duplicate ID anywhere in the tree is rejected at load time with an error in the debug log.

Folder and file names may contain letters, digits, `-`, and `_`, but cannot start with `_` (an underscore prefix opts a file or folder out of loading — see below) and cannot use `..`, backslashes, or drive letters. Folders can be nested up to 8 levels deep.

The in-game editor's **organize mode** on the Stage Overview screen lets you tick multiple stages and folders and drag them onto a target folder in one move — moving a folder brings its contents along automatically. See [In-Game Editor](/docs/modpack-developers/in-game-tools/in-game-editor#key-capabilities).

## Ignored Files

Any JSON file or folder within the stage configuration directories whose name starts with an underscore (`_`) will be ignored by History Stages. This feature is useful for storing templates, backup configurations, or work-in-progress stage definitions without them being loaded into the game.
