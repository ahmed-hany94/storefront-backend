import { CookieOptions, NextFunction, Request, Response } from 'express';

import { selectOneQuery } from '../db';
import {
  authenticate,
  authorize,
  UserSchema,
  UserSchemaError
} from '../models/User';
import { USER_STATUS_MESSAGES } from '../modules/constants';

const isAuthenticated = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorizationHeader = req.headers.authorization as string;
    const token = authorizationHeader.split(' ')[1];
    const user = authorize(token);
    if (!user) {
      throw new Error(UserSchemaError.authorizationFailed);
    } else {
      res.locals.authenticated_user = user;
      next();
    }
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: UserSchemaError.authorizationFailed
      });
    }
  }
};

const hasAuthroization = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (
      res.locals.profile &&
      res.locals.authenticated_user.user &&
      res.locals.profile.id === res.locals.authenticated_user.user.id
    ) {
      next();
    } else {
      throw new Error('User is not authorized.');
    }
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: UserSchemaError.authorizationFailed
      });
    }
  }
};

const login = async function (req: Request, res: Response) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) throw new Error(UserSchemaError.usernameMissing);
    if (!password) throw new Error(UserSchemaError.passwordMissing);

    const query = 'SELECT * FROM "users" WHERE username = $1;';
    const user = await selectOneQuery<UserSchema>(query, [username]);
    const token = authenticate(user, password);

    if (!token) throw new Error("User authentication failed. Can't login.");

    const date = new Date();
    date.setDate(date.getDate() + 1);
    res.cookie('t', token, {
      expire: date,
      httpOnly: true,
      path: '/'
    } as CookieOptions);
    res
      .status(200)
      .json({ message: USER_STATUS_MESSAGES.user_login_success, token: token });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        Error: err.message
      });
    else {
      console.log(err);
      res.status(400).json({
        Error: USER_STATUS_MESSAGES.user_login_failed
      });
    }
  }
};

const logout = async function (req: Request, res: Response) {
  res.clearCookie('t', {
    path: '/'
  });
  res.status(200).json({ message: USER_STATUS_MESSAGES.user_logout_success });
};

export { hasAuthroization, isAuthenticated, login, logout };
