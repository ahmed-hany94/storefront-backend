import { Request } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import { BCRYPT_SECRET, JWT_SECRET, SALT_ROUNDS } from '../constants';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

const UserSchemaError = {
  usernameIsMissing: 'Username is missing.',
  usernameIsNotUnique: 'Username is not unique.',
  firstnameIsMissing: 'Firstname is missing.',
  lastnameIsMissing: 'Lastname is missing.',
  passwordIsMissing: 'Password is missing.'
};

type UserSchema = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  hash: string;
  error: string;
};
const User = function (requestBody: Request['body']): UserSchema {
  const uname = requestBody.username;
  const fname = requestBody.firstName;
  const lname = requestBody.lastName;
  const passwd = requestBody.password;

  if (uname && fname && lname && passwd) {
    const _hash = hashSync(
      passwd + BCRYPT_SECRET,
      parseInt(SALT_ROUNDS as string)
    );

    return {
      username: uname,
      firstName: fname,
      lastName: lname,
      hash: _hash
    } as UserSchema;
  } else if (!uname) {
    return {
      error: UserSchemaError.usernameIsMissing
    } as UserSchema;
  } else if (!fname) {
    return {
      error: UserSchemaError.firstnameIsMissing
    } as UserSchema;
  } else if (!lname) {
    return {
      error: UserSchemaError.lastnameIsMissing
    } as UserSchema;
  } else {
    return {
      error: UserSchemaError.passwordIsMissing
    } as UserSchema;
  }
};

const authenticate = function (user: UserSchema, password: string): string {
  console.log(user);
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
    return {} as UserSchema;
  }
};
export { UserSchema, User, authenticate, authorize };
