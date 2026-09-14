---
title: Configuration (TOML)
sidebar_position: 12
---

History Stages keeps its settings in `config/historystages/settings/`. They can be edited by hand or through the in-game config editor, which writes the same files.

```
config/historystages/settings/
    visual.toml      what a player sees or hears
    gameplay.toml    what happens in the background
    graph.toml       the player-facing Stage Graph
```

**Both files live on the server and are sent to every player who joins.** The split between them is thematic, not a question of ownership — a pack author sets both, and neither is something an individual player is expected to touch. A client's own copies are used in singleplayer and while not connected anywhere; the moment they join a server, that server's values apply for the session, and their own come back when they leave. Their files on disk are never overwritten by a server.

Saving from the in-game editor requires permission level 2.

> **Stage Graph:** `graph.toml` has around 90 keys of its own (canvas appearance, visibility rules, node styling). It is documented on the **[Stage Graph](./stage-graph.md)** page and has its own tab in the config editor.

## Updating from 5.x

Before 6.0.0 the settings lived in `config/historystages-client.toml` and `config/historystages-common.toml`, and they were split by *who owned the value* rather than by what it does. On first launch of 6.0.0 both old files are read and every setting is carried into its new home automatically — nothing needs to be re-entered. The old files are then renamed to `historystages-client.toml.migrated` and `historystages-common.toml.migrated` and left in place, so the originals are still there if anything looks wrong.

The migration writes a summary line to the log, and the config editor shows a one-off notice the first time it is opened afterwards.

Two settings were removed rather than moved, because nothing in the mod ever read them: `lockScrollWhileResearching` and `showDependencyScreenInPedestal`.

The carry-over is kept until 6.3. A pack skipping straight from 5.x to a later version will have to set its options again.

---

## `visual.toml`

### `[visuals]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `showTooltips` | `true` | Show information tooltips on locked items. |
| `showStageName` | `true` | If tooltips are enabled, name the required stage. |
| `showAllUntilComplete` | `true` | If an item belongs to several stages, list all of them until all are unlocked. |
| `showLockIcons` | `true` | Padlock overlay on locked items in inventories and JEI/EMI. |
| `showBoosterTooltips` | `true` | Tooltip on Research Pedestal booster blocks describing their speed/cost effect. |
| `showScrollTierTooltip` | `true` | Show the minimum required Pedestal tier on Research Scroll tooltips. |
| `openScrollBackdrop` | `60` | How far the world behind an open scroll is dimmed, in percent. `0` = not at all, `100` = black. |
| `showWelcomeMessage` | `true` | The welcome message shown to players when they join. |
| `showEditorButton` | `true` | The Stage Editor button in the pause menu. Operators can still open the editor with `/history debug editor`. |

### `[structure_overlay]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `structureBorderEnabled` | `true` | Render a force-field-style border on the walls of locked structures when you get close. |
| `structureBorderDistance` | `8.0` | How close, in blocks, before the border becomes visible. It fades in as you approach. Range 1.0–32.0. |
| `structureLockOverlayEnabled` | `true` | While standing inside a locked structure, tint the whole screen red. |
| `structureLockOverlayOpacity` | `0.30` | Opacity of that red overlay. Range 0.0–1.0. |

### `[zone_overlay]`

Zones are areas a pack author draws themselves, and each one carries its own switch for whether it shows a wall or tints the screen at all. This block only answers **how much** — there is deliberately no second switch here that could contradict the zone's own.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `zoneBorderDistance` | `8.0` | How close, in blocks, before a locked zone's wall becomes visible. It fades in as you approach. `0` turns the wall off entirely. Range 0.0–32.0. |
| `zoneLockOverlayOpacity` | `0.30` | Opacity of the red tint while you stand inside a locked zone. `0.0` turns it off. Range 0.0–1.0. |
| `zoneBorderFullView` | `false` | Draw the wall far past the usual few blocks, so a whole side is visible at once. It still fades with distance — the wall is worked out from the blocks in front of you, and the further it reaches the more of them there are. |
| `zoneBorderOutline` | `false` | Also draw a wireframe of every shape in a locked zone, fading in from about fifty blocks out. More use while laying a pack out than while playing one. |
| `zoneBorderColor` | `#E61414` | Colour of both the wall and the wireframe. |

Zones read these rather than the structure values above, because a pack can gate a whole region as a zone and a single hut as a structure, and wanting to see the region from further off says nothing about the hut.

