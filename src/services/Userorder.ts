import { Request, Response } from 'express';

import { insertQuery, selectManyQuery, updateQuery } from '../db';
import { Order, OrderSchema, OrderSchemaError } from '../models/Order';
import {
  DATABASE_STATUS_MESSAGES,
  ORDER_STATUS_MESSAGES
} from '../modules/constants';

const createUserOrder = async function (req: Request, res: Response) {
  try {
    if (!req.body.items) throw new Error(OrderSchemaError.itemsMissing);
    if (req.body.items.length === 0)
      throw new Error(OrderSchemaError.itemsEmpty);

    if (!req.body.status) throw new Error(OrderSchemaError.statusMissing);

    const userID = res.locals.profile.user_id;
    if (!userID) throw new Error(OrderSchemaError.userIDMissing);

    for (let i = 0; i < req.body.items.length; i++) {
      const item = req.body.items[i];

      if (!item.product_id) throw new Error(OrderSchemaError.productIDMissing);
      const order = Order(item);
      if (!order) throw new Error(ORDER_STATUS_MESSAGES.order_created_failed);

      const query =
        'INSERT INTO "orders" (status, quantity, product_id, user_id) VALUES ($1, $2, $3, $4);';

      const insertMessage = await insertQuery(query, [
        req.body.status,
        order.quantity,
        order.product_id,
        userID
      ]);

      if (req.body.status === 'complete') {
        const query =
          "UPDATE orders SET status = 'complete' WHERE user_id = $1;";
        const updateMessage = await updateQuery(query, [userID]);
        if (updateMessage !== DATABASE_STATUS_MESSAGES.update_success)
          throw new Error(updateMessage);
      }

      if (insertMessage !== DATABASE_STATUS_MESSAGES.insert_success) {
        throw new Error(insertMessage);
      }
    }

    res.status(200).json({
      message: ORDER_STATUS_MESSAGES.order_created_success
    });
  } catch (err) {
    console.log(err);
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: ORDER_STATUS_MESSAGES.order_created_failed
      });
    }
  }
};

const getAllUserOrdersActive = async function (req: Request, res: Response) {
  try {
    const userID = res.locals.profile.user_id;
    if (!userID) throw new Error(OrderSchemaError.userIDMissing);

    const query =
      'SELECT name, price, status, quantity FROM' +
      ' ' +
      '"products" as p JOIN "orders" as o' +
      ' ' +
      'ON o.product_id = p.prod_id' +
      ' ' +
      'WHERE user_id = $1 and' +
      ' ' +
      "status = 'active'" +
      ';';

    const order = await selectManyQuery<OrderSchema>(query, [userID]);
    if (!order) throw new Error(DATABASE_STATUS_MESSAGES.select_failed);

    res.status(200).json({ order: order });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: ORDER_STATUS_MESSAGES.order_created_failed
      });
    }
  }
};

const getAllUserOrdersCompleted = async function (req: Request, res: Response) {
  try {
    const userID = res.locals.profile.user_id;
    if (!userID) throw new Error(OrderSchemaError.userIDMissing);

    const query =
      'SELECT name, price, status, quantity FROM' +
      ' ' +
      '"products" as p JOIN "orders" as o' +
      ' ' +
      'ON o.product_id = p.prod_id' +
      ' ' +
      'WHERE user_id = $1 and' +
      ' ' +
      "status = 'complete'" +
      ';';

    const order = await selectManyQuery<OrderSchema>(query, [userID]);
    if (!order) throw new Error(DATABASE_STATUS_MESSAGES.select_failed);

    res.status(200).json({ order: order });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: ORDER_STATUS_MESSAGES.order_created_failed
      });
    }
  }
};

const getAllUserOrders = async function (req: Request, res: Response) {
  try {
    const userID = res.locals.profile.user_id;
    if (!userID) throw new Error(OrderSchemaError.userIDMissing);

    const query =
      'SELECT name, price, status, quantity FROM' +
      ' ' +
      '"products" as p JOIN "orders" as o' +
      ' ' +
      'ON o.product_id = p.prod_id' +
      ' ' +
      'WHERE user_id = $1;';

    const order = await selectManyQuery<OrderSchema>(query, [userID]);
    if (!order) throw new Error(DATABASE_STATUS_MESSAGES.select_failed);

    res.status(200).json({ order: order });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: ORDER_STATUS_MESSAGES.order_created_failed
      });
    }
  }
};

export {
  createUserOrder,
  getAllUserOrders,
  getAllUserOrdersActive,
  getAllUserOrdersCompleted
};
