import { Request } from 'express';

const OrderSchemaError = {
  statusMissing: "Order's status is missing.",
  productIDMissing: "Order's corresponding product's id is missing.",
  userIDMissing: "Order's corresponding user's id is missing.",
  itemsMissing: "Order's items are missing.",
  itemsEmpty: "Order's items are empty."
};

type OrderSchema = {
  id: string;
  status: string;
  quantity: number;
  product_id: string;
  user_id: string;
};

const Order = function (requestBody: Request['body']): OrderSchema {
  const quantity: number = requestBody.quantity;
  const product_id: string = requestBody.product_id;

  return {
    quantity: quantity,
    product_id: product_id
  } as OrderSchema;
};

export { Order, OrderSchema, OrderSchemaError };
