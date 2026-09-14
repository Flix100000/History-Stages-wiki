---
title: In-Game Editor
sidebar_position: 1
---

History Stages features a comprehensive in-game suite for modpack creators, streamlining the management of progression.

## Key Capabilities

The in-game editor provides a powerful set of tools for stage management, allowing modpack creators to configure their progression systems without ever leaving the game or manually editing JSON files:

*   **Stage Management:** Create new stages from scratch, edit existing configurations, duplicate stages for rapid iteration, and delete stages directly within the Minecraft client. New stages prompt for a display name at creation time.
*   **Stage Settings:** A dedicated settings screen for managing core stage metadata such as Stage ID, Display Name, and Research Time, keeping these properties separate from the lock entries. The same screen also exposes the [Stage Tier Gating](/wiki/modpack-developers/in-game-tools/research-system#stage-tier-gating) controls (`min_pedestal_tier` and `pedestal_tier_mode`), and the [Lose on Death](/wiki/modpack-developers/locking-zones/stage-behavior#lose-on-death) toggle for individual stages, so these can be configured without editing JSON.
*   **Folders & Organize Mode:** Stages can be sorted into nested [folders](/wiki/modpack-developers/locking-zones/stage-behavior#folders) for large modpacks. A dedicated organize mode on the Stage Overview screen lets you tick multiple stages and folders and drag-and-drop them onto a target folder in one move; moving a folder brings its contents along automatically.
*   **Per-Player Unlocking:** The Stage Overview screen can unlock or relock an individual stage for one specific online player, or for every online player at once, without going through the `/history individual unlock` command. This uses the same server-side logic as the command (sync, notifications, item cleanup on relock), so behaviour is identical — it only works for players who are currently online.
*   **Searchable Registries:** Efficiently find and select items, fluids, recipes, entities, dimensions, biomes, structures and villager trades. The editor features a unified search and filter bar, supports both full registry browsing and direct selection from the player's inventory, and offers a multi-select mode with a dedicated "Selected" tab for bulk operations. The entity picker supports multi-select in the same way as the item picker. The recipe picker works differently enough to have its own section below.
*   **Dependency Editor:** A dedicated visual interface for configuring stage prerequisites. Modpack creators can easily set up requirements such as deposited items, item tags, Entity Kills, XP Levels, Statistics, Scoreboard Objectives, or other Individual Stages, and organize them into logical groups.
*   **Dependency Graph:** A read-only, OP-only visual overview of all stage dependencies in the modpack, rendered as an interactive node graph. Useful for spotting long dependency chains, missing links, or unintended cycles at a glance. Accessible from the Stage Overview screen. This is distinct from the player-facing **[Stage Graph](/wiki/modpack-developers/in-game-tools/stage-graph)**, which is a separate, configurable feature shown to regular players from the pause menu when enabled.
*   **NBT Editor:** A specialized visual editor designed for defining complex NBT (Named Binary Tag) criteria for item locking. It simplifies the process by providing autocompletion and real-time validation warnings to prevent errors. On 1.21+ the editor also accepts arbitrary data components alongside the legacy NBT fields, and an inventory slot's current state can be imported directly with **Ctrl-click** instead of being transcribed by hand.
*   **Lock Actions Editor:** A visual editor for restricting individual entries to specific interactions (such as use, attack, equip, or pickup) instead of locking them completely, configurable per item, tag, or mod entry.
*   **Validation & Overlap Warnings:** The editor actively identifies and warns about potential overlaps between global and individual stages, ensuring logical consistency in modpack progression. Entries that trigger the dual-phase lock system are clearly marked with a `[Dual]` badge.
*   **Config Editor:** Access and modify all mod settings across `historystages/settings/gameplay.toml`, `historystages/settings/visual.toml`, and `graph.toml` directly within the game, organized into separate Common, Client, and Graph tabs with a convenient reset-to-defaults option. This includes the [Research Boosters](/wiki/modpack-developers/in-game-tools/research-system#research-boosters) list, so booster blocks and their tier requirements can be set up in-game without touching the TOML file.
*   **Feedback:** Save, duplicate, delete, and similar actions surface styled toast notifications instead of generic chat messages so the editor flow stays uninterrupted.

## The Recipe Picker

The recipe picker is one panel with two columns. The left is a grid of everything recipes produce;
clicking one fills the right with that item's recipes, drawn as cards in the recipe's real shape.
A shaped recipe shows its pattern with the holes where the recipe has holes, which is the only way
to tell two recipes apart that use the same ingredients in a different arrangement.

Click cards to select them. Selection survives moving to another item, so several recipes across
several items can be gathered before pressing **Add**. The **Selected** tab lists what is currently
chosen; deselecting there works on a snapshot, so cards do not jump around under the cursor. The
**Select all** and **Deselect all** buttons act on what the right column is showing at that moment,
not on the whole pack.

Search matches an item's name, its id, and the recipe types it has — typing `smelting` finds
everything with a furnace recipe. The namespace filters and `@namespace` searches read **the
recipe's** id, not its output item's. That distinction matters: a KubeJS or CraftTweaker recipe
almost always outputs a vanilla item, so filtering by the item would hide precisely the recipes a
pack author wrote themselves.

### Fluids

Recipes that produce a fluid and no item appear in the picker too. Their fluids sit in the same
grid as the items, after them, drawn with the fluid's own texture; searching for the fluid by name
is the quickest way there. Clicking one lists the recipes that could be producing it.

**What gets stored is always a recipe id.** Going in through a fluid does not create a fluid lock;
it only makes those recipes reachable, since a recipe with no item result appears nowhere else in
the editor and there is no way to type a recipe id by hand.

A card shows a recipe's fluid ingredients in a row of their own beneath the item pattern, kept
separate on purpose: nothing in a recipe says where in the pattern a fluid belongs, so putting one
in a grid cell would claim a position that is not known. Amounts are not shown either, for the
same reason — the information is not there to read.

### The purple mark, and the question mark

Whether a fluid goes into a recipe or comes out of it is not something Minecraft can be asked. It
is read from the way the recipe is written, and mods spell it differently: some write
`ingredients` and `results`, others `input` and `output`, others `ingredient` and `result`. A
spelling that matches none of them leaves the side unknown, and that is what the marks are about.

*   **A purple edge on a grid entry** means no recipe under it is known to produce that fluid —
    the entry rests entirely on the possibility. The recipes listed are worth checking against a
    recipe viewer before locking them.
*   **A purple edge on a slot inside a card** means that one fluid could not be placed on either
    side. The lock treats such a fluid as both ingredient and result, so the card shows it rather
    than hiding it.
*   **A question mark in a card's result slot** means nothing certain belongs there. The recipe
    makes no item, and no fluid could be confirmed as its output.

### When a recipe is not listed at all

A recipe appears if it produces an item, or a fluid it could be producing. Three kinds fall
through:

*   recipes whose fluids were all read, with certainty, as ingredients — there is nothing to file
    them under;
*   recipes with no recognisable output of any kind;
*   recipes that cannot be written back into their own text form, which is how the fluids are read
    in the first place.

**The lock is less strict than the picker.** Gating a fluid still gates every recipe that touches
it, including the ones the picker leaves out, because the lock counts an unreadable side as both.
A recipe missing from the picker is therefore not a recipe missing from the lock.

### On individual stages

The picker offers fewer recipes on an individual stage, and says so above the list. A per-player
lock works by asking who is crafting, and only a station a player stands at with its screen open
can answer. Furnaces, hoppers and autocrafters resolve recipes with nobody there, so their recipe
types are not offered — an entry for them would be written to the stage file and then do nothing.

## The Zone Editor

:::warning
**Beta.** The zone category is younger than the rest and still growing.
:::

Zones are the one lock type with no registry to pick from — the area has to be drawn. The zone tab lists a stage's zones with a one-line summary of what each does (`3 shapes · damage · barrier · inverted`), and **Edit** opens the zone's own screen.

That screen has four sections. **General** holds the name, the world, and the list of shapes. **Effect** holds the message, the damage and the potion effects. **Protection** holds the interaction switches, the hard barrier and the spawn suppression. **Display** holds the two visibility switches.

### Drawing the shapes

There are two ways in, and they meet in the same place:

*   **Mark it in the world.** Sneak + left click with the marker item sets the first corner, sneak + right click the second (the item is named in [`[zone_lock]`](/wiki/modpack-developers/server-integration/gameplay-toml#zone_lock)); `/history zone mark` does the same without an item. Back in the editor, **Marked in the world** shows the selection and **Use it** turns it into a cube.
*   **Type it.** **Add shape** offers a cube, a sphere or a cylinder, and **Numbers** opens the coordinates for editing by hand — which is how you set a corner in a place you would rather not stand.

A zone is the union of its shapes, so an awkward area is built by dropping several over each other rather than by finding one box that fits.

### The map

Every zone screen carries a small map; clicking it opens the large one. It can be read flat from above or tilted into a **3D** view, dragged to turn and scrolled to zoom, and it has buttons to jump to the player (**to me**) or to frame the whole zone (**to zone**). A readout under it names the coordinates the cursor is over. A zone in a world the player is not currently in is drawn without terrain — the shapes are still positioned correctly, there is simply nothing to draw them on.

## The Spawn Rule Dialog

A spawn lock entry is a rule rather than a checkbox, and the editor opens it as a dialog. The lock **phase** sits at the top — *while locked* or *after unlock* — and the rest is four tabs, each with a count badge saying how much of it is set:

1.  **Sources** — the six spawn sources.
2.  **Location** — dimensions and biomes (each *any* / *only in* / *not in*, with a picker), whether the sky is visible, and a height range.
3.  **Time & Weather** — day or night, a light range, the weather, and the moon phase.
4.  **Extra biomes** — biomes the entity should *additionally* spawn in, with an optional frequency, and a switch to ignore the entity's own placement rules.

A line under the tabs spells the whole rule out in words, so the thing being saved can be read back in one sentence rather than reconstructed from four tabs. Conditions that are not set are greyed out.

→ [Lock Types](/wiki/modpack-developers/locking-zones/entity-and-trade-locks#entity-control) has what each of those writes into the stage file, and the four limits worth knowing about extra biomes.

## Accessing the Editor

1.  Access to the editor requires **Permission Level 2 (OP)** on the server or in single-player mode.
2.  The editor can be opened via a dedicated button located in the **Pause Menu**.

## Multiplayer Synchronization

In multiplayer environments, changes made through the in-game editor are saved immediately and synchronized across all connected administrators, ensuring consistent configurations.
