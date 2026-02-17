/**
 * MindNode – radial mind-map renderer for Development Ontologies
 *
 * Layout:
 *   - Central topic printed in a box at the centre of the terminal
 *   - Five main branches spread above / below / left / right
 *   - Sub-nodes and leaves listed on each arm
 *   - Graph-themed spinners used during "build" phase
 */

import cliSpinners from 'cli-spinners';

/* ─── ANSI helpers ─────────────────────────────────────────── */
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  black:   '\x1b[30m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  bgBlue:  '\x1b[44m',
  bgCyan:  '\x1b[46m',
};

/* ─── Spinner utility ───────────────────────────────────────── */
class Spinner {
  constructor(name, text) {
    this.sp = cliSpinners[name];
    this.text = text;
    this.i = 0;
    this.tid = null;
  }
  start() {
    this.tid = setInterval(() => {
      process.stdout.write(`\r${this.sp.frames[this.i]} ${this.text}`);
      this.i = (this.i + 1) % this.sp.frames.length;
    }, this.sp.interval);
  }
  stop(sym = '✓', msg = null) {
    clearInterval(this.tid);
    process.stdout.write(`\r${sym} ${msg ?? this.text}\n`);
  }
}

const wait = ms => new Promise(r => setTimeout(r, ms));

/* ─── Mind-map data ─────────────────────────────────────────── */
const mindmap = {
  root: 'Software\nDevelopment',
  branches: [
    {
      label: 'Programming\nParadigms',
      color: C.cyan,
      icon: '◈',
      dir: 'LEFT',
      children: [
        { label: 'Imperative',   leaves: ['Procedural', 'Object-Oriented', 'Parallel'] },
        { label: 'Declarative',  leaves: ['Functional', 'Logic', 'Reactive'] },
      ],
    },
    {
      label: 'Dev\nMethodologies',
      color: C.yellow,
      icon: '◈',
      dir: 'TOP',
      children: [
        { label: 'Agile',        leaves: ['Scrum', 'Kanban', 'XP', 'Lean'] },
        { label: 'Traditional',  leaves: ['Waterfall', 'V-Model', 'Spiral'] },
      ],
    },
    {
      label: 'Architecture\nPatterns',
      color: C.green,
      icon: '◈',
      dir: 'RIGHT',
      children: [
        { label: 'Structural',   leaves: ['MVC', 'MVVM', 'Layered', 'Hexagonal'] },
        { label: 'Distributed',  leaves: ['Microservices', 'Event-Driven', 'SOA'] },
      ],
    },
    {
      label: 'Data\nStructures',
      color: C.magenta,
      icon: '◈',
      dir: 'BOTTOM',
      children: [
        { label: 'Linear',       leaves: ['Array', 'Linked List', 'Stack', 'Queue'] },
        { label: 'Non-Linear',   leaves: ['Tree', 'Graph', 'Hash Table'] },
      ],
    },
    {
      label: 'Design\nPatterns',
      color: C.red,
      icon: '◈',
      dir: 'RIGHT',
      children: [
        { label: 'Creational',   leaves: ['Singleton', 'Factory', 'Builder'] },
        { label: 'Structural',   leaves: ['Adapter', 'Decorator', 'Proxy'] },
        { label: 'Behavioral',   leaves: ['Observer', 'Strategy', 'Command'] },
      ],
    },
  ],
};

/* ─── Box-drawing helpers ───────────────────────────────────── */
function box(lines, color = '') {
  const w = Math.max(...lines.map(l => l.length));
  const top    = `╔${'═'.repeat(w + 2)}╗`;
  const bottom = `╚${'═'.repeat(w + 2)}╝`;
  const mid    = lines.map(l => `║ ${l.padEnd(w)} ║`);
  return [top, ...mid, bottom].map(l => color + C.bold + l + C.reset);
}

function badge(text, color) {
  return `${color}${C.bold}[ ${text} ]${C.reset}`;
}

function pad(s, n) { return s + ' '.repeat(Math.max(0, n - s.length)); }

/* ─── Render LEFT arm ───────────────────────────────────────── */
function renderLeft(branch) {
  const lines = [];
  const col = branch.color;

  lines.push('');
  branch.label.split('\n').forEach((l, i) =>
    lines.push(`  ${col}${C.bold}${i === 0 ? '◄──' : '   '} ${l}${C.reset}`));

  branch.children.forEach(child => {
    lines.push(`  ${col}    ├─ ${child.label}${C.reset}`);
    child.leaves.forEach((leaf, i) => {
      const pfx = i < child.leaves.length - 1 ? '│  ├·' : '│  └·';
      lines.push(`  ${C.dim}    ${pfx} ${leaf}${C.reset}`);
    });
  });

  return lines;
}

/* ─── Render RIGHT arm ──────────────────────────────────────── */
function renderRight(branch) {
  const lines = [];
  const col = branch.color;

  lines.push('');
  branch.label.split('\n').forEach((l, i) =>
    lines.push(`${col}${C.bold}${i === 0 ? `──► ${l}` : `     ${l}`}${C.reset}`));

  branch.children.forEach(child => {
    lines.push(`${col}    ├─ ${child.label}${C.reset}`);
    child.leaves.forEach((leaf, i) => {
      const pfx = i < child.leaves.length - 1 ? '│  ├·' : '│  └·';
      lines.push(`${C.dim}    ${pfx} ${leaf}${C.reset}`);
    });
  });

  return lines;
}

