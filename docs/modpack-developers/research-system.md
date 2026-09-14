---
title: Research System
sidebar_position: 6
---

History Stages implements an in-world research system for stage progression, designed to integrate seamlessly into modpacks.

## The Research Pedestal

The Research Pedestal functions as the primary interaction point for stage progression:

*   **Activation:** Research is initiated by placing a **Research Scroll** into the pedestal.
*   **Visual Indicators:** While active, the pedestal emits light (light level 13) and displays research progress within its GUI.
*   **Progress Persistence:** Research progress is stored directly within the scroll item's NBT data. This allows players to interrupt and resume research without loss of progress.
*   **Dependencies:** When a stage requires prerequisites, the pedestal GUI dynamically expands to reveal a dependency side panel. This panel displays a comprehensive checklist of all required conditions. For deposit-based dependencies, players can directly insert items or experience points into the pedestal to fulfill the requirements incrementally.

## Pedestal Tiers

The Research Pedestal is available in four tiers, allowing modpack creators to gate higher-level research behind more elaborate setups:

| Tier | Block | Notes |
| :--- | :--- | :--- |
| **Tier I** | `historystages:research_pedestal` | The basic single-block pedestal. |
| **Tier II** | `historystages:research_pedestal_tier_2` | Enhanced single-block variant. |
| **Tier III** | `historystages:research_pedestal_tier_3` | Wider, multi-block-looking pedestal. |
| **Tier IV** | `historystages:research_pedestal_tier_4` | The largest, for end-game research. |

Each tier is its own block; placing a higher-tier pedestal does not require dismantling the previous one. The active pedestal's tier is used for both stage gating and booster matching (see below).

### Stage Tier Gating

A stage can be restricted to research at pedestals of a certain tier via two optional fields in its JSON file:

| Field | Type | Description |
| :--- | :--- | :--- |
| `min_pedestal_tier` | Integer (1-4) | Minimum pedestal tier required to research this stage. Default `1` (works on every tier). |
| `pedestal_tier_mode` | String | Either `"min"` (this tier and higher) or `"exact"` (only this exact tier). Default `"min"`. |

If a scroll is placed in a pedestal that does not match the stage's tier requirement, the pedestal GUI displays a tier-mismatch warning and the research will not start.

## Research Boosters

Booster blocks placed directly **underneath** an active Research Pedestal modify the research running on top:

*   **Speed reduction** shortens the research time (capped at 90%, i.e. research runs up to 10x faster).
*   **Cost reduction** reduces the count of any item-deposit dependencies. The reduction is locked into the scroll on the first deposit, so it cannot be exploited by swapping boosters mid-research.

Boosters are configured in `historystages/settings/gameplay.toml` under the `researchBoosters` list. Each entry is a comma-separated string:

```
"block_id, speed_percent, cost_percent, tier, mode"
```

*   `speed_percent` / `cost_percent`: 0-90.
*   `tier`: minimum pedestal tier the booster works under (1-4).
*   `mode`: `min` (this tier and higher) or `exact` (only this tier).

Booster recipes registered with JEI/EMI show players which blocks are eligible and what they do.

Example:

```
researchBoosters = [
    "minecraft:redstone_block, 25, 0, 1, min",
    "minecraft:diamond_block, 50, 25, 2, min",
    "minecraft:beacon, 75, 50, 4, exact"
]
```

On Tier I and Tier II pedestals only the single block directly underneath is checked. Tier III and Tier IV pedestals are multi-block structures, so the mod scans **both** positions underneath them (the foot block and the head block) and applies only the strongest matching booster — speed reduction wins, with cost reduction as the tie-breaker, and the foot block wins on a complete tie. Boosters whose `tier` / `mode` does not match the current pedestal tier are ignored entirely.

## Redstone / Comparator Output

The Research Pedestal supports comparator output, allowing redstone circuits to react to research progress.

| Signal | Condition |
| :--- | :--- |
| `0` | No scroll inserted, or research has not started yet |
| `1–14` | Research in progress — scales linearly with progress |
| `15` | Research complete |

The signal jumps to `1` as soon as a scroll is inserted and research begins, then rises continuously until it reaches `15` on completion. This lets a comparator drive proportional redstone — for example to fill a display, trigger a sound, or gate a door that only opens when research finishes.

On multi-block pedestals (Tier III / IV) both the foot block and the head block emit the same signal.

## Research Scrolls

Research Scrolls are key items for unlocking stages. Different types of scrolls facilitate various progression designs:

| Scroll Type | Description |
| :--- | :--- |
| **Stage Scroll** | Linked to a specific stage ID (e.g., `"bronze_age"`). Completing research with this scroll unlocks the corresponding stage. |
| **Individual Scroll** | Bound to a specific player via UUID. Only the designated owner can use this scroll for research, enabling personalized progression paths. Individual scrolls show the owner's name in the tooltip and pedestal GUI. Locked individual scroll slots are grayed out for other players. |
| **Creative Scroll** | A special scroll that, when researched, instantly unlocks all available stages. This is intended for testing or creative mode use. |

