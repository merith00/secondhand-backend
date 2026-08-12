import { randomUUID } from 'node:crypto';

import { pool } from '../config/db.js';

import * as saleRepository from '../repositories/sale.repository.js';
import * as itemRepository from '../repositories/item.repository.js';
import * as customerRepository from '../repositories/customer.repository.js';

import { updateCustomerStatus } from '../utils/customerStatus.js';


export const getAllSales = async () => {
  return saleRepository.findAll();
};


export const createSale = async (data) => {
  validateSaleInput(data);

  const item = await itemRepository.findById(
    Number(data.item_id)
  );

  if (!item) {
    const error = new Error(
      'Kleidungsstück nicht gefunden'
    );

    error.statusCode = 404;
    throw error;
  }

  if (item.status === 'sold') {
    const error = new Error(
      'Kleidungsstück wurde bereits verkauft'
    );

    error.statusCode = 400;
    throw error;
  }

  if (item.status === 'withdrawn') {
    const error = new Error(
      'Kleidungsstück wurde zurückgenommen und kann nicht verkauft werden'
    );

    error.statusCode = 400;
    throw error;
  }

  const existingSale =
    await saleRepository.findByItemId(
      Number(data.item_id)
    );

  if (existingSale) {
    const error = new Error(
      'Für dieses Kleidungsstück existiert bereits ein Verkauf'
    );

    error.statusCode = 400;
    throw error;
  }

  const salePrice = Number(data.sale_price);

  const saleId = await saleRepository.insert({
    item_id: Number(data.item_id),
    owner_customer_id: Number(
      item.owner_customer_id
    ),
    sale_price: salePrice,
    owner_amount: data.owner_amount,
    shop_amount: data.shop_amount,
    sale_type: data.sale_type || 'store',
    payment_method:
      data.payment_method || 'cash',
    notes: data.notes || null,
    buyer_customer_id: Number(
      data.buyer_customer_id
    ),
  });

  await itemRepository.update(
    Number(data.item_id),
    {
      status: 'sold',
      is_in_store: 0,
      is_online_visible: 0,
      sold_at: new Date(),
    }
  );

  await updateCustomerStatus(
    Number(item.owner_customer_id)
  );

  await updateCustomerStatus(
    Number(data.buyer_customer_id)
  );

  return saleRepository.findById(saleId);
};


