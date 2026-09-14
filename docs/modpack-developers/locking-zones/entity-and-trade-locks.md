---
title: Entity & Trade Locks
sidebar_position: 3
---

The two locking mechanisms that gate a living, moving part of the world rather than an item or a place:
mob interactions, and what a merchant will trade. → [Lock Types](/wiki/modpack-developers/locking-zones/lock-types) covers item and tag
locking; → [World Locks](./world-locks.md) covers fluids, biomes, and structure generation.

## Entity Control

Modpack creators can define how players interact with specific entities through stage locking:

*   **`attacklock`:** This list specifies entity IDs (e.g., `minecraft:zombie`) that players will be prevented from damaging until the stage is unlocked. This can be used to gate combat progression.
    Example: `"attacklock": ["minecraft:zombie"]`
*   **`spawnlock`:** A spawn rule for an entity — which sources it covers, when it applies, and the conditions under which the entity may still appear. Global stages only; there is no per-player spawn gate.

    > **Changed in 6.0: a spawn lock no longer implies an attack lock.** Until 6.0.0, gating an entity's spawning also stopped players from hitting it. That coupling is gone entirely — whether a creature may be hit is a separate question from whether it may appear, and a zombie from a spawner or an egg is a perfectly ordinary zombie. A stage that relied on the implication now leaves the creature attackable; list it in `attacklock` as well if that is what you wanted.

    The simple form is still a plain entity ID, which blocks every source everywhere:

    ```json
    "spawnlock": ["minecraft:skeleton"]
    ```

    **Everything an existing pack already wrote keeps working and is written back unchanged.** A rule the old format can express — `unlock_sources`, `unlock_dimensions` — is saved in exactly that form, so stage files that never touch the new options stay byte-identical.

    | Field | Meaning |
    | :--- | :--- |
    | `id` | The entity. |
    | `unlock_sources` | Sources that are **not** blocked; everything else is. Recognised: `natural`, `spawner`, `structure`, `breeding`, `summon`, `spawn_egg`. Absent means every source is blocked. |
    | `phase` | `"while_locked"` (default) — the rule applies until the stage opens. `"after_unlock"` — it applies only once the stage is open, which is how you make something start appearing rather than stop. |
    | `conditions` | Where and when the entity may still spawn. Every slot is optional and all present slots have to hold. See below. |
    | `extra_biomes` | Biomes the entity **additionally** spawns in. See below. |
    | `unlock_dimensions` | The pre-6.0 spelling of an "only in these dimensions" condition. Still read; new rules write `conditions.dimensions` instead. |

    ### `conditions`

    ```json
    "spawnlock": [
      {
        "id": "minecraft:phantom",
        "conditions": {
          "dimensions": { "mode": "only", "ids": ["minecraft:overworld"] },
          "biomes":     { "mode": "exclude", "ids": ["#minecraft:is_ocean"] },
          "sky": "visible",
          "y": { "min": 60, "max": 180 },
          "time": "night",
          "light": { "min": 0, "max": 7 },
          "weather": "clear",
          "moon_phases": [0, 4]
        }
      }
    ]
    ```

    | Slot | Values |
    | :--- | :--- |
    | `dimensions`, `biomes` | `mode` is `"only"` or `"exclude"`; `ids` are IDs, and biomes also accept `#tag` entries. |
    | `sky` | `"visible"` or `"hidden"` — whether the spawn position can see the sky. |
    | `y` | `{ "min", "max" }`, inclusive. A reversed pair is swapped rather than rejected. |
    | `time` | `"day"` or `"night"`. |
    | `light` | `{ "min", "max" }`, 0–15 inclusive. |
    | `weather` | `"clear"`, `"rain"` or `"thunder"`. A thunderstorm counts as rain as well. |
    | `moon_phases` | A list of phase numbers, 0–7. |

    ### `extra_biomes`

    The inverse of a lock: biomes the entity spawns in that it otherwise would not.

    ```json
    "extra_biomes": {
      "ids": ["minecraft:desert", "#minecraft:is_badlands"],
      "weight": 30,
      "min_group": 2,
      "max_group": 4,
      "ignore_spawn_rules": false
    }
    ```

    Leaving `weight`, `min_group` and `max_group` out copies the frequency from the biomes the entity already spawns in. `ignore_spawn_rules` skips the entity's own placement rules — its light level, its surface preference — but not the physical ones: something still needs space and solid ground, and a fish still needs water. The rest of the rule's `conditions` apply here too; only the biome condition is set aside, since it would otherwise exclude the very biome being added.

    Four limits are worth knowing before building around this:

    *   **Animals placed during world generation are not added.** Chunk generation reads the biome's own list directly. Extra biomes only affect ongoing natural spawning — invisible for monsters, noticeable for animals in land that is already explored.
    *   **The Nether and the End report a fixed clock**, so a `time` condition is constant there.
    *   **Weather is per world, not per biome.** `"rain"` also matches in a desert while it is raining somewhere else.
    *   **Space and ground still count**, even with `ignore_spawn_rules`.

    Spawn rules are normally built in the editor's spawn dialog — phase at the top, then four tabs (Sources, Location, Time & Weather, Extra biomes) and a line underneath that spells the whole rule out in words.

