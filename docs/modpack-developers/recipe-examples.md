---
title: Recipe Examples
sidebar_position: 7
---

This page collects ready-to-use crafting recipe examples for History Stages items — primarily **Research Scrolls** and the **Research Pedestal**. History Stages itself does not ship default recipes; modpack authors decide how players obtain these items.

> **Stage IDs:** Every scroll recipe references a stage ID (e.g. `iron_age`). This must exactly match the ID defined in your `config/historystages/global/` or `individual/` JSON files. A typo here is the most common reason a custom recipe "doesn't work".

> **Component vs. NBT syntax:** Starting with Minecraft 1.20.5, item data uses **data components** (`minecraft:custom_data`) instead of raw NBT. The examples below use the modern syntax. For 1.20.4 and older, replace `{"minecraft:custom_data":{...}}` with the old `{StageResearch:"..."}` NBT form.

---

## KubeJS

Place these files under `kubejs/server_scripts/`.

### Research Scroll

Works for both **global** and **individual** stages — the recipe form is identical. The `OwnerName` for individual scrolls is set automatically when a player starts researching at the pedestal, not at craft time. Just point `StageResearch` at the stage ID you want.

```js
ServerEvents.recipes(event => {
    event.shaped(
        Item.of('historystages:research_scroll', '{"minecraft:custom_data":{StageResearch:"iron_age"}}'),
        [
            'PPP',
            'PBP',
            'PPP'
        ],
        {
            P: 'minecraft:paper',
            B: 'minecraft:book'
        }
    )
})
```

Replace `iron_age` with your stage ID — global or individual.

### Creative Scroll

```js
ServerEvents.recipes(event => {
    event.shapeless(
        'historystages:creative_scroll',
        ['minecraft:nether_star', 'minecraft:writable_book', 'minecraft:paper']
    )
})
```

### Research Pedestal

```js
ServerEvents.recipes(event => {
    event.shaped(
        'historystages:research_pedestal',
        [
            'GBG',
            'SLS',
            'SSS'
        ],
        {
            G: 'minecraft:gold_ingot',
            B: 'minecraft:writable_book',
            S: 'minecraft:smooth_stone',
            L: 'minecraft:lectern'
        }
    )
})
```

---

## CraftTweaker

Place these files under `scripts/`. CraftTweaker uses ZenScript.

### Research Scroll

```zenscript
craftingTable.addShaped("historystages_research_scroll_iron_age",
    <item:historystages:research_scroll>.withTag({StageResearch: "iron_age" as string}),
    [
        [<item:minecraft:paper>, <item:minecraft:paper>, <item:minecraft:paper>],
        [<item:minecraft:paper>, <item:minecraft:book>,  <item:minecraft:paper>],
        [<item:minecraft:paper>, <item:minecraft:paper>, <item:minecraft:paper>]
    ]
);
```

> **MC 1.20.5+ / 1.21:** Replace `.withTag({...})` with the component-based form:
> ```zenscript
> <item:historystages:research_scroll>.withJsonComponents({
>     "minecraft:custom_data": {StageResearch: "iron_age"} as IData
> })
> ```

Replace `iron_age` with your stage ID — works for global and individual stages.

### Creative Scroll

```zenscript
craftingTable.addShapeless("historystages_creative_scroll",
    <item:historystages:creative_scroll>,
    [<item:minecraft:nether_star>, <item:minecraft:writable_book>, <item:minecraft:paper>]
);
```

### Research Pedestal

```zenscript
craftingTable.addShaped("historystages_research_pedestal",
    <item:historystages:research_pedestal>,
    [
        [<item:minecraft:gold_ingot>,   <item:minecraft:writable_book>, <item:minecraft:gold_ingot>],
        [<item:minecraft:smooth_stone>, <item:minecraft:lectern>,       <item:minecraft:smooth_stone>],
        [<item:minecraft:smooth_stone>, <item:minecraft:smooth_stone>,  <item:minecraft:smooth_stone>]
    ]
);
```

---

## Vanilla Datapack

Place under `data/<your_pack>/recipe/`.

### Research Scroll for a specific stage (`research_scroll_iron_age.json`)

```json
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "PPP",
    "PBP",
    "PPP"
  ],
  "key": {
    "P": { "item": "minecraft:paper" },
    "B": { "item": "minecraft:book" }
  },
  "result": {
    "id": "historystages:research_scroll",
    "count": 1,
    "components": {
      "minecraft:custom_data": {
        "StageResearch": "iron_age"
      }
    }
  }
}
```

---

## Admin Command (for testing)

```
/give @s historystages:research_scroll[minecraft:custom_data={StageResearch:"iron_age"}]
```

For Minecraft 1.20.4 and older:

```
/give @s historystages:research_scroll{StageResearch:"iron_age"}
```

---

## Troubleshooting

| Problem | Likely cause |
| :--- | :--- |
| Scroll crafts but pedestal rejects it | Stage ID typo — check `config/historystages/global/*.json` |
| Recipe doesn't appear in JEI/EMI | Datapack/KubeJS didn't reload — run `/reload` |
| Result item has no name / falls back to "Research Scroll" | `StageResearch` field missing or wrong key casing |
| Old `{StageResearch:"..."}` NBT works on 1.20.4 but not 1.21 | Use the new `minecraft:custom_data` component form |
| CraftTweaker `.withTag()` doesn't apply on 1.21 | Use `.withJsonComponents({...})` instead |
