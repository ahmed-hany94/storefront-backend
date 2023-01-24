import { NextFunction, Request, Response } from 'express';

import { User, UserSchema } from '../models/User';
import { getConnection, insertQuery, selectQuery } from '../db';
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
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) {
  try {
    const client = await getConnection();
    const query = 'SELECT * FROM "users" WHERE id = $1;';
    const result = await client.query(query, [id]);

    if (result.rows.length) {
      const user = result.rows[0] as UserSchema;
      res.locals.profile = user;
      next();
    } else {
      res.status(400).json({ message: 'Failed to retrieve user.' });
    }
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(400).json({ message: 'Failed to retrieve user.' });
  }
};

const getUser = async function (req: Request, res: Response) {
  try {
    const userLocal = res.locals.user;
    delete userLocal.user.hash;
    res.status(200).json({ message: userLocal.user });
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(400).json({ message: 'Failed to retrieve user.' });
  }
};

const getUsers = async function (req: Request, res: Response) {
  try {
    const query = 'SELECT * FROM "users";';
    const result = await selectQuery(query, []);
    if (result!.error) {
      res.status(404).json({ message: 'No users were found.' });
    } else {
    }
    // if (result.rows.length) {
    //   client.release();
    //   res.status(200).json(result.rows);
    // } else {
    //   res.status(404).json({ message: 'No users were found.' });
    // }
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
      Object.entries(req.body).forEach(async (entry) => {
        switch (entry[0]) {
          case 'username': {
            const query = 'UPDATE users SET username = $1 WHERE id = $2';
            await client.query(query, [entry[1], user_id]);
            break;
          }
          case 'firstName': {
            const query = 'UPDATE users SET firstName = $1 WHERE id = $2';
            await client.query(query, [entry[1], user_id]);
            break;
          }
          case 'lastName': {
            const query = 'UPDATE users SET lastName = $1 WHERE id = $2';
            await client.query(query, [entry[1], user_id]);
            break;
          }
          case 'password': {
            // TODO: rehash password and all that jazz.
            // const query = 'UPDATE users SET password = $1 WHERE user_id = $2';
            // await client.query(query, [entry[1], user_id]);
            break;
          }
          default:
            res.status(400).json({ message: 'Bad parameter.' });
        }
      });
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

const deleteUser = async function (req: Request, res: Response) {
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
