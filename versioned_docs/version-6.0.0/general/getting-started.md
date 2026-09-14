---
title: Getting Started
sidebar_position: 2
---

History Stages is a versatile progression and gatekeeping mod for Minecraft on **Forge**, **NeoForge**, and **Fabric** platforms. This document outlines the installation process and initial steps for creating stages.

## Installation

To integrate History Stages into a modpack, the following dependencies are required:

*   **Required:** [Lootr](https://modrinth.com/mod/lootr) (CurseForge: [Lootr](https://www.curseforge.com/minecraft/mc-mods/lootr)). Lootr is necessary for the correct handling of locked chest contents in multiplayer environments.
*   **Recommended:**
    *   [JEI (Just Enough Items)](https://www.curseforge.com/minecraft/mc-mods/jei) or [EMI (Everything Modded Items)](https://modrinth.com/mod/emi) for visual recipe overlays. These mods display locked recipes with a "Locked" indicator.
    *   [Jade](https://modrinth.com/mod/jade) (CurseForge: [Jade](https://www.curseforge.com/minecraft/mc-mods/jade)) for enhanced in-game tooltips. Jade displays required stage information when players look at locked blocks, entities, armor stands, or item frames.

## Creating Stages

Stages can be defined and managed using two methods:

1.  **In-Game Editor (Recommended for Modpack Creators):** This graphical interface allows for the creation, modification, duplication, and deletion of stages directly within Minecraft. It includes searchable lists for items, recipes, entities, and dimensions, as well as a visual NBT editor for advanced item locking. The editor is accessible via a dedicated button in the pause menu (requires OP permissions).
2.  **Manual JSON Configuration:** Stages can be defined by creating `.json` files in specific directories after the game has been run once with History Stages installed:
    *   **Global Stages:** Files are placed in `config/historystages/global/`. These stages apply to all players on the server.
    *   **Individual Stages:** Files are placed in `config/historystages/individual/`. These stages track progression on a per-player basis.

### Example Stage Configuration (JSON)

An example of a basic "Bronze Age" stage that locks iron-related content:

```json
{
  "display_name": "Bronze Age",
  "research_time": 60,
  "items": ["minecraft:iron_ingot"],
  "tags": ["c:ores/iron"],
  "recipes": ["minecraft:iron_pickaxe"]
}
```

Upon loading and activation, players will be prevented from using or accessing iron ingots and crafting iron pickaxes until the "Bronze Age" stage is unlocked.

## Research Pedestal and Scroll Recipes

History Stages does not include default crafting recipes for the **Research Pedestal** or **Research Scrolls**. Modpack creators are responsible for defining how these items are acquired within their modpack. This can be achieved using:

*   **KubeJS**
*   **CraftTweaker**
*   **Datapacks**
*   **FTB Quests rewards**
