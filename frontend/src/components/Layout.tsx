
type LayoutProps = {
  activeView: 'customers' | 'items' | 'sales';
  onChangeView: (view: 'customers' | 'items' | 'sales') => void;
  children: React.ReactNode;
};

export default function Layout({
  activeView,
  onChangeView,
  children,
}: LayoutProps) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Second Hand</h2>

        <button
          className={activeView === 'customers' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('customers')}
        >
          Kunden
        </button>

        <button
          className={activeView === 'items' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('items')}
        >
          Kleidungsstücke
        </button>

        <button
          className={activeView === 'sales' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('sales')}
        >
          Verkäufe
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Verwaltung</h1>
            <p>Second-Hand Verwaltung für Kunden und Kleidungsstücke</p>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}