*   **`interactionlock`:** This list specifies entity IDs whose non-combat interactions (naming, leashing, shearing, milking, breeding, trading, mounting, equipping armor/saddles, etc.) are blocked until the stage is unlocked. Attacking and spawning are unaffected — use `attacklock` / `spawnlock` for those.

    Each entry can be a plain entity ID (blocks every recognised interaction) or an object with `unlock_actions` and/or `lock_items`:

    ```json
    "interactionlock": [
      "minecraft:villager",
      {
        "id": "minecraft:horse",
        "unlock_actions": ["mount"],
        "lock_items": ["minecraft:saddle"]
      }
    ]
    ```

    | Field | Type | Description |
    | :--- | :--- | :--- |
    | `unlock_actions` | List of Strings | Actions that are **not** locked; every other recognised action stays blocked. Recognised actions: `breed`, `mount`, `trade`, `leash`, `shear`, `milk`, `name`, `equip`, `other`. |
    | `lock_items` | List of Strings/Objects | Optional held-item filter. When present, the lock only applies while the player is holding one of these items (plain item IDs, `#tag` entries, or `{ "id": ..., "nbt": {...} }` objects). Omitted or empty means the lock applies regardless of what is held, including an empty hand. |

    In the example above, villagers cannot be interacted with at all (trading, naming, etc.), while horses can be mounted freely but cannot be saddled, bred, or leashed until the stage is unlocked, and only while a saddle is in hand.

## Merchant Trades

The `trades` object holds three lists. They are asked separately and stack: an offer survives only if none of the three gates it.

```json
"trades": {
  "offers": [
    {
      "merchant": "minecraft:librarian",
      "level": 2,
      "gives": "minecraft:bookshelf",
      "takes": ["minecraft:emerald"]
    }
  ],
  "professions": [
    "minecraft:weaponsmith",
    { "id": "minecraft:librarian", "levels": [4, 5] }
  ],
  "levels": [5]
}
```

*   **`offers`:** one named trade, and nothing else. `merchant` is the profession id, or the entity id for a merchant that has no profession (`minecraft:wandering_trader`, or a merchant added by another mod). `level` is the merchant level the offer belongs to and defaults to `1`. `gives` is what the player receives; `takes` holds one or both price items. An optional `nbt` criterion narrows it further, the same way it does on an item entry.

    **Amounts are deliberately not part of it.** A merchant rolls its own price and stack size, so an entry naming them would gate the same trade on one villager and miss it on the next.

    The editor's picker lists real offers rather than every item in the game, so most of the time this block is written by clicking rather than by hand.

*   **`professions`:** a bare id gates that profession at every level. The object form gates only the levels listed — `{"id": "minecraft:librarian", "levels": [4, 5]}` leaves novice, apprentice and journeyman librarians trading normally.

    **The levels listed here are the gated ones, not the free ones.** That is the opposite of `unlock_actions`, and it is deliberate: the `levels` list in the same object already means "these levels are gated", and one word meaning two opposite things inside one block is a trap for whoever edits the file by hand.

*   **`levels`:** a merchant level gated for *every* profession at once — the rule behind "until the Bronze Age there are only novices", which would be tedious to repeat profession by profession. Written as numbers; strings are accepted on the way in.

    **A wandering trader always counts as level 1**, so gating level 1 hides every wandering trader as well.

Gating an item for trading wherever it turns up is a different question and is not written here — that is the `trade` action on an ordinary `items` entry. Use `offers` to name one trade, `professions` or `levels` to gate a merchant, and the item action to say "nobody trades in this at all".

**What the player sees:** a merchant whose offers are all gated opens with a notice in the trade window instead of an empty list. Whether that notice names the stages is a config switch, off by default. → [Configuration](../server-integration/visual-toml.md#trade_lock).
