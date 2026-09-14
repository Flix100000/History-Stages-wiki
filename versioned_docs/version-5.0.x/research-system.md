---
id: research-system
title: Research System
---

History Stages implements an in-world research system for stage progression, designed to integrate seamlessly into modpacks.

## The Research Pedestal

The Research Pedestal functions as the primary interaction point for stage progression:

*   **Activation:** Research is initiated by placing a **Research Scroll** into the pedestal.
*   **Visual Indicators:** While active, the pedestal emits light (light level 13) and displays research progress within its GUI.
*   **Progress Persistence:** Research progress is stored directly within the scroll item's NBT data. This allows players to interrupt and resume research without loss of progress.
*   **Dependencies:** When a stage requires prerequisites, the pedestal GUI dynamically expands to reveal a dependency side panel. This panel displays a comprehensive checklist of all required conditions. For deposit-based dependencies, players can directly insert items or experience points into the pedestal to fulfill the requirements incrementally.
*   **Owner Protection:** Only the scroll owner can interact with their scroll slot in the pedestal.

## Research Scrolls

Research Scrolls are key items for unlocking stages. Different types of scrolls facilitate various progression designs:

| Scroll Type | Description |
| :--- | :--- |
| **Stage Scroll** | Linked to a specific stage ID (e.g., `"bronze_age"`). Completing research with this scroll unlocks the corresponding stage. |
| **Individual Scroll** | Bound to a specific player via UUID. Only the designated owner can use this scroll for research, enabling personalized progression paths. Individual scrolls show the owner's name in the tooltip and pedestal GUI. Locked individual scroll slots are grayed out for other players. |
| **Creative Scroll** | A special scroll that, when researched, instantly unlocks all available stages. This is intended for testing or creative mode use. |

## Scroll Acquisition

History Stages does not provide default crafting recipes for the Research Pedestal or Research Scrolls. Modpack creators are responsible for defining how these items are obtained within their modpack's progression system. Common methods include:

*   **FTB Quests:** Scrolls can be distributed as rewards for completing questlines.
*   **Loot Tables:** Scrolls can be added as drops from mobs or as treasure in structures.
*   **Custom Recipes:** Scripting mods such as [KubeJS](https://www.curseforge.com/minecraft/mc-mods/kubejs) or [CraftTweaker](https://www.curseforge.com/minecraft/mc-mods/crafttweaker), or datapacks, can be used to create custom crafting recipes.
*   **Admin Commands:** For administrative purposes or testing, scrolls can be given to players using the command:
    `/give @s historystages:research_scroll{StageResearch:"your_stage_id"}`
    (Replace `"your_stage_id"` with the actual ID of the stage to be linked to the scroll, e.g., `"bronze_age"`).
