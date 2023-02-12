const OrderSchemaError = {
  statusMissing: "Order's status is missing.",
  userIDMissing: "Order's corresponding user's id is missing.",
  newOrderAndNoItems: 'A new Order must have items provided, you provided none.'
};

type OrderSchema = {
  order_id: string;
  status: string;
  user_id: string;
};

const Order = function (status: string, user_id: string): OrderSchema {
  return {
    status: status,
    user_id: user_id
  } as OrderSchema;
};

export { Order, OrderSchema, OrderSchemaError };
