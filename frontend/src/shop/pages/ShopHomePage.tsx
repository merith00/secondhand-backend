import { useEffect, useState } from 'react';
import { fetchShopItems } from '../../api/shopApi';
import type { ShopItem } from '../../types';
import ShopItemCard from '../components/ShopItemCard';
import ShopLayout from '../components/ShopLayout';
import '../../App.css';

export default function ShopHomePage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadItems() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchShopItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Shop-Artikel');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <ShopLayout>
      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <p>Lade Artikel...</p>
      ) : items.length === 0 ? (
        <div className="card">
          <p>Aktuell sind keine Artikel online verfügbar.</p>
        </div>
      ) : (
        <div className="shop-grid">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </ShopLayout>
  );
}