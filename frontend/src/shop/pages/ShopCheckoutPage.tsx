import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createShopOrder } from '../../api/shopApi';
import type { CheckoutFormData, ShopOrder } from '../../types';
import ShopLayout from '../components/ShopLayout';
import { useCart } from '../context/CartContext';
import '../../App.css';

export default function ShopCheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<ShopOrder | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const order = await createShopOrder({
        ...formData,
        items: cartItems.map((item) => item.id),
      });

      setSuccessOrder(order);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Absenden der Bestellung');
    } finally {
      setLoading(false);
    }
  }

  if (successOrder) {
    return (
      <ShopLayout>
        <div className="card checkout-success">
          <h2>Bestellung erfolgreich abgesendet</h2>
          <p>
            Vielen Dank für deine Bestellung.
          </p>
          <p>
            Deine Bestellnummer: <strong>{successOrder.order_number}</strong>
          </p>
          <p>
            Gesamtbetrag: <strong>{Number(successOrder.total_amount).toFixed(2)} €</strong>
          </p>
          <p>
            Zahlungsart: Überweisung
          </p>
          <div className="checkout-success-actions">
            <button
              className="primary-btn"
              onClick={() => navigate('/shop')}
            >
              Zurück zum Shop
            </button>
          </div>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="shop-detail-topbar">
        <Link to="/shop/cart" className="secondary-btn shop-link-btn">
          Zurück zum Warenkorb
        </Link>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="checkout-layout">
        <section className="card">
          <h2>Zur Kasse</h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row-two">
              <input
                name="first_name"
                placeholder="Vorname"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <input
                name="last_name"
                placeholder="Nachname"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row-two">
              <input
                name="email"
                type="email"
                placeholder="E-Mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                placeholder="Telefon"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-row-two">
              <input
                name="street"
                placeholder="Straße"
                value={formData.street}
                onChange={handleChange}
                required
              />
              <input
                name="house_number"
                placeholder="Hausnummer"
                value={formData.house_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-row-two">
              <input
                name="postal_code"
                placeholder="PLZ"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
              <input
                name="city"
                placeholder="Ort"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <textarea
              name="notes"
              placeholder="Anmerkungen zur Bestellung"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />

            <div className="info-box">
              Zahlungsart: Überweisung
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || cartItems.length === 0}
            >
              {loading ? 'Bestellung wird gesendet...' : 'Verbindlich bestellen'}
            </button>
          </form>
        </section>

        <aside className="card checkout-summary">
          <h3>Bestellübersicht</h3>

          {cartItems.length === 0 ? (
            <p>Dein Warenkorb ist leer.</p>
          ) : (
            <>
              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <span>{item.title}</span>
                    <strong>{Number(item.price).toFixed(2)} €</strong>
                  </div>
                ))}
              </div>

              <p className="cart-total">
                Gesamt: <strong>{cartTotal.toFixed(2)} €</strong>
              </p>
            </>
          )}
        </aside>
      </div>
    </ShopLayout>
  );
}