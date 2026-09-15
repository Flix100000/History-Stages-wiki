// Checks that the build itself cannot make. Run after `npm run build` (npm run check).
//
// The admonition check is the reason this file exists: `:::warning Title` without brackets
// builds without a single warning and lands on the page as raw text -- 25 boxes were broken
// that way once, and only reading the built page found them.

import {readdirSync, readFileSync, statSync, existsSync} from 'node:fs';
import {join, relative} from 'node:path';

const root = process.cwd();
const failures = [];

function walk(dir, match, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, match, out);
    else if (match(name)) out.push(p);
  }
  return out;
}

// 1. Admonition syntax that survived into the rendered page.
if (existsSync(join(root, 'build'))) {
  for (const file of walk(join(root, 'build'), (n) => n === 'index.html')) {
    const html = readFileSync(file, 'utf8');
    // Only the main content area matters; ::: inside a <code> block is legitimate documentation.
    const body = html.replace(/<code[\s\S]*?<\/code>/g, '');
    if (body.includes(':::')) {
      failures.push(`${relative(root, file)}: literal ":::" in the rendered page -- an admonition did not parse (title needs brackets: :::warning[Title])`);
    }
  }
} else {
  console.log('no build/ directory -- skipping the rendered-page checks');
}

// Names that are spelled one way. Code, file names, URLs and JSX attributes are stripped
// before this runs, so `visual.toml` and `value="json"` are not spelling mistakes.
const NAMES = [
  'NeoForge', 'CurseForge', 'Modrinth', 'KubeJS', 'CraftTweaker', 'ZenScript',
  'Minecraft', 'JEI', 'EMI', 'Lootr', 'GitHub', 'Discord', 'JSON', 'TOML', 'NBT',
  'Jade', 'Curios', 'Fabric',
];

function prose(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\]\([^)]*\)/g, '](')
    .replace(/<[^>\n]*>/g, '')
    .replace(/https?:\/\/\S+/g, '');
}

// 2 + 3. Source checks: every page carries a description, every code fence names a language.
const sources = [];
for (const dir of ['docs', 'api']) {
  if (existsSync(join(root, dir))) sources.push(...walk(join(root, dir), (n) => n.endsWith('.md') || n.endsWith('.mdx')));
}

for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file).split('\\').join('/');

  if (!/^description:/m.test(text.split(/^---$/m)[1] ?? '')) {
    failures.push(`${rel}: no description in the frontmatter -- it is what search results and link previews show`);
  }

  const body = prose(text);
  for (const name of NAMES) {
    // `(?!\\.\\w)` skips file extensions (visual.toml) without skipping a name that
    // happens to sit at the end of a sentence.
    const re = new RegExp(`(?<![.\\w])${name}(?!\\w|\\.\\w)`, 'gi');
    for (const m of body.matchAll(re)) {
      if (m[0] !== name) {
        failures.push(`${rel}: "${m[0]}" is spelled "${name}" everywhere else`);
      }
    }
  }

  let inside = false;
  text.split('\n').forEach((line, i) => {
    if (!line.startsWith('```')) return;
    if (inside) {
      inside = false;
      return;
    }
    inside = true;
    if (line.trim() === '```') {
      failures.push(`${rel}:${i + 1}: code fence without a language (use \`text\` if none fits)`);
    }
  });
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`checked ${sources.length} pages: descriptions, code fences, spellings, rendered admonitions -- all clear`);
