import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchShopItemById } from '../../api/shopApi';
import type { ShopItem } from '../../types';
import ShopLayout from '../components/ShopLayout';
import { useCart } from '../context/CartContext';
import '../../App.css';

export default function ShopItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<ShopItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addToCart, isInCart } = useCart();

  async function loadItem() {
    try {
      setLoading(true);
      setError('');

      if (!id) {
        throw new Error('Keine Artikel-ID gefunden');
      }

      const data = await fetchShopItemById(Number(id));
      setItem(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Artikels');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItem();
  }, [id]);

  const alreadyInCart = item ? isInCart(item.id) : false;

  return (
    <ShopLayout>
      <div className="shop-detail-topbar">
        <Link to="/shop" className="secondary-btn shop-link-btn">
          Zurück zum Shop
        </Link>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <p>Lade Artikel...</p>
      ) : !item ? (
        <div className="card">
          <p>Artikel nicht gefunden.</p>
        </div>
      ) : (
        <div className="shop-detail-card">
          <div className="shop-detail-image">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} />
            ) : (
              <div className="shop-image-placeholder">Kein Bild</div>
            )}
          </div>

          <div className="shop-detail-content">
            <p className="shop-detail-category">
              {item.category || 'Ohne Kategorie'}
            </p>

            <h1>{item.title}</h1>

            <div className="shop-detail-price">
              {Number(item.price).toFixed(2)} €
            </div>

            <div className="shop-detail-meta">
              <div><strong>Marke:</strong> {item.brand || '-'}</div>
              <div><strong>Größe:</strong> {item.size || '-'}</div>
              <div><strong>Farbe:</strong> {item.color || '-'}</div>
            </div>

            {item.description && (
              <div className="shop-detail-description">
                <h3>Beschreibung</h3>
                <p>{item.description}</p>
              </div>
            )}

            <div className="shop-detail-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => addToCart(item)}
                disabled={alreadyInCart}
              >
                {alreadyInCart ? 'Bereits im Warenkorb' : 'In den Warenkorb'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}