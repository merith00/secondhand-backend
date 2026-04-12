const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'Unbekannter Fehler';

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // leer
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchShopItems() {
  const response = await fetch(`${API_BASE_URL}/shop/items`);
  return handleResponse(response);
}

export async function fetchShopItemById(id: number) {
  const response = await fetch(`${API_BASE_URL}/shop/items/${id}`);
  return handleResponse(response);
}

export async function createShopOrder(order: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  street: string;
  house_number?: string;
  postal_code: string;
  city: string;
  notes?: string;
  items: number[];
}) {
  const response = await fetch(`${API_BASE_URL}/shop/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });

  return handleResponse(response);
}