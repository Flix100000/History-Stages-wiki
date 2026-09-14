---
title: Editor Toolkit
sidebar_position: 7
---

> **API generation 6** · Requires History Stages **6.0.0+** on **NeoForge 1.21**.
> The addon platform does not exist on Fabric or Forge 1.20 yet.

**The same toolkit serves all five extension points, and that is the whole reason an addon's tab looks like a built-in one — it is built from the same widgets.**

A lock category, a requirement, an auto-trigger, a stage settings group and a config section all reach the packmaker through the same rows, search bars, pickers and input screens the mod draws for itself. There is no addon-flavoured widget set beside the real one, so a tab is not "styled to match": it matches because it is the same code. → [Addon Development](./addon-development.md) covers where each extension point plugs in; this page is what a maintainer then sees.

## Three tiers

How much UI you write is a choice, and the first tier is none at all.

| Tier | What you write | How you get it |
| :--- | :--- | :--- |
| 1 — reuse a list | Nothing. The addon says which ids exist. | `CategoryEditor.ofIdList`, `TriggerEditor.ofIdList`, `RequirementEditor.ofIdList` / `ofIdCount` |
| 2 — your own list | A subclass of `AbstractSearchableList<T>`, supplying the data source, the row drawing and the match predicate | Hand it back from the tab's picker factory, the way `GenericIdPicker` is |
| 3 — draw it yourself | `renderContent`, `rowAt` and whichever input hooks you need | Implement `createTab` and return a tab of your own |

Tier 2 is the middle ground and is easy to miss. `AbstractSearchableList<T>` already owns the search bar, the filter dropdown, the panel frame, the scrollbar arithmetic, the mouse and keyboard handling and show/hide; a subclass supplies `loadEntries`, `getIdForFilter`, `matchesQuery`, `selectionValueOf` and `renderRow`. `GenericIdPicker` is that subclass for the case where four of those five answers are the identity — which is why tier 1 exists at all.

Nothing forces a whole addon into one tier. The demo takes tier 1 for one of its auto-triggers and tier 3 for its lock category, in the same file.

## Tier 1: one call

The demo registers its "relic found" trigger with no UI code whatsoever:

```java
event.register(TriggerEditor.ofIdList(
        DemoAddonCategory.TRIGGER_TYPE,
        "editor.historystages.demo.auto_trigger.relic_found",
        "editor.historystages.demo.search.relics",
        DemoAddonCategory::candidateRelics,
        RelicFoundTrigger::new,
        t -> t instanceof RelicFoundTrigger r ? r.relic() : ""));
```

The last two arguments are the pair that makes the free tier work in both directions.

`RelicFoundTrigger::new` is the **factory**: `Function<String, TriggerCondition>`, called with whichever id the maintainer picked out of the list, returning the condition to store on the stage.

`t -> t instanceof RelicFoundTrigger r ? r.relic() : ""` is the **way back**: `Function<TriggerCondition, String>`, handed a condition that was loaded from disk and asked which id it was built from. Only the addon can read its own trigger, so without this the editor has nothing to print in the value column. The five-argument overload of `ofIdList` supplies `t -> ""` for it, and lists render that as the bare type — honest, but a trigger list where every row says the same thing.

> **Note:** The type string passed first must name a trigger type that is actually registered, and the same holds for `CategoryEditor.ofIdList` and `RequirementEditor.ofIdList` / `ofIdCount`. Those two build their tab against the registered category or requirement and throw `IllegalStateException` from `createTab` when nothing is registered under the id — at the moment the tab is opened, naming the id.

`RequirementEditor` has one extra wrinkle: both of its factories read and write `IdCountEntry`, so a requirement using either must have registered with `RequirementStorage.gson(IdCountEntry.class)`. `ofIdCount` adds an amount dialog on top of the picker; `ofIdList` stores the same entry shape with a count of 1, rather than a second shape differing by one field.

## Tier 3: drawing your own tab

At the other end, a tab draws its own content and the host stays out of the way. This is the demo's lock-category tab in full — `onShown`, `contentHeight`, `rowAt`, `renderContent`, `mouseClicked` and all four row slots, in one file:

```java
package net.bananemdnsa.historystages.demo;

import net.bananemdnsa.historystages.api.editor.StringListCategoryTab;
import net.bananemdnsa.historystages.api.editor.TabInputContext;
import net.bananemdnsa.historystages.api.editor.TabRenderContext;
import net.bananemdnsa.historystages.api.editor.widget.EditorRowList;
import net.bananemdnsa.historystages.api.lock.LockCategory;
import net.minecraft.network.chat.Component;

/**
 * The stand-in addon's lock-category tab, drawing itself.
 *
 * <p>Its twin on the dependency side gets more attention, but this one is the proof that matters
 * for the <em>lock</em> axis: the stage editor honours the same hooks, so an addon writes a tab the
 * same way whichever axis it plugs into. Without something like this the hook is only claimed to
 * work there.
 *
 * <p>What it shows that a plain row list cannot: taller rows, a colour block painted per entry, and
 * a button inside the row that moves the entry up. That last one is real editing and not a
 * decoration — the order of a category's entries is stored, so the button changes the stage file.
 *
 * <p>Reading and writing are inherited untouched from {@link StringListCategoryTab}. An addon that
 * only wants the list keeps {@code CategoryEditor.ofIdList} and writes none of this.
 */
final class DemoCategoryTab extends StringListCategoryTab {

    private static final int ROW_HEIGHT = 30;

    private final EditorRowList rows = new EditorRowList(ROW_HEIGHT);

    DemoCategoryTab(LockCategory<String> category, PickerFactory pickerFactory, Runnable onChanged) {
        super(category, pickerFactory, onChanged);
    }

    @Override
    public void onShown() {
        rows.resetSlideIn();
    }

    @Override
    public int contentHeight(int width) {
        return rows.heightForRows(entries().size());
    }

    @Override
    public int rowAt(TabInputContext ctx) {
        return rows.rowAt(ctx, entries().size());
    }

    @Override
    public boolean renderContent(TabRenderContext ctx) {
        rows.render(ctx, entries().size(), (row, i) -> {
            String relic = entries().get(i);
            row.leading(10, (g, x, y, w, h) -> g.fill(x, y + 2, x + w, y + h - 2, colourFor(relic)));
            row.text(relic);
            row.badge("#" + (i + 1), 0x888888);
            if (i > 0) {
                row.button(Component.translatable("editor.historystages.demo.row.move_up").getString(),
                        () -> moveUp(i));
            }
        });
        return true;
    }

    @Override
    public boolean mouseClicked(TabInputContext ctx, int button) {
        return button == 0 && rows.mouseClicked(ctx);
    }

    private void moveUp(int index) {
        if (index <= 0 || index >= entries().size()) return;
        String moved = entries().remove(index);
        entries().add(index - 1, moved);
        markChanged();
    }

    /** A stable colour per id, so the same relic looks the same every time the screen opens. */
    private static int colourFor(String relic) {
        int hash = relic.hashCode();
        return 0xFF000000 | (0x404040 + (hash & 0x7F7F7F));
    }
}
```

Three things in there are worth pulling out.

`renderContent` returns **true**, which is the tab saying "I drew it". Returning false — the default — means the host falls back to drawing `entries()` as its own standard rows, which is what every tab written before the self-drawing hooks existed relies on.

`rowAt` exists because the host knows where *its* rows are and cannot know where yours went. Without an answer, a self-drawing tab could never offer a right-click menu on a row.

Reading and writing are not overridden at all. `load` and `store` come down untouched from `StringListCategoryTab`, which goes through `LockCategory.read` / `write` — so a tab and a lock check can never disagree about where a category's entries live.

## EditorRowList and its slots

`EditorRowList` is the editor's card row as a widget: chrome, hover lift, the staggered slide-in, the marquee for text too long to fit, the badge stack and hit testing. It does **not** own scrolling — the host screens keep their own scrollbar and smooth-scroll animation. Keep one instance per tab.

Inside the builder handed to `render`, a row declares what goes in it, never how it is drawn:

| Slot | Signature | What it is |
| :--- | :--- | :--- |
| `leading` | `Row leading(int width, RowPainter painter)` | Reserves `width` pixels at the row's left edge and lets you paint them yourself — a colour block, a swatch, anything. The only free-form slot. |
| `text` | `Row text(String text)` | The row's main label. Marquees on hover when it does not fit, and is ellipsised otherwise. |
| `subtitle` | `Row subtitle(String text)` / `Row subtitle(String text, int colour)` | A second, dimmer line under the label. Drawn only when the list was built with room for it — at the default row height it is ignored, so setting one on a normal list changes nothing rather than producing a clipped half-line. Cut rather than marqueed: two lines chasing each other under one cursor is noise. |
| `badge` | `Row badge(String text)` / `Row badge(String text, int colour)` | Short right-aligned text such as `[NBT]`. Several stack right to left in declaration order. Defaults to the editor's gold. |
| `button` | `Row button(String label, Runnable onClick)` / `Row button(String label, @Nullable String tooltip, Runnable onClick)` | A badge with a hit zone and a handler. |
| `dropdown` | `Row dropdown(String label, @Nullable String tooltip, boolean expanded, SlotClick onClick)` | A button wearing the caret every other menu in the editor wears. The handler is told the slot's rectangle so a popup can hang off it. Use it only when a menu really opens — a caret over something that merely cycles teaches people not to trust the first click. |
| `toggle` | `Row toggle(boolean value, @Nullable String tooltip, ToggleClick onPick)` | The editor's on/off switch as a slot, for a row whose whole content is one yes-or-no. Picked, not flipped: clicking the side already showing is a no-op, so a double click does not undo itself. Never draw a button labelled "on"/"off" instead — that is a third way of drawing the same question. |

The set was read off the built-in tabs rather than invented, and a row needing something outside it paints it through `leading`.

For a two-line row, build the list with a height that leaves room — `new EditorRowList(32)` — and override `contentHeight(int)` to return `rows.heightForRows(count)`. The default on `EditorTab` measures at the standard height, and a host scrolling by that measurement cuts the last rows off.

**The button in the demo tab is real editing, not decoration.** `moveUp` mutates the live `entries()` list and calls `markChanged()`; a category's entry order is part of what `store` writes back through `LockCategory.write`. Pressing that button changes the stage file. `Row.isHovered()` is set before your builder runs, so a builder can also decide to show something only while the cursor is on that row.

Two more pieces of the widget matter to a tab that uses it. `rows.rowAt(ctx, count)` is pure arithmetic and safe before the first frame has been drawn. `rows.mouseClicked(ctx)` fires whichever button zone the cursor is over, reading the rectangles the last `render` recorded — sound, because a click always follows a frame drawn with the same layout — and returns true when it hit one, so the caller stops there.

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

## Registering the editor

The demo's category editor, whole:

```java
@SubscribeEvent
public static void onRegisterEditors(RegisterCategoryEditorsEvent event) {
    if (!DemoAddonCategory.enabled()) return;

    event.register(new CategoryEditor() {
        @Override
        public String categoryId() {
            return DemoAddonCategory.CATEGORY_ID;
        }

        @Override
        public CategoryTab createTab(Runnable onChanged, StageScope scope) {
            return new DemoCategoryTab(DemoAddonCategory.category(),
                    (onSelect, alreadyAdded) -> {
                        GenericIdPicker picker = new GenericIdPicker(
                                "editor.historystages.demo.search.relics",
                                DemoAddonCategory::candidateRelics, onSelect, alreadyAdded);
                        picker.setMultiSelect(true);
                        return picker;
                    },
                    onChanged);
        }
    });
}
```

Two things about that.

**Editor registration is client-side.** The subscriber carries `value = Dist.CLIENT`:

```java
@EventBusSubscriber(modid = HistoryStages.MOD_ID, value = Dist.CLIENT,
        bus = EventBusSubscriber.Bus.MOD)
```

`RegisterCategoryEditorsEvent` and `RegisterTriggerEditorsEvent` fire once on the client only, deliberately separate from the common-side events that register the category or the trigger type itself — the server gates with those, while a tab is pure UI. Registering a category and giving it no editor is legal and means exactly what it looks like: the category loads, stores and gates, it just cannot be edited in game.

**`createTab(Runnable onChanged, StageScope scope)` hands you the callback you must fire.** It is how the editor learns the stage is dirty and re-measures its scroll extent, and nothing calls it for you. Pass it down to whatever you build — `AbstractCategoryTab` takes it in its constructor and exposes it as the protected `markChanged()`, which is what the demo's `moveUp` calls. A tab that changes data without firing `onChanged` leaves the editor believing nothing happened.