### `[jade]` (requires Jade)

| Setting | Default | Description |
| :--- | :--- | :--- |
| `showInfo` | `true` | Show stage information on locked blocks in the Jade overlay. |
| `showStageName` | `true` | If Jade info is enabled, name the required stage. |
| `showAllUntilComplete` | `true` | If a block belongs to several stages, list all of them until all are unlocked. |

### `[dimension_lock]` and `[mob_lock]`

Both blocks carry the same three keys; they control only the feedback, not the lock itself.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `useActionbar` | `true` | Show a short message in the actionbar. |
| `showInChat` | `false` | Also send the message to chat. |
| `showStagesInChat` | `true` | If the chat message is on, list the required stages with it. |

### `[trade_lock]`

Controls the notice shown **inside** the trade window when a merchant has nothing left to offer once the trade locks have been applied. Without it an emptied merchant is indistinguishable from a merchant who happens to have no stock, which reads as a bug.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `showStagesInWindow` | `false` | Also name the stages holding the offers back. |

Off by default, unlike the dimension and mob switches. Those answer "why can I not go there", where naming the stage is the whole help; a merchant with nothing to offer is a puzzle some packs would rather keep as one.

### `[individual_stages]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `showSilverLockIcons` | `true` | Silver lock icon on items locked by individual stages. |
| `showIndividualTooltips` | `true` | Tooltip information for items locked by individual stages. |

### `[recipe_book]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `hideLockedRecipesInBook` | `true` | Hide locked recipes from the **vanilla** recipe book at the crafting table. Covers both halves of recipe gating: a recipe id named on a stage, and an item whose locked actions include `recipe`. |

**This is a change from before 6.0.0**, where a locked recipe stayed visible in the book and simply refused to craft. Turning it off restores that. The book belongs to one player, so it is filtered per player — an individual stage reaches it.

### `[jei_hiding]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `hideLockedItemsInJei` | `false` | Remove locked items from the JEI ingredient panel entirely instead of marking them with a lock overlay. |
| `hideLockedRecipesInJei` | `false` | Hide recipes whose output is a locked item. |
| `lockedItemMultiStagePolicy` | `STRICT` | How items assigned to several stages behave. `STRICT` = locked while any assigned stage is still locked. `LENIENT` = unlocked as soon as any assigned stage is. |

### `[notifications]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `broadcastChat` | `true` | Broadcast unlock messages to everyone on the server. |
| `unlockMessageFormat` | `"&aNew Era: {stage}"` | Format of the global unlock message. Supports `{stage}` and `&`-style colour codes. |
| `useActionbar` | `true` | Show unlock messages in the actionbar. |
| `useSounds` | `true` | Play a notification sound on unlock. |
| `useToasts` | `true` | Show an advancement-style toast on unlock. |
| `defaultStageIcon` | `"minecraft:book"` | Item used as the toast icon when a stage specifies no `icon` of its own. |

### `[notifications.individual]`

The same five settings again, for per-player stages. They are nested under `[notifications]` rather than kept in their own block so the two reaches sit side by side.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `broadcastChat` | `true` | Broadcast individual unlock messages. |
| `unlockMessageFormat` | `"&a{player} unlocked: {stage}"` | Format of the individual unlock message. Supports `{player}` and `{stage}`. |
| `useActionbar` | `true` | Actionbar message on an individual unlock. |
| `useSounds` | `true` | Sound on an individual unlock. |
| `useToasts` | `true` | Toast on an individual unlock. |

### `[lock_messages]`

Overrides for the actionbar/chat messages shown when a player interacts with locked content. Each defaults to an empty string, which falls back to the built-in translation key — so existing localisations are preserved unless overridden. Override strings support `&`-style colour codes and the same `{stage}` / `{player}` / `{structure}` placeholders as the other message settings, where applicable.

| Setting | Falls back to | Shown when |
| :--- | :--- | :--- |
| `itemLocked` | `message.historystages.item_locked` | Interacting with a locked item. |
| `fluidLocked` | `message.historystages.fluid_locked` | Taking a locked fluid out of the world. |
| `tradeLocked` | `message.historystages.trade_locked` | A merchant has nothing left once the trade locks have been applied. |
| `blockLocked` | `message.historystages.block_locked` | Interacting with a locked block. |
| `entityItemLocked` | `message.historystages.entity_item_locked` | Interacting with armor stands or item frames holding locked items. |
| `enchantmentLocked` | `message.historystages.enchantment_locked` | Applying a locked enchantment via an anvil or enchanting table. |
| `recipeLocked` | `message.historystages.recipe_locked` | Clicking a locked recipe in the recipe book. |
| `dimensionUnknown` | `message.historystages.dimension_unknown` | Entering a locked dimension. |
| `mobUnknown` | `message.historystages.mob_unknown` | Attacking a locked mob. |

