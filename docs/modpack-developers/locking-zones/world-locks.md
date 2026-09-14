---
title: World Locks
sidebar_position: 2
---

The three locking mechanisms that gate part of the world itself rather than an item or a creature: fluids,
biomes, and how often a structure may generate. → [Lock Types](/docs/modpack-developers/locking-zones/lock-types) covers item and tag
locking; → [Entity & Trade Locks](./entity-and-trade-locks.md) covers mobs and merchants.

## Fluid Locking

The `fluids` block gates fluids by their registry ID:

```json
{
  "fluids": [
    "minecraft:lava",
    {
      "id": "minecraft:water",
      "unlock_actions": ["pickup"]
    }
  ]
}
```

**What is gated is the fluid, but what is recognised is the container.** The mod asks every item stack what it is carrying rather than what it is, so a single `minecraft:lava` entry covers the vanilla bucket, every modded bucket, and every filled tank item in the pack — without a single item ID appearing in the stage file.

The action vocabulary is shorter than the item one. A fluid can answer for seven actions:

`use`, `place`, `pickup`, `recipe`, `ingredient`, `loot`, `icon`

`equip`, `attack`, `break` and `gui` are not offered, because a fluid is not worn, not swung, not mined and opens no GUI of its own. In exchange there is `ingredient`, which items do not have.

> **`recipe` and `ingredient` are two different things, and both are on by default.** `recipe` gates the recipes that **produce** the fluid; `ingredient` gates the ones that **consume** it. An entry without `unlock_actions` locks every one of the seven, so gating `minecraft:water` takes every recipe that touches water out of the pack — in a large modpack that is a four-digit number of recipes. This is the single most common surprise with fluid locks. Narrow the entry with `unlock_actions` if that is not what you meant.

That also answers a question that otherwise reads as a bug: **recipes disappear that nobody listed.** Gating a fluid removes the recipes touching it from crafting and from the recipe browser, including recipes inside other mods' machines. The `[Recipes: N]` badge the editor shows on a fluid row is there so the reach of an entry is visible before the decision rather than after it. The index behind that number is only built when a fluid is actually gated or the editor is open, so a row with no badge means either "none" or "not counted yet" — open the fluid tab once and it settles.

Three limits are deliberate and worth stating:

*   **There are no NBT criteria for fluids.** Of the four places the mod is asked about a fluid, only the container item could ever supply one. A fluid block in the world and an entry in the recipe browser carry nothing to match against, so a criterion would have done nothing on the two surfaces a pack author checks first.
*   **Name and tooltip overrides reach the container, not the fluid.** A foreign tank's own GUI, and Jade's tank readout, keep showing the real name.
*   **Pumps and pipes are not gated.** A player who already has lava in a tank can keep moving it. Gating that would mean taking the fluid interface away from other mods' tanks, which crashes inside foreign code and cannot be caught. In practice it rarely shows, because without recipes and without buckets nothing reaches the first tank. Fluids already lying in the world also keep flowing — a lock governs what a player *does*, not what the world contains.

## Biome Locking

The `biomes` block restricts players from surviving in specific biomes until the stage is unlocked. Entries are biome IDs or biome tags (`#` prefix):

```json
{
  "biomes": {
    "biomes": ["minecraft:desert", "#minecraft:is_forest"]
  }
}
```

While a player stands inside a locked biome, the mod can apply potion effects, deal periodic damage, show a periodic warning message, and cancel right-clicks, left-clicks/mining, and projectile impacts — all configurable per-server in `historystages/settings/gameplay.toml` under `biome_lock` (see [Configuration](../server-integration/gameplay-toml.md#biome_lock)). This mirrors the existing structure-lock behaviour, applied to biomes instead of structure zones.

## Structure Generation Limits

Beyond blocking entry, individual entries in `structures` can instead cap how many times a structure is allowed to generate in the world rather than blocking it outright. This is configured via the `block_generation` field inside the `structures` object (accessible from the in-game editor's structure context menu):

```json
{
  "structures": {
    "block_generation": [
      "minecraft:stronghold",
      {
        "id": "#minecraft:village",
        "phase": "while_locked",
        "max": 3,
        "reset_on_relock": false
      }
    ]
  }
}
```

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | — | Structure ID or tag (`#` prefix). |
| `phase` | String | `"while_locked"` | `"while_locked"` — the cap only counts while the stage is locked; generation is unrestricted after unlock. `"after_unlock"` — nothing generates while the stage is locked; the cap only starts counting once the stage is unlocked. |
| `max` | Integer | `0` | Maximum number of times the structure (or all members of the tag, combined) may generate. `0` blocks it entirely, same as a plain string entry. |
| `reset_on_relock` | Boolean | `false` | If `true`, the generation counter resets when the stage is relocked. |

This only applies to **global** stages — world generation is a permanent, world-wide decision, so it cannot be gated per-player. Counts are tracked world-wide (not per-dimension) starting from the moment the rule takes effect; chunks generated before the rule was added are not retroactively affected. Treasure maps also stop pointing at structures whose limit has been reached.
