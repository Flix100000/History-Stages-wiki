---
id: global-vs-individual-stages
title: Global vs Individual Stages
---

History Stages has two progression models: **Global** (server-wide) and **Individual** (per-player). Both can run side by side in the same modpack, but they lock different things and behave differently for the player. This page is about that behaviour.

## What can each one lock?

Not every lock type works in both modes. Pick the wrong stage type and your lock is silently ignored. You will only see it in the debug log.

| Lock type | Global | Individual |
|---|:---:|:---:|
| Items / Blocks (use, attack, equip, pickup, place, break, gui) | yes | yes |
| Tags | yes | yes |
| Mods (incl. `mod_exceptions`) | yes | yes |
| NBT items | yes | yes |
| Dimensions | yes | yes |
| Structures | yes | yes |
| Entities, `attacklock` (player cannot attack the mob) | yes | yes |
| Entities, `spawnlock` (mob does not spawn at all) | yes | no |
| Recipes (lock specific recipe IDs) | yes | no |
| Loot tables (replace/remove in chests and drops) | yes | yes |
| Enchantments | yes | yes |

`recipes` and `spawnlock` are missing from the Individual column for the same reason. They are world-global mechanics. The recipe lookup runs without a player context, and a mob spawn does not know who it is appearing for. Individual locks need a concrete player ("this player just tried to use this item"), and neither of those two systems gives you one.

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

One exception: if the item entry has a `lockActions` field that leaves out `"recipe"` (say `["use"]`), the recipe stays active. The default, with no `lockActions` field, locks everything including the recipe.

**Individual stage: the item refuses to land in the inventory.**

The recipe stays in the registry. Any unlocked player can craft it like normal. For a locked player, a few different mechanics work together so that the item never actually ends up in their inventory:

- Picking it up off the ground is blocked (`EntityItemPickupEvent` is cancelled).
- Clicking it in any slot of any container (chest, crafting table output, anywhere) is cancelled as soon as the locked player tries to grab it.
- On login, the server scans the player's inventory and drops any stack whose `pickup` action is now locked for them. This is how the system catches items that became locked while the player was offline.
- The regular action locks (use, equip, place, etc.) still apply if the item somehow lands in their hand anyway, for example through `/give` from an op.

So the recipe still exists, but a locked player cannot have the item. They cannot craft it into their inventory, cannot pick it up, cannot pull it out of a chest. An unlocked player can stand at the same crafting table and produce it without anything stopping them. Only the locked player is shut out.

The `recipes` field has no effect inside an individual stage. Entries are thrown away at load time, with an error logged.

A note on the relevant config flags: the pickup block can be turned off via `lockItemPickup` in `historystages-common.toml` (default `true`). When it is off, the player can pick the item up, but the action locks still apply. The container click block is a separate toggle, `lockContainerInteraction`.

### Mob spawns (Global only)

`entities.spawnlock` stops a mob from appearing in the world at all. That is a world-global decision, so per-player does not make sense for it. It only exists for global stages.

`attacklock` is the individual-friendly version. The mob spawns normally and unlocked players can attack it, but for a locked player every attack is cancelled.

### Items, blocks, dimensions, structures

The lock mechanism is the same in both modes. What changes is who the lock applies to.

- Global: once unlocked, the content is free for every player on the server. New joiners walk into the already-unlocked state.
- Individual: every player has to unlock the stage themselves. New joiners start with nothing, regardless of what other players have done.

This is why player A can be wandering through the End while player B is still scraping by in the Stone Age. Normal for individual stages, impossible for global ones.

### Stage dependencies

A stage can require a list of conditions before it can be researched. The in-game editor shows a different set of dependency types depending on the stage type.

**Global stages** can only depend on three things:

- Items deposited at the pedestal
- Other global stages being unlocked
- An individual stage being unlocked (collective check, see below)

**Individual stages** support those three plus five per-player conditions:

- Advancements the player has finished
- XP level, with an option to consume the levels at deposit time
- Entity kill counts
- Custom stats
- Scoreboard objective values (compared against the player's own score or a named score holder)

The split exists because per-player conditions need a clearly defined "researcher". An individual scroll has a fixed owner from the moment research starts, so the check always knows which player to look at. A global scroll has no owner, so there is no single player to check those conditions against.

If you edit JSON files by hand, the runtime checker will still evaluate per-player conditions on a global stage. It just falls back on whoever last opened the pedestal menu, which is exactly why the editor leaves them out.

**The `individual_stages` dependency is collective**

It does not target a specific player. The `mode` field picks the scope:

- `all_online`: every currently online player must have the individual stage unlocked.
- `all_ever`: every player the server has ever tracked must have it.

It is the only dependency type that gates progression on the whole player base instead of a single researcher. Useful for "no one moves on until everyone is ready" style mechanics.

## Dual-Phase: when both lists target the same content

If the same item, tag, mod, dimension, structure, or `attacklock` entry appears in a global stage and in an individual stage, History Stages turns on the **Dual-Phase Lock** for it automatically.

1. Phase 1 (Global): locked for everyone until the global stage is unlocked server-wide. The recipe is also blocked during this phase, see above.
2. Phase 2 (Individual): once the global unlock happens, the recipe becomes craftable again, but each player still cannot use or pick up the item until they unlock their individual stage themselves.

Dual-phase entries get a `[Dual]` badge in the in-game editor and their own lock icon in the player's inventory.

## Pitfalls

- Same stage ID in both folders → the individual one is dropped. Global always wins on an ID collision. The debug log shows an error, and the individual stage simply does not load.
- Recipe locks inside an individual JSON disappear silently. They are stripped at load time, and the only sign is an error in `debug-*.log`.
- An individual item lock does not touch the recipe. Other players can craft the item right next to a locked player without anything happening. The lock only kicks in when the locked player tries to obtain or use the item.
- Individual unlocks do not apply retroactively. `/history individual unlock @a stage_x` only reaches players who are online at that moment. Anyone joining later has to be unlocked separately, or has to clear a dependency chain on their own.
- `/history reload` does not change any unlock state. It only re-reads stage definitions. If you rename a stage, every unlock on the old ID is gone.
