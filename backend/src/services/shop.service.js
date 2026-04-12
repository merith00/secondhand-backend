import * as shopRepository from '../repositories/shop.repository.js';

export const getVisibleShopItems = async (query) => {
  return shopRepository.findVisibleItems(query);
};

export const getVisibleShopItemById = async (id) => {
  const item = await shopRepository.findVisibleItemById(id);

  if (!item) {
    const error = new Error('Shop-Artikel nicht gefunden');
    error.statusCode = 404;
    throw error;
  }

  return item;
};