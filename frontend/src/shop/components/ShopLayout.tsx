import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../../App.css';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartCount } = useCart();

  return (
    <div className="shop-page">
      <header className="shop-header shop-header-bar">
        <div>
          <h1>Onlineshop</h1>
          <p>Second-Hand Mode online entdecken</p>
        </div>

        <nav className="shop-nav">
          <Link to="/shop" className="secondary-btn shop-link-btn">
            Shop
          </Link>

          <Link to="/shop/cart" className="primary-btn shop-link-btn">
            Warenkorb ({cartCount})
          </Link>
        </nav>
      </header>

      {children}
    </div>
  );
}