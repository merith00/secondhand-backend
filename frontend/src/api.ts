const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'Unbekannter Fehler';

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // absichtlich leer
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchCustomers() {
  const response = await fetch(`${API_BASE_URL}/customers`);
  return handleResponse(response);
}

export async function createCustomer(customer: {
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
  email: string;
}) {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  });

  return handleResponse(response);
}

export async function fetchItems() {
  const response = await fetch(`${API_BASE_URL}/items`);
  return handleResponse(response);
}


export async function createItem(item: {
  owner_customer_id: number;
  title: string;
  description?: string;
  category?: string;
  size?: string;
  brand?: string;
  color?: string;
  price: number;
  is_online_visible: number;
}) {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  return handleResponse(response);
}

export async function fetchSales() {
  const response = await fetch(`${API_BASE_URL}/sales`);
  return handleResponse(response);
}

export async function createSale(sale: {
  item_id: number;
  sale_price: number;
  sale_type: 'store' | 'online';
  payment_method: 'cash' | 'bank_transfer';
  notes?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sale),
  });

  return handleResponse(response);
}

export async function fetchCustomerCredits() {
  const response = await fetch(`${API_BASE_URL}/customers/credits/overview`);
  return handleResponse(response);
}
