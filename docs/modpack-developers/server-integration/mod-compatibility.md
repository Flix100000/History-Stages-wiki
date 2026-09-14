---
title: Mod Compatibility
sidebar_position: 5
---

History Stages recognises a number of widely used mods and adjusts its behaviour when they are
present. Nothing here needs configuring: install the mod, and the integration is on.

One of them is not optional — **Lootr is a required dependency** and History Stages will not load
without it.

| Mod | What History Stages does with it |
| :--- | :--- |
| **JEI (Just Enough Items) / EMI (Everything Modded Items)** | History Stages integrates with these recipe viewers to provide visual feedback on locked content. Locked items are marked with a padlock icon in inventories and recipe displays. Locked recipes display a "Locked" overlay instead of being hidden, indicating content that is not yet accessible. Two optional common-config toggles, `hideLockedItemsInJei` and `hideLockedRecipesInJei`, fully remove locked items from the JEI ingredient panel and hide recipes whose output is locked, respectively. Research Booster blocks are registered as their own JEI/EMI recipe category so players can see which blocks accelerate research and by how much. The JEI and EMI integrations are at feature parity with one another. |
| **FTB Quests** | History Stages adds native "History Stage" task and reward types directly into the FTB Quests editor. Tasks and rewards select their target stage through a searchable stage picker screen, making it easy to find the right stage in large modpacks without knowing the exact ID. The quest book displays each stage's configured display name and per-stage icon. Tasks are event-driven and auto-complete when the corresponding stage is unlocked; a `negate` flag inverts the condition so the task completes when the stage is *locked* instead. Task progress resets automatically if the stage is relocked. Rewards can be configured to either unlock or relock stages. |
| **Jade** | This integration provides enhanced in-game tooltips. When players look at blocks, entities, armor stands, or item frames affected by History Stages, Jade displays information about the required stage. |
| **Lootr** | **Lootr is a required dependency** for History Stages. It ensures the correct handling of locked loot in multiplayer chests, preventing exploits and maintaining progression integrity. |
| **Spell Engine / Better Combat** | When either of these combat mods is present, items that are locked for a player are treated as inert — they deal no spell damage and cannot be used to initiate Better Combat attacks. This prevents players from gaining combat benefits from locked items through mod interactions that bypass the normal use-lock. |
| **Curios API** | When Curios is present, History Stages extends its item-locking checks to Curio slots, preventing players from equipping locked items into trinket, ring, belt, or other Curios-managed slots. *Forge / NeoForge only — Curios does not exist for Fabric.* |
| **Accessories** | When the Accessories mod is present, History Stages registers a `CanEquipCallback` analogous to the Curios integration. Locked items are refused at equip time in accessory slots, with the same actionbar feedback used elsewhere. Vanilla armor slots rendered through Accessories' wrapping container UI are also covered. |

---

## Fluid locks and other mods' tanks

A [fluid lock](/wiki/modpack-developers/locking-zones/world-locks#fluid-locking) reaches further into other mods than most lock types, so it is worth knowing where it stops.

**What it does reach:** any item that reports what it is carrying. That is the vanilla bucket, every modded bucket, and every filled tank item in the pack, without a single item ID being listed. It also reaches the recipes — gating a fluid takes every recipe producing or consuming it out of crafting and out of the recipe browser, including recipes belonging to other mods' machines.

**What it does not reach:**

*   **Pumps, pipes and placed tanks.** A player who already has the fluid in a tank can keep moving it. Gating that would mean taking their fluid interface away from other mods' blocks, which crashes inside foreign code and cannot be caught from outside. In practice it rarely matters, because with the recipes and the buckets gone there is no way to fill the first tank.
*   **Foreign display names.** A name or tooltip override on a fluid entry is applied to the container item, so another mod's tank GUI — and Jade's tank readout — keep showing the fluid's real name.

**KubeJS and CraftTweaker** are integrations too, but they are big enough to have their own page:
**→ [Scripting (KubeJS & CraftTweaker)](/wiki/modpack-developers/server-integration/scripting-with-kubejs-and-crafttweaker)**.

---

## Making your own mod work with History Stages

Writing a mod rather than a pack? Two starting points:

- **[Stage State & Events](/api/stage-state-and-events)** — read and change stage state, and react when
  it changes. This is what you want if your mod only needs to *know* about stages.
- **[Addon Development](/api/addon-development)** — register your own gated content, requirements,
  auto-triggers, per-stage settings and config sections, each with a native tab in the in-game
  editor. NeoForge, 6.0.0 and up.
