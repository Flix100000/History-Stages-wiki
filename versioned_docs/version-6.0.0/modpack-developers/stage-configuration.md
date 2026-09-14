---
title: Stage Configuration
sidebar_position: 1
---

Each stage in History Stages is defined by a JSON file, allowing for granular control over progression elements. These files are typically located in `config/historystages/global/` for global stages and `config/historystages/individual/` for per-player stages. The structure and available fields are consistent across all supported Minecraft versions.

## Configuration Fields

Below is a comprehensive list of fields available in a stage JSON file, along with their types, descriptions, and examples. These fields enable modpack creators to define progression rules.

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `display_name` | String | A human-readable name for the stage, displayed in messages, tooltips, and toast notifications. | `"Stone Age"` |
| `mode` | String | Controls how the stage is unlocked and whether a Research Scroll is generated. See [Stage Modes](./stage-modes.md) for a full description of each option. Defaults to `"default"` when omitted. | `"auto"` |
| `research_time` | Integer | The duration in seconds required for a player to research this stage at a Research Pedestal. If omitted or set to `0`, the global default `researchTimeInSeconds` from `historystages/settings/gameplay.toml` is used. | `120` |
| `min_pedestal_tier` | Integer (1-4) | Minimum [pedestal tier](./research-system.md#pedestal-tiers) required to research this stage. Defaults to `1` (any tier works). | `3` |
| `pedestal_tier_mode` | String | `"min"` (this tier and higher) or `"exact"` (only this exact tier). Defaults to `"min"`. | `"exact"` |
| `icon` | String | An optional item ID shown as the icon in unlock toast notifications. If omitted, it falls back to the global `defaultStageIcon` config. | `"minecraft:iron_ingot"` |
| `items` | List of Strings/Objects | A list of item IDs or objects with `id` and `nbt` criteria to be locked. This field supports NBT-specific locking for fine-grained control. | `["minecraft:iron_ingot"]` |
| `fluids` | List of Strings/Objects | Fluid IDs to be locked. An entry gates what a stack is *carrying*, not what it is, so one fluid covers every bucket and tank item that holds it. Entries can be objects with an `id` and an optional `unlock_actions` field. | `["minecraft:lava"]` |
| `tags` | List of Strings/Objects | A list of item tags (e.g., `c:ores/iron`) that, when locked, will prevent interaction with any item belonging to that tag. Entries can also be objects with an `id`, an optional `nbt`/`components` criterion (to match only tag members with specific NBT data), and an optional `unlock_actions` field. | `["c:ores/iron"]` |
| `mods` | List of Strings | A list of mod IDs (e.g., `mekanism`) that, when locked, will prevent interaction with all items originating from that specific mod. | `["mekanism"]` |
| `mod_exceptions` | List of Strings/Objects | A list of specific item IDs or NBT-defined items to be excluded from mod-level locking. This allows for selective unlocking within a globally locked mod. | `["mekanism:configurator"]` |
| `recipes` | List of Strings | A list of recipe IDs (e.g., `minecraft:iron_pickaxe`) that will be displayed with a "Locked" overlay in JEI/EMI, indicating they cannot be crafted until the stage is unlocked. | `["minecraft:iron_pickaxe"]` |
| `dimensions` | List of Strings | A list of dimension IDs (e.g., `minecraft:the_nether`) that players will be prevented from entering until the stage is unlocked. | `["minecraft:the_nether"]` |
| `structures` | Object | An object with a `structures` list of structure IDs or tag IDs (`#` prefix) to block access to, and an optional `block_generation` list to cap generation instead (see below). A legacy flat array (`"structures": [...]`) is still read for backwards compatibility and rewritten to the object form on save. | `{"structures": ["minecraft:stronghold", "#minecraft:village"]}` |
| `biomes` | Object | An object with a `biomes` list of biome IDs or tag IDs (`#` prefix) that players cannot survive in until the stage is unlocked. | (see below) |
| `zones` | List of Objects | Named areas drawn by the pack author, each in one dimension, each built from one or more shapes and carrying its own rules. **Beta.** | (see below) |
| `entities` | Object | An object containing optional sub-lists: `attacklock`, `spawnlock`, and `interactionlock`, used to control mob interactions. | (see below) |
| `trades` | Object | An object with three optional lists — `offers`, `professions` and `levels` — controlling what merchants will trade with the player. | (see below) |
| `hidden_display` | Object | Controls how locked items from this stage appear to players who have not yet unlocked it — hides or replaces names and tooltips. | (see below) |
| `lose_on_death` | Boolean | Individual stages only. If `true`, this stage relocks for the player whenever they die. Omitted (not written) when `false`. | `true` |
| `dependencies` | List of Objects | A list of prerequisite conditions that must be met before this stage can be unlocked. | (see below) |

## Advanced Locking Features

### NBT-Specific Item Locking

History Stages provides NBT-based locking, allowing modpack creators to target items with precision. This is applicable for enchanted books, potions with specific effects, or complex mod items with unique NBT data.

```json
{
  "items": [
    {
      "id": "minecraft:enchanted_book",
      "nbt": {
        "StoredEnchantments": [
          {"id": "minecraft:sharpness", "lvl": "1-4"}
        ]
      }
    }
  ]
}
```

In this example, only enchanted books with Sharpness levels 1-4 would be locked, while other enchanted books remain accessible.

On Minecraft 1.21+, the matcher additionally supports arbitrary [data components](https://minecraft.wiki/w/Data_component_format) via a top-level `components` object alongside the legacy NBT fields. This lets stages target items that store their state in data components rather than custom NBT (e.g. dyed leather armor, jukebox playable, food, custom mod components):

```json
{
  "items": [
    {
      "id": "minecraft:leather_chestplate",
      "nbt": {
        "components": {
          "minecraft:dyed_color": { "rgb": 16711680 }
        }
      }
    }
  ]
}
```

### NBT Criteria on Tag Entries

Tag entries support the same `nbt` and `components` criteria as item entries. When an NBT criterion is present on a tag entry, only tag members that also match that criterion are locked — other items in the same tag remain accessible.

```json
{
  "tags": [
    "minecraft:swords",
    {
      "id": "minecraft:swords",
      "nbt": {
        "components": {
          "minecraft:enchantments": { "minecraft:sharpness": 5 }
        }
      }
    }
  ]
}
```

> **Note:** Tag entries with an NBT criterion are skipped in code paths where no ItemStack is available (e.g., loot table checks without context), because NBT matching requires an actual stack. Plain string tag entries remain unaffected.

### Per-Entry Action Locking (`unlock_actions`)

By default, every entry in `items`, `tags`, and `mods` blocks all interactions with the matching content. The optional `unlock_actions` field allows modpack creators to instead restrict only specific interactions per entry, leaving the others available even while the stage is locked.

The recognised action names, with the labels the editor shows for them:

| Action | Editor label | What it covers |
| :--- | :--- | :--- |
| `use` | Use | Right-click use — food, a bow, activating a tool. |
| `attack` | Attack | Attacking entities with it. |
| `equip` | Equip | Wearing it in an armour or offhand slot. |
| `pickup` | Pickup | Taking it — off the ground, out of a container. |
| `place` | Place | Placing it as a block, or using it on a block. |
| `break` | Break | Breaking blocks with it. |
| `gui` | GUI | Opening the block's GUI. |
| `loot` | Loot | Appearing in container loot and mob drops. |
| `recipe` | Show in JEI / EMI | Its recipes in the recipe browser. |
| `trade` | Trade | Buying or selling it at a merchant. |
| `icon` | Icon | The padlock overlay drawn on the slot. |

> **`trade` was added in 6.0 and changes existing files.** It gates buying or selling the item at any merchant, wherever that item turns up. Because `unlock_actions` stores the actions that stay *free*, an action nobody could have listed before counts as locked in every file written earlier: an entry someone narrowed to `["use"]` gates trading as well from this version onwards. That is the intended reading — a narrowed entry means "only this" — but it is worth knowing before a pack updates. There is deliberately no migration for it.
>
> Two smaller consequences travel with it. The result slot of a trade window is now judged by `trade` rather than by `pickup`, so an entry that allowed pickup in order to allow trading has to say `trade` instead. And the extra action costs room in the stage's network payload: a stage made entirely of narrowed item entries now holds about 544 of them rather than 581.

> **`place` vs `use`:** These two actions are distinct. `place` gates block placement — when locked, the item cannot be placed as a block. `use` gates right-click usage (e.g. opening a GUI, drinking a potion, activating a tool) but does **not** affect block placement. Locking `use` alone will not prevent a placeable block from being placed.

The field lists the actions that are **not** locked — every other action remains blocked. A plain string entry (or an object without `unlock_actions`) keeps the default behaviour of locking every action.

```json
{
  "items": [
    "minecraft:diamond_pickaxe",
    {
      "id": "minecraft:diamond_sword",
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

In this example, the diamond pickaxe stays fully locked, while the diamond sword can still be picked up and equipped — only attacking, crafting, and other actions remain blocked. Iron ingots from the tag can be picked up but cannot be used, equipped, or crafted with.

> **Note:** The legacy `lock_actions` field (which listed the locked actions directly) is still read for backwards compatibility, but new entries are always written using `unlock_actions`.

**Two surfaces deliberately ignore the action list.** An item whose entry narrows the lock to, say, `recipe` alone still shows as `???` in the inventory when the stage has [Hidden Display](#hidden-display) on, and still carries the "requires stage X" tooltip. Both describe *that the item belongs to a stage*, which stays true however narrow the gate is. Everything that actually refuses an action — containers, equip slots, item frames, anvils, the recipe browser — reads the list.

### Fluid Locking

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

### Biome Locking

The `biomes` block restricts players from surviving in specific biomes until the stage is unlocked. Entries are biome IDs or biome tags (`#` prefix):

```json
{
  "biomes": {
    "biomes": ["minecraft:desert", "#minecraft:is_forest"]
  }
}
```

While a player stands inside a locked biome, the mod can apply potion effects, deal periodic damage, show a periodic warning message, and cancel right-clicks, left-clicks/mining, and projectile impacts — all configurable per-server in `historystages/settings/gameplay.toml` under `biome_lock` (see [Configuration](./configuration.md#biome_lock)). This mirrors the existing structure-lock behaviour, applied to biomes instead of structure zones.

### Structure Generation Limits

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

### Zones

> **Beta.** Zones work and are enforced, but the category is younger than the rest and still growing. Expect additions.

A zone is an area the pack author draws themselves — a crater, a walled-off city, the far side of a river — rather than something Minecraft already has a name for. Unlike biome and structure locks, whose behaviour is set once for the whole server in the config, **every zone carries its own rules**: one can merely refuse interaction while the next one burns.

```json
{
  "zones": [
    {
      "name": "The Crater",
      "dimension": "minecraft:overworld",
      "shapes": [
        { "type": "cube", "from": [-120, 60, 340], "to": [-60, 90, 400], "full_height": true },
        { "type": "cylinder", "center": [-90, 63, 370], "radius": 24, "height": 32, "full_height": false },
        { "type": "sphere", "center": [-40, 70, 410], "radius": 16 }
      ],
      "rules": {
        "message": { "enabled": true, "text": "&cThe air here is still poison.", "in_chat": false },
        "damage": { "enabled": true, "amount": 1.0, "interval": 20 },
        "effects": {
          "enabled": true,
          "clear_on_leave": true,
          "list": [ { "id": "minecraft:blindness", "seconds": 30, "amplifier": 0 } ]
        },
        "block_right_click": true,
        "block_left_click": true,
        "block_projectiles": true,
        "block_explosions": true,
        "barrier": false,
        "block_spawns": false,
        "inverted": false,
        "show_border": false,
        "show_overlay": false
      }
    }
  ]
}
```

Zones are normally drawn in the game rather than typed. Sneak + left click with the marker item sets the first corner and sneak + right click the second (see [`[zone_lock]`](./configuration.md#zone_lock)); `/history zone mark`, `clear` and `info` do the same without an item, which is how you set a corner you cannot stand on.

**The dimension is mandatory and is never inverted.** Coordinates alone are ambiguous — 100/64/100 exists in the Overworld, the Nether and the End — so a zone meant for a Nether fortress would otherwise also fire in the middle of an Overworld village. An area spanning two worlds is two zones, on purpose: the editor then shows that there are two.

#### Shapes

A zone is the union of its shapes, and a shape is one of three kinds:

| `type` | Fields | Meaning |
| :--- | :--- | :--- |
| `cube` | `from`, `to`, `full_height` | Two opposite corners, in any order. |
| `sphere` | `center`, `radius` | — |
| `cylinder` | `center`, `radius`, `height`, `full_height` | `center` is the middle of the **floor**; `height` is the extent upwards. |

`full_height` makes a cube or cylinder span the whole build range of its dimension and ignores the height numbers. It is the common case in practice — a village is gated as a whole, not as a slice of one.

A zone with no shapes at all is legal. It is shown as incomplete and applies to nobody.

#### Rules

| Key | Default | Effect |
| :--- | :--- | :--- |
| `message.enabled` / `.text` / `.in_chat` | on / empty / off | A message while the player is inside. `{zone}` and `{stage}` are replaced; `&` sets a colour. `in_chat` prints it in chat as well as above the hotbar. |
| `damage.enabled` / `.amount` / `.interval` | off / `1.0` / `20` | Periodic damage. Never in creative mode. |
| `effects.enabled` / `.clear_on_leave` / `.list` | off / off / empty | Potion effects, as `{ "id", "seconds", "amplifier" }`. `clear_on_leave` removes them at once instead of letting them run out. |
| `block_right_click` | `true` | Blocks, items and creatures — including placing against the border from outside. |
| `block_left_click` | `true` | Attacking and breaking, including reaching through the wall from outside. |
| `block_projectiles` | `true` | Arrows, snowballs and the like vanish when they would land inside. |
| `block_explosions` | `true` | Blocks inside the zone are not destroyed by explosions. |
| `barrier` | `false` | The player physically cannot get in — not with an elytra, an ender pearl or a horse. Creative mode is exempt. |
| `block_spawns` | `false` | Suppresses natural spawning. Spawners, spawn eggs and commands are left alone. Global stages only. |
| `inverted` | `false` | Turns the zone around: the rules apply everywhere **except** here — but still only in this world. |
| `show_border` | `false` | Draws the zone's wall once the player is close enough. |
| `show_overlay` | `false` | Tints the screen red while the player is inside. |

The two visibility switches decide **whether** a zone is seen; `[zone_overlay]` in `visual.toml` decides how far the wall carries and how strong the tint is. A zone meant to stay secret leaves both off — the client is not told about a zone it is not allowed to see.

#### Standing in two zones at once

Overlap is normal rather than exceptional; packs get built by dropping boxes onto a map until the area looks right. The rules are merged into one answer, and the merge is deliberate:

*   **Switches are an OR.** One zone asking for interaction to be blocked is enough. A zone that does not ask cannot un-ask on another's behalf.
*   **Damage takes the highest amount, never the sum** — nudging two zones into overlap while building must not quietly become lethal. The interval travels with the amount that won.
*   **One message wins**, the first of the zones found. Three messages fighting over the action bar reads as a bug.
*   **Effects are merged by effect ID**: the stronger amplifier wins, and at equal strength the longer duration.

### Entity Control

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

    #### `conditions`

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

    #### `extra_biomes`

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

### Merchant Trades

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

**What the player sees:** a merchant whose offers are all gated opens with a notice in the trade window instead of an empty list. Whether that notice names the stages is a config switch, off by default. → [Configuration](./configuration.md#trade_lock).

### Hidden Display

The `hidden_display` block controls how locked items from a stage appear to players who have not yet unlocked it. All effects apply only while the item is locked for the viewing player — once the stage is unlocked, items display normally.

```json
{
  "hidden_display": {
    "name_mode": "replace",
    "name_text": "???",
    "tooltip_mode": "replace",
    "tooltip_text": "Unlock the Stone Age to reveal this item.",
    "show_lock_hints": false
  }
}
```

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name_mode` | String | `"off"` | `"off"` — item name unchanged. `"hidden"` — name is cleared. `"replace"` — name is replaced with `name_text`. |
| `name_text` | String | `""` | The replacement name shown when `name_mode` is `"replace"`. |
| `tooltip_mode` | String | `"off"` | `"off"` — tooltip unchanged. `"hidden"` — all extra tooltip lines are stripped. `"replace"` — tooltip is replaced with `tooltip_text`. |
| `tooltip_text` | String | `""` | The replacement tooltip shown when `tooltip_mode` is `"replace"`. Use `\n` for multi-line text. |
| `show_lock_hints` | Boolean | `true` | When `false`, the padlock icon and "Locked" hint line are not added to the tooltip. Only useful in combination with `tooltip_mode: "replace"` to fully control what locked players see. |

Individual entries in `items` and `tags` lists can additionally override the stage-default `name_text` and `tooltip_text` on a per-entry basis by adding `name_text` and `tooltip_text` fields directly to the entry object. The `name_mode` and `tooltip_mode` from `hidden_display` still determine whether hiding or replacement is active — only the text itself is overridden.

### Lose on Death

Individual stages can be set to relock automatically when the owning player dies, via `"lose_on_death": true`. This is not available for global stages (there is no single player to relock a server-wide stage for).

The relock happens on death itself, not on respawn, so the stage's newly re-locked items are included in the player's death drops. Combined with `keepInventory`, this can be used to make specific progression items the only thing a player risks losing on death. If the stage is in `temporary` mode with an active timer, dying ends that timer early and starts the cooldown as if it had expired naturally, without counting against `max_triggers` any differently than a normal expiry.

### Stage Dependencies

To create a structured progression path, stages can demand that things be done before they open. Dependencies are normally built in the visual Dependency Editor inside the in-game stage editor, but they are plain JSON and can be written by hand.

`dependencies` is a list of **groups**. A group is not a single condition — it holds one list per kind of requirement, plus a `logic` field saying how its own entries are connected:

```json
"dependencies": [
  {
    "logic": "AND",
    "items": [ { "id": "minecraft:iron_ingot", "count": 16 } ],
    "item_tags": [ { "id": "#minecraft:planks", "count": 8 } ],
    "stages": [ "stone_age" ],
    "individual_stages": [ { "stage_id": "apprentice", "mode": "all_online" } ],
    "advancements": [ "minecraft:story/mine_diamond" ],
    "xp_level": { "level": 30, "consume": true },
    "entity_kills": [ { "entity_id": "minecraft:enderman", "count": 50 } ],
    "stats": [ { "stat_id": "minecraft:play_time", "min_value": 72000 } ],
    "scoreboard": [ { "objective": "quests", "op": ">=", "value": 5 } ]
  }
]
```

Every list is optional — leave out what the group does not use. An `addons` block can sit alongside them for requirement kinds owned by other mods; see [Requirements](../addon-developers/requirements.md).

| Field | Demands |
| :--- | :--- |
| `items` | Items handed in at the Research Pedestal. Entries take `id`, `count`, and an optional `nbt` criterion. |
| `item_tags` | An item tag handed in at the pedestal, same entry shape. A tag entry does not behave like a list of items — see below. |
| `stages` | Another global stage is already unlocked. Plain stage IDs. |
| `individual_stages` | An individual stage is held. `mode` is `"all_online"` (everyone currently online), `"all_ever"` (everyone the server has ever seen), or `"player"` (only whoever is researching). A global stage may not use `"player"`: it would let the first qualifying player open the stage for everybody, including those without the prerequisite. |
| `advancements` | The player has earned an advancement. |
| `xp_level` | A single object rather than a list. `consume` takes the levels away on unlock. |
| `entity_kills` | The player has killed `count` of `entity_id`. |
| `stats` | A tracked statistic has reached `min_value`. |
| `scoreboard` | An objective satisfies a comparison. `op` is one of `>=`, `<=`, `==`, `>`, `<`, `!=`. Without `score_holder`, the acting player's own score is read. |

Four of these need a single player to measure and are therefore **individual-only**: `advancements`, `xp_level`, `entity_kills` and `stats`. Written into a global stage by hand they are skipped rather than checked against whoever happened to trigger it. The rest — items, item tags, stages, individual stages and scoreboard — work in both scopes. → [Requirements](../addon-developers/requirements.md) has the same split from the addon side.

#### AND, OR, and where the line runs

**`logic` applies inside a group and never between groups.** Groups are always joined by AND: every group has to be satisfied. Within one group, `"AND"` (the default) demands every entry and `"OR"` demands any single one.

So "sixteen iron *or* eight gold, and thirty levels either way" is two groups — an OR group holding the two items, and a second group holding the level. Putting all three into one OR group would let thirty levels alone open the stage.

The Research Scroll tooltip and the graph's detail panel both print the heading of each group, so a player can see which entries an OR applies to.

#### Item tags settle on the first deposit

An `item_tags` entry is not shorthand for "any one of these items". The first matching item thrown into the pedestal is written onto the scroll, and from then on that entry demands **that** item for the rest of its count — so `8x #minecraft:planks` means eight planks of one kind, not eight planks scraped together from four different woods.

The choice lives on the individual scroll, next to the counter, and there is no way to reset it. Two players researching the same stage can settle on different items. While an entry is still open, its icon cycles through the tag's members once a second, so it reads as a choice rather than as one specific item.

Deposits are matched in a fixed order: concrete items first, then tags that have already settled, then open tags. An open tag gives up its freedom last.

### Folders

Stage JSON files can be organized into nested subfolders under `config/historystages/global/` and `config/historystages/individual/`. Folders are purely organizational — **the stage ID is the file name, not the folder path**, and IDs must still be unique across the entire tree regardless of which folder they sit in. A duplicate ID anywhere in the tree is rejected at load time with an error in the debug log.

Folder and file names may contain letters, digits, `-`, and `_`, but cannot start with `_` (an underscore prefix opts a file or folder out of loading — see below) and cannot use `..`, backslashes, or drive letters. Folders can be nested up to 8 levels deep.

The in-game editor's **organize mode** on the Stage Overview screen lets you tick multiple stages and folders and drag them onto a target folder in one move — moving a folder brings its contents along automatically. See [In-Game Editor](./in-game-editor.md#key-capabilities).

### Ignored Files

Any JSON file or folder within the stage configuration directories whose name starts with an underscore (`_`) will be ignored by History Stages. This feature is useful for storing templates, backup configurations, or work-in-progress stage definitions without them being loaded into the game.
