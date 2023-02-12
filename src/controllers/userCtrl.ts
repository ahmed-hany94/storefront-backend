import { NextFunction, Request, Response } from 'express';

import {
  hashPassword,
  User,
  UserSchema,
  UserSchemaError
} from '../models/User';
import {
  insertQuery,
  selectAllQuery,
  selectOneQuery,
  updateQuery,
  deleteQuery
} from '../db';
import {
  DATABASE_STATUS_MESSAGES,
  USER_STATUS_MESSAGES
} from '../modules/constants';

const createUser = async function (req: Request, res: Response) {
  try {
    if (!req.body.username) throw new Error(UserSchemaError.usernameMissing);
    if (!req.body.firstName) throw new Error(UserSchemaError.firstnameMissing);
    if (!req.body.lastName) throw new Error(UserSchemaError.lastnameMissing);
    if (!req.body.password) throw new Error(UserSchemaError.passwordMissing);

    const user = User(req.body);
    if (!user) throw new Error(USER_STATUS_MESSAGES.user_created_failed);

    const query =
      'INSERT INTO "users" (username, firstname, lastname, hash) VALUES ($1, $2, $3, $4);';

    const status = await insertQuery(query, [
      user.username,
      user.firstname,
      user.lastname,
      user.hash
    ]);

    if (status === DATABASE_STATUS_MESSAGES.insert_success) {
      res.status(200).json({
        message: USER_STATUS_MESSAGES.user_created_success
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
        Error: USER_STATUS_MESSAGES.user_created_failed
      });
    }
  }
};

const userByID = async function (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) {
  try {
    const query = 'SELECT * FROM "users" WHERE user_id = $1;';
    const user = await selectOneQuery<UserSchema>(query, [id]);

    if (!user) throw new Error(USER_STATUS_MESSAGES.user_retrieval_failed);

    res.locals.profile = user;
    next();
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({
        Error: err.message
      });
    } else {
      console.log(err);
      return res.status(400).json({
        Error: USER_STATUS_MESSAGES.user_retrieval_failed
      });
    }
  }
};

const getUser = async function (req: Request, res: Response) {
  const profile = res.locals.profile;
  delete profile.hash;
  res.status(200).json({ profile: profile });
};

const getUsers = async function (req: Request, res: Response) {
  try {
    const query = 'SELECT user_id, username, firstname, lastname FROM "users";';
    const users = await selectAllQuery<UserSchema>(query);
    if (!users) {
      throw new Error(DATABASE_STATUS_MESSAGES.select_failed);
    } else {
      res.status(200).json({ users: users });
    }
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

const updateUser = async function (req: Request, res: Response) {
  try {
    const user_id = res.locals.profile.user_id;

    if (!user_id) throw new Error(DATABASE_STATUS_MESSAGES.update_failed);

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
          const hashed_password = hashPassword(entry[1] as string);
          query +=
            index === 0 ? `hash = $${index + 1}` : `, hash = $${index + 1}`;
          params.push(hashed_password);
          break;
        }
        default:
          res.status(400).json({ message: 'Bad parameter.' });
      }
    });
    query += ` WHERE user_id = $${params.length + 1}`;
    params.push(user_id);

    const updateMessage = await updateQuery(query, params);
    if (updateMessage !== DATABASE_STATUS_MESSAGES.update_success)
      throw new Error(updateMessage);

    res.status(200).json({ message: updateMessage });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: DATABASE_STATUS_MESSAGES.update_failed
      });
    }
  }
};

const deleteUser = async function (req: Request, res: Response) {
  try {
    const user_id = res.locals.profile.user_id;

    if (!user_id) throw new Error(DATABASE_STATUS_MESSAGES.delete_failed);

    const query = 'DELETE FROM "users" WHERE user_id = $1;';
    const resultMsg = await deleteQuery(query, [user_id]);
    res.status(200).json({ message: resultMsg });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: DATABASE_STATUS_MESSAGES.delete_failed
      });
    }
  }
};

export { createUser, deleteUser, getUser, getUsers, updateUser, userByID };
