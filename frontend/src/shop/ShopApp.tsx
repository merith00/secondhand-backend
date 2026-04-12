import { Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ShopHomePage from './pages/ShopHomePage';
import ShopItemDetailPage from './pages/ShopItemDetailPage';
import ShopCartPage from './pages/ShopCartPage';
import ShopCheckoutPage from './pages/ShopCheckoutPage';

export default function ShopApp() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<ShopHomePage />} />
        <Route path="/items/:id" element={<ShopItemDetailPage />} />
        <Route path="/cart" element={<ShopCartPage />} />
        <Route path="/checkout" element={<ShopCheckoutPage />} />
      </Routes>
    </CartProvider>
  );
}