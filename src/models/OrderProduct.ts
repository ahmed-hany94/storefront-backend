const OrderProductSchemaError = {
  quantityMissing: "Order's quantity of product is missing.",
  productIDMissing: "Order's corresponding product's id is missing."
};

type OrderProductSchema = {
  order_product_id: string;
  quantity: number;
  product_id: string;
  order_id: string;
  user_id: string;
};

const OrderProduct = function (
  quantity: number,
  product_id: string
): OrderProductSchema {
  return {
    quantity: quantity,
    product_id: product_id
  } as OrderProductSchema;
};

export { OrderProduct, OrderProductSchema, OrderProductSchemaError };