export const createBatchSale = async (data) => {
  validateBatchSaleInput(data);

  const buyerCustomerId = Number(
    data.buyer_customer_id
  );

  const sellerSharePercent = Number(
    data.seller_share_percent ?? 40
  );

  const shopSharePercent = Number(
    data.shop_share_percent ?? 60
  );

  if (
    sellerSharePercent < 0 ||
    shopSharePercent < 0 ||
    sellerSharePercent > 100 ||
    shopSharePercent > 100 ||
    sellerSharePercent + shopSharePercent !== 100
  ) {
    const error = new Error(
      'Verkäuferanteil und Shopanteil müssen zusammen 100 % ergeben'
    );

    error.statusCode = 400;
    throw error;
  }

  /*
   * Einheitliche Reihenfolge verhindert Probleme,
   * wenn mehrere Verkäufe gleichzeitig stattfinden.
   */
  const saleItems = [...data.items]
    .map((saleItem) => ({
      item_id: Number(saleItem.item_id),
      sale_price: Number(saleItem.sale_price),
    }))
    .sort(
      (first, second) =>
        first.item_id - second.item_id
    );

  const transactionId = randomUUID();
  const connection = await pool.getConnection();

  const createdSaleIds = [];

  const affectedCustomerIds = new Set([
    buyerCustomerId,
  ]);

  try {
    await connection.beginTransaction();

    /*
     * Käufer wird dabei gesperrt, damit dasselbe
     * Guthaben nicht gleichzeitig verwendet wird.
     */
    const buyerCredit =
      await customerRepository
        .findCreditBalanceWithConnection(
          connection,
          buyerCustomerId
        );

    if (buyerCredit === null) {
      const error = new Error(
        'Käufer wurde nicht gefunden'
      );

      error.statusCode = 404;
      throw error;
    }

    /*
     * Berechnung in Cent verhindert Rundungsfehler.
     */
    const totalPriceCents = saleItems.reduce(
      (sum, saleItem) =>
        sum +
        Math.round(saleItem.sale_price * 100),
      0
    );

    const availableCreditCents = Math.max(
      0,
      Math.round(buyerCredit * 100)
    );

    const creditUsedCents = Math.min(
      availableCreditCents,
      totalPriceCents
    );

    const cashDifferenceCents =
      totalPriceCents - creditUsedCents;

    const cashDifferenceConfirmed =
      data.cash_difference_confirmed === true ||
      data.cash_difference_confirmed === 1;

    if (
      cashDifferenceCents > 0 &&
      !cashDifferenceConfirmed
    ) {
      const error = new Error(
        `Das Guthaben reicht nicht aus. Die Barzahlung über ${(
          cashDifferenceCents / 100
        ).toFixed(2)} € muss bestätigt werden.`
      );

      error.statusCode = 400;
      throw error;
    }

    /*
     * Guthaben wird auf die Verkaufspositionen verteilt.
     */
    let remainingCreditCents = creditUsedCents;

    for (const saleItem of saleItems) {
      const item =
        await itemRepository.findByIdForUpdate(
          connection,
          saleItem.item_id
        );

      if (!item) {
        const error = new Error(
          `Kleidungsstück ${saleItem.item_id} wurde nicht gefunden`
        );

        error.statusCode = 404;
        throw error;
      }

      if (
        item.status === 'sold' ||
        item.is_in_store === 0
      ) {
        const error = new Error(
          `"${item.title}" wurde bereits verkauft`
        );

        error.statusCode = 409;
        throw error;
      }

      if (item.status === 'withdrawn') {
        const error = new Error(
          `"${item.title}" wurde zurückgenommen und kann nicht verkauft werden`
        );

        error.statusCode = 400;
        throw error;
      }

      if (
        Number.isNaN(saleItem.sale_price) ||
        saleItem.sale_price < 0
      ) {
        const error = new Error(
          `Der Verkaufspreis für "${item.title}" ist ungültig`
        );

        error.statusCode = 400;
        throw error;
      }

      const salePriceCents = Math.round(
        saleItem.sale_price * 100
      );

      const itemCreditUsedCents = Math.min(
        remainingCreditCents,
        salePriceCents
      );

      const itemCashPaidCents =
        salePriceCents - itemCreditUsedCents;

      remainingCreditCents -=
        itemCreditUsedCents;

      const buyerCreditUsed =
        itemCreditUsedCents / 100;

      const buyerCashPaid =
        itemCashPaidCents / 100;

      const grossPrice = saleItem.sale_price;
      const netPrice = grossPrice / 1.19;
      const vatAmount = grossPrice - netPrice;

      const ownerAmount =
        (grossPrice * sellerSharePercent) / 100 -
        vatAmount;

      const shopAmount =
        (grossPrice * shopSharePercent) / 100;

      const saleId =
        await saleRepository
          .insertWithConnection(
            connection,
            {
              transaction_id: transactionId,
              item_id: item.id,
              owner_customer_id:
                item.owner_customer_id,
              sale_price: grossPrice,
              owner_amount: Number(
                ownerAmount.toFixed(2)
              ),
              shop_amount: Number(
                shopAmount.toFixed(2)
              ),
              sale_type:
                data.sale_type || 'store',
              payment_method:
                data.payment_method || 'cash',
              notes: data.notes || null,
              buyer_customer_id:
                buyerCustomerId,

              buyer_credit_used:
                buyerCreditUsed,

              buyer_cash_paid:
                buyerCashPaid,

              cash_difference_confirmed:
                itemCashPaidCents > 0 ? 1 : 0,
            }
          );

      await itemRepository
        .markAsSoldWithConnection(
          connection,
          item.id,
          new Date()
        );

      createdSaleIds.push(saleId);

      affectedCustomerIds.add(
        Number(item.owner_customer_id)
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  /*
   * Status erst nach erfolgreichem Verkauf aktualisieren.
   */
  await Promise.allSettled(
    [...affectedCustomerIds].map((customerId) =>
      updateCustomerStatus(customerId)
    )
  );

  return {
    transaction_id: transactionId,
    sale_ids: createdSaleIds,
    item_count: createdSaleIds.length,
    total_price: Number(
      saleItems
        .reduce(
          (sum, item) =>
            sum + item.sale_price,
          0
        )
        .toFixed(2)
    ),
  };
};


const validateSaleInput = (data) => {
  if (
    !data.item_id ||
    data.sale_price == null
  ) {
    const error = new Error(
      'item_id und sale_price sind Pflichtfelder'
    );

    error.statusCode = 400;
    throw error;
  }

  const salePrice = Number(data.sale_price);

  if (
    Number.isNaN(salePrice) ||
    salePrice < 0
  ) {
    const error = new Error(
      'sale_price ist ungültig'
    );

    error.statusCode = 400;
    throw error;
  }
};


const validateBatchSaleInput = (data) => {
  if (!data.buyer_customer_id) {
    const error = new Error(
      'Ein Käufer muss ausgewählt werden'
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    const error = new Error(
      'Mindestens ein Kleidungsstück muss ausgewählt werden'
    );

    error.statusCode = 400;
    throw error;
  }

  const itemIds = data.items.map((item) =>
    Number(item.item_id)
  );

  if (
    itemIds.some(
      (id) =>
        !Number.isInteger(id) ||
        id <= 0
    )
  ) {
    const error = new Error(
      'Mindestens eine Kleidungsstück-ID ist ungültig'
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    new Set(itemIds).size !== itemIds.length
  ) {
    const error = new Error(
      'Ein Kleidungsstück wurde mehrfach ausgewählt'
    );

    error.statusCode = 400;
    throw error;
  }

  const hasInvalidPrice = data.items.some(
    (item) => {
      const price = Number(item.sale_price);

      return (
        !Number.isFinite(price) ||
        price < 0
      );
    }
  );

  if (hasInvalidPrice) {
    const error = new Error(
      'Mindestens ein Verkaufspreis ist ungültig'
    );

    error.statusCode = 400;
    throw error;
  }

  const allowedSaleTypes = [
    'store',
    'online',
  ];

  const allowedPaymentMethods = [
    'cash',
    'bank_transfer',
  ];

  if (
    data.sale_type &&
    !allowedSaleTypes.includes(data.sale_type)
  ) {
    const error = new Error(
      'Ungültige Verkaufsart'
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    data.payment_method &&
    !allowedPaymentMethods.includes(
      data.payment_method
    )
  ) {
    const error = new Error(
      'Ungültige Zahlungsart'
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    data.cash_difference_confirmed !==
      undefined &&
    typeof data.cash_difference_confirmed !==
      'boolean' &&
    data.cash_difference_confirmed !== 0 &&
    data.cash_difference_confirmed !== 1
  ) {
    const error = new Error(
      'Die Bestätigung der Barzahlung ist ungültig'
    );

    error.statusCode = 400;
    throw error;
  }
};