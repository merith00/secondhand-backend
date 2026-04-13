import { asyncHandler } from '../utils/asyncHandler.js';
import * as customerService from '../services/customer.service.js';


export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await customerService.getAllCustomers();
  res.json(customers);
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(Number(req.params.id));
  res.json(customer);
});

export const createCustomer = asyncHandler(async (req, res) => {
  const newCustomer = await customerService.createCustomer(req.body);
  res.status(201).json(newCustomer);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const updatedCustomer = await customerService.updateCustomer(Number(req.params.id), req.body);
  res.json(updatedCustomer);
});

export const getCustomerCredits = asyncHandler(async (req, res) => {
  const credits = await customerService.getCustomerCreditsOverview();
  res.json(credits);
});