import { Link } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import { useCart } from '../context/CartContext';
import '../../App.css';

export default function ShopCartPage() {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();

    return (
        <ShopLayout>
            <div className="shop-detail-topbar">
                <Link to="/shop" className="secondary-btn shop-link-btn">
                    Weiter einkaufen
                </Link>
            </div>

            <div className="cart-layout">
                <section className="card">
                    <div className="card-header">
                        <h2>Warenkorb</h2>

                        {cartItems.length > 0 && (
                            <button className="secondary-btn" onClick={clearCart}>
                                Alles entfernen
                            </button>
                        )}
                    </div>

                    {cartItems.length === 0 ? (
                        <p>Dein Warenkorb ist aktuell leer.</p>
                    ) : (
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-image">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} />
                                        ) : (
                                            <div className="shop-image-placeholder">Kein Bild</div>
                                        )}
                                    </div>

                                    <div className="cart-item-content">
                                        <h3>{item.title}</h3>
                                        <p>{item.brand || 'Ohne Marke'}</p>
                                        <p>Größe: {item.size || '-'}</p>
                                        <strong>{Number(item.price).toFixed(2)} €</strong>
                                    </div>

                                    <div className="cart-item-actions">
                                        <Link
                                            to={`/shop/items/${item.id}`}
                                            className="secondary-btn shop-link-btn"
                                        >
                                            Details
                                        </Link>

                                        <button
                                            className="primary-btn"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            Entfernen
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="card cart-summary">
                    <h3>Zusammenfassung</h3>
                    <p>Anzahl Artikel: {cartItems.length}</p>
                    <p className="cart-total">
                        Gesamt: <strong>{cartTotal.toFixed(2)} €</strong>
                    </p>

                    <Link
                        to="/shop/checkout"
                        className={`primary-btn shop-link-btn ${cartItems.length === 0 ? 'disabled-link' : ''}`}
                        onClick={(e) => {
                            if (cartItems.length === 0) {
                                e.preventDefault();
                            }
                        }}
                    >
                        Zur Kasse
                    </Link>
                </aside>
            </div>
        </ShopLayout>
    );
}