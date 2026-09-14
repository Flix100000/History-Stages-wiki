---
title: Entity & World Examples
sidebar_position: 5
---

Worked examples for spawn rules, fluids, trades, zones, biomes, and structure generation caps.
→ [Basic Examples](./examples-basic.md) covers item/tag/mod locking. → [Stage Examples](/docs/modpack-developers/stage-basics/stage-examples)
has the flagship combined example.

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
