---
id: stage-examples
title: Stage Examples
---

This page provides various examples of stage configurations in JSON format to demonstrate the capabilities of History Stages. These examples can be used as templates for creating custom progression systems.

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
    "forge:ores/copper",
    "forge:ingots/copper"
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

## Comprehensive Stage Example

This example combines multiple locking mechanisms into a single, complex stage definition.

```json
{
  "display_name": "The End Game",
  "research_time": 300,
  "items": [
    "minecraft:ender_pearl",
    "minecraft:ender_eye"
  ],
  "tags": [
    "forge:end_stones"
  ],
  "recipes": [
    "minecraft:end_crystal"
  ],
  "dimensions": [
    "minecraft:the_end"
  ],
  "structures": [
    "minecraft:end_city"
  ],
  "entities": {
    "attacklock": [
      "minecraft:enderman"
    ],
    "spawnlock": [
      "minecraft:ender_dragon"
    ]
  },
  "dependencies": [
    {
      "type": "xp_level",
      "level": 30
    },
    {
      "type": "entity_kills",
      "entity": "minecraft:enderman",
      "count": 50
    }
  ]
}
```