## Configuring the Scroll Tooltip

The tooltip shown on a Research Scroll is fully configurable via `historystages/settings/gameplay.toml` under `scroll_tooltip.lines` (also editable in-game through a dedicated screen in the [Config Editor](./in-game-editor.md#config-editor)). Each entry is a pipe-delimited string: `id|enabled|spacerBefore|style|text`.

*   `id` — which section this line controls. The item name (`name`) is always shown first and cannot be reordered. The movable sections are, in configurable order: `individual_badge`, `owner`, `info1`, `info2`, `tier`, `dependencies`. The dependency block itself is built from further sub-templates (`dep.header`, `dep.group_header`, `dep.item`, `dep.stage`, `dep.individual`, `dep.xp`, `dep.separator`) and icon/color options (`dep.icon_fulfilled`, `dep.icon_open`, `dep.icon_unknown`, `dep.color_fulfilled`, `dep.color_open`).
*   `enabled` — whether the section is shown at all.
*   `spacerBefore` — whether a blank line is inserted before the section.
*   `style` — `+`-joined Minecraft chat formatting names (e.g. `gray+italic`). Leave empty to use the built-in default color.
*   `text` — custom text for the section, or empty to use the built-in translation.

Unknown IDs are ignored, and any known ID missing from the list falls back to its built-in default — existing configs keep working as new sections are added in future updates.

**AND and OR are printed in two different places, because they mean two different things.** `dep.group_header` sits above a group and says how that group's own entries combine — *All of* or *One of*. `dep.separator` sits between two groups and always says AND, because groups are always joined by AND. They used to be one line, which printed one group's logic in the gap before the next and made an OR group look like it applied to everything after it.

The related `scroll_tooltip.hideFulfilledDependencies` toggle hides dependency lines the player has already met from the list, so only outstanding requirements are shown. Visibility is worked out before a switched-off line drops away, so a met entry whose line is hidden still settles its OR group.

## The Open Scroll Document

Once a Research Scroll has been researched (or an already-unlocked scroll is opened), it becomes an **open scroll** — a distinct item that, when used, opens a dedicated book-style GUI (the "open scroll document") describing the stage in full: an overview page plus `items`, `creatures`, and `world` chapters. Locked entries inside the document are shown as silhouettes by default (`open_scroll.lockedDisplay = "obscured"`), or normally if set to `"visible"`.

The **world** chapter is the catch-all for everything that is neither an item nor a creature, grouped under its own headings:

| Group | Contents |
| :--- | :--- |
| Dimensions, Structures, Biomes | As before. |
| Zones | By name. A zone nobody has named has nothing to show and is left out; the same name used in two worlds appears once. |
| Fluids | Under their real in-game name rather than their registry ID. |
| Merchant Professions | The profession, with the gated levels named. |
| Trade Offers | The single offers. The merchant, the price and the levels are in the tooltip; an offer that applies to every merchant says so. |
| Merchant Levels | Levels gated across every profession at once. |

A group with nothing in it gets no heading at all.

Because the chapter is no longer only about places, its counter on the overview page reads **world entries** rather than naming locations.

Recipes, mods, mod exceptions and addon categories are deliberately **not** on the scroll. A scroll is a player-facing description of what a stage holds back, and those four are authoring concepts rather than things a player can point at.

Chapters, the overview layout, search, entry IDs, sort order, and page ink colors are all configurable under `open_scroll` in `historystages/settings/gameplay.toml` — see [Configuration](./configuration.md). An open scroll can be resealed back into a closed Research Scroll via a `reseal_scroll` recipe.

### Reading from a Lectern

An open scroll can be placed into a **Lectern** like a book. Right-clicking the lectern opens the same open scroll document GUI directly from the block, letting players read scroll contents without holding the item — useful for library or archive setups in a modpack. The lock system still applies: a lectern inside a locked area cannot be read from until it is unlocked.

## Scroll Acquisition

History Stages does not provide default crafting recipes for the Research Pedestal or Research Scrolls. Modpack creators are responsible for defining how these items are obtained within their modpack's progression system. Common methods include:

*   **FTB Quests:** Scrolls can be distributed as rewards for completing questlines.
*   **Loot Tables:** Scrolls can be added as drops from mobs or as treasure in structures.
*   **Custom Recipes:** Scripting mods such as [KubeJS](https://www.curseforge.com/minecraft/mc-mods/kubejs) or [CraftTweaker](https://www.curseforge.com/minecraft/mc-mods/crafttweaker), or datapacks, can be used to create custom crafting recipes. See the [Recipe Examples](./recipe-examples.md) page for copy-paste templates.
- **Admin Commands:** For administrative purposes or testing, scrolls can be given to players using the command:
  - **Pre-1.20.5:** `/give @s historystages:research_scroll{StageResearch:"your_stage_id"}`
  - **1.20.5+ / 1.21.x:** `/give @s historystages:research_scroll[minecraft:custom_data={StageResearch:"your_stage_id"}]`

  Replace `"your_stage_id"` with the actual ID of the stage to be linked to the scroll, e.g., `"bronze_age"`.