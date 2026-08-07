import { asyncHandler } from '../utils/asyncHandler.js';
import * as itemOptionService from '../services/itemOption.service.js';

export const getItemOptions = asyncHandler(async (req, res) => {
  const options = await itemOptionService.getAllOptions(req.query.type);

  res.json(options);
});

export const createItemOption = asyncHandler(async (req, res) => {
  const option = await itemOptionService.createOption(req.body);

  res.status(201).json(option);
});

export const deleteItemOption = asyncHandler(async (req, res) => {
  const result = await itemOptionService.deleteOption(
    Number(req.params.id)
  );

  res.json(result);
});