---
id: configuration
title: Configuration (TOML)
---

History Stages provides extensive configuration options to fine-tune its behavior, accessible via two TOML files located in the `/config` directory. These settings can also be managed through the in-game config editor.

## Common Config (`historystages-common.toml`)

This file contains server-side settings that govern core game logic and global behaviors. These settings apply to all players on the server.

| Setting | Default Value | Description |
| :--- | :--- | :--- |
| `showWelcomeMessage` | `true` | Controls the display of a welcome message to players upon joining the server. |
| `showDebugErrors` | `false` | If `true`, configuration validation errors are displayed in chat, assisting in debugging modpack setups. |
| `lockMobLoot` | `true` | If `true`, locked items are removed from mob drops. |
| `lockBlockBreaking` | `true` | If `true`, locked blocks become significantly harder to break and will not drop items. |
| `lockedBlockBreakSpeedMultiplier` | `0.05` | A multiplier for the break speed of locked blocks. A value of `0.05` results in blocks breaking 20 times slower. |
| `structure_lock.checkInterval` | `10` | Interval in ticks for checking if a player is inside a locked structure. |
| `structure_lock.messageEnabled` | `true` | If `true`, sends a message when a player enters a locked structure. |
| `structure_lock.messageFormat` | `"&cYou cannot enter &e{structure}&c yet!"` | Customizes the format of the structure lock message. Supports `{stage}` and `{structure}` placeholders. |
| `structure_lock.showInChat` | `false` | If `true`, structure lock messages are sent to chat in addition to the actionbar. |
| `structure_lock.damageEnabled` | `false` | If `true`, players take damage while inside a locked structure. |
| `structure_lock.damageAmount` | `1.0` | Amount of damage dealt per damage tick when inside a locked structure. |
| `structure_lock.damageInterval` | `20` | Interval in ticks between damage ticks when inside a locked structure. |
| `structure_lock.blockRightClick` | `true` | Cancel all right-click interactions (blocks, items, entities) while inside a locked structure. |
| `structure_lock.blockLeftClick` | `true` | Cancel all left-click interactions (attacking entities, breaking blocks) while inside a locked structure. |
| `structure_lock.blockProjectiles` | `true` | Cancel projectiles (arrows, snowballs, ender pearls, etc.) the moment they would impact something inside a locked structure. |
| `structure_lock.lockPadding` | `0` | **Advanced.** Extra blocks added around each structure piece when building the lock zone, on top of a fixed 2-block safety buffer. Range 0-16. |
| `structure_lock.clusterDistance` | `6` | **Advanced.** How far apart (in blocks) two pieces of the same structure can be while still being joined into one connected lock zone. Higher = larger, more filled-in zones; lower = more precise, more gaps. Range 0-32. |
| `lockItemUsage` | `true` | If `true`, players are prevented from using (eating, equipping, attacking with) locked items. |
| `lockEntityItems` | `true` | If `true`, prevents interaction with or breaking of armor stands and item frames containing locked items. |
| `lockBlockGUI` | `true` | If `true`, prevents players from opening GUIs (e.g., chests, furnaces, crafting tables) of locked blocks. |
| `lockContainerInteraction` | `true` | If `true`, prevents moving individually-locked items within containers. |
| `lockEnchanting` | `true` | If `true`, prevents applying locked enchantments via anvils and enchanting tables. |
| `broadcastChat` | `true` | If `true`, unlock/lock messages are broadcast to all players on the server. |
| `unlockMessageFormat` | `"&aNew Era: {stage}"` | Customizes the format of the global unlock message. Supports `{stage}` placeholder and Minecraft color codes (`&a`, `&b`, etc.). |
| `individualUnlockMessageFormat` | `"&a{player} unlocked: {stage}"` | Customizes the format of individual unlock messages. Supports `{player}` and `{stage}` placeholders. |
| `useActionbar` | `true` | If `true`, messages (unlocks, blocked actions) are displayed in the actionbar. |
| `useSounds` | `true` | If `true`, plays notification sounds for unlocks and blocked actions. |
| `useToasts` | `true` | If `true`, displays advancement-style toast popups for unlocks. |
| `defaultStageIcon` | `"minecraft:book"` | The default item ID used as the icon in unlock toast notifications if a stage doesn't specify an `icon`. |
| `researchTimeInSeconds` | `20` | The default research duration in seconds for stages. This value is used if `research_time` is not specified in a stage's JSON file or is set to `0`. |
| `showDependencyScreenInPedestal` | `true` | If `true`, the Research Pedestal GUI expands to show the dependency checklist. |
| `researchBoosters` | `[]` | List of booster-block definitions placed under a pedestal to accelerate or discount research. Format per entry: `"block_id, speed%, cost%, tier, mode"` (see [Research System](./research-system.md#research-boosters)). |
| `hideLockedItemsInJei` | `false` | If `true`, locked items are removed from the JEI ingredient panel entirely instead of being marked with a lock overlay. |
| `hideLockedRecipesInJei` | `false` | If `true`, recipes whose output is a locked item are hidden from JEI entirely instead of receiving the "Locked" overlay. |
| `lockedItemMultiStagePolicy` | `STRICT` | How items assigned to multiple stages behave. `STRICT` = locked while ANY assigned stage is still locked. `LENIENT` = unlocked as soon as ANY assigned stage is unlocked. |
| `enableRuntimeLogging` | `false` | If `true`, enables comprehensive runtime event logging to a file, tracking stage changes, blocked actions, and inventory issues for debugging. |
| `useReplacements` | `false` | If `true`, locked items found in chests or mob drops will be replaced by items from `replacementItems` or `replacementTag` instead of being removed. |
| `replacementItems` | `[]` | A list of item IDs (e.g., `minecraft:stick`) that can be used as replacements for locked loot when `useReplacements` is `true`. |
| `replacementTag` | `""` | An item tag (e.g., `forge:dusts/stone`) that can be used as a fallback for loot replacement if `replacementItems` is empty or exhausted. |

### Lock Messages (`[lock_messages]`)

The `lock_messages` subsection of `historystages-common.toml` lets modpack creators override the actionbar/chat messages shown when players interact with locked content. All entries default to an empty string, which falls back to the built-in translation key — so existing localisations (en_us, de_de) are preserved unless overridden. Override strings support `&`-style color codes (`&c`, `&a`, …) and the same `{stage}` / `{player}` / `{structure}` placeholders as the other message settings where applicable.

| Setting | Lang Key Fallback | Description |
| :--- | :--- | :--- |
| `itemLocked` | `message.historystages.item_locked` | Shown when interacting with a locked item. |
| `blockLocked` | `message.historystages.block_locked` | Shown when interacting with a locked block. |
| `entityItemLocked` | `message.historystages.entity_item_locked` | Shown when interacting with armor stands or item frames holding locked items. |
| `enchantmentLocked` | `message.historystages.enchantment_locked` | Shown when applying a locked enchantment via an anvil or enchanting table. |
| `dimensionUnknown` | `message.historystages.dimension_unknown` | Shown when entering a locked dimension. |
| `mobUnknown` | `message.historystages.mob_unknown` | Shown when attacking a locked mob. |

## Client Config (`historystages-client.toml`)

This file contains client-side settings that control visual display and feedback for individual players. These settings can be adjusted by each player.

| Setting | Default Value | Description |
| :--- | :--- | :--- |
| `showDependenciesOnScroll` | `true` | If `true`, the required dependencies are shown in the tooltip of Research Scrolls. |
| `hideFulfilledDependencies` | `false` | If `true`, fulfilled dependencies are hidden from the Research Scroll tooltip. |
| `showTooltips` | `true` | If `true`, information tooltips (e.g., required stage name) are displayed on locked items. |
| `showStageName` | `true` | If `true`, the required stage name is included in tooltips for locked items. |
| `showAllUntilComplete` | `false` | If `true`, all required stages for an item are shown in tooltips until the item is unlocked. |
| `showLockIcons` | `true` | If `true`, displays a padlock icon overlay on locked items in inventories and JEI (automatically disabled if EMI is present). |
| `jadeShowInfo` | `true` | If `true`, History Stages information is displayed within Jade tooltips for locked blocks/entities. |
| `jadeStageName` | `true` | If `true`, the required stage name is shown in Jade tooltips. |
| `jadeShowAllUntilComplete` | `false` | If `true`, all required stages are shown in Jade tooltips until the item is unlocked. |
| `dimensionLockFeedback` | `"ACTIONBAR"` | Controls feedback for dimension locking (`"ACTIONBAR"`, `"CHAT"`, or `"NONE"`). |
| `mobLockFeedback` | `"ACTIONBAR"` | Controls feedback for mob locking (`"ACTIONBAR"`, `"CHAT"`, or `"NONE"`). |
| `structureLockOverlayEnabled` | `true` | If `true`, displays the red force-field border overlay around locked structures while the player stands inside the lock zone. |
| `structureLockOverlayOpacity` | `0.30` | Opacity of the structure lock force-field overlay. Range 0.0 (invisible) to 1.0 (fully opaque). |

## Debugging and Logging

History Stages includes a two-tier logging system to assist modpack creators and developers:

*   **Load-time Diagnostic Reports (`debug-*.log`):** These reports provide comprehensive config validation and registry checks, listing both global and individual stages. They are used for identifying issues during modpack startup.
*   **Runtime Event Logs (`runtime-*.log`):** These logs track stage changes, blocked actions, and inventory issues in real-time. They offer insights into player progression and potential conflicts. Enable `enableRuntimeLogging` in `historystages-common.toml` to activate. |