/* ─── Render TOP arm ────────────────────────────────────────── */
function renderTop(branch) {
  const lines = [];
  const col = branch.color;
  lines.push(`        ${col}${C.bold}▲${C.reset}`);
  lines.push(`        ${col}${C.bold}│${C.reset}`);
  branch.children.forEach((child, ci) => {
    lines.push(`  ${col}${ci === 0 ? '┌' : '└'}── ${child.label}${C.reset}`);
    child.leaves.forEach((leaf, i) => {
      const pfx = i < child.leaves.length - 1 ? '    ├·' : '    └·';
      lines.push(`  ${C.dim}${pfx} ${leaf}${C.reset}`);
    });
  });
  return lines;
}

/* ─── Render BOTTOM arm ─────────────────────────────────────── */
function renderBottom(branch) {
  const lines = [];
  const col = branch.color;
  branch.children.forEach((child, ci) => {
    lines.push(`  ${col}${ci === 0 ? '┌' : '└'}── ${child.label}${C.reset}`);
    child.leaves.forEach((leaf, i) => {
      const pfx = i < child.leaves.length - 1 ? '    ├·' : '    └·';
      lines.push(`  ${C.dim}${pfx} ${leaf}${C.reset}`);
    });
  });
  lines.push(`        ${col}${C.bold}│${C.reset}`);
  lines.push(`        ${col}${C.bold}▼${C.reset}`);
  return lines;
}

/* ─── Combine left & right columns around the central box ───── */
function render(mm) {
  const leftBranch   = mm.branches.find(b => b.dir === 'LEFT');
  const rightBranches = mm.branches.filter(b => b.dir === 'RIGHT');
  const topBranch    = mm.branches.find(b => b.dir === 'TOP');
  const bottomBranch = mm.branches.find(b => b.dir === 'BOTTOM');

  // ── top arm ───────────────────────────────────────────────
  renderTop(topBranch).forEach(l => console.log('                          ' + l));

  // ── connector to centre ───────────────────────────────────
  console.log('                              ' + C.cyan + C.bold + '│' + C.reset);

  // ── central box ───────────────────────────────────────────
  const rootLines = mm.root.split('\n');
  const centreBox = box(rootLines, C.bgBlue + C.white);

  const leftLines  = renderLeft(leftBranch);
  const rightLines = [];
  rightBranches.forEach(b => rightLines.push(...renderRight(b)));

  const maxRows = Math.max(centreBox.length, leftLines.length, rightLines.length);

  const pad2 = (arr, n) => [...arr, ...Array(n - arr.length).fill('')];

  const L = pad2(leftLines, maxRows);
  const M = pad2(centreBox, maxRows);
  const R = pad2(rightLines, maxRows);

  // strip ANSI for width calculation
  const stripAnsi = s => s.replace(/\x1b\[[0-9;]*m/g, '');
  const leftWidth  = Math.max(...L.map(l => stripAnsi(l).length), 0);
  const centreWidth = Math.max(...M.map(l => stripAnsi(l).length), 0);

  for (let i = 0; i < maxRows; i++) {
    const lCell = pad(L[i] ?? '', leftWidth + 20);
    const mCell = M[i] ?? ' '.repeat(centreWidth);
    const rCell = R[i] ?? '';
    console.log(`${lCell}  ${mCell}   ${rCell}`);
  }

  // ── connector from centre ─────────────────────────────────
  console.log('                              ' + C.magenta + C.bold + '│' + C.reset);

  // ── bottom arm ────────────────────────────────────────────
  renderBottom(bottomBranch).forEach(l => console.log('                          ' + l));
}

/* ─── Stats footer ──────────────────────────────────────────── */
function renderStats(mm) {
  const totalBranches  = mm.branches.length;
  const totalChildren  = mm.branches.reduce((s, b) => s + b.children.length, 0);
  const totalLeaves    = mm.branches.reduce(
    (s, b) => s + b.children.reduce((t, c) => t + c.leaves.length, 0), 0);
  const totalNodes     = 1 + totalBranches + totalChildren + totalLeaves;

  console.log('\n' + C.dim + '─'.repeat(72) + C.reset);
  console.log(
    `  ${C.bold}Stats:${C.reset}` +
    `  Root: 1` +
    `  │  Main branches: ${totalBranches}` +
    `  │  Sub-categories: ${totalChildren}` +
    `  │  Leaves: ${totalLeaves}` +
    `  │  Total nodes: ${totalNodes}`
  );
  console.log(C.dim + '─'.repeat(72) + C.reset + '\n');
}

/* ─── Main ──────────────────────────────────────────────────── */
async function main() {
  // header
  console.log('\n' + C.bgCyan + C.black + C.bold +
    '  MindNode – Development Ontologies                                  ' +
    C.reset + '\n');

  // spinner build phase
  const s = new Spinner('treeGrowth', 'Growing mind map…');
  s.start();
  await wait(1800);
  s.stop('✓', 'Mind map ready');

  const s2 = new Spinner('graphIsomorphism', 'Mapping branches…');
  s2.start();
  await wait(1200);
  s2.stop('✓', 'All branches mapped');

  console.log('');
  render(mindmap);
  renderStats(mindmap);

  // branch legend
  console.log('  ' + C.bold + 'Branches:' + C.reset);
  mindmap.branches.forEach(b =>
    console.log(`    ${b.color}${C.bold}◈  ${b.label.replace('\n', ' ')}${C.reset}`));
  console.log('');
}

main().catch(console.error);
