const links = [
  ['/', 'HOME'],
  ['/index', 'INDEX'],
  ['/museum', 'MUSEUMS'],
  ['/archive', 'ARCHIVE'],
  ['/stages', 'STAGES'],
  ['/comments', 'COMMENTS'],
  ['/about', 'ABOUT'],
];

// Native document navigation stays usable without client router scripts.
function NavigationLinks() {
  return <>{links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</>;
}

export function SiteNav() {
  return (
    <header className="site-nav">
      <a className="sigil" href="/" aria-label="What Remains Unsaid home">W<span>/</span>R<span>/</span>U</a>
      <nav className="desktop-navigation" aria-label="Primary"><NavigationLinks /></nav>
      <details className="mobile-navigation">
        <summary><span className="menu-closed">CONTENTS +</span><span className="menu-open">CLOSE −</span></summary>
        <nav aria-label="Primary"><NavigationLinks /></nav>
      </details>
      <span className="nav-note">AN ONGOING COLLECTION</span>
    </header>
  );
}
