export const createOrderNumber = (id) => {
  return `SO${String(id).padStart(6, '0')}`;
};