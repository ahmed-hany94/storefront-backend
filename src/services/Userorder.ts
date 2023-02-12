import { Request, Response } from 'express';

import {
  insertQuery,
  insertReturningInsertedQuery,
  selectManyQuery,
  selectOneQuery,
  updateQuery
} from '../db';
import { Order, OrderSchema, OrderSchemaError } from '../models/Order';
import { OrderProduct, OrderProductSchemaError } from '../models/OrderProduct';
import {
  DATABASE_STATUS_MESSAGES,
  ORDER_PRODUCT_STATUS_MESSAGES,
  ORDER_STATUS_MESSAGES
} from '../modules/constants';

const getIsThereAnActiveOrder = async function (user_id: string) {
  const query = 'SELECT order_id, status FROM orders WHERE user_id = $1';
  const order = await selectOneQuery<OrderSchema>(query, [user_id]);
  return order ? order : '';
};

const createUserOrder = async function (req: Request, res: Response) {
  try {
    let returning_msg = '';
    if (!req.body.status) throw new Error(OrderSchemaError.statusMissing);

    const userID = res.locals.profile.user_id;
    if (!userID) throw new Error(OrderSchemaError.userIDMissing);

    const isThereAnActiveOrderRes = await getIsThereAnActiveOrder(userID);
    if (isThereAnActiveOrderRes) {
      // **********************************************
      // There is an already active order
      // **********************************************

      // If we are _completing_ the order? Update ther orders table
      if (req.body.status === 'complete') {
        const query =
          "UPDATE orders SET status = 'complete' WHERE order_id = $1;";
        const updateMessage = await updateQuery(query, [
          isThereAnActiveOrderRes.order_id
        ]);
        if (updateMessage !== DATABASE_STATUS_MESSAGES.update_success)
          throw new Error(updateMessage);

        returning_msg +=
          returning_msg.length > 0
            ? `, ${ORDER_STATUS_MESSAGES.order_update_success}`
            : `${ORDER_STATUS_MESSAGES.order_update_success}`;
      }

      // Are there items to add to the already active order?
      // Insert to the order_products table
      if (req.body.items) {
        for (let i = 0; i < req.body.items.length; i++) {
          const item = req.body.items[i];
          if (!item.quantity)
            throw new Error(OrderProductSchemaError.quantityMissing);
          if (!item.product_id)
            throw new Error(OrderProductSchemaError.productIDMissing);

          const query =
            'INSERT INTO "order_products" (quantity, order_id, product_id) VALUES ($1, $2, $3);';
          const insertMessage = await insertQuery(query, [
            item.quantity,
            isThereAnActiveOrderRes.order_id,
            item.product_id
          ]);

          if (insertMessage !== DATABASE_STATUS_MESSAGES.insert_success)
            throw new Error(insertMessage);
        }

        returning_msg +=
          returning_msg.length > 0
            ? `, ${ORDER_PRODUCT_STATUS_MESSAGES.order_product_update_success}`
            : `${ORDER_PRODUCT_STATUS_MESSAGES.order_product_update_success}`;
      }
    } else {
      // **********************************************
      // This is a new order
      // **********************************************

      const order = Order(req.body.status, userID);
      if (!order) throw new Error(ORDER_STATUS_MESSAGES.order_created_failed);
      if (!req.body.items || (req.body.items && req.body.items.length === 0))
        throw new Error(OrderSchemaError.newOrderAndNoItems);

      // Validate the input
      let orderProducts = [];
      for (let i = 0; i < req.body.items.length; i++) {
        const item = req.body.items[i];

        if (!item.quantity)
          throw new Error(OrderProductSchemaError.quantityMissing);
        if (!item.product_id)
          throw new Error(OrderProductSchemaError.productIDMissing);

        const orderProduct = OrderProduct(item.quantity, item.product_id);
        if (!orderProduct)
          throw new Error(
            ORDER_PRODUCT_STATUS_MESSAGES.order_product_created_failed
          );
        orderProducts.push(orderProduct);
      }

      // Insert into the Orders table
      const query =
        'INSERT INTO "orders" (status, user_id) VALUES ($1, $2) RETURNING order_id;';
      const orderID = await insertReturningInsertedQuery(query, [
        req.body.status,
        userID
      ]);

      if (!orderID) throw new Error(DATABASE_STATUS_MESSAGES.insert_failed);

      // Insert into the orderProducts table
      for (let i = 0; i < orderProducts.length; i++) {
        const orderProductItem = orderProducts[i];

        if (!orderProductItem.quantity)
          throw new Error(OrderProductSchemaError.quantityMissing);
        if (!orderProductItem.product_id)
          throw new Error(OrderProductSchemaError.productIDMissing);

        const query =
          'INSERT INTO "order_products" (quantity, order_id, product_id) VALUES ($1, $2, $3);';
        const insertMessage = await insertQuery(query, [
          orderProductItem.quantity,
          orderID,
          orderProductItem.product_id
        ]);

        if (insertMessage !== DATABASE_STATUS_MESSAGES.insert_success)
          throw new Error(insertMessage);
      }

      returning_msg =
        `${ORDER_STATUS_MESSAGES.order_created_success}, ` +
        `${ORDER_PRODUCT_STATUS_MESSAGES.order_product_created_success}`;
    }

    res.status(200).json({
      message: returning_msg
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
      '"orders" as o JOIN "order_products" as op' +
      ' ' +
      'ON o.order_id = op.order_id' +
      ' ' +
      'JOIN "products" as p' +
      ' ' +
      'ON op.product_id = p.prod_id' +
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
      '"orders" as o JOIN "order_products" as op' +
      ' ' +
      'ON o.order_id = op.order_id' +
      ' ' +
      'JOIN "products" as p' +
      ' ' +
      'ON op.product_id = p.prod_id' +
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
      '"orders" as o JOIN "order_products" as op' +
      ' ' +
      'ON o.order_id = op.order_id' +
      ' ' +
      'JOIN "products" as p' +
      ' ' +
      'ON op.product_id = p.prod_id' +
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
