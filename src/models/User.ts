import { Request } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

import { BCRYPT_SECRET, JWT_SECRET, SALT_ROUNDS } from '../modules/constants';

const UserSchemaError = {
  usernameMissing: 'Username is missing.',
  usernameNotUnique: 'Username is not unique.',
  firstnameMissing: 'Firstname is missing.',
  lastnameMissing: 'Lastname is missing.',
  passwordMissing: 'Password is missing.',

  authorizationFailed: 'Authorization token verification failed.'
};

type UserSchema = {
  user_id: string;
  username: string;
  firstname: string;
  lastname: string;
  hash: string;
  error: string;
};

const hashPassword = function (password: string) {
  return hashSync(password + BCRYPT_SECRET, parseInt(SALT_ROUNDS as string));
};

const User = function (requestBody: Request['body']): UserSchema {
  const uname = requestBody.username;
  const fname = requestBody.firstName;
  const lname = requestBody.lastName;
  const passwd = requestBody.password;

  if (uname && fname && lname && passwd) {
    const hash = hashPassword(passwd);

    return {
      username: uname,
      firstname: fname,
      lastname: lname,
      hash: hash
    } as UserSchema;
  } else if (!uname) {
    return {
      error: UserSchemaError.usernameMissing
    } as UserSchema;
  } else if (!fname) {
    return {
      error: UserSchemaError.firstnameMissing
    } as UserSchema;
  } else if (!lname) {
    return {
      error: UserSchemaError.lastnameMissing
    } as UserSchema;
  } else {
    return {
      error: UserSchemaError.passwordMissing
    } as UserSchema;
  }
};

const authenticate = function (user: UserSchema, password: string): string {
  if (compareSync(password + BCRYPT_SECRET, user.hash)) {
    const token = sign({ user: user }, JWT_SECRET as string);
    return token;
  } else {
    return '';
  }
};

const authorize = function (token: string): UserSchema {
  try {
    const user = verify(token, JWT_SECRET as string) as JwtPayload;
    return user as UserSchema;
  } catch (err) {
    console.log(err);
    return {
      error: UserSchemaError.authorizationFailed
    } as UserSchema;
  }
};
export {
  authenticate,
  authorize,
  hashPassword,
  User,
  UserSchema,
  UserSchemaError
};
