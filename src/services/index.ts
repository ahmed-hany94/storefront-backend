import { Request, Response } from 'express';

import { getConnection } from '../db';

const getUserOrder = async function (req: Request, res: Response) {
  try {
    const userID = res.locals.authenticated_user.user.id;
    if (userID) {
      const client = await getConnection();
      const query = 'SELECT * FROM "orders" WHERE user_id = $1;';
      const result = await client.query(query, [userID]);
      if (result.rows.length) {
        const order = result.rows[0];
        res.status(200).json({ message: order });
      } else {
        res.status(400).json({ message: 'Failed to retrieve order.' });
      }
    } else {
      res.status(400).json({ message: 'Failed to retrieve order.' });
    }
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(400).json({ message: 'Failed to create order.' });
  }
};

const createUserOrder = async function (req: Request, res: Response) {
  try {
    const productID = req.body.product_id;
    const status = req.body.status;
    const userID = res.locals.authenticated_user.user.id;
    if (productID && status) {
      const client = await getConnection();
      const query =
        'INSERT INTO "orders" (status, product_id, user_id) VALUES ($1, $2, $3);';
      await client.query(query, [status, productID, userID]);
      client.release();
      res.status(200).json({ message: 'Order added.' });
    } else {
      res.status(400).json({ message: 'Failed to create order.' });
    }
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(400).json({ message: 'Failed to create order.' });
  }
};

export { createUserOrder, getUserOrder };
