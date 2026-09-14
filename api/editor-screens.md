---
title: Editor Screens
sidebar_position: 9
---

The full lifecycle contract a tab may override, the gotcha in the one hook that is easy to forget, and the
escape hatch for triggers that have no list to pick from at all. → [Editor Toolkit](./editor-toolkit.md)
covers the three tiers and registering an editor in the first place; → [Editor Widgets](./editor-widgets.md)
covers the row widget, pickers, and the rest of the reference catalogue.

## onShown(), and why forgetting it is a real bug

A tab that draws itself owns its row list. The host resetting *its* row list therefore does not reach yours, and a tab that never overrides `onShown()` never starts the slide-in: its rows appear instead of arriving, while every built-in tab beside them animates.

```java
@Override
public void onShown() {
    rows.resetSlideIn();
}
```

That is the whole fix, and the symptom is why it is documented rather than left to be noticed. Nothing throws, nothing logs, and the failure reads as "the animation was never built" rather than "it was never started" — so the natural next move is to go looking for a feature that is already there.

This was one of three genuine API bugs found while the toolkit was being built, and all three came from **extracting** existing code rather than writing new code. The hand-written original did the right thing; the extraction left it behind, because a step that is invisible when it works is also invisible when it is dropped. Documentation is the only thing that stops the next one — a test cannot see a missing animation, and a review of the extracted class cannot see what is no longer in it.

`onShown()` is called when the tab becomes the visible one, and again when the container underneath it changes.

## Authoring screens

Some things cannot be picked, because there is no list. A trigger holding only a number has nothing for a picker to show, and before `authoringScreen` existed such a trigger could not be authored by an addon at all.

The demo registers one of each kind side by side. This is the second:

```java
event.register(new TriggerEditor() {
    @Override
    public String type() {
        return RelicHoardTrigger.TYPE;
    }

    @Override
    public String labelLangKey() {
        return "editor.historystages.demo.auto_trigger.relic_hoard";
    }

    @Override
    public String searchPlaceholderLangKey() {
        return "editor.historystages.demo.search.relics"; // unused; authoring is a screen
    }

    @Override
    public Collection<String> candidates() {
        return List.of();
    }

    @Override
    public TriggerCondition create(String chosenId) {
        // Never reached while authoringScreen answers; a sane value rather than a throw,
        // because a future caller finding this should get a trigger, not a crash.
        return new RelicHoardTrigger(1);
    }

    @Override
    public Screen authoringScreen(Screen parent, Consumer<TriggerCondition> onCreated) {
        return new CountInputScreen(parent,
                Component.translatable("editor.historystages.demo.auto_trigger.relic_hoard"),
                "", 5, 1, 999,
                count -> onCreated.accept(new RelicHoardTrigger(count)));
    }

    @Override
    public String valueText(TriggerCondition trigger) {
        return trigger instanceof RelicHoardTrigger h ? String.valueOf(h.count()) : "";
    }
});
```

`authoringScreen` returns a screen rather than opening one. The editor owns how its overlays and screens are shown, and an addon calling `setScreen` itself would be reaching past that seam; handing the screen back keeps the decision with the host. `CountInputScreen` is one of the mod's own dialogs, so the result looks like every other number prompt in the editor — parent, title, subject id, default, min, max, and the callback that receives the confirmed count.

**Returning `null` from `authoringScreen` means "use the built-in picker".** That is the default implementation, so a tier-1 editor never mentions the method: `create(String chosenId)` is asked instead, with whatever the maintainer picked. The two are alternatives, which is why the demo's `create` still returns a sane value it never reaches — a future caller finding that method should get a trigger, not a crash.

`valueText(TriggerCondition)` is the same idea as the `reader` argument in tier 1, written out longhand: it is how a stored trigger describes itself in the value column.

## The hooks a tab may override

`EditorTab<C>` is one contract across the axes — the same idea whether it lists a lock category's entries on a stage or a requirement's entries on one dependency group. The type parameter is the only real difference: `C` is a `StageEntry` for a lock category and one `DependencyGroup` for a requirement. `CategoryTab extends EditorTab<StageEntry>`, and `DependencyTab` is its counterpart.

These are `default`, and a simple tab overrides none of them:

