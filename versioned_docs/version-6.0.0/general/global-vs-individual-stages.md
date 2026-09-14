---
title: Global vs Individual Stages
sidebar_position: 3
---

History Stages has two progression models: **Global** (server-wide) and **Individual** (per-player). Both can run side by side in the same modpack, but they lock different things and behave differently for the player. This page is about that behaviour.

## What can each one lock?

Not every lock type works in both modes. Pick the wrong stage type and your lock is silently ignored. You will only see it in the debug log.

| Lock type | Global | Individual |
|---|:---:|:---:|
| Items / Blocks (use, attack, equip, pickup, place, break, gui) | yes | yes |
| Fluids (what a bucket or tank is carrying) | yes | yes |
| Tags | yes | yes |
| Mods (incl. `mod_exceptions`) | yes | yes |
| NBT items | yes | yes |
| Dimensions | yes | yes |
| Structures | yes | yes |
| Structure generation caps (`block_generation`) | yes | no |
| Biomes | yes | yes |
| Zones (areas you draw yourself) | yes | yes, except "no mob spawns" |
| Entities, `attacklock` (player cannot attack the mob) | yes | yes |
| Entities, `interactionlock` (breed/mount/trade/leash/etc.) | yes | yes |
| Entities, `spawnlock` (mob does not spawn at all) | yes | no |
| Merchant offers (`trades` → `offers`) | yes | yes |
| Merchant professions and levels (`trades` → `professions`, `levels`) | yes | yes |
| Recipes (lock specific recipe IDs) | yes | yes, at manned stations |
| Loot tables (replace/remove in chests and drops) | yes | yes |
| Enchantments | yes | yes |
| `lose_on_death` | no | yes |

`spawnlock` is missing from the Individual column because it is a world-global mechanic: a mob spawn does not know who it is appearing for, and an individual lock needs a concrete player ("this player just tried to use this item"). A zone's **no mob spawns** switch is the same question in a different place, and is likewise global-only; everything else a zone does has a player standing in it and works in both.

Fluids work in both, because a fluid is only ever asked about with a player at hand. The one place that breaks down is the recipe side of a fluid lock on an individual stage: it only reaches the stations that know who is crafting, exactly as `recipes` does — see below. Furnaces, hoppers, autocrafters and most modded machines answer globally or not at all, and the mod writes a warning into the log when an individual stage asks for something they cannot answer.

