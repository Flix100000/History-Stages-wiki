---
title: Lock Types
sidebar_position: 1
---

Beyond the basic `items`, `tags`, `mods`, `recipes`, and `dimensions` fields, History Stages supports NBT-
and action-level control over items and tags. → [World Locks](./world-locks.md) covers fluids, biomes and
structure generation; → [Entity & Trade Locks](./entity-and-trade-locks.md) covers mobs and merchants;
→ [Zones](/wiki/modpack-developers/locking-zones/zones) covers player-drawn areas, which — because every zone carries its own independent
rules rather than a server-wide config — get their own page too.

## NBT-Specific Item Locking

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

## NBT Criteria on Tag Entries

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

:::note
**Note:** Tag entries with an NBT criterion are skipped in code paths where no ItemStack is available (e.g., loot table checks without context), because NBT matching requires an actual stack. Plain string tag entries remain unaffected.
:::

## Per-Entry Action Locking (`unlock_actions`)

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

:::warning
**`trade` was added in 6.0 and changes existing files.** It gates buying or selling the item at any merchant, wherever that item turns up. Because `unlock_actions` stores the actions that stay *free*, an action nobody could have listed before counts as locked in every file written earlier: an entry someone narrowed to `["use"]` gates trading as well from this version onwards. That is the intended reading — a narrowed entry means "only this" — but it is worth knowing before a pack updates. There is deliberately no migration for it.

Two smaller consequences travel with it. The result slot of a trade window is now judged by `trade` rather than by `pickup`, so an entry that allowed pickup in order to allow trading has to say `trade` instead. And the extra action costs room in the stage's network payload: a stage made entirely of narrowed item entries now holds about 544 of them rather than 581.
:::

:::tip
**`place` vs `use`:** These two actions are distinct. `place` gates block placement — when locked, the item cannot be placed as a block. `use` gates right-click usage (e.g. opening a GUI, drinking a potion, activating a tool) but does **not** affect block placement. Locking `use` alone will not prevent a placeable block from being placed.
:::

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

:::note
**Note:** The legacy `lock_actions` field (which listed the locked actions directly) is still read for backwards compatibility, but new entries are always written using `unlock_actions`.
:::

**Two surfaces deliberately ignore the action list.** An item whose entry narrows the lock to, say, `recipe` alone still shows as `???` in the inventory when the stage has [Hidden Display](/wiki/modpack-developers/locking-zones/stage-behavior#hidden-display) on, and still carries the "requires stage X" tooltip. Both describe *that the item belongs to a stage*, which stays true however narrow the gate is. Everything that actually refuses an action — containers, equip slots, item frames, anvils, the recipe browser — reads the list.
