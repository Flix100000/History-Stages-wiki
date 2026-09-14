#!/usr/bin/env python3
"""Cut an archived docs version out of the old GitHub wiki.

    python scripts/archive_version.py <legacy-ref> <version-label> [--drop Page,Page]

The old wiki is still around as a git clone next to this repo. Every release used to get a
"update wiki for X" commit, so the tree right before the *next* such commit is the documentation
as it stood for that release. This reads that tree and lands it as a Docusaurus version.

Archived versions keep the flat page layout and the sidebar grouping of their own era -- the
grouping comes straight out of that revision's _Sidebar.md.
"""
import argparse
import json
import os
import re
import subprocess
import sys

LEGACY_REPO = os.path.join("..", "History-Stages-wiki-legacy")
SIDEBAR_ID = "wikiSidebar"  # must match sidebars.js, the navbar points at this id

# Pages dropped from an archive still get linked to from pages we keep. They are addon/API pages,
# and that documentation only exists for the current version, so send readers to the API tab.
API_TAB = {
    "Addon-Development", "Lock-Categories", "Requirements", "Auto-Triggers",
    "Stage-Settings", "Config-Sections", "Editor-Toolkit", "Stage-State-and-Events",
}

# Every Home.md carries this line. In an archive it is simply false -- the unmaintained banner
# right above it says the opposite -- so it goes.
STALE_NOTE_RE = re.compile(
    r"^>?\s*\*\*Note:\*\* This wiki is always aligned with the latest version.*\n+",
    re.MULTILINE,
)

SIDEBAR_CATEGORY_RE = re.compile(r"^##\s+(.+?)\s*$")
SIDEBAR_ITEM_RE = re.compile(r"^\s*\*\s+\[([^\]]+)\]\(([^)]+)\)\s*$")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([A-Za-z0-9_.-]+)(#[^)\s]*)?\)")
H1_RE = re.compile(r"^#\s+(.+?)\s*\n+")


def git_show(ref, path):
    result = subprocess.run(
        ["git", "-C", LEGACY_REPO, "show", f"{ref}:{path}"],
        capture_output=True, check=True,
    )
    return result.stdout.decode("utf-8")


def git_pages(ref):
    result = subprocess.run(
        ["git", "-C", LEGACY_REPO, "ls-tree", "-r", "--name-only", ref],
        capture_output=True, text=True, check=True,
    )
    return [f[:-3] for f in result.stdout.split()
            if f.endswith(".md") and not f.startswith("_")]


def slug_of(page):
    return page.lower()


def parse_sidebar(text):
    """_Sidebar.md -> [(category, [(label, page), ...]), ...], external links skipped."""
    categories = []
    current = None
    for line in text.splitlines():
        heading = SIDEBAR_CATEGORY_RE.match(line)
        if heading:
            current = (heading.group(1), [])
            categories.append(current)
            continue
        item = SIDEBAR_ITEM_RE.match(line)
        if item and current is not None:
            label, target = item.group(1), item.group(2)
            if "://" not in target:
                current[1].append((label, target))
    return [c for c in categories if c[1]]


def rewrite_links(body, known, dropped):
    def replace(match):
        text, target, anchor = match.group(1), match.group(2), match.group(3) or ""
        if target in dropped:
            return f"[{text}](/api/{slug_of(target)}{anchor})" if target in API_TAB else text
        if target not in known:
            return match.group(0)
        return f"[{text}](./{slug_of(target)}.md{anchor})"
    return LINK_RE.sub(replace, body)


def frontmatter(page, sidebar_label, title):
    lines = ["---", f"id: {slug_of(page)}", f"title: {title}"]
    if sidebar_label != title:
        lines.append(f"sidebar_label: {sidebar_label}")
    if page == "Home":
        lines.append("slug: /")
    lines += ["---", "", ""]
    return "\n".join(lines)


def archive(ref, label, dropped):
    out_dir = os.path.join("versioned_docs", f"version-{label}")
    os.makedirs(out_dir, exist_ok=True)

    categories = parse_sidebar(git_show(ref, "_Sidebar.md"))
    available = set(git_pages(ref))
    listed = {page for _, items in categories for _, page in items}

    # A page in the tree but missing from the sidebar would still be linked to from somewhere,
    # so it gets written and tacked onto the last group rather than silently lost.
    orphans = sorted(available - listed - dropped)
    if orphans:
        categories.append(("Other", [(p.replace("-", " "), p) for p in orphans]))

    keep = (listed | set(orphans)) & available - dropped
    sidebar = []
    for category, items in categories:
        docs = [{"type": "doc", "id": slug_of(page)} for _, page in items if page in keep]
        if docs:
            sidebar.append({"type": "category", "label": category,
                            "collapsed": False, "items": docs})

    for _, items in categories:
        for sidebar_label, page in items:
            if page not in keep:
                continue
            body = git_show(ref, f"{page}.md")
            heading = H1_RE.match(body)
            title = heading.group(1) if heading else sidebar_label
            body = H1_RE.sub("", body, count=1)
            if page == "Home":
                body = STALE_NOTE_RE.sub("", body, count=1)
            body = rewrite_links(body, keep, dropped)
            target = os.path.join(out_dir, f"{slug_of(page)}.md")
            with open(target, "w", encoding="utf-8", newline="\n") as f:
                f.write(frontmatter(page, sidebar_label, title) + body)
            print(f"  {page}.md -> {target}")

    os.makedirs("versioned_sidebars", exist_ok=True)
    sidebar_file = os.path.join("versioned_sidebars", f"version-{label}-sidebars.json")
    with open(sidebar_file, "w", encoding="utf-8", newline="\n") as f:
        json.dump({SIDEBAR_ID: sidebar}, f, indent=2)
        f.write("\n")
    print(f"  sidebar -> {sidebar_file}")

    versions = []
    if os.path.exists("versions.json"):
        with open("versions.json", encoding="utf-8") as f:
            versions = json.load(f)
    if label not in versions:
        versions.append(label)
        versions.sort(key=lambda v: [int(n) for n in v.replace(".x", "").split(".")], reverse=True)
        with open("versions.json", "w", encoding="utf-8", newline="\n") as f:
            json.dump(versions, f, indent=2)
            f.write("\n")
    print(f"  versions.json -> {versions}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("ref", help="commit in the legacy wiki clone, e.g. a28a6ff^")
    parser.add_argument("label", help="version label, e.g. 5.6.x")
    parser.add_argument("--drop", default="", help="comma-separated page names to leave out")
    args = parser.parse_args()

    if not os.path.isdir(LEGACY_REPO):
        sys.exit(f"legacy wiki clone not found at {LEGACY_REPO}")

    dropped = {p for p in args.drop.split(",") if p}
    print(f"archiving {args.ref} as {args.label}")
    archive(args.ref, args.label, dropped)


if __name__ == "__main__":
    main()
