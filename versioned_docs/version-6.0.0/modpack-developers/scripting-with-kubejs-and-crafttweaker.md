---
title: Scripting (KubeJS & CraftTweaker)
sidebar_position: 11
---

History Stages talks to both scripting mods. A script can **read** stage state, **change** it, and
**react** when it changes — in JavaScript through KubeJS, in ZenScript through CraftTweaker, with
the same capabilities on both sides.

A script cannot **define** stages or decide what a stage locks — which items, tags, mods, recipes,
dimensions, structures, biomes and mobs belong to a stage is set in the in-game editor, and only
there.

Neither mod is required. Install one, both, or neither; History Stages loads its bridge only for
the one that is present.

---

## Before 6.0.0 and from 6.0.0 on

This page is the one place in the wiki that documents an older version alongside the current one,
because packs written against the old behaviour still work and there is no reason to rewrite them.

| | Before 6.0.0 | From 6.0.0 |
|---|---|---|
| React to an unlock | `ForgeEvents.onEvent('net.bananemdnsa.historystages.api.stage.StageEvent$Unlocked', …)` | `HistoryStagesEvents.unlocked(event => …)` |
| React to one specific stage | filter by hand inside the listener | `HistoryStagesEvents.unlocked('bronze', event => …)` |
| Ask whether a stage is unlocked | not possible | `HistoryStages.isUnlocked('bronze')` |
| Unlock or relock a stage | not possible | `HistoryStages.unlock('bronze')` |
| Ask whether something is gated | not possible | `HistoryStages.isLocked('items', 'minecraft:diamond', player)` |
| CraftTweaker | nothing at all | `mods.historystages.HistoryStages` |

**The old form still works.** `ForgeEvents.onEvent` with the class name as a string keeps firing;
it is simply no longer the way to do it. The reason to move is that nothing checks that string —
misspell it, or upgrade to a version where the class moved, and the listener silently never runs.
The class *did* move in 6.0.0 — from `net.bananemdnsa.historystages.events.StageEvent` to
`net.bananemdnsa.historystages.api.stage.StageEvent` — so a script carrying the old string needs
the new one. `HistoryStagesEvents` cannot go wrong that way.

---

## KubeJS

### Reacting to stage changes

In `server_scripts`:

```javascript
HistoryStagesEvents.unlocked(event => {
    console.log(event.stage + ' — ' + event.displayName)
})

// Only this one stage. The first argument is optional.
HistoryStagesEvents.unlocked('bronze', event => {
    server.runCommandSilent('say The Bronze Age begins')
})

HistoryStagesEvents.locked(event => { … })

HistoryStagesEvents.individualUnlocked(event => {
    // event.player may be null — an individual stage can be relocked by a timer
    // while that player is offline.
    if (event.player) event.player.tell('You now know ' + event.displayName)
})

HistoryStagesEvents.individualLocked(event => { … })
```

All four fire from **every** path that changes a stage: the in-game editor, the Research Pedestal,
`/history stage unlock`, an auto-trigger, an FTB Quests reward, another mod's API call. There is
one code path underneath and the events sit in it.

### Reading and changing state

```javascript
// Reading
HistoryStages.isUnlocked('bronze')                  // global stage, world-wide
HistoryStages.isUnlockedFor(player, 'tutorial')     // individual stage, this player
HistoryStages.hasStage(player, 'bronze')            // either scope, whichever the id belongs to

HistoryStages.stages()                              // every defined global stage id
HistoryStages.individualStages()                    // every defined individual stage id
HistoryStages.unlockedStages()                      // the global ones currently open
HistoryStages.unlockedStagesFor(player)             // this player's individual ones
HistoryStages.categories()                          // every valid lock-category id

// Changing — returns true when something actually changed
HistoryStages.unlock('bronze')
HistoryStages.lock('bronze')
HistoryStages.unlockFor(player, 'tutorial')
HistoryStages.lockFor(player, 'tutorial')
```

`unlock` and friends go through the same code the editor and the pedestal use, so a script unlock
is a real unlock: it is saved, synced to every client, announced with the configured chat line,
sound and toast, it drops the structure and biome caches, it reloads recipes, and it fires the
events above.

### Asking whether something is gated

```javascript
HistoryStages.isLocked('items', 'minecraft:diamond', player)
HistoryStages.isLocked('recipes', 'kubejs:crafting_shaped_7')   // no player: recipes gate globally
HistoryStages.missingStages('items', 'minecraft:diamond', player)   // what is still needed
```

The first argument is a **lock category id**. Use it to gate your own machine, your own GUI or
your own tooltip the same way the mod gates its own content.

Category ids are namespaced. The sixteen built-in ones live under `historystages:`, and you may
leave that off — `'items'` and `'historystages:items'` mean the same thing, the way a bare item id
means `minecraft:`. A category added by an **addon mod** must be named in full (`'hsdemo:relics'`),
because guessing a namespace for it would break the day two addons pick the same short name.

`HistoryStages.categories()` lists what is actually registered, in full:

