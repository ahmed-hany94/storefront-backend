import { NextFunction, Request, Response } from 'express';

import { getConnection } from '../db';

const listProducts = async function (req: Request, res: Response) {
  try {
    const client = await getConnection();
    const result = await client.query(`SELECT * FROM "products"`);
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(400).json({
      message: err
    });
  }
};

const createProducts = async function (req: Request, res: Response) {
  try {
    const { name, price } = req.body;
    const client = await getConnection();
    await client.query(
      `INSERT INTO "products" (name, price) VALUES ('${name}', ${price});`
    );
    client.release();
    res.status(200).json({ message: 'Product inserted.' });
  } catch (err) {
    res.status(400).json({
      message: err
    });
  }
};

const productByID = async function (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) {
  try {
    const client = await getConnection();
    const result = await client.query(
      `SELECT * FROM "products" WHERE id = '${id}';`
    );

    if (result.rows.length) {
      const product = result.rows[0];
      res.locals.product = product;
      next();
    } else {
      res.status(400).json({ message: 'Could not get product.' });
    }
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(400).json({ message: "Couldn't retrieve product" });
  }
};

const getProduct = async function (req: Request, res: Response) {
  res.status(200).json({ message: res.locals.product });
};

export { listProducts, createProducts, productByID, getProduct };
