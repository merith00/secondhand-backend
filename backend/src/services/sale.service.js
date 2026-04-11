import * as saleRepository from '../repositories/sale.repository.js';
import * as itemRepository from '../repositories/item.repository.js';

export const getAllSales = async () => {
  return saleRepository.findAll();
};

export const createSale = async (data) => {
  validateSaleInput(data);

  const item = await itemRepository.findById(Number(data.item_id));
  if (!item) {
    const error = new Error('Kleidungsstück nicht gefunden');
    error.statusCode = 404;
    throw error;
  }

  if (item.status === 'sold') {
    const error = new Error('Kleidungsstück wurde bereits verkauft');
    error.statusCode = 400;
    throw error;
  }

  if (item.status === 'withdrawn') {
    const error = new Error('Kleidungsstück wurde zurückgenommen und kann nicht verkauft werden');
    error.statusCode = 400;
    throw error;
  }

  const existingSale = await saleRepository.findByItemId(Number(data.item_id));
  if (existingSale) {
    const error = new Error('Für dieses Kleidungsstück existiert bereits ein Verkauf');
    error.statusCode = 400;
    throw error;
  }

  const salePrice = Number(data.sale_price);
  const ownerAmount = Number((salePrice * 0.5).toFixed(2));
  const shopAmount = Number((salePrice - ownerAmount).toFixed(2));

  const saleId = await saleRepository.insert({
    item_id: Number(data.item_id),
    owner_customer_id: Number(item.owner_customer_id),
    sale_price: salePrice,
    owner_amount: ownerAmount,
    shop_amount: shopAmount,
    sale_type: data.sale_type || 'store',
    payment_method: data.payment_method || 'cash',
    notes: data.notes || null,
  });

  await itemRepository.update(Number(data.item_id), {
    status: 'sold',
    is_in_store: 0,
    is_online_visible: 0,
    sold_at: new Date(),
  });

  return saleRepository.findById(saleId);
};

const validateSaleInput = (data) => {
  if (!data.item_id || data.sale_price == null) {
    const error = new Error('item_id und sale_price sind Pflichtfelder');
    error.statusCode = 400;
    throw error;
  }

  const salePrice = Number(data.sale_price);
  if (Number.isNaN(salePrice) || salePrice < 0) {
    const error = new Error('sale_price ist ungueltig');
    error.statusCode = 400;
    throw error;
  }
};