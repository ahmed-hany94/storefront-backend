import { NextFunction, Request, Response } from 'express';

import { User, UserSchema } from '../model/User';
import { getConnection } from '../db';

const createUser = async function (req: Request, res: Response) {
  try {
    const user = User(req.body);
    if (user.error) {
      res.status(400).json({ message: user.error });
    }
    const client = await getConnection();

    await client.query(
      `INSERT INTO "users" (username, firstname, lastname, hash) VALUES ('${user.username}', '${user.firstName}', '${user.lastName}', '${user.hash}');`
    );
    client.release();
    res.status(200).json({ message: 'User added.' });
  } catch (err) {
    res.status(400).json({
      message: err
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
    const result = await client.query(
      `SELECT * FROM "users" WHERE id = '${id}';`
    );

    if (result.rows.length) {
      const user = result.rows[0] as UserSchema;
      res.locals.user = user;
      next();
    } else {
      res.status(400).json({ message: 'Could not get user.' });
    }
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(400).json({ message: 'Could not get user.' });
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
    res.status(400).json({ message: 'Could not get user.' });
  }
};

const getUsers = async function (req: Request, res: Response) {
  try {
    const client = await getConnection();
    const result = await client.query(`SELECT * FROM "users";`);
    if (result.rows.length) {
      client.release();
      res.status(200).json(result.rows);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err
    });
  }
};

// TODO: finish this
const updateUser = async function (req: Request, res: Response) {
  try {
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: '' });
  }
};

// TODO: finish this
const deleteUser = async function (req: Request, res: Response) {
  try {
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: '' });
  }
};
export { createUser, getUsers, userByID, getUser, updateUser, deleteUser };
