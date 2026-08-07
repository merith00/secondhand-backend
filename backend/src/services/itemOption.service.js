import * as itemOptionRepository from '../repositories/itemOption.repository.js';

const ALLOWED_TYPES = ['category', 'size', 'brand', 'color'];

export const getAllOptions = async (type) => {
  if (type && !ALLOWED_TYPES.includes(type)) {
    const error = new Error('Ungültiger Optionstyp');
    error.statusCode = 400;
    throw error;
  }

  return itemOptionRepository.findAll(type || null);
};

export const createOption = async (data) => {
  const type = data.type?.trim();
  const value = data.value?.trim();

  if (!type || !ALLOWED_TYPES.includes(type)) {
    const error = new Error('Ungültiger Optionstyp');
    error.statusCode = 400;
    throw error;
  }

  if (!value) {
    const error = new Error('Wert darf nicht leer sein');
    error.statusCode = 400;
    throw error;
  }

  const optionId = await itemOptionRepository.insert({
    type,
    value,
    sort_order: data.sort_order ?? 0,
    is_active: 1,
  });

  return itemOptionRepository.findById(optionId);
};

export const deleteOption = async (id) => {
  const option = await itemOptionRepository.findById(id);

  if (!option) {
    const error = new Error('Option nicht gefunden');
    error.statusCode = 404;
    throw error;
  }

  await itemOptionRepository.remove(id);

  return {
    message: 'Option erfolgreich gelöscht',
  };
};