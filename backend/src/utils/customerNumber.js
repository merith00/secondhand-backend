export const createCustomerNumber = (id) => {
    return `K${String(id).padStart(5, '0')}`;
};