| Hook | Default | What it is for |
| :--- | :--- | :--- |
| `int contentHeight(int width)` | `EditorRowList.heightFor(entries().size())` | The single source of content height for both screens. Override it to draw rows of another height, or something that is not rows at all. |
| `boolean renderContent(TabRenderContext ctx)` | `false` | Draw your own content. Returning false means "I drew nothing", and the host draws `entries()` as standard rows. |
| `int rowAt(TabInputContext ctx)` | `-1` | Which of your rows is under the cursor. Needed before a self-drawing tab can offer a right-click menu. |
| `void onShown()` | no-op | Called when the tab becomes visible, and again when its container changes underneath. Where a self-drawing tab restarts its slide-in. |
| `boolean mouseClicked(TabInputContext ctx, int button)` | `false` | A click inside the content area. Return true if consumed. |
| `boolean mouseDragged(TabInputContext ctx, int button)` | `false` | Needed by anything draggable, such as a slider. |
| `boolean mouseReleased(TabInputContext ctx, int button)` | `false` | The other half of a drag. |
| `boolean mouseScrolled(TabInputContext ctx, double scrollX, double scrollY)` | `false` | For a tab with a scroll region of its own. |
| `boolean keyPressed(int keyCode, int scanCode, int modifiers)` | `false` | A tab with a focused field **must** return true for `ESC`, or the host closes the editor instead of leaving the field. |
| `boolean charTyped(char codePoint, int modifiers)` | `false` | Without it, no embedded field can be typed into. |
| `@Nullable String iconItemId(int index)` | `null` | An item id to draw as an icon at the row's left. An id and not an `ItemStack`: a tab says what to show, the host decides how. |
| `@Nullable String badgeText(int index)` | `null` | Short right-aligned text for a host-drawn row, such as `[NBT]`. |
| `boolean hasAddButton()` | `true` | False for a tab with nothing to add to, and the host leaves its Add button out — a single value, or a fixed set of switches, where a button that opens nothing is worse than none. It lived on `DependencyTab` until the lock axis grew the same shape; a dependency tab that already overrides it needs no change. |

Six input methods and not one, because drawing without input is a picture: an embedded number field would take its `+` / `−` clicks through `mouseClicked` and never see a typed digit, and a slider needs `mouseDragged` and `mouseReleased` besides.

> **Note:** `iconItemId` and `badgeText` are honoured by **both** editors. This used to be true of the dependency editor only; the stage editor now asks the tab as well. Its own built-in decorations still come first and a tab's answers are applied after them, so a lock-category tab that returns an icon or a badge is drawn, and badges stack rather than overwrite one another. A self-drawing tab is unaffected either way — it paints its own icon through `EditorRowList`'s `leading` slot and its own badges through `badge`.

The rest of the interface is **not** `default`, and every tab supplies it — usually by extending `AbstractCategoryTab` or `AbstractDependencyTab` rather than by hand:

| Member | Purpose |
| :--- | :--- |
| `String tabLangKey()` | Lang key for the tab label. |
| `String tooltipLangKey()` | Lang key for the tab tooltip. |
| `List<String> entries()` | The rows, **live** rather than a copy — the host indexes into it and expects `removeAt` to be visible immediately. |
| `void removeAt(int index)` | Remove one row. |
| `void load(C container)` | Pull this tab's edit state out of the container being opened. |
| `void store(C container)` | Write it into the container about to be saved. A stage is opened once and saved once; a dependency group is one of several, so its host stores before leaving one and loads after entering the next. |
| `void rebuildPicker()` | Called from the screen's `init()`, which reruns on every window resize. |
| `@Nullable PickerOverlay activeOverlay()` | Whichever of this tab's overlays currently holds input, or null when none is up. One method rather than a list: a tab may own as many overlays as it likes and only it knows which is showing. Null before the first `init()`, because the picker is built there. |
| `void openPicker(int centerX, int centerY, int parentWidth)` | Show the picker at a point the host chooses. |

`CategoryTab` adds two of its own: `String categoryId()`, and `boolean availableForIndividualStages()` — which `AbstractCategoryTab` answers from the category's `supportedScopes()`. That second one is deliberately not on `EditorTab`, because the dependency axis answers the same question from `Requirement.supportedScopes()`, and one shared method would have two different answers under one name.
