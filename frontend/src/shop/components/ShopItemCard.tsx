import { Link } from 'react-router-dom';
import type { ShopItem } from '../../types';
import { useCart } from '../context/CartContext';

type ShopItemCardProps = {
  item: ShopItem;
};

export default function ShopItemCard({ item }: ShopItemCardProps) {
  const { addToCart, isInCart } = useCart();
  const alreadyInCart = isInCart(item.id);

  return (
    <article className="shop-card">
      <div className="shop-image">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} />
        ) : (
          <div className="shop-image-placeholder">Kein Bild</div>
        )}
      </div>

      <div className="shop-card-content">
        <h3>{item.title}</h3>

        <div className="shop-meta">
          <span>{item.brand || 'Ohne Marke'}</span>
          <span>{item.category || 'Ohne Kategorie'}</span>
          <span>Größe: {item.size || '-'}</span>
        </div>

        {item.color && <p className="shop-color">Farbe: {item.color}</p>}

        {item.description && (
          <p className="shop-description">{item.description}</p>
        )}

        <div className="shop-card-footer">
          <strong>{Number(item.price).toFixed(2)} €</strong>
        </div>

        <div className="shop-card-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => addToCart(item)}
            disabled={alreadyInCart}
          >
            {alreadyInCart ? 'Im Warenkorb' : 'In den Warenkorb'}
          </button>

          <Link className="primary-btn shop-link-btn" to={`/shop/items/${item.id}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}