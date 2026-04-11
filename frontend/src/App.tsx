import { useEffect, useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import CustomerForm from './components/CustomerForm';
import CustomerTable from './components/CustomerTable';
import ItemForm from './components/ItemForm';
import ItemTable from './components/ItemTable';

import SaleForm from './components/SaleForm';
import SalesTable from './components/SalesTable';

import CustomerCreditsTable from './components/CustomerCreditsTable';


import type {
  Customer,
  CustomerCredit,
  CustomerFormData,
  Item,
  ItemFormData,
  Sale,
  SaleFormData,
} from './types';


import {
  createCustomer,
  createItem,
  createSale,
  fetchCustomerCredits,
  fetchCustomers,
  fetchItems,
  fetchSales,
} from './api';

function App() {
  const [activeView, setActiveView] = useState<'customers' | 'items' | 'sales'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const [customerCredits, setCustomerCredits] = useState<CustomerCredit[]>([]);
const [loadingCustomerCredits, setLoadingCustomerCredits] = useState(false);

  const [error, setError] = useState('');

  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    first_name: '',
    last_name: '',
    city: '',
    phone: '',
    email: '',
  });

  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    owner_customer_id: '',
    title: '',
    description: '',
    category: '',
    size: '',
    brand: '',
    color: '',
    price: '',
    is_online_visible: false,
  });


  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [saleFormData, setSaleFormData] = useState<SaleFormData>({
    item_id: '',
    sale_price: '',
    sale_type: 'store',
    payment_method: 'cash',
    notes: '',
  });


  async function loadCustomers() {
    try {
      setLoadingCustomers(true);
      setError('');
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Kunden');
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadItems() {
    try {
      setLoadingItems(true);
      setError('');
      const data = await fetchItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Kleidungsstücke');
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadSales() {
  try {
    setLoadingSales(true);
    setError('');
    const data = await fetchSales();
    setSales(data);
  } catch (err: any) {
    setError(err.message || 'Fehler beim Laden der Verkäufe');
  } finally {
    setLoadingSales(false);
  }
}

async function loadCustomerCredits() {
  try {
    setLoadingCustomerCredits(true);
    setError('');
    const data = await fetchCustomerCredits();
    setCustomerCredits(data);
  } catch (err: any) {
    setError(err.message || 'Fehler beim Laden der Guthabenübersicht');
  } finally {
    setLoadingCustomerCredits(false);
  }
}

useEffect(() => {
  loadCustomers();
  loadItems();
  loadSales();
  loadCustomerCredits();
}, []);

  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError('');
      await createCustomer(customerFormData);

      setCustomerFormData({
        first_name: '',
        last_name: '',
        city: '',
        phone: '',
        email: '',
      });

      await loadCustomers();
      await loadCustomerCredits();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Kunden');
    }
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError('');

      await createItem({
        owner_customer_id: Number(itemFormData.owner_customer_id),
        title: itemFormData.title,
        description: itemFormData.description,
        category: itemFormData.category,
        size: itemFormData.size,
        brand: itemFormData.brand,
        color: itemFormData.color,
        price: Number(itemFormData.price),
        is_online_visible: itemFormData.is_online_visible ? 1 : 0,
      });

      setItemFormData({
        owner_customer_id: '',
        title: '',
        description: '',
        category: '',
        size: '',
        brand: '',
        color: '',
        price: '',
        is_online_visible: false,
      });

      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Kleidungsstücks');
    }
  }

  function handleCustomerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleItemChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setItemFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleItemCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = e.target;

    setItemFormData((prev) => ({
      ...prev,
      is_online_visible: checked,
    }));
  }


  async function handleSaleSubmit(e: React.FormEvent) {
  e.preventDefault();

  try {
    setError('');

    await createSale({
      item_id: Number(saleFormData.item_id),
      sale_price: Number(saleFormData.sale_price),
      sale_type: saleFormData.sale_type,
      payment_method: saleFormData.payment_method,
      notes: saleFormData.notes,
    });

    setSaleFormData({
      item_id: '',
      sale_price: '',
      sale_type: 'store',
      payment_method: 'cash',
      notes: '',
    });

    await loadSales();
    await loadItems();
    await loadCustomerCredits();
  } catch (err: any) {
    setError(err.message || 'Fehler beim Speichern des Verkaufs');
  }
}




function handleSaleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) {
  const { name, value } = e.target;

  setSaleFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
}
  return (
    <Layout activeView={activeView} onChangeView={setActiveView}>
      {error && <div className="error-box">{error}</div>}

{activeView === 'customers' && (
  <div className="customer-page">
    <div className="content-grid">
      <CustomerForm
        formData={customerFormData}
        onChange={handleCustomerChange}
        onSubmit={handleCustomerSubmit}
      />

      <CustomerTable
        customers={customers}
        loading={loadingCustomers}
        onReload={loadCustomers}
      />
    </div>

    <div className="section-spacing">
      <CustomerCreditsTable
        credits={customerCredits}
        loading={loadingCustomerCredits}
        onReload={loadCustomerCredits}
      />
    </div>
  </div>
)}

      {activeView === 'items' && (
        <div className="content-grid">
          <ItemForm
            formData={itemFormData}
            customers={customers}
            onChange={handleItemChange}
            onCheckboxChange={handleItemCheckboxChange}
            onSubmit={handleItemSubmit}
          />

          <ItemTable
            items={items}
            loading={loadingItems}
            onReload={loadItems}
          />
        </div>
      )}

      {activeView === 'sales' && (
  <div className="content-grid">
    <SaleForm
      formData={saleFormData}
      items={items}
      onChange={handleSaleChange}
      onSubmit={handleSaleSubmit}
    />

    <SalesTable
      sales={sales}
      loading={loadingSales}
      onReload={loadSales}
    />
  </div>
)}
    </Layout>
  );
}




export default App;