```
historystages:items          historystages:mods            historystages:recipes
historystages:tags           historystages:mod_exceptions  historystages:dimensions
historystages:structures     historystages:biomes          historystages:attacklock
historystages:spawnlock      historystages:interactionlock historystages:fluids
historystages:trades         historystages:trade_professions
historystages:trade_levels   historystages:zones
```

### Client scripts

`client_scripts` get a read-only `HistoryStages` that answers from the state the client already
has, which is what you want for a tooltip or a HUD element:

```javascript
HistoryStages.isUnlocked('bronze')
HistoryStages.isUnlockedIndividually('tutorial')
HistoryStages.hasStage('bronze')                    // either scope
```

Nothing that changes state exists there. Calling `HistoryStages.unlock(...)` in a client script is
an error, not a silent no-op — you find out immediately instead of wondering why nothing happened.

`startup_scripts` get nothing at all: they run before a world exists, so every answer about stage
state would be a lie rather than a "no".

---

## CraftTweaker

```zenscript
import mods.historystages.HistoryStages;

// Reading
HistoryStages.isUnlocked("bronze");
HistoryStages.isUnlockedFor(player, "tutorial");
HistoryStages.stages();
HistoryStages.unlockedStages();
HistoryStages.categories();

// Changing
HistoryStages.unlock("bronze");
HistoryStages.lock("bronze");
HistoryStages.unlockFor(player, "tutorial");
HistoryStages.lockFor(player, "tutorial");

// Asking whether something is gated — the player is optional, the namespace is too
HistoryStages.isLocked("items", "minecraft:diamond", player);
HistoryStages.isLocked("recipes", "crafttweaker:my_recipe");
HistoryStages.missingStages("historystages:items", "minecraft:diamond", player);
```

### On the player

```zenscript
player.hasStage("bronze");
```

Asks both scopes, which is what "does this player have this stage" usually means. If you are
coming from GameStages, this is the call you already know.

### Reacting to stage changes

```zenscript
import mods.historystages.HistoryStages;

HistoryStages.onStageUnlocked(event => {
    println("Stage unlocked: " + event.stage + " — " + event.displayName);
});

HistoryStages.onStageLocked(event => { … });

HistoryStages.onIndividualStageUnlocked(event => {
    // event.player may be null when that player is offline
    println(event.stage + " for " + event.player.name);
});

HistoryStages.onIndividualStageLocked(event => { … });
```

Listeners are dropped and re-registered on every `/reload`, so a reloaded script is subscribed
once rather than twice.

---

## When something is wrong

Mistyped ids do not crash the server. The call returns `false` (or an empty list), and History
Stages writes one line to the log:

| What you did | What you get |
|---|---|
| Unknown stage id | `a script used unknown stage id 'bronce'. Known global stages: bronze, iron` |
| Individual stage passed to `unlock` / `isUnlocked` | a line naming the scope and the method to use instead |
| Global stage passed to `unlockFor` / `isUnlockedFor` | the same, the other way round |
| Unknown lock category | `unknown lock category 'itemz'. Known categories: historystages:items, …` |
| Any call while no server is running | one line saying so |

**Each distinct mistake is logged once**, not once per call — a query inside a tick handler would
otherwise write the same line sixty times a second. That counting is shared between the two
languages: if a KubeJS script and a ZenScript script make the same mistake, you get one line, not
two. The counter resets on `/reload`, so a corrected script gets to complain again about anything
it still has wrong.

The lines go to the normal game log (`logs/latest.log`), next to the KubeJS and CraftTweaker
errors — not into the History Stages stage-load report, which is written once at startup and is
not where you look when a script misbehaves.

Every changing call returns a boolean, so a script can check rather than assume:

```javascript
if (!HistoryStages.unlock('bronze')) {
    console.warn('bronze was already unlocked, or the id is wrong')
}
```

---

## A note on script-generated recipes

KubeJS builds recipe ids out of the order things appear in your scripts —
`kubejs:crafting_shaped_7` is the seventh shaped recipe it saw. Reorder the script and the
numbering shifts, which silently breaks any stage that gated the old id.

Since 6.0.0 History Stages checks this. After every world load and every `/reload` it compares
the recipe ids in your stages against the recipes actually loaded, and writes a warning for each
one that is missing. In the editor, those entries are shown in red on the stage's Recipes tab.

Nothing is removed — a recipe can be legitimately absent for a while — but you find out on the
same day instead of when a player asks why they can craft something they should not.

The way to avoid it entirely is to give your recipes explicit ids:

```javascript
ServerEvents.recipes(event => {
    event.shaped('4x minecraft:stick', ['A', 'A'], { A: 'minecraft:oak_planks' })
        .id('mypack:sticks')
})
```

Then the id is yours, it never moves, and picking it in the editor sticks.

---

**See also:** [Stage State & Events](../addon-developers/stage-state-and-events.md) for the Java side of the same events ·
[Lock Categories](../addon-developers/lock-categories.md) for what the category ids mean ·
[Mod Compatibility](./mod-compatibility.md) for the other integrations
