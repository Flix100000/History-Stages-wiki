---
title: Installation & Your First Stage
sidebar_position: 2
---

# Installation & Your First Stage

## What you need alongside it

**Lootr is required.** ([Modrinth](https://modrinth.com/mod/lootr) ·
[CurseForge](https://www.curseforge.com/minecraft/mc-mods/lootr)) Chest loot in vanilla is shared:
one container, one roll, whoever opens it first takes it. That cannot be filtered per player, so on
an individual stage a locked item would either vanish for everybody or reach everybody. Lootr gives
each player their own view of a container, which is what makes [per-player loot
filtering](/wiki/locking/items-and-recipes/loot) possible at all. History Stages does not load
without it.

**Recommended, not required:**

| | |
| :--- | :--- |
| [JEI](https://www.curseforge.com/minecraft/mc-mods/jei) or [EMI](https://modrinth.com/mod/emi) | Draws the padlock overlay on locked recipes. Without a recipe browser, players get no warning before they try to craft something gated. |
| [Jade](https://modrinth.com/mod/jade) | Shows the required stage when a player looks at a locked block, entity, armour stand or item frame. |

## First launch

Install the mod and start the game once. History Stages creates its folders and writes its default
settings:

```
config/historystages/
    global/              stage files that apply to everyone
    individual/          stage files tracked per player
    settings/            visual.toml, gameplay.toml, graph.toml
    logs/                load reports and runtime logs
```

Nothing is locked yet. The two stage folders are empty, and an empty folder means an unchanged game.

## Your first stage

A stage is one JSON file. Its **id is the file name** — `bronze_age.json` defines the stage
`bronze_age` — and the id is what commands, dependencies and scripts refer to.

Save this as `config/historystages/global/bronze_age.json`:

```json title="config/historystages/global/bronze_age.json"
{
  "display_name": "Bronze Age",
  "research_time": 60,
  "items": ["minecraft:iron_ingot"],
  "tags": ["c:ores/iron"],
  "recipes": ["minecraft:iron_pickaxe"]
}
```

Then reload:

```
/history reload
```

:::warning[Reload is not optional]
A stage file edited by hand does nothing until `/history reload` runs — the mod reads the folders at
startup and on that command, not on every file change. The in-game editor reloads by itself when it
saves, so this only applies to hand-edited files.
:::

Iron ingots and everything in the `c:ores/iron` tag are now out of reach, and the iron pickaxe
recipe shows a padlock in JEI. `/history global unlock bronze_age` opens it again.

## The other way: build it in the game

The [In-Game Editor](/wiki/in-game-tools/in-game-editor) does the same thing without a text editor.
Open the pause menu with permission level 2 and use the History Stages button, or run
`/history editor`. It writes the same JSON files, so a pack can be started in the editor and
finished by hand, or the other way round.

For anything past a handful of entries, the editor is the faster route — it has searchable pickers
for items, recipes, fluids, entities, structures and trades, and it will not let you write an id
that does not exist.

## Players still cannot research anything

History Stages ships **no recipes** for the Research Pedestal or the Research Scrolls. That is
deliberate: how players earn the right to progress is a pack decision, not a mod decision. Until you
add a way to obtain them, the only route is `/give` or creative mode.

→ [Obtaining Scrolls & Pedestals](/wiki/in-game-tools/research/obtaining) has ready-made recipes for
KubeJS, CraftTweaker, vanilla datapacks and FTB Quests.

## Where to go next

- [Global vs Individual Stages](/wiki/start-here/global-vs-individual) — which of the two you want,
  and which locks only work in one of them. Read this before designing a pack.
- [Anatomy of a Stage File](/wiki/stage-file/anatomy) — every field a stage file can hold.
- [Where Stage Files Live](/wiki/start-here/where-stage-files-live) — folders, naming rules, and how
  to park a file without loading it.
- [Complete Examples](/wiki/stage-file/complete-examples) — whole stage files to copy.
