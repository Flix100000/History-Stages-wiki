import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// A loose progression tree, unlocked on the left fading to locked on the right —
// the same three states and colours as the real in-game Stage Graph, laid out as
// ambient background art instead of a screenshot. Hand-placed, not random: it
// should read as a deliberate "ages, connected" shape, not scattered dots.
const NODES = [
  {x: 90, y: 210, state: 'unlocked'},
  {x: 230, y: 130, state: 'unlocked'},
  {x: 230, y: 280, state: 'unlocked'},
  {x: 380, y: 80, state: 'unlocked'},
  {x: 380, y: 210, state: 'reachable'},
  {x: 380, y: 340, state: 'unlocked'},
  {x: 540, y: 150, state: 'reachable'},
  {x: 540, y: 300, state: 'locked'},
  {x: 700, y: 90, state: 'locked'},
  {x: 700, y: 230, state: 'locked'},
  {x: 860, y: 170, state: 'locked'},
  {x: 860, y: 320, state: 'locked'},
  {x: 1020, y: 110, state: 'locked'},
  {x: 1020, y: 260, state: 'locked'},
  {x: 1150, y: 190, state: 'locked'},
];

const EDGES = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
  [3, 6], [4, 6], [5, 7], [6, 8], [6, 9], [7, 9],
  [8, 10], [9, 10], [9, 11], [10, 12], [11, 13], [12, 14], [13, 14],
];

const STATE_COLOR = {
  unlocked: '#5FAE6C',
  reachable: '#D8A93E',
  locked: '#4B4A51',
};

function GraphBackdrop() {
  return (
    <svg
      className={styles.backdrop}
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true">
      <defs>
        <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" strokeOpacity="0.035" />
        </pattern>
        <radialGradient id="hero-vignette" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#17171A" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#17171A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="400" fill="#17171A" />
      <rect width="1200" height="400" fill="url(#hero-grid)" />
      {EDGES.map(([a, b], i) => {
        const met = NODES[a].state === 'unlocked' && NODES[b].state !== 'locked';
        return (
          <line
            key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke={met ? STATE_COLOR.unlocked : '#3A393F'}
            strokeWidth="1.5"
            strokeOpacity={met ? 0.35 : 0.22}
          />
        );
      })}
      {NODES.map((n, i) => (
        <g key={i} className={n.state === 'reachable' ? styles.pulsingNode : undefined}>
          <circle
            cx={n.x} cy={n.y}
            r={n.state === 'unlocked' ? 7 : 5}
            fill={n.state === 'locked' ? '#17171A' : STATE_COLOR[n.state]}
            stroke={STATE_COLOR[n.state]}
            strokeWidth="2"
            opacity={n.state === 'locked' ? 0.45 : 0.85}
          />
        </g>
      ))}
      <rect width="1200" height="400" fill="url(#hero-vignette)" />
    </svg>
  );
}

export default function HomepageHero() {
  const {siteConfig} = useDocusaurusContext();
  const iconUrl = useBaseUrl('/img/icon.png');
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <GraphBackdrop />
      <div className={clsx('container', styles.heroContent)}>
        <img
          className={styles.heroIcon}
          src={iconUrl}
          alt=""
          width="88"
          height="88"
        />
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--lg', styles.heroButton)}
            to="/wiki/general/getting-started">
            Getting Started
          </Link>
        </div>
      </div>
    </header>
  );
}
