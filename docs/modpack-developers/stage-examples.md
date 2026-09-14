---
title: Stage Examples
sidebar_position: 6
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

## Per-Source Spawn Locking

This example demonstrates how `spawnlock` entries can restrict only specific spawn sources per entity. Wither skeletons cannot spawn naturally or from structures (so Nether fortresses produce none), but spawners and spawn eggs still work — useful for letting modpack creators distribute the mob through curated encounters while the stage remains locked.

```json
{
  "display_name": "Nether Hunting",
  "research_time": 150,
  "entities": {
    "spawnlock": [
      "minecraft:ghast",
      {
        "id": "minecraft:wither_skeleton",
        "unlock_sources": ["spawner", "spawn_egg"]
      }
    ]
  }
}
```

## A Spawn Rule With Conditions

The same entry can say a great deal more than which sources it covers. Here zombies keep spawning underground but not in daylight on the surface, and once the stage opens, silverfish start turning up in the badlands where they otherwise would not.

```json
{
  "display_name": "The Deep Dark",
  "entities": {
    "spawnlock": [
      {
        "id": "minecraft:zombie",
        "conditions": {
          "dimensions": { "mode": "only", "ids": ["minecraft:overworld"] },
          "sky": "visible",
          "time": "day"
        }
      },
      {
        "id": "minecraft:silverfish",
        "phase": "after_unlock",
        "extra_biomes": {
          "ids": ["#minecraft:is_badlands"],
          "weight": 30,
          "min_group": 2,
          "max_group": 4
        }
      }
    ]
  }
}
```

Note the second entry: `phase: "after_unlock"` turns the rule around, so it does nothing while the stage is locked and only takes effect once it opens. That is how a stage makes something *start* happening rather than stop.

## Fluids, Trades and Zones

The three lock categories added in 6.0.0, in one file. The fluid entry is narrowed so that lava can still be picked up — only using it, placing it and its recipes are gated. The zone seals off the volcano until the stage opens.

```json
{
  "display_name": "The Volcano",
  "research_time": 300,
  "fluids": [
    {
      "id": "minecraft:lava",
      "unlock_actions": ["pickup", "icon"]
    }
  ],
  "trades": {
    "professions": [
      { "id": "minecraft:weaponsmith", "levels": [4, 5] }
    ]
  },
  "zones": [
    {
      "name": "Caldera",
      "dimension": "minecraft:overworld",
      "shapes": [
        { "type": "cylinder", "center": [1240, 64, -880], "radius": 90, "height": 0, "full_height": true }
      ],
      "rules": {
        "message": { "enabled": true, "text": "&cThe heat drives you back.", "in_chat": false },
        "damage": { "enabled": true, "amount": 2.0, "interval": 20 },
        "barrier": true,
        "show_border": true
      }
    }
  ]
}
```

Leaving a rule out of the `rules` block keeps its default — the four interaction switches are on unless they are turned off, everything else is off unless it is turned on.

## Biome and Interaction Locking

This example locks a biome and restricts non-combat interactions with a specific entity, gating both survival and taming until the stage is unlocked.

```json
{
  "display_name": "Desert Survival",
  "research_time": 90,
  "biomes": {
    "biomes": ["minecraft:desert", "#minecraft:is_savanna"]
  },
  "entities": {
    "interactionlock": [
      {
        "id": "minecraft:camel",
        "unlock_actions": ["mount"],
        "lock_items": ["minecraft:saddle"]
      }
    ]
  }
}
```

Players cannot survive in deserts or savannas until the stage is unlocked, and camels can be mounted freely but not saddled until then.

## Structure Generation Cap and Lose on Death

This example caps how many villages can generate in the world while the stage is locked, and relocks itself if the (individual) owner dies.

```json
{
  "display_name": "Settlers",
  "research_time": 60,
  "lose_on_death": true,
  "structures": {
    "block_generation": [
      {
        "id": "#minecraft:village",
        "phase": "while_locked",
        "max": 3
      }
    ]
  }
}
```

At most 3 villages generate while the stage is locked; once unlocked, village generation is unrestricted. Because `lose_on_death` is set, this stage relocks (and its items drop) if the player dies — this field only has an effect on individual stages.

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
    "c:end_stones"
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
      "logic": "AND",
      "xp_level": { "level": 30 },
      "entity_kills": [
        { "entity_id": "minecraft:enderman", "count": 50 }
      ]
    }
  ]
}
```
