#!/usr/bin/env python3
"""One-off migration: History-Stages-wiki-legacy/*.md -> History-Stages-wiki/docs/**/*.md"""
import os
import re

WIKI_DIR = "../History-Stages-wiki-legacy"
DOCS_DIR = "docs"

# old wiki page name -> (new relative path without extension, display title, position within its folder)
PAGE_MAP = {
    "Home": ("general/intro", "Home", 1),
    "Getting-Started": ("general/getting-started", "Getting Started", 2),
    "Global-vs-Individual-Stages": ("general/global-vs-individual-stages", "Global vs Individual Stages", 3),

    "Stage-Configuration": ("modpack-developers/stage-configuration", "Stage Configuration", 1),
    "Stage-Modes": ("modpack-developers/stage-modes", "Stage Modes", 2),
    "Stage-Examples": ("modpack-developers/stage-examples", "Stage Examples", 3),
    "Recipe-Examples": ("modpack-developers/recipe-examples", "Recipe Examples", 4),
    "In-Game-Editor": ("modpack-developers/in-game-editor", "In-Game Editor", 5),
    "Research-System": ("modpack-developers/research-system", "Research System", 6),
    "Stage-Graph": ("modpack-developers/stage-graph", "Stage Graph", 7),
    "Commands-and-Permissions": ("modpack-developers/commands-and-permissions", "Commands & Permissions", 8),
    "Configuration": ("modpack-developers/configuration", "Configuration (TOML)", 9),
    "Mod-Compatibility": ("modpack-developers/mod-compatibility", "Mod Compatibility", 10),
    "Scripting-with-KubeJS-and-CraftTweaker": ("modpack-developers/scripting-with-kubejs-and-crafttweaker", "Scripting (KubeJS & CraftTweaker)", 11),

    "Addon-Development": ("addon-developers/addon-development", "Addon Development", 1),
    "Lock-Categories": ("addon-developers/lock-categories", "Lock Categories", 2),
    "Requirements": ("addon-developers/requirements", "Requirements", 3),
    "Auto-Triggers": ("addon-developers/auto-triggers", "Auto-Triggers", 4),
    "Stage-Settings": ("addon-developers/stage-settings", "Stage Settings", 5),
    "Config-Sections": ("addon-developers/config-sections", "Config Sections", 6),
    "Editor-Toolkit": ("addon-developers/editor-toolkit", "Editor Toolkit", 7),
    "Stage-State-and-Events": ("addon-developers/stage-state-and-events", "Stage State & Events", 8),

    "Porting-History-Stages": ("project/porting-history-stages", "Porting to Other Versions & Loaders", 1),
}

LINK_RE = re.compile(r"\[([^\]]+)\]\(([A-Za-z0-9_-]+)(#[\w-]+)?\)")


def rewrite_links(body: str, from_path: str) -> str:
    def replace(m):
        text, target, anchor = m.group(1), m.group(2), m.group(3) or ""
        if target not in PAGE_MAP:
            return m.group(0)  # not an internal wiki page (e.g. an external link) — leave untouched
        target_path, _, _ = PAGE_MAP[target]
        rel = os.path.relpath(target_path, os.path.dirname(from_path))
        rel = rel.replace(os.sep, "/")
        if not rel.startswith("."):
            rel = "./" + rel
        return f"[{text}]({rel}.md{anchor})"
    return LINK_RE.sub(replace, body)


def migrate():
    for old_name, (new_path, title, position) in PAGE_MAP.items():
        src = os.path.join(WIKI_DIR, f"{old_name}.md")
        dst = os.path.join(DOCS_DIR, f"{new_path}.md")
        os.makedirs(os.path.dirname(dst), exist_ok=True)

        with open(src, "r", encoding="utf-8") as f:
            body = f.read()

        # drop the redundant leading "# Title" line — frontmatter title replaces it
        body = re.sub(r"^#\s+.+\n+", "", body, count=1)
        body = rewrite_links(body, new_path)

        frontmatter = f"---\ntitle: {title}\nsidebar_position: {position}\n---\n\n"
        with open(dst, "w", encoding="utf-8") as f:
            f.write(frontmatter + body)

        print(f"{old_name}.md -> {new_path}.md")


if __name__ == "__main__":
    migrate()