### `[scroll_tooltip]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `lines` | built-in defaults | Ordered, per-section layout of the Research Scroll tooltip. See [Research System](./research-system.md#configuring-the-scroll-tooltip). |
| `hideFulfilledDependencies` | `false` | Hide dependencies the player already meets from the tooltip's dependency list. |

### `[open_scroll]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `chapters` | built-in defaults | Ordered chapter layout of the [open scroll document](./research-system.md#the-open-scroll-document) (`overview`, `items`, `creatures`, `world`). |
| `lockedDisplay` | `"obscured"` | `"visible"` shows locked entries normally; `"obscured"` shows them as silhouettes with a redacted name. |
| `overviewBlocks` | built-in defaults | Which blocks (`icon`, `title`, `description`, `counts`) appear on the overview page, and in what order. |
| `showSearch` | `true` | Show a search bar. |
| `showEntryIds` | `true` | Show each entry's registry ID alongside its display name. |
| `entrySort` | `"defined"` | `"defined"` keeps the order listed in the stage; `"alphabetical"` sorts by name. |
| `inkHeading` | `#3F2D13` | Ink for headings. |
| `inkBody` | `#4A3416` | Ink for entries and the description. |
| `inkFaint` | `#7A5A2C` | Ink for group headings, the counts line and the sheet counter. |

---

## `gameplay.toml`

### `[logging]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `showDebugErrors` | `true` | Show stage loading errors and warnings in chat on join. |
| `enableRuntimeLogging` | `false` | Write detailed runtime information (stage changes, blocked actions, inventory issues) to `config/historystages/logs/`. |

### `[gameplay]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `lockMobLoot` | `true` | Remove locked items from mob drops. |
| `lockBlockBreaking` | `true` | Locked blocks become far harder to break and drop nothing. |
| `lockedBlockBreakSpeedMultiplier` | `0.05` | Break-speed multiplier for locked blocks. `0.05` means 20× slower. |
| `lockItemUsage` | `true` | Prevent using locked items — eating, equipping, attacking with. |
| `lockEntityItems` | `true` | Prevent interacting with or breaking armor stands and item frames holding locked items. |
| `lockBlockInteraction` | `true` | Prevent opening the GUI of locked blocks (chests, furnaces, crafting tables, …). |
| `lockContainerInteraction` | `true` | Prevent moving locked items within containers. |
| `lockEnchanting` | `true` | Prevent applying locked enchantments via anvils and enchanting tables. |

