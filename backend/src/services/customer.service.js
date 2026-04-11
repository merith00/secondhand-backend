import * as customerRepository from '../repositories/customer.repository.js';
import { createCustomerNumber } from '../utils/customerNumber.js';
export const getAllCustomers = async () => {
    return customerRepository.findAll();
};
export const getCustomerById = async (id) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
        const error = new Error('Kunde nicht gefunden');
        error.statusCode = 404;
        throw error;
    }
    return customer;
};
export const createCustomer = async (data) => {
    validateCustomerInput(data);
    const customerId = await customerRepository.insert(data);
    const customerNumber = createCustomerNumber(customerId);
    await customerRepository.updateCustomerNumber(customerId, customerNumber);
    return customerRepository.findById(customerId);
};
export const updateCustomer = async (id, data) => {
    const existingCustomer = await customerRepository.findById(id);
    if (!existingCustomer) {
        const error = new Error('Kunde nicht gefunden');
        error.statusCode = 404;
        throw error;
    }
    validateCustomerInput({
        first_name: data.first_name ?? existingCustomer.first_name,
        last_name: data.last_name ?? existingCustomer.last_name
    });
    await customerRepository.update(id, data);
    return customerRepository.findById(id);
};
const validateCustomerInput = (data) => {
    if (!data.first_name || !data.last_name) {
        const error = new Error('Vorname und Nachname sind Pflichtfelder');
        error.statusCode = 400;
        throw error;
    }
};