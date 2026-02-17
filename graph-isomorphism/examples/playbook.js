/**
 * Planning Strategy Playbook – Scale-Up Visualizer
 *
 * Brainstorms and renders a full hierarchy:
 *   Vision → Goals → Objectives → Milestones → Targets
 *
 * Scaling dimensions:
 *   Temporal  : Sprint → Quarter → Year → 3-Year → 5-Year
 *   Org depth : Individual → Team → Dept → BU → Company
 *   Strategic : Vision → Strategy → Tactics → Operations
 */

import { Tree, TreeNode } from '../src/index.js';
import cliSpinners from 'cli-spinners';
import { writeFileSync } from 'fs';

/* ─── ANSI ─────────────────────────────────────────────────── */
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  white: '\x1b[37m', gray: '\x1b[90m',
  bgBlue: '\x1b[44m', bgGreen: '\x1b[42m', bgMagenta: '\x1b[45m',
};

const wait = ms => new Promise(r => setTimeout(r, ms));

class Spinner {
  constructor(name, text) {
    this.sp = cliSpinners[name]; this.text = text; this.i = 0; this.tid = null;
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

/* ─── PLAYBOOK DATA ─────────────────────────────────────────── */
const PLAYBOOK = {

  // ── 1. VISION LAYER ────────────────────────────────────────
  vision: {
    statement: 'Be the leading platform enabling teams to ship faster with confidence',
    mission:   'Empower developers with tools that remove friction and amplify impact',
    values:    ['Transparency', 'Ownership', 'Iteration', 'Scale', 'User Obsession'],
    bhag:      '10× developer throughput in 3 years',
  },

  // ── 2. STRATEGIC GOALS (annual) ────────────────────────────
  goals: [
    {
      id: 'G1', label: 'Growth',      color: C.green,
      horizon: '12-month',
      statement: 'Expand user base and revenue 3×',
      subgoals: [
        'Acquire 500 new enterprise accounts',
        'Expand to 3 new markets (LATAM, SEA, DACH)',
        'Launch partner / reseller program',
      ],
    },
    {
      id: 'G2', label: 'Product',     color: C.cyan,
      horizon: '12-month',
      statement: 'Ship a platform that developers love',
      subgoals: [
        'NPS ≥ 60 by Q4',
        'Core feature parity with competitors',
        'Self-serve onboarding < 5 min',
      ],
    },
    {
      id: 'G3', label: 'Platform',    color: C.magenta,
      horizon: '12-month',
      statement: 'Infrastructure that scales to 100× load',
      subgoals: [
        'p99 latency < 200 ms globally',
        '99.99% uptime SLA',
        'Zero-downtime deploys every release',
      ],
    },
    {
      id: 'G4', label: 'People',      color: C.yellow,
      horizon: '12-month',
      statement: 'Build a high-performance, inclusive team',
      subgoals: [
        'eNPS ≥ 50',
        'Hire 40 engineers (IC3–IC5)',
        'Manager effectiveness score ≥ 4.2 / 5',
      ],
    },
    {
      id: 'G5', label: 'Operations',  color: C.red,
      horizon: '12-month',
      statement: 'Streamline processes to sustain scale',
      subgoals: [
        'Deploy cycle time < 2 days',
        'Incident MTTR < 30 min',
        'ISO 27001 certification',
      ],
    },
  ],

  // ── 3. OBJECTIVES (quarterly OKRs) ─────────────────────────
  objectives: {
    G1: [
      { q: 'Q1', okr: 'Close 50 pilot enterprise deals',         kr: ['20 pilots signed', 'ARR +$500K', 'Churn < 2%'] },
      { q: 'Q2', okr: 'Launch LATAM market',                     kr: ['3 anchor customers', 'Local pricing', 'Spanish l10n'] },
      { q: 'Q3', okr: 'Scale partner program to 10 resellers',   kr: ['10 resellers', 'Pipeline $2M', 'Partner portal live'] },
      { q: 'Q4', okr: 'Hit 3× ARR milestone',                    kr: ['ARR target hit', '500 accounts', 'NDR ≥ 120%'] },
    ],
    G2: [
      { q: 'Q1', okr: 'Ship v2 onboarding flow',                 kr: ['Time-to-value < 5 min', 'Activation +25%', 'NPS baseline set'] },
      { q: 'Q2', okr: 'Feature parity with top 3 competitors',   kr: ['Gap list closed', 'Win-rate +15%', 'Analyst brief'] },
      { q: 'Q3', okr: 'Mobile & API-first experience',           kr: ['Mobile beta', 'API v2 GA', 'SDK published'] },
      { q: 'Q4', okr: 'Achieve NPS ≥ 60',                        kr: ['NPS 60', 'CSAT 4.5', 'Support deflection 40%'] },
    ],
    G3: [
      { q: 'Q1', okr: 'Multi-region active-active deployment',   kr: ['3 regions', 'Failover < 30 s', 'DR tested'] },
      { q: 'Q2', okr: 'Observability platform upgrade',          kr: ['OTel adopted', 'MTTR -40%', 'Dashboards live'] },
      { q: 'Q3', okr: 'Database sharding for 10× scale',         kr: ['Shard design', 'Migration plan', 'Load tests pass'] },
      { q: 'Q4', okr: 'Achieve 99.99% uptime SLA',               kr: ['Uptime met', 'p99 < 200ms', '0 P0 incidents'] },
    ],
    G4: [
      { q: 'Q1', okr: 'Establish hiring pipelines',              kr: ['Scorecards done', '15 hires', 'Offer acceptance ≥ 80%'] },
      { q: 'Q2', okr: 'Launch L&D curriculum',                   kr: ['Paths for IC3-5', '70% enrolled', 'Mgr training'] },
      { q: 'Q3', okr: 'Culture & inclusion audit',               kr: ['Survey done', '3 ERGs live', 'Action plan'] },
      { q: 'Q4', okr: 'eNPS ≥ 50',                               kr: ['eNPS hit', '40 hires total', 'Retention ≥ 92%'] },
    ],
    G5: [
      { q: 'Q1', okr: 'Deploy CI/CD overhaul',                   kr: ['Build time -50%', 'Pipeline green', 'Rollback < 5 min'] },
      { q: 'Q2', okr: 'Incident management framework',           kr: ['Runbooks', 'On-call rotation', 'MTTR -40%'] },
      { q: 'Q3', okr: 'Security & compliance audit',             kr: ['Pen test', 'SAST/DAST', 'SOC2 renewal'] },
      { q: 'Q4', okr: 'ISO 27001 certification',                  kr: ['Audit passed', 'Policies live', 'Training complete'] },
    ],
  },

  // ── 4. MILESTONES ──────────────────────────────────────────
  milestones: [
    { id: 'M1', quarter: 'Q1-W6',  label: 'Alpha Release',       type: 'Product',    criteria: 'Core features + 10 beta users' },
    { id: 'M2', quarter: 'Q1-W12', label: 'Seed ARR $1M',        type: 'Revenue',    criteria: 'Signed contracts, invoices issued' },
    { id: 'M3', quarter: 'Q2-W4',  label: 'LATAM Launch',        type: 'GTM',        criteria: 'Spanish l10n + 3 customers live' },
    { id: 'M4', quarter: 'Q2-W10', label: 'Multi-Region Live',   type: 'Platform',   criteria: 'US + EU + APAC active-active' },
    { id: 'M5', quarter: 'Q3-W2',  label: 'Mobile Beta',         type: 'Product',    criteria: 'iOS + Android beta shipped' },
    { id: 'M6', quarter: 'Q3-W8',  label: 'Partner Portal GA',   type: 'GTM',        criteria: '10 resellers onboarded' },
    { id: 'M7', quarter: 'Q4-W4',  label: '3× ARR',              type: 'Revenue',    criteria: 'ARR milestone confirmed by Finance' },
    { id: 'M8', quarter: 'Q4-W10', label: 'ISO 27001 Cert',      type: 'Compliance', criteria: 'Certificate issued by auditor' },
    { id: 'M9', quarter: 'Q4-W12', label: 'Year-End Review',     type: 'Planning',   criteria: 'All annual OKRs graded, next year plan' },
  ],

  // ── 5. TARGETS (KPI thresholds) ────────────────────────────
  targets: [
    // Revenue
    { area: 'Revenue',   kpi: 'ARR',               baseline: '$2M',   q1: '$3M',    q2: '$4M',    q3: '$5.5M',  q4: '$6M' },
    { area: 'Revenue',   kpi: 'Net Dollar Retention', baseline: '105%', q1: '108%',  q2: '112%',  q3: '116%',  q4: '120%' },
    { area: 'Revenue',   kpi: 'Churn Rate',          baseline: '3%',   q1: '2.5%',  q2: '2.2%',  q3: '2%',    q4: '1.8%' },
    // Product
    { area: 'Product',   kpi: 'NPS',                 baseline: '42',   q1: '45',    q2: '50',    q3: '56',    q4: '60' },
    { area: 'Product',   kpi: 'Activation Rate',     baseline: '38%',  q1: '45%',   q2: '52%',   q3: '58%',   q4: '63%' },
    { area: 'Product',   kpi: 'Time-to-Value (min)', baseline: '12',   q1: '8',     q2: '6',     q3: '5',     q4: '5' },
    // Platform
    { area: 'Platform',  kpi: 'Uptime',              baseline: '99.9%',q1: '99.95%',q2: '99.97%',q3: '99.99%',q4: '99.99%' },
    { area: 'Platform',  kpi: 'p99 Latency (ms)',    baseline: '450',  q1: '350',   q2: '280',   q3: '220',   q4: '200' },
    { area: 'Platform',  kpi: 'MTTR (min)',           baseline: '62',   q1: '48',    q2: '40',    q3: '34',    q4: '30' },
    // People
    { area: 'People',    kpi: 'eNPS',                baseline: '32',   q1: '38',    q2: '42',    q3: '47',    q4: '50' },
    { area: 'People',    kpi: 'Headcount (Eng)',      baseline: '60',   q1: '70',    q2: '80',    q3: '90',    q4: '100' },
    { area: 'People',    kpi: 'Retention Rate',       baseline: '88%',  q1: '89%',   q2: '90%',   q3: '91%',   q4: '92%' },
    // Operations
    { area: 'Operations',kpi: 'Deploy Cycle (days)', baseline: '7',    q1: '5',     q2: '4',     q3: '3',     q4: '2' },
    { area: 'Operations',kpi: 'Build Time (min)',     baseline: '22',   q1: '16',    q2: '13',    q3: '11',    q4: '11' },
  ],

  // ── 6. SCALING DIMENSIONS ──────────────────────────────────
  scaling: {
    temporal:       ['Sprint (2w)', 'Quarter (13w)', 'Annual (52w)', '3-Year', '5-Year'],
    organizational: ['Individual', 'Squad', 'Tribe / Dept', 'Business Unit', 'Company'],
    strategic:      ['Vision', 'Strategy', 'Programme', 'Project', 'Task'],
    frameworks:     ['OKRs', 'Balanced Scorecard', 'OGSM', 'V2MOM', 'Hoshin Kanri', 'SMART', 'BHAG'],
  },
};

/* ─── BUILD TREE ────────────────────────────────────────────── */
function buildPlaybookTree() {
  const tree = new Tree('Planning Strategy Playbook');

  // Vision
  const vNode = new TreeNode('Vision & Direction');
  tree.root.addChild(vNode);
  vNode.addChild(new TreeNode(`Vision: "${PLAYBOOK.vision.statement.slice(0, 48)}…"`));
  vNode.addChild(new TreeNode(`BHAG:   ${PLAYBOOK.vision.bhag}`));
  const valNode = new TreeNode('Core Values');
  vNode.addChild(valNode);
  PLAYBOOK.vision.values.forEach(v => valNode.addChild(new TreeNode(v)));

  // Goals
  const gRoot = new TreeNode('Strategic Goals');
  tree.root.addChild(gRoot);
  PLAYBOOK.goals.forEach(g => {
    const gNode = new TreeNode(`${g.id}: ${g.label} — ${g.statement.slice(0, 38)}…`);
    gRoot.addChild(gNode);
    g.subgoals.forEach(sg => gNode.addChild(new TreeNode(sg)));
  });

  // Objectives (sample: G1 only to keep tree readable)
  const oRoot = new TreeNode('Quarterly OKRs (sample: Growth)');
  tree.root.addChild(oRoot);
  PLAYBOOK.objectives.G1.forEach(o => {
    const oNode = new TreeNode(`${o.q}: ${o.okr}`);
    oRoot.addChild(oNode);
    o.kr.forEach(kr => oNode.addChild(new TreeNode(`KR: ${kr}`)));
  });

  // Milestones
  const mRoot = new TreeNode('Milestones');
  tree.root.addChild(mRoot);
  PLAYBOOK.milestones.forEach(m =>
    mRoot.addChild(new TreeNode(`${m.id} [${m.quarter}] ${m.label} (${m.type})`)));

  // Scaling
  const sRoot = new TreeNode('Scaling Dimensions');
  tree.root.addChild(sRoot);
  Object.entries(PLAYBOOK.scaling).forEach(([dim, items]) => {
    const dNode = new TreeNode(dim.charAt(0).toUpperCase() + dim.slice(1));
    sRoot.addChild(dNode);
    items.forEach(i => dNode.addChild(new TreeNode(i)));
  });

  return tree;
}

/* ─── RENDER MINDMAP ────────────────────────────────────────── */
function renderMindmap() {
  const div = C.dim + '─'.repeat(72) + C.reset;

  console.log('\n' + C.bgMagenta + C.white + C.bold +
    '  PLANNING STRATEGY PLAYBOOK  –  Scale-Up MindNode                  ' + C.reset);

  console.log(`
${C.dim}           Temporal scale →  Sprint ▸ Quarter ▸ Year ▸ 3Y ▸ 5Y
           Org depth   →  Individual ▸ Squad ▸ Dept ▸ BU ▸ Company
           Strategy    →  Vision ▸ Goals ▸ Objectives ▸ Milestones ▸ Targets${C.reset}
`);

  // ── LAYER 1: VISION ────────────────────────────────────────
  console.log(div);
  console.log(C.bold + C.blue + '  LAYER 1 — VISION  ★ BHAG' + C.reset);
  console.log(div);
  console.log(`  ${C.bold}Vision :${C.reset}  ${PLAYBOOK.vision.statement}`);
  console.log(`  ${C.bold}Mission:${C.reset}  ${PLAYBOOK.vision.mission}`);
  console.log(`  ${C.bold}BHAG   :${C.reset}  ${C.yellow}${C.bold}${PLAYBOOK.vision.bhag}${C.reset}`);
  console.log(`  ${C.bold}Values :${C.reset}  ${PLAYBOOK.vision.values.map(v => C.cyan + v + C.reset).join('  ·  ')}`);

  // ── LAYER 2: GOALS ─────────────────────────────────────────
  console.log('\n' + div);
  console.log(C.bold + C.green + '  LAYER 2 — STRATEGIC GOALS  (12-month)' + C.reset);
  console.log(div);
  PLAYBOOK.goals.forEach(g => {
    console.log(`\n  ${g.color}${C.bold}${g.id} ◈ ${g.label}${C.reset}  ${C.dim}[${g.horizon}]${C.reset}`);
    console.log(`     ${g.statement}`);
    g.subgoals.forEach((sg, i) => {
      const pfx = i < g.subgoals.length - 1 ? '├·' : '└·';
      console.log(`     ${C.dim}${pfx}${C.reset} ${sg}`);
    });
  });

  // ── LAYER 3: OBJECTIVES – OKR GRID ────────────────────────
  console.log('\n' + div);
  console.log(C.bold + C.cyan + '  LAYER 3 — QUARTERLY OKRs (all 5 goals × 4 quarters = 20 OKRs)' + C.reset);
  console.log(div);

  const goalIds = Object.keys(PLAYBOOK.objectives);
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const goal = PLAYBOOK.goals;

  // print header
  process.stdout.write(`  ${'Goal'.padEnd(12)}`);
  quarters.forEach(q => process.stdout.write(`│ ${q.padEnd(38)}`));
  console.log();
  console.log('  ' + '─'.repeat(12) + (('┼' + '─'.repeat(39)).repeat(4)));

  goalIds.forEach((gid, gi) => {
    const g = goal[gi];
    const row = PLAYBOOK.objectives[gid];
    process.stdout.write(`  ${(g.color + C.bold + gid + C.reset).padEnd(22)}`);
    row.forEach(o => {
      const txt = o.okr.length > 35 ? o.okr.slice(0, 34) + '…' : o.okr;
      process.stdout.write(`│ ${txt.padEnd(38)}`);
    });
    console.log();
  });

  // ── LAYER 4: MILESTONES TIMELINE ──────────────────────────
  console.log('\n' + div);
  console.log(C.bold + C.magenta + '  LAYER 4 — MILESTONES  (time-phased gates)' + C.reset);
  console.log(div);

  const qGroups = {};
  PLAYBOOK.milestones.forEach(m => {
    const q = m.quarter.split('-')[0];
    if (!qGroups[q]) qGroups[q] = [];
    qGroups[q].push(m);
  });

  Object.entries(qGroups).forEach(([q, ms]) => {
    console.log(`\n  ${C.yellow}${C.bold}── ${q} ────────────────────────────────────────${C.reset}`);
    ms.forEach(m => {
      const typeColor = m.type === 'Revenue' ? C.green : m.type === 'Product' ? C.cyan :
                       m.type === 'Platform' ? C.magenta : m.type === 'Compliance' ? C.red : C.yellow;
      console.log(`    ${C.bold}${m.id}${C.reset} [${m.quarter.padEnd(6)}]  ${typeColor}${m.label.padEnd(22)}${C.reset}  ${C.dim}${m.criteria}${C.reset}`);
    });
  });

  // ── LAYER 5: TARGETS TABLE ─────────────────────────────────
  console.log('\n' + div);
  console.log(C.bold + C.red + '  LAYER 5 — KPI TARGETS  (quarterly trajectory)' + C.reset);
  console.log(div);

  const areas = [...new Set(PLAYBOOK.targets.map(t => t.area))];
  areas.forEach(area => {
    const aColor = area === 'Revenue' ? C.green : area === 'Product' ? C.cyan :
                   area === 'Platform' ? C.magenta : area === 'People' ? C.yellow : C.red;
    console.log(`\n  ${aColor}${C.bold}▸ ${area}${C.reset}`);
    console.log(`  ${'KPI'.padEnd(26)} ${'Base'.padEnd(8)} ${'Q1'.padEnd(8)} ${'Q2'.padEnd(8)} ${'Q3'.padEnd(8)} ${'Q4'}`);
    console.log('  ' + '─'.repeat(70));
    PLAYBOOK.targets.filter(t => t.area === area).forEach(t => {
      console.log(`  ${t.kpi.padEnd(26)} ${C.dim}${t.baseline.padEnd(8)}${C.reset}` +
        ` ${C.green}${t.q1.padEnd(8)}${C.reset}` +
        ` ${C.green}${t.q2.padEnd(8)}${C.reset}` +
        ` ${C.green}${t.q3.padEnd(8)}${C.reset}` +
        ` ${C.bold}${C.green}${t.q4}${C.reset}`);
    });
  });

  // ── SCALING PLAYBOOK ───────────────────────────────────────
  console.log('\n' + div);
  console.log(C.bold + C.white + '  SCALING PLAYBOOK  –  Dimensions & Frameworks' + C.reset);
  console.log(div);

  Object.entries(PLAYBOOK.scaling).forEach(([dim, items]) => {
    const arrow = items.map((v, i) => (i < items.length - 1 ? `${C.cyan}${v}${C.reset} → ` : `${C.bold}${C.green}${v}${C.reset}`)).join('');
    console.log(`  ${C.bold}${dim.charAt(0).toUpperCase() + dim.slice(1).padEnd(16)}${C.reset}  ${arrow}`);
  });

  console.log('\n' + div + '\n');
}

/* ─── CSV EXPORTS ───────────────────────────────────────────── */
function exportCSVs() {
  // Targets CSV
  const tHeader = 'Area,KPI,Baseline,Q1,Q2,Q3,Q4';
  const tRows = PLAYBOOK.targets.map(t =>
    `"${t.area}","${t.kpi}","${t.baseline}","${t.q1}","${t.q2}","${t.q3}","${t.q4}"`);
  writeFileSync('./playbook-targets.csv', [tHeader, ...tRows].join('\n'));

  // Milestones CSV
  const mHeader = 'ID,Quarter,Label,Type,Criteria';
  const mRows = PLAYBOOK.milestones.map(m =>
    `"${m.id}","${m.quarter}","${m.label}","${m.type}","${m.criteria}"`);
  writeFileSync('./playbook-milestones.csv', [mHeader, ...mRows].join('\n'));

  // OKRs CSV
  const oHeader = 'Goal,Quarter,Objective,KR1,KR2,KR3';
  const oRows = [];
  Object.entries(PLAYBOOK.objectives).forEach(([gid, okrs]) => {
    okrs.forEach(o => oRows.push(
      `"${gid}","${o.q}","${o.okr}","${o.kr[0]}","${o.kr[1] ?? ''}","${o.kr[2] ?? ''}"`));
  });
  writeFileSync('./playbook-okrs.csv', [oHeader, ...oRows].join('\n'));

  return ['./playbook-targets.csv', './playbook-milestones.csv', './playbook-okrs.csv'];
}

/* ─── MAIN ──────────────────────────────────────────────────── */
async function main() {
  let s;

  s = new Spinner('graphIsomorphism', 'Mapping strategy layers…');
  s.start(); await wait(1500); s.stop('✓', 'Vision → Goals → OKRs → Milestones → Targets mapped');

  s = new Spinner('bfsTraversal', 'Scaling across org dimensions…');
  s.start(); await wait(1200); s.stop('✓', 'Individual → Squad → Dept → BU → Company layered');

  s = new Spinner('treeGrowth', 'Growing playbook tree…');
  s.start(); await wait(1000); s.stop('✓', 'Playbook tree constructed');

  renderMindmap();

  // Tree view
  console.log(C.bold + C.blue + '  TREE VIEW\n' + C.reset);
  const tree = buildPlaybookTree();
  console.log(tree.toString());
  console.log(`  Nodes: ${tree.countNodes()}  │  Height: ${tree.getHeight()}  │  Leaves: ${tree.getLeaves().length}\n`);

  // Export
  s = new Spinner('adjacencyMatrix', 'Exporting CSVs…');
  s.start(); await wait(800);
  const files = exportCSVs();
  s.stop('✓', `Exported: ${files.join('  ')}`);
  console.log();
}

main().catch(console.error);
