---
title: Basic Examples
sidebar_position: 4
---

Worked examples of the basic item/tag/mod locking fields, from a first stage to NBT-specific and
per-entry action locking. → [Entity & World Examples](./examples-entities-and-world.md) covers spawn
rules, fluids, zones, biomes, and structures. → [Stage Examples](/wiki/modpack-developers/stage-basics/stage-examples) has the flagship
combined example.

## Basic Item and Recipe Locking

This example demonstrates a simple stage that locks basic iron-related items and recipes.

```json
{
  "display_name": "Iron Age",
  "research_time": 60,
  "items": [
    "minecraft:iron_ingot",
    "minecraft:iron_block",
    "minecraft:raw_iron"
  ],
  "recipes": [
    "minecraft:iron_pickaxe",
    "minecraft:iron_sword",
    "minecraft:iron_chestplate"
  ]
}
```

## Tag and Mod Locking

This example shows how to lock entire categories of items using tags and how to lock all items from a specific mod, with an exception.

```json
{
  "display_name": "Industrial Era",
  "research_time": 120,
  "tags": [
    "c:ores/copper",
    "c:ingots/copper"
  ],
  "mods": [
    "create"
  ],
  "mod_exceptions": [
    "create:andesite_alloy"
  ]
}
```

## Dimension and Entity Locking

This example illustrates how to restrict access to a dimension and control entity interactions.

```json
{
  "display_name": "Nether Exploration",
  "research_time": 180,
  "dimensions": [
    "minecraft:the_nether"
  ],
  "entities": {
    "attacklock": [
      "minecraft:blaze",
      "minecraft:wither_skeleton"
    ],
    "spawnlock": [
      "minecraft:ghast"
    ]
  }
}
```

## Advanced NBT Locking

This example demonstrates how to lock items based on specific NBT data, such as an enchanted book with a specific enchantment level.

```json
{
  "display_name": "Advanced Magic",
  "research_time": 240,
  "items": [
    {
      "id": "minecraft:enchanted_book",
      "nbt": {
        "StoredEnchantments": [
          {
            "id": "minecraft:mending",
            "lvl": 1
          }
        ]
      }
    }
  ]
}
```

## Per-Entry Action Locking

This example demonstrates how `unlock_actions` can restrict only specific interactions per entry, leaving the others available even while the stage is locked. Here, players can pick up and equip iron swords but cannot attack with them, while iron pickaxes are completely locked.

```json
{
  "display_name": "Combat Training",
  "research_time": 90,
  "items": [
    "minecraft:iron_pickaxe",
    {
      "id": "minecraft:iron_sword",
      "unlock_actions": ["pickup", "equip"]
    }
  ],
  "tags": [
    {
      "id": "c:ingots/iron",
      "unlock_actions": ["pickup"]
    }
  ]
}
```