`createTab` runs once, when the editor opens. `rebuildPicker()` is called from the screen's `init()`, which Minecraft runs again on **every window resize** — so the picker is rebuilt each time while the tab and its entries are created once and must survive. A tab that rebuilt its entry list from `init()` would throw the maintainer's edits away on a resize.

## Pickers

`GenericIdPicker` (`net.bananemdnsa.historystages.api.editor.GenericIdPicker`) is the ready-made one: a searchable list over whatever ids the addon says are available.

```java
GenericIdPicker picker = new GenericIdPicker(
        "editor.mymod.search.trades",   // lang key for the search hint, not a string
        MyTrades::allKnownTradeIds,     // asked each time the picker opens
        onSelect,
        alreadyAdded);
picker.setMultiSelect(true);
```

The candidates supplier is queried on every open rather than cached, so a list that depends on world state stays current. The search hint is a lang key so an addon's picker is translatable like the rest of the editor.

`setMultiSelect(true)` is what the demo uses, and what every free-tier category editor turns on — a maintainer filling a category picks several ids in a row without the panel closing between them. There is one case where it must stay off: `RequirementEditor.ofIdCount` leaves it false, because with an amount every pick opens the amount dialog, and a second pick made behind an open dialog is lost.

`PickerOverlay` (`net.bananemdnsa.historystages.api.editor.widget.PickerOverlay`) is the interface underneath, for building your own. It names what a host screen needs from any overlay — `show`, `hide`, `isVisible`, `setFilter`, `render`, and the input methods `mouseClicked`, `mouseDragged`, `mouseReleased`, `mouseScrolled`, `keyPressed`, `charTyped`. `AbstractSearchableList<T>` implements it, so a tier-2 subclass gets the whole set for free, and `EditorTab.activeOverlay()` returns this type rather than a concrete picker — which is what lets a tab put up a dropdown of its own beside the Add picker and have the host render and feed both.

> **Note:** What a tab hands its picker back through is `PickerFactory` — `PickerOverlay create(Consumer<String> onSelect, Supplier<Collection<String>> alreadyAdded)`. Configuration belongs in the factory rather than in the tab, because it differs per category. Passing `alreadyAdded` is what makes the picker's **Hide already added** filter option exist at all: `AbstractSearchableList` registers that option only when the supplier is non-null, and consults the supplier when a maintainer switches it on. It hides those entries rather than greying them out, and it is off unless toggled.

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

## Right-click actions on entries

`EntryAction` adds rows to the context menu a maintainer gets on a tab row. Declare them from `entryActions()` on `CategoryEditor` or `RequirementEditor`; they are **appended** after the built-in entries, so copy and remove stay where a maintainer expects them and an addon adds to the menu instead of replacing it.

```java
@Override
public List<EntryAction> entryActions() {
    return List.of(EntryAction.of("editor.mymod.context.cycle_rarity",
            ctx -> tab.cycleRarity(ctx.index())));
}
```

An action takes the **row index**, not the entry. The tab already owns its rows, so threading a typed entry through every declaration would buy nothing — the addon closes over its own tab and looks the entry up itself.

`EntryActionContext` is what the action is handed when it runs, and it covers the three shapes an action can take:

| Member | What it does |
| :--- | :--- |
| `index()` | The row that was right-clicked. |
| `markChanged()` | Say the data changed, so the editor marks the stage dirty. |
| `openScreen(Screen)` | Ask the host to push a screen. |
| `openOverlay(PickerOverlay)` | Ask the host to show an overlay and feed it input until it hides itself. |
| `EntryActionContext.dataOnly(int, Runnable)` | Builds a context with both sinks inert — so a unit test can construct one at all. |

> **Note:** Call the methods, never the record accessors. `ctx.dirtySink()` hands back the `Runnable` and does nothing; it compiles, throws nothing, and the change is silently never registered. The same mistake on a tooltip sink once disabled the editor's whole add menu. It applies to `TabRenderContext.tooltip(...)` as well.

Four built-in popups can be offered from an addon's menu rather than rebuilt:

| Factory | Opens |
| :--- | :--- |
| `EntryAction.editNbt(IntFunction<String> itemId, IntFunction<JsonObject> current, BiConsumer<Integer, JsonObject> apply)` | The mod's NBT editor, as a screen. |
| `EntryAction.dimensionFilter(IntFunction<String> entryId, IntFunction<List<String>> current, BiConsumer<Integer, List<String>> apply)` | The dimension allow-list popup. |
| `EntryAction.spawnSources(IntFunction<String> entryId, IntFunction<List<String>> current, BiConsumer<Integer, List<String>> apply)` | The spawn-source block-list popup. |
| `EntryAction.interactionActions(IntFunction<String> entryId, IntFunction<List<String>> current, BiConsumer<Integer, List<String>> apply)` | The interaction-action block-list popup. |

**All four live in `EntryAction.java`**, alongside the generic `EntryAction.of(...)`. `EntryActionScreens.java` is a separate, package-private class holding one method — `nbtEditor(...)`, which `editNbt` delegates to — and the split is deliberate rather than tidiness.

The reason is worth knowing before you write a public class of your own that touches a screen: **a public class whose constructor names a Minecraft type is a class no unit test can build.** `new NbtItemEditScreen(...)` passed to a `Screen` parameter is an assignment between two Minecraft types, and the bytecode verifier loads *both* the instant it touches the enclosing class. While that expression sat inside `EntryAction`, every unit test that so much as named `EntryAction` died with a `NoClassDefFoundError` — from tests mentioning no screen at all. Behind a call into another class, the verifier's check happens over there instead, in a class nothing tests. `EntryActionContext.dataOnly` exists for the same reason from the other side: its two sinks are typed on Minecraft classes, which test source cannot name.

## One tab, several sections

Some categories are one decision. A packmaker gating a merchant answers three questions in one sitting — which offers, which professions, which levels — and three entries in a strip that already holds a dozen would bury the other nine. `CompositeCategoryTab` is one tab holding several category tabs, with a bar of sections above the list to change between them.

```java
new CompositeCategoryTab(
        "mymod:relics",                          // the tab's own id
        "editor.mymod.tab.relics",               // its label on the strip
        "editor.mymod.tooltip.relics",           // its tooltip
        List.of(new CompositeCategoryTab.Section(commonTab, "editor.mymod.relics.section.common"),
                new CompositeCategoryTab.Section(rareTab,   "editor.mymod.relics.section.rare")),
        scope)                                   // the scope createTab handed you
```

Return one from `createTab` and the host does the rest: it recognises the type, reserves the strip above the list and draws the bar. The bar is the host's, not the tab's — it is fixed above the scrolling area rather than sitting at the top of it, because a switcher that scrolls out of sight once a section fills the screen is a switcher nobody can find their way back to.

**`load` and `store` reach every section, not just the visible one.** That is the whole reason this type exists rather than a tab that swaps its rows: the sections are a way of looking at the stage, and all of them are live. Storing only what was on screen would drop what a maintainer entered before switching sections, and they would find out when the stage came back without it.

**Sections the current stage cannot use are greyed rather than hidden.** A section is disabled when the stage being edited is individual and the section's category does not serve that scope — which the tab reads from the section itself, so a category that changes its mind about scopes cannot leave a stale copy behind. A disabled section cannot be selected, the tab never opens on one, and the whole tab is only withheld from individual stages when *none* of its sections fits. That last rule is why the built-in entity tab still works per player: spawn locks are global-only, attack and interaction locks are not.

Everything else about the tab answers for the section on screen — its entries, its rows, its picker, its right-click menu — because a row index means nothing else. The one exception is the number the strip shows in brackets after the tab's name, which sums every section: a tab holding twenty offers must not claim `(0)` because someone left it on another section.

## Widgets

Everything under `net.bananemdnsa.historystages.api.editor.widget`. Nineteen types, and the built-in screens are made of these same nineteen.

