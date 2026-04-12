import { Navigate, Route, Routes } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import ShopApp from './shop/ShopApp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shop" />} />

      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/shop/*" element={<ShopApp />} />
    </Routes>
  );
}

export default App;