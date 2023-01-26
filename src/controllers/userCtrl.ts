import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User';
import { getConnection, insertQuery, selectAll, selectOne } from '../db';
import {
  DATABASE_STATUS_MESSAGES,
  USER_STATUS_MESSAGES
} from '../modules/constants';

const createUser = async function (req: Request, res: Response) {
  try {
    const user = User(req.body);
    if (user.error) {
      res.status(400).json({ message: user.error });
    }
    const query =
      'INSERT INTO "users" (username, firstname, lastname, hash) VALUES ($1, $2, $3, $4);';

    const status = await insertQuery(query, [
      user.username,
      user.firstName,
      user.lastName,
      user.hash
    ]);

    if (status === DATABASE_STATUS_MESSAGES.insert_success) {
      res.status(200).json({
        message: USER_STATUS_MESSAGES.user_created_succes,
        body: user
      });
    } else {
      res.status(400).json({ message: status });
    }
  } catch (err) {
    res.status(400).json({
      message: USER_STATUS_MESSAGES.user_created_failed
    });
  }
};

const userByID = async function (
  _: Request,
  res: Response,
  next: NextFunction,
  id: string
) {
  try {
    const query = 'SELECT * FROM "users" WHERE id = $1;';
    const result = await selectOne(query, [id]);
    if (result) {
      res.locals.profile = result;
      next();
    } else {
      res
        .status(404)
        .json({ message: USER_STATUS_MESSAGES.user_retrieval_failed });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err
    });
  }

  // try {
  //   const client = await getConnection();
  //   const query = 'SELECT * FROM "users" WHERE id = $1;';
  //   const result = await client.query(query, [id]);

  //   if (result.rows.length) {
  //     const user = result.rows[0] as UserSchema;
  //     res.locals.profile = user;
  //     next();
  //   } else {
  //     res
  //       .status(400)
  //       .json({ message: USER_STATUS_MESSAGES.user_retrieval_failed });
  //   }
  // } catch (err) {
  //   // TODO: better error message
  //   console.log(err);
  //   res
  //     .status(400)
  //     .json({ message: USER_STATUS_MESSAGES.user_retrieval_failed });
  // }
};

const getUser = async function (_: Request, res: Response) {
  try {
    // TODO: res.locals is too much right now
    const userLocal = res.locals.authenticated_user;
    delete userLocal.user.hash;
    res.status(200).json({ message: userLocal.user });
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res
      .status(400)
      .json({ message: USER_STATUS_MESSAGES.user_retrieval_failed });
  }
};

const getUsers = async function (_: Request, res: Response) {
  try {
    const query = 'SELECT * FROM "users";';
    const result = await selectAll(query);
    // TODO: fix this
    // console.log('2', result);
    if (result) res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err
    });
  }
};

const updateUser = async function (req: Request, res: Response) {
  try {
    const user_id = res.locals.authenticated_user.user.id;
    if (user_id) {
      const client = await getConnection();
      let query = `UPDATE users SET `;
      let params = [];
      Object.entries(req.body).forEach(async (entry, index) => {
        switch (entry[0]) {
          case 'username': {
            query +=
              index === 0
                ? `username = $${index + 1}`
                : `, username = $${index + 1}`;
            params.push(entry[1]);
            break;
          }
          case 'firstName': {
            query +=
              index === 0
                ? `firstname = $${index + 1}`
                : `, firstname = $${index + 1}`;
            params.push(entry[1]);
            break;
          }
          case 'lastName': {
            query +=
              index === 0
                ? `lastname = $${index + 1}`
                : `, lastname = $${index + 1}`;
            params.push(entry[1]);
            break;
          }
          case 'password': {
            // TODO: rehash password and all that jazz.
            query +=
              index === 0 ? `hash = $${index + 1}` : `, hash = $${index + 1}`;
            params.push(entry[1]);
            break;
          }
          default:
            res.status(400).json({ message: 'Bad parameter.' });
        }
      });
      query += ` WHERE id = $${params.length + 1}`;
      params.push(user_id);
      await client.query(query, params);
      client.release();
      res.status(200).json({ message: 'Updated User.' });
    } else {
      res.status(400).json({ message: 'Failed to update user' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Failed to update user.' });
  }
};

const deleteUser = async function (_: Request, res: Response) {
  try {
    const user_id = res.locals.authenticated_user.user.id;
    if (user_id) {
      const client = await getConnection();
      const query = 'DELETE FROM "users" WHRER user_id = $1;';
      await client.query(query, [user_id]);
      client.release();
      res.status(200).json({ message: 'User deleted.' });
    } else {
      res.status(400).json({ message: 'Failed to delete user' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: '' });
  }
};
export { createUser, deleteUser, getUser, getUsers, updateUser, userByID };
