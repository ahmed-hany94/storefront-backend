import { CookieOptions, NextFunction, Request, Response } from 'express';
import { getConnection } from '../db';
import { authenticate, authorize, UserSchema } from '../models/User';

const isAuthenticated = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorizationHeader = req.headers.authorization as string;
    const token = authorizationHeader.split(' ')[1];
    const user = authorize(token);
    if (user.error) {
      res.status(401).json({ message: user.error });
    } else {
      res.locals.authenticated_user = user;
      next();
    }
  } catch (err) {
    // TODO: better error message
    console.log(err);
    res.status(401).json({ message: 'User is not authenticated.' });
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
      res.status(401).json({ message: 'User is not authorized.' });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'User is not authorized.' });
  }
};

const login = async function (req: Request, res: Response) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
      const client = await getConnection();
      const query = 'SELECT * FROM "users" WHERE username = $1;';
      const result = await client.query(query, [username]);

      if (result.rows.length) {
        const user = result.rows[0] as UserSchema;

        const token = authenticate(user, password);

        if (token) {
          const date = new Date();
          date.setDate(date.getDate() + 1);
          res.cookie('t', token, {
            expire: date,
            httpOnly: true
          } as CookieOptions);
          res
            .status(200)
            .json({ message: 'User logged in successfully.', token: token });
          client.release();
        } else {
          // TODO: send a proper error message detailing what went wrong
          res
            .status(401)
            .json({ message: `User authentication failed. Can't login.` });
        }
      } else {
        // TODO: send a proper error message detailing what went wrong
        res
          .status(401)
          .json({ message: `User authentication failed. Can't login.` });
      }
    } else {
      res.status(400).json({ message: 'Missing Credentials' });
    }
  } catch (err) {
    res.status(400).json({
      message: err
    });
  }
};

const logout = async function (req: Request, res: Response) {
  res.clearCookie('t');
  res.status(200).json({ message: 'User signed out.' });
};

export { hasAuthroization, isAuthenticated, login, logout };
