import { asyncHandler } from '../utils/asyncHandler.js';
import * as itemService from '../services/item.service.js';
export const getItems = asyncHandler(async (req, res) => {
    const items = await itemService.getAllItems(req.query);
    res.json(items);
});
export const getItemById = asyncHandler(async (req, res) => {
    const item = await itemService.getItemById(Number(req.params.id));
    res.json(item);
});
export const createItem = asyncHandler(async (req, res) => {
    const newItem = await itemService.createItem(req.body);
    res.status(201).json(newItem);
});
export const updateItem = asyncHandler(async (req, res) => {
    const updatedItem = await itemService.updateItem(Number(req.params.id),
        req.body);
    res.json(updatedItem);
});
export const updateItemStatus = asyncHandler(async (req, res) => {
    const updatedItem = await
        itemService.updateItemStatus(Number(req.params.id), req.body.status);
    res.json(updatedItem);
});