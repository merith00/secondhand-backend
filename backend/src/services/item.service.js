import * as itemRepository from '../repositories/item.repository.js';
import * as customerRepository from '../repositories/customer.repository.js';
const ALLOWED_STATUSES = ['active', 'reserved', 'sold', 'withdrawn'];
export const getAllItems = async (query) => {
    return itemRepository.findAll(query);
};
export const getItemById = async (id) => {
    const item = await itemRepository.findById(id);
    if (!item) {
        const error = new Error('Kleidungsstueck nicht gefunden');
        error.statusCode = 404;
        throw error;
    }
    return item;
};
export const createItem = async (data) => {
    validateItemInput(data);
    const owner = await
        customerRepository.findById(Number(data.owner_customer_id));
    if (!owner) {
        const error = new Error('Eigentuemer nicht gefunden');
        error.statusCode = 400;
        throw error;
    }
    const itemId = await itemRepository.insert({
        ...data,
        is_in_store: 1,
        is_online_visible: Number(data.is_online_visible || 0),
        status: 'active'
    });
    return itemRepository.findById(itemId);
};
export const updateItem = async (id, data) => {
    const existingItem = await itemRepository.findById(id);
    if (!existingItem) {
        const error = new Error('Kleidungsstueck nicht gefunden');
        error.statusCode = 404;
        throw error;
    }
    if (data.owner_customer_id) {
        const owner = await
            customerRepository.findById(Number(data.owner_customer_id));
        if (!owner) {
            const error = new Error('Eigentuemer nicht gefunden');
            error.statusCode = 400;
            throw error;
        }
    }
    await itemRepository.update(id, data);
    return itemRepository.findById(id);
};
export const updateItemStatus = async (id, status) => {
    if (!ALLOWED_STATUSES.includes(status)) {
        const error = new Error('Ungueltiger Status');
        error.statusCode = 400;
        throw error;
    }
    const existingItem = await itemRepository.findById(id);
    if (!existingItem) {
        const error = new Error('Kleidungsstueck nicht gefunden');
        error.statusCode = 404;
        throw error;
    }
    const updateData = { status };
    if (status === 'sold' || status === 'withdrawn') {
        updateData.is_in_store = 0;
        updateData.is_online_visible = 0;
        updateData.sold_at = status === 'sold' ? new Date() : null;
    }
    if (status === 'active') {
        updateData.is_in_store = 1;
    }
    await itemRepository.update(id, updateData);
    return itemRepository.findById(id);
};
const validateItemInput = (data) => {
    if (!data.owner_customer_id || !data.title || data.price == null) {
        const error = new Error('owner_customer_id, title und price sind Pflichtfelder');
        error.statusCode = 400;
        throw error;
    }
}