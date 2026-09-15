import Footer from '@theme-original/DocItem/Footer';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Wraps the stock doc footer (tags, edit link, last updated) with a line saying where to go
// when the page is the problem. The edit link above it only helps people who already think of
// themselves as contributors; most readers need to be told that asking is fine.
export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <div className={styles.pageHelp}>
        Something wrong or missing here?{' '}
        <Link to="https://discord.gg/BeZzxyZ9c4">Ask on Discord</Link> ·{' '}
        <Link to="https://github.com/Flix100000/History-Stages/issues">Open an issue</Link>
      </div>
    </>
  );
}