| Type | What it is |
| :--- | :--- |
| `AbstractModalScreen` | Shared chrome for every modal dialog: backdrop, gold-accented frame, title, optional subtitle, confirm/cancel row. Subclasses declare `contentHeight()` and draw into what they are handed, so no dialog hardcodes a box size. |
| `AbstractInputScreen` | A modal built from a declarative list of `InputField` specs — builds the boxes, lays them out, validates live, and shows the first error above the button row. Errors stay hidden until the user has typed or pressed confirm once. |
| `AbstractSearchableList<T>` | The scaffold behind every picker overlay: search bar, filter dropdown, panel frame, scrollbar maths, input handling, show and hide. Implements `PickerOverlay`. |
| `PickerOverlay` | The interface a host screen needs from any overlay — show it, draw it, hand it input, ask whether it is still up. What `EditorTab.activeOverlay()` returns. |
| `EditorRowList` | The editor's card row: chrome, hover, slide-in, marquee, badge stack, hit testing. Seven slots per row. |
| `InputField` | The declarative spec for one field on an `AbstractInputScreen`. `number` and `decimal` derive their typing filter, max length and range validator from the range itself. |
| `InputValues` | The trimmed field values handed to `onConfirm`, produced only after validation passed — so the numeric getters cannot see malformed input. |
| `CountInputScreen` | The ready-made "ask for one count or threshold" dialog, showing the subject id as its subtitle. |
| `ChoiceOverlay` | A modal list of named choices: a title, one row per option, a click runs that option's action. For the question a searchable list is too heavy for and a number field cannot express — "which of these four". Rows carrying `Option.more` draw a chevron, marking a choice that opens another step. Arrow keys move the selection, Enter takes it, ESC closes. Implements `PickerOverlay`, so anything that can show a searchable list can show this. |
| `ChoiceScreen` | That same list as a screen of its own, for `TriggerEditor.authoringScreen` and anywhere else a `Screen` is what gets returned. Picking a row or pressing ESC returns to the parent; a row that opens a screen of its own is free to do so. |
| `FormattedTextScreen` | The dialog for text carrying format codes and placeholders: wrapping field, live preview underneath, codes and placeholders as buttons. Codes are written `&`, not `§`. |
| `NumberStepper` | A bounded integer as minus, readout, plus. Clamps internally, greys a button out at its end of the range, and the readout doubles as a small digits-only field for wide ranges. |
| `SearchBar` | The search field plus funnel-icon filter button, owning its text, focus and clipboard handling and an embedded `FilterDropdown`. |
| `FilterDropdown` | The funnel button and its checkbox popup. Options sharing a non-null `groupId` are mutually exclusive; a null `groupId` makes an independent checkbox. |
| `ToggleControl` | The editor's on/off switch: both halves side by side, the active one filled, and the fill travels when the value changes. A click sets the half it landed on rather than flipping, so clicking what is already set does nothing. Keep one `ToggleControl.State` per switch and call `update()` once a frame before `draw()`. |
| `ToggleGeometry` | Where that switch's two halves begin and end. Names no Minecraft type, so a tab can lay a switch out — or work out which half a click meant — without drawing anything. |
| `SegmentBar` | The same switch with more than two segments: the selected one filled, the fill travelling when it changes, a click selecting the segment it landed on rather than advancing. For a control you draw inside your own `renderContent` — the bar above a `CompositeCategoryTab` is drawn by the host and needs nothing from you. Keep one `SegmentBar.State` per bar and call `update()` once a frame before `draw()`; pass one `disabled` flag per label, and hand `update()` a hovered index of `-1` for a segment nobody can choose. |
| `TradeRowGeometry` | Where the parts of a trade row sit, in the merchant window's reading order: what it costs, an arrow, what you get. The painted zone is one fixed width for every row and the second price keeps its place even when an offer has only one, so the names all start at the same x and the list can be read down a column. Names no Minecraft type. |
| `SegmentBarGeometry` | The arithmetic under both, for any number of labels: segment width sized from the widest so nothing moves when the selection does, where segment *n* starts, and which one a click landed in. `ToggleGeometry` is the two-segment front door onto it and is unchanged — a value that is on or off is a different gesture from choosing which section you are looking at, and only the naming differs. |

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

---

→ [Lock Categories](./lock-categories.md) — giving a lock category its tab.
→ [Requirements](./requirements.md) — the dependency axis and its own tabs.
→ [Auto-Triggers](./auto-triggers.md) — trigger types, and what an editor authors.
→ [Stage Settings](./stage-settings.md) — settings groups, including the custom-screen escape hatch.
→ [Config Sections](./config-sections.md) — the config screen's own field kinds.
→ [Addon Development](./addon-development.md) — the entry point and the five extension points.