`recipes` used to sit next to it for the same reason, and since 6.0 it no longer does — but only halfway. The recipe lookup itself still carries no player; what changed is that a station with someone standing at it now says who that is. Four vanilla stations do, other mods can add their own, and everything else stays global. See [Per-player recipe locks](#per-player-recipe-locks-and-where-they-stop) for where that reaches and where it stops.

`block_generation` is missing from the Individual column for the same class of reason: world generation happens once, permanently, for the whole world — there is no per-player chunk to gate. `lose_on_death` is the mirror case: it only makes sense for individual stages, since there is no single player whose death should relock a stage shared by the whole server.

## How the player experiences it

### Global and Individual lock at different layers

This is the part that trips most people up. Listing the same item in a global stage and in an individual stage does very different things.

**Global stage: the recipe goes away.**

While the stage is locked, every recipe whose output is the locked item is filtered out of the `RecipeManager`. That covers every recipe type the game has:

- Crafting table and crafter
- Furnace, smoker, blast furnace, campfire
- Stonecutter, smithing table
- Brewing stand
- Custom recipe types from KubeJS, CraftTweaker, and other mods

The item cannot be produced. No one on the server can craft it. JEI and EMI show a lock overlay, or hide the recipe entirely if `hideLockedItemsInJei` or `hideLockedRecipesInJei` is on. The `recipes` field works as a more surgical tool on top of this, removing specific recipe IDs by hand when you only want one of several variants gone.

One exception: an item entry can leave `recipe` out of the lock. `unlock_actions` lists the actions that stay **free**, so `"unlock_actions": ["recipe"]` keeps the recipe craftable while everything else about the item stays gated. An entry with no `unlock_actions` at all locks every action, the recipe included.

**Individual stage: the item refuses to land in the inventory.**

The recipe stays in the registry. Any unlocked player can craft it like normal. For a locked player, a few different mechanics work together so that the item never actually ends up in their inventory:

- Picking it up off the ground is blocked (`EntityItemPickupEvent` is cancelled).
- Clicking it in any slot of any container (chest, crafting table output, anywhere) is cancelled as soon as the locked player tries to grab it.
- On login, the server scans the player's inventory and drops any stack whose `pickup` action is now locked for them. This is how the system catches items that became locked while the player was offline.
- The regular action locks (use, equip, place, etc.) still apply if the item somehow lands in their hand anyway, for example through `/give` from an op.

So the recipe still exists, but a locked player cannot have the item. They cannot craft it into their inventory, cannot pick it up, cannot pull it out of a chest. An unlocked player can stand at the same crafting table and produce it without anything stopping them. Only the locked player is shut out.

### Per-player recipe locks, and where they stop

Since 6.0 the `recipes` field also works inside an individual stage, and so does an item entry whose `recipe` action is locked. Both are gated per player at the stations that know who is standing at them:

- Crafting table
- The 2×2 grid in the player's own inventory
- Stonecutter
- Smithing table

At those four, an individual stage does exactly what a global one does: the result slot stays empty, and for the stonecutter the locked recipe is not even offered as a button. Two players can stand at the same crafting table and get different results.

**Everywhere else it stays global-only**, because there is no player to ask:

- Furnace, blast furnace, smoker, campfire
- Brewing stand
- The crafter block, hopper feeds, and mod autocrafters
- Any mod station with its own menu whose recipe type has not been registered as per-player-gateable

**Another mod can add to that list.** Since 6.0.0 a mod may declare one of its own recipe types per-player-gateable, and the editor then offers it like the built-in three. That is a promise about the mod's own station — that a player is standing at it and that our hooks see them — so the list above is the vanilla floor rather than the whole of it. → [Addon Development](../addon-developers/addon-development.md).

**This means a recipe locked by an individual stage can still be produced in an autocrafter.** That is acceptable for progression design — a professions system, a research tree — and it is not cheat protection. If you need something to be truly unobtainable, use a global stage.

Anvil, loom and cartography table are absent from both lists: they are not recipe-driven in the first place. Vanilla has exactly seven recipe types, and those three stations use none of them, so there is no recipe id to write into a stage.

The switch for all of this is `lockRecipes` in `[individual_stages]`, on by default.

#### The recipe type is a stand-in, not a promise

Whether a recipe can be gated per player is decided by its **type** — `minecraft:crafting`, `minecraft:stonecutting`, `minecraft:smithing`. That is a stand-in for the real rule, which is about the menu: a mod machine with its own screen that uses `minecraft:crafting` internally does not go through our hooks and stays global-only. Treat the type list as "supported as far as we know" rather than a guarantee.

The editor's recipe picker offers only these three types on an individual stage, and says so under the item grid. A recipe of any other type written into an individual stage by hand is left exactly as you wrote it and reported as a warning in `debug-*.log` — it simply never gates anything.

A note on the relevant config flags: the pickup block can be turned off via `lockItemPickup` in `historystages/settings/gameplay.toml` (default `true`). When it is off, the player can pick the item up, but the action locks still apply. The container click block is a separate toggle, `lockContainerInteraction`.

### Mob spawns (Global only)

`entities.spawnlock` stops a mob from appearing in the world at all. That is a world-global decision, so per-player does not make sense for it. It only exists for global stages.

`attacklock` is the individual-friendly version. The mob spawns normally and unlocked players can attack it, but for a locked player every attack is cancelled.

### Items, blocks, dimensions, structures

The lock mechanism is the same in both modes. What changes is who the lock applies to.

- Global: once unlocked, the content is free for every player on the server. New joiners walk into the already-unlocked state.
- Individual: every player has to unlock the stage themselves. New joiners start with nothing, regardless of what other players have done.

This is why player A can be wandering through the End while player B is still scraping by in the Stone Age. Normal for individual stages, impossible for global ones.

### Stage dependencies

A stage can require a list of conditions before it can be researched. Which kinds the editor offers depends on the stage type, and the split is not arbitrary: a per-player condition needs a clearly defined researcher. An individual scroll has a fixed owner from the moment research starts, so the check always knows whose advancements to read. A global scroll has no owner.

**Both stage types** can use:

- Items deposited at the pedestal
- Item tags deposited at the pedestal
- Another global stage being unlocked
- An individual stage being unlocked (collective check, see below)
- A scoreboard objective, compared against a named score holder

**Individual stages** add four that need a specific player:

- Advancements the player has finished
- XP level, with an option to consume the levels at deposit time
- Entity kill counts
- Tracked statistics

A scoreboard condition works on a global stage because it can name the holder it reads. Left without one it falls back to the acting player, which on a global stage is whoever happens to be at the pedestal — so name the holder when you use it there.

If you write a per-player condition into a global stage by hand, the editor will not show it, but nothing strips it out either: the checker simply skips the kinds that scope cannot answer, rather than measuring them against whoever last opened the pedestal.

**The `individual_stages` dependency is collective**

It does not target one named player. The `mode` field picks whose stage is read:

- `all_online` — every currently online player must have it.
- `all_ever` — every player the server has ever seen must have it.
- `player` — only whoever is doing the research. **Individual stages only.**

The first two are what "nobody moves on until everyone is ready" is spelled with. `player` is the ordinary personal prerequisite, and it is deliberately not offered on a global stage: a global stage unlocks once for everybody, so a personal gate would let the first qualifying player open it for the whole server, including everyone without the prerequisite. That reads as "everyone needs it" and does the opposite.

## Dual-Phase: when both lists target the same content

If the same entry appears in a global stage and in an individual stage, History Stages turns on the **Dual-Phase Lock** for it automatically. Every category takes part except two: `mod_exceptions`, which carves holes rather than locking, and `spawnlock`, which has no individual side to overlap with. So items, fluids, tags, mods, recipes, dimensions, structures, biomes, zones, attack and interaction locks, and all three trade categories are all covered.

1. Phase 1 (Global): locked for everyone until the global stage is unlocked server-wide. The recipe is also blocked during this phase, see above.
2. Phase 2 (Individual): once the global unlock happens, the recipe becomes craftable again, but each player still cannot use or pick up the item until they unlock their individual stage themselves.

Dual-phase entries get a `[Dual]` badge in the in-game editor and their own lock icon in the player's inventory.

## Pitfalls

- Stage IDs must be unique **within** a tree, not across the two. Two files called `iron_age.json` in different subfolders of `global/` collide: the alphabetically first path is kept, the other is skipped with an error in the debug log. The same ID in `global/` *and* in `individual/` is a different matter — both load, and that is exactly how a [dual-phase lock](#dual-phase-when-both-lists-target-the-same-content) is written.
- Recipe locks in an individual stage reach the stations with a player standing at them — four in vanilla, more if a mod registers its own. A furnace or an autocrafter ignores them; see [Per-player recipe locks](#per-player-recipe-locks-and-where-they-stop). Before 6.0 they were stripped out at load time entirely; they are now kept.
- An individual item lock does not touch the recipe. Other players can craft the item right next to a locked player without anything happening. The lock only kicks in when the locked player tries to obtain or use the item.
- Individual unlocks do not apply retroactively. `/history individual unlock @a stage_x` only reaches players who are online at that moment. Anyone joining later has to be unlocked separately, or has to clear a dependency chain on their own.
- `/history reload` does not change any unlock state. It only re-reads stage definitions. If you rename a stage, every unlock on the old ID is gone.