### `[research]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `researchTimeInSeconds` | `20` | Default research duration, used when a stage's JSON does not set `research_time`. |
| `researchBoosters` | `[]` | Booster blocks placed under a pedestal to speed up or discount research. Format per entry: `"block_id, speed%, cost%, tier, mode"`. See [Research System](./research-system.md#research-boosters). |
| `defaultScrollCompletion` | `"consume"` | What happens to a scroll when its research finishes. `consume` uses it up; `replace` puts a fresh scroll for the same stage back into the pedestal; `open` leaves an open scroll as a keepsake. A stage can override this with its own `scroll_completion`. |
| `enableScrollResealing` | `true` | Allow crafting an open scroll back into a sealed one. Crafting follows this immediately, but JEI and EMI build their recipe lists at startup, so the entry only appears or disappears there after a restart. |

### `[loot_replacements]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `useReplacements` | `false` | Replace locked loot with something else instead of removing it. |
| `replacementItems` | `[]` | Item IDs to pick a random replacement from. Checked first. |
| `replacementTags` | `[]` | Item tags (e.g. `c:dusts`) to pick a random replacement from. Used when `replacementItems` is empty or exhausted. |

### `[individual_stages]`

The per-player counterparts of the `[gameplay]` locks. Their notification settings live in `visual.toml` under `[notifications.individual]`.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `lockItemPickup` | `true` | Prevent picking up items locked by individual stages. |
| `lockLoot` | `true` | Handle individually-locked items in Lootr containers and mob loot. Lootr loot is checked against the player it is rolled for; mob drops are shared world items, so they are checked against the killing player. |
| `dropOnRevoke` | `true` | Drop locked items from a player's inventory when their individual stage is revoked. |
| `lockBlockBreaking` | `true` | Individually-locked blocks become far harder to break. |
| `lockedBlockBreakSpeedMultiplier` | `0.05` | Break-speed multiplier for individually-locked blocks. |
| `lockItemUsage` | `true` | Prevent using individually-locked items. |
| `lockBlockInteraction` | `true` | Prevent opening the GUI of individually-locked blocks. |
| `lockEnchanting` | `true` | Prevent applying individually-locked enchantments. |
| `lockRecipes` | `true` | Let individual stages gate recipes at the stations that know who is crafting: crafting table, 2×2 inventory grid, stonecutter, smithing table. Furnaces, hoppers and autocrafters resolve recipes with nobody there and stay global-only. |

### `[structure_lock]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `checkInterval` | `10` | Ticks between checks for whether a player is inside a locked structure. |
| `messageEnabled` | `true` | Send a message when a player enters a locked structure. |
| `messageFormat` | `"&cYou cannot enter &e{structure}&c yet!"` | Format of that message. Supports `{stage}` and `{structure}`. |
| `showInChat` | `false` | Also send it to chat, not just the actionbar. |
| `damageEnabled` | `false` | Damage players inside a locked structure. |
| `damageAmount` | `1.0` | Damage per tick interval. |
| `damageInterval` | `20` | Ticks between damage ticks. |
| `lockPadding` | `0` | **Advanced.** Extra blocks around each structure piece when building the lock zone, on top of a fixed 2-block buffer. Range 0–16. |
| `clusterDistance` | `6` | **Advanced.** How far apart two pieces of the same structure can be while still joining into one lock zone. Higher = larger, more filled-in zones. Range 0–32. |
| `blockRightClick` | `true` | Cancel right-click interactions inside a locked structure. |
| `blockLeftClick` | `true` | Cancel left-click interactions inside a locked structure. |
| `blockProjectiles` | `true` | Cancel projectiles the moment they would impact something inside a locked structure. |

### `[biome_lock]`

| Setting | Default | Description |
| :--- | :--- | :--- |
| `checkInterval` | `10` | Ticks between checks for whether a player is inside a locked biome. Range 1–200. |
| `effectsEnabled` | `true` | Apply potion effects to players standing in a locked biome. |
| `effects` | `["minecraft:blindness, 30, 0"]` | Effects applied. Format per entry: `"effect_id, seconds, amplifier"`. |
| `clearEffectsOnLeave` | `false` | Clear those effects as soon as the player leaves, instead of letting them run out. |
| `messageEnabled` | `true` | Send a periodic message while inside a locked biome. |
| `messageFormat` | `"&cYou cannot survive in &e{biome}&c yet!"` | Format of that message. Supports `{stage}` and `{biome}`. |
| `showInChat` | `false` | Also send it to chat. |
| `damageEnabled` | `true` | Damage players inside a locked biome. |
| `damageAmount` | `1.0` | Damage per tick interval. Range 0.1–100.0. |
| `damageInterval` | `20` | Ticks between damage ticks. Range 1–600. |
| `blockRightClick` | `true` | Cancel right-click interactions inside a locked biome. |
| `blockLeftClick` | `true` | Cancel left-click interactions inside a locked biome. |
| `blockProjectiles` | `true` | Cancel projectiles and explosions the moment they would impact something inside a locked biome. |

### `[zone_lock]`

Zones carry their own rules per zone, so almost nothing about them is configured server-wide. The one thing that is: which item marks out corners in the world.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `markerItem` | `"minecraft:stick"` | Item used to mark out zone corners. Sneak + left click sets the first corner, sneak + right click the second. Requires permission level 2, the same bar as opening the editor. Without sneaking the item behaves completely normally, so something you already carry is a safe choice. Leave empty to switch marking by item off and use `/history zone` instead. |

---

## Debugging and Logging

History Stages writes two kinds of log to `config/historystages/logs/`:

*   **Load-time diagnostic reports (`debug-*.log`)** — config validation and registry checks, listing both global and individual stages. Useful for finding problems at modpack startup.
*   **Runtime event logs (`runtime-*.log`)** — stage changes, blocked actions and inventory issues as they happen. Turn these on with `logging.enableRuntimeLogging` in `gameplay.toml`.

To stop the chat debug messages, set `logging.showDebugErrors = false` in `gameplay.toml`.
