import { NextFunction, Request, Response } from 'express';

import { insertQuery, selectAllQuery, selectOneQuery } from '../db';
import { Product, ProductSchema, ProductSchemaError } from '../models/Product';
import {
  DATABASE_STATUS_MESSAGES,
  PRODUCT_STATUS_MESSAGES
} from '../modules/constants';

const createProducts = async function (req: Request, res: Response) {
  try {
    if (!req.body.name) throw new Error(ProductSchemaError.nameMissing);
    if (!req.body.price) throw new Error(ProductSchemaError.priceMissing);

    const product = Product(req.body);
    if (!product)
      throw new Error(PRODUCT_STATUS_MESSAGES.product_created_failed);

    const query = 'INSERT INTO "products" (name, price) VALUES ($1, $2);';
    const status = await insertQuery(query, [product.name, product.price]);
    if (status === DATABASE_STATUS_MESSAGES.insert_success) {
      res.status(200).json({
        message: DATABASE_STATUS_MESSAGES.insert_success,
        created_product: product
      });
    } else {
      throw new Error(status);
    }
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: PRODUCT_STATUS_MESSAGES.product_created_failed
      });
    }
  }
};

const productByID = async function (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) {
  try {
    const query = 'SELECT * FROM "products" WHERE prod_id = $1;';
    const product = await selectOneQuery<ProductSchema>(query, [id]);

    if (!product) throw new Error(DATABASE_STATUS_MESSAGES.select_failed);

    res.locals.product = product;
    next();
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: DATABASE_STATUS_MESSAGES.select_failed
      });
    }
  }
};

const getProduct = async function (req: Request, res: Response) {
  res.status(200).json({ product: res.locals.product });
};

const listProducts = async function (req: Request, res: Response) {
  try {
    const query = 'SELECT * FROM "products";';
    const products = await selectAllQuery(query);
    res.status(200).json({ products: products });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: DATABASE_STATUS_MESSAGES.select_failed
      });
    }
  }
};

export { createProducts, getProduct, listProducts, productByID };
