---
title: Stage Examples
sidebar_position: 3
---

This page provides various examples of stage configurations in JSON format to demonstrate the capabilities of History Stages. These examples can be used as templates for creating custom progression systems.

- **[Basic Examples](./examples-basic.md)** — items, tags, mods, dimensions, NBT, and per-entry actions.
- **[Entity & World Examples](./examples-entities-and-world.md)** — spawn rules, fluids, trades, zones, biomes, structure generation.

The flagship, combining several mechanisms at once:

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
