import { Request } from 'express';

const ProductSchemaError = {
  nameMissing: "Product's name is missing.",
  priceMissing: "Product's price is missing."
};

type ProductSchema = {
  id: string;
  name: string;
  price: number;
};

const Product = function (requestBody: Request['body']): ProductSchema {
  const name: string = requestBody.name;
  const price: number = requestBody.price;

  return {
    name: name,
    price: price
  } as ProductSchema;
};

export { Product, ProductSchema, ProductSchemaError };
