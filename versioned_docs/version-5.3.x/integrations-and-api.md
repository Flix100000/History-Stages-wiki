---
id: integrations-and-api
title: Integrations & API
---

History Stages is designed to integrate with other popular Minecraft mods and provides an API for mod developers. This section covers compatibility and extensibility.

## Mod Integrations (For Modpack Developers)

History Stages integrates with several widely used Minecraft mods, enhancing the player experience and simplifying modpack creation.

| Mod | Integration Details |
| :--- | :--- |
| **JEI (Just Enough Items) / EMI (Everything Modded Items)** | History Stages integrates with these recipe viewers to provide visual feedback on locked content. Locked items are marked with a padlock icon in inventories and recipe displays. Locked recipes display a "Locked" overlay instead of being hidden, indicating content that is not yet accessible. |
| **FTB Quests** | History Stages adds native "History Stage" task and reward types directly into the FTB Quests editor. Tasks and rewards select their target stage through a NameMap dropdown populated with all registered stages (replacing the previous free-text ID field), and the quest book displays each stage's configured display name and per-stage icon. Tasks are event-driven and auto-complete when the corresponding stage is unlocked; a `negate` flag inverts the condition so the task completes when the stage is *locked* instead. Task progress resets automatically if the stage is relocked. Rewards can be configured to either unlock or relock stages. |
| **Jade** | This integration provides enhanced in-game tooltips. When players look at blocks, entities, armor stands, or item frames affected by History Stages, Jade displays information about the required stage. |
| **Lootr** | **Lootr is a required dependency** for History Stages. It ensures the correct handling of locked loot in multiplayer chests, preventing exploits and maintaining progression integrity. |
| **Curios API** | When Curios is present, History Stages extends its item-locking checks to Curio slots, preventing players from equipping locked items into trinket, ring, belt, or other Curios-managed slots. *Forge / NeoForge only — Curios does not exist for Fabric.* |

## Developer API (For Mod Developers)

For mod developers seeking to extend or interact with History Stages programmatically, the mod exposes stage-change hooks. The exact entry point depends on the loader you target: Forge / NeoForge fire bus events, Fabric exposes Fabric `Event<>` listeners. Both surfaces emit the same set of changes and can be consumed by other mods, KubeJS, CraftTweaker, or any scripting framework that can register listeners.

### Forge Events

History Stages dispatches the following events:

*   **`StageEvent.Unlocked`:** This event is fired after a stage is successfully unlocked. It is triggered regardless of the unlock method used (e.g., via admin command, Research Pedestal, or FTB Quests reward). Mod developers can listen for this event to trigger custom actions.
*   **`StageEvent.Locked`:** This event is fired after a stage is relocked. This typically occurs via admin commands or specific FTB Quests rewards. It allows for custom reactions when progression is reversed.

Both `StageEvent.Unlocked` and `StageEvent.Locked` provide methods to retrieve information about the affected stage:
*   `getStageId()`: Returns the unique string ID of the stage.
*   `getDisplayName()`: Returns the human-readable display name of the stage.

### Fabric Events

On Fabric, the same set of changes is exposed via Fabric `Event<>` listeners under `net.bananemdnsa.historystages.api.StageEvents`. Register a listener in your mod initializer:

```java
import net.bananemdnsa.historystages.api.StageEvents;

StageEvents.UNLOCKED.register((stageId, displayName) ->
        System.out.println("History Stages: Stage Unlocked: " + stageId));

StageEvents.LOCKED.register((stageId, displayName) -> { /* ... */ });

StageEvents.INDIVIDUAL_UNLOCKED.register((stageId, displayName, playerUuid) -> { /* ... */ });
StageEvents.INDIVIDUAL_LOCKED.register((stageId, displayName, playerUuid) -> { /* ... */ });
```

All four events fire from a single central code path, so listeners run regardless of how the change was triggered (admin command, Research Pedestal, FTB Quests reward, or another mod's API call).

### KubeJS Example

An example of how a mod developer can listen for a stage unlock event using KubeJS:

```javascript
ForgeEvents.onEvent(
  'net.bananemdnsa.historystages.events.StageEvent$Unlocked',
  event => {
    console.log('History Stages: Stage Unlocked: ' + event.getStageId());
    // Custom logic can be added here, e.g., trigger other events or send messages.
  }
);
